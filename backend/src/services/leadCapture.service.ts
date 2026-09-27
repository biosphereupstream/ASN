import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { areaRequests, cities, districts, leads, packages } from '../db/schema'

/**
 * Public lead capture per PRD FR-4 / FR-5:
 * - FR-4.1 field validation (E.164-ID WhatsApp number, optional fields)
 * - FR-4.3 duplicate detection: same normalized phone + city within 30 days
 *   → still stored, `duplicateOf` points at the original (§12 dedup rule)
 * - FR-4.4 anti-spam: per-IP rate limit + honeypot; Cloudflare Turnstile is
 *   verified when TURNSTILE_SECRET_KEY is configured (no-op in dev)
 */

const DUPLICATE_WINDOW_DAYS = 30
/** FR-4.4: burst abuse guard — 5 submissions per IP per minute. */
const MAX_PER_IP_PER_MINUTE = 5
/** FR-4.4: sustained abuse guard — 10 submissions per IP per hour. */
const MAX_PER_IP_PER_HOUR = 10

const LEAD_SOURCES = [
  'homepage_checker',
  'package_card',
  'product_page',
  'promo_page',
  'contact_page',
  'waitlist'
] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

export function isLeadSource(v: string): v is LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(v)
}

// --- Validation ------------------------------------------------------------

/** E.164-ID normalization: keep digits, coerce 08xx/+62xx/62xx → 628xxxx (FR-4.1). */
export function normalizePhoneId(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, '')
  const plus = digits.startsWith('+')
  const bare = digits.replace(/^\+/, '')
  let national: string
  if (bare.startsWith('62')) national = `0${bare.slice(2)}`
  else if (bare.startsWith('0')) national = bare
  else if (bare.startsWith('8')) national = `0${bare}`
  else national = bare

  // Indonesian mobile: 08xx with 9–13 digits total.
  if (!/^08[1-9]\d{6,10}$/.test(national)) return null
  // E.164 storage format: +62…
  return `+62${national.slice(1)}`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type CreateLeadInput = {
  fullName: string
  phone: string
  email?: string
  citySlug: string
  districtSlug: string
  address: string
  packageSlug?: string
  preferredDate?: string
  source: LeadSource
  consent: boolean
  website?: string // honeypot — must stay empty
  turnstileToken?: string
}

export type CreateLeadResult =
  | { ok: true; id: number; duplicate: boolean }
  | {
      ok: false
      error:
        | 'INVALID_NAME'
        | 'INVALID_PHONE'
        | 'INVALID_EMAIL'
        | 'INVALID_CITY'
        | 'INVALID_DISTRICT'
        | 'INVALID_PACKAGE'
        | 'INVALID_ADDRESS'
        | 'INVALID_DATE'
        | 'CONSENT_REQUIRED'
        | 'HONEYPOT'
        | 'TURNSTILE_FAILED'
        | 'RATE_LIMITED'
    }

// --- Per-IP rate limiting (in-memory; per process like the admin limiter) ---
const hits = new Map<string, number[]>()
function ipRateLimited(ip: string): boolean {
  const now = Date.now()
  const minuteStart = now - 60 * 1000
  const hourStart = now - 60 * 60 * 1000
  const kept = (hits.get(ip) ?? []).filter((t) => t > hourStart)
  kept.push(now)
  hits.set(ip, kept)
  if (hits.size > 10_000) {
    // Simple memory guard: drop expired entries periodically.
    for (const [k, v] of hits) {
      if (v.every((t) => t <= hourStart)) hits.delete(k)
    }
  }
  const inLastMinute = kept.filter((t) => t > minuteStart).length
  return inLastMinute > MAX_PER_IP_PER_MINUTE || kept.length > MAX_PER_IP_PER_HOUR
}

// --- Turnstile (FR-4.4) — active only when the secret key is configured ----
async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // dev: not configured → skip
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip })
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

// --- Create lead ------------------------------------------------------------

export async function createLead(input: CreateLeadInput, ip: string): Promise<CreateLeadResult> {
  if (input.website) return { ok: false, error: 'HONEYPOT' } // FR-4.4 honeypot
  if (!(await verifyTurnstile(input.turnstileToken, ip))) return { ok: false, error: 'TURNSTILE_FAILED' }
  if (ipRateLimited(ip)) return { ok: false, error: 'RATE_LIMITED' }

  const name = input.fullName.trim()
  if (name.length < 2 || name.length > 100) return { ok: false, error: 'INVALID_NAME' }

  const phone = normalizePhoneId(input.phone)
  if (!phone) return { ok: false, error: 'INVALID_PHONE' }

  const email = input.email?.trim()
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) return { ok: false, error: 'INVALID_EMAIL' }

  const address = input.address.trim()
  if (address.length < 5 || address.length > 300) return { ok: false, error: 'INVALID_ADDRESS' }

  if (!input.consent) return { ok: false, error: 'CONSENT_REQUIRED' }

  const [city] = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, input.citySlug)).limit(1)
  if (!city) return { ok: false, error: 'INVALID_CITY' }

  const [district] = await db
    .select({ id: districts.id })
    .from(districts)
    .where(and(eq(districts.slug, input.districtSlug), eq(districts.cityId, city.id)))
    .limit(1)
  if (!district) return { ok: false, error: 'INVALID_DISTRICT' }

  let packageId: number | undefined
  if (input.packageSlug) {
    const [pkg] = await db.select({ id: packages.id }).from(packages).where(eq(packages.slug, input.packageSlug)).limit(1)
    if (!pkg) return { ok: false, error: 'INVALID_PACKAGE' }
    packageId = pkg.id
  }

  let preferredDate: string | undefined
  if (input.preferredDate) {
    if (!DATE_RE.test(input.preferredDate) || Number.isNaN(new Date(input.preferredDate).getTime())) {
      return { ok: false, error: 'INVALID_DATE' }
    }
    // Not in the past (compare calendar dates in UTC).
    const today = new Date().toISOString().slice(0, 10)
    if (input.preferredDate < today) return { ok: false, error: 'INVALID_DATE' }
    preferredDate = input.preferredDate
  }

  // FR-4.3 duplicate rule: same normalized phone + city within 30 days.
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const [original] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.phone, phone), eq(leads.cityId, city.id), gte(leads.createdAt, windowStart)))
    .orderBy(desc(leads.createdAt))
    .limit(1)

  const [row] = await db
    .insert(leads)
    .values({
      fullName: name,
      phone,
      email: email || null,
      cityId: city.id,
      districtId: district.id,
      address,
      packageId: packageId ?? null,
      preferredDate: preferredDate ?? null,
      source: input.source,
      status: 'new',
      duplicateOf: original?.id ?? null,
      consentAt: new Date()
    })
    .returning({ id: leads.id })

  return { ok: true, id: row.id, duplicate: original != null }
}

// --- Area request (FR-5.1) ---------------------------------------------------

export type CreateAreaRequestInput = {
  fullName: string
  phone: string
  citySlug: string
  districtSlug: string
  notifyWhenAvailable?: boolean
  website?: string
  turnstileToken?: string
}

export type CreateAreaRequestResult =
  | { ok: true; id: number }
  | { ok: false; error: 'INVALID_NAME' | 'INVALID_PHONE' | 'INVALID_CITY' | 'INVALID_DISTRICT' | 'HONEYPOT' | 'TURNSTILE_FAILED' | 'RATE_LIMITED' }

export async function createAreaRequest(
  input: CreateAreaRequestInput,
  ip: string
): Promise<CreateAreaRequestResult> {
  if (input.website) return { ok: false, error: 'HONEYPOT' }
  if (!(await verifyTurnstile(input.turnstileToken, ip))) return { ok: false, error: 'TURNSTILE_FAILED' }
  if (ipRateLimited(ip)) return { ok: false, error: 'RATE_LIMITED' }

  const name = input.fullName.trim()
  if (name.length < 2 || name.length > 100) return { ok: false, error: 'INVALID_NAME' }

  const phone = normalizePhoneId(input.phone)
  if (!phone) return { ok: false, error: 'INVALID_PHONE' }

  const [city] = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, input.citySlug)).limit(1)
  if (!city) return { ok: false, error: 'INVALID_CITY' }

  const [district] = await db
    .select({ id: districts.id })
    .from(districts)
    .where(and(eq(districts.slug, input.districtSlug), eq(districts.cityId, city.id)))
    .limit(1)
  if (!district) return { ok: false, error: 'INVALID_DISTRICT' }

  const [row] = await db
    .insert(areaRequests)
    .values({
      fullName: name,
      phone,
      cityId: city.id,
      districtId: district.id,
      notifyWhenAvailable: input.notifyWhenAvailable ?? false
    })
    .returning({ id: areaRequests.id })

  return { ok: true, id: row.id }
}

/** Duplicate-flag count for the admin inbox badge (FR-4.3 visibility). */
export async function duplicateCount(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(leads).where(sql`duplicate_of is not null`)
  return row?.n ?? 0
}

