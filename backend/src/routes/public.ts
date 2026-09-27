import { Elysia, t } from 'elysia'
import { listCities, listDistricts, resolveCoverage } from '../services/coverage.service'
import {
  createAreaRequest,
  createLead,
  isLeadSource,
  type CreateAreaRequestResult,
  type CreateLeadResult
} from '../services/leadCapture.service'

/** Best-effort client IP behind proxies (rate-limit key only, FR-4.4). */
function clientIp(headers: Record<string, string | null>): string {
  const fwd = headers['x-forwarded-for']?.split(',')[0]?.trim()
  return fwd || '127.0.0.1'
}

/** Map a service error to its HTTP status per FR-4/§11 semantics. */
function statusFor(error: CreateLeadResult | CreateAreaRequestResult): number {
  if (!('error' in (error as object)) || (error as { ok?: boolean }).ok) return 200
  const e = (error as { error: string }).error
  if (e === 'RATE_LIMITED') return 429
  if (e === 'TURNSTILE_FAILED') return 403
  if (e === 'HONEYPOT') return 200 // silently swallow bots — pretend success
  if (e.startsWith('INVALID_') || e === 'CONSENT_REQUIRED') return 422
  return 400
}

/** 5-minute CDN/HTTP cache per FR-1.4. */
const CACHE_HEADER = 'public, max-age=300, stale-while-revalidate=60'

/**
 * Public API surface per PRD §10.3:
 *   GET /api/cities                      → active cities
 *   GET /api/cities/:slug/districts      → districts for a city
 *   GET /api/coverage?city=&district=    → status + effective packages for the area
 */
export const publicRoutes = new Elysia({ prefix: '/api' })
  .get('/cities', async ({ set }) => {
    set.headers['Cache-Control'] = CACHE_HEADER
    return await listCities()
  })
  .get(
    '/cities/:slug/districts',
    async ({ params, set }) => {
      const rows = await listDistricts(params.slug)
      if (!rows) {
        set.status = 404
        return { error: 'CITY_NOT_FOUND' }
      }
      set.headers['Cache-Control'] = CACHE_HEADER
      return rows
    },
    {
      params: t.Object({ slug: t.String({ minLength: 1 }) })
    }
  )
  .get(
    '/coverage',
    async ({ query, set }) => {
      const result = await resolveCoverage(query.city, query.district)
      if (!result) {
        // FR-1 acceptance: invalid combos return a friendly 404, never a 500.
        set.status = 404
        return { error: 'AREA_NOT_FOUND' }
      }
      set.headers['Cache-Control'] = CACHE_HEADER
      return result
    },
    {
      query: t.Object({
        city: t.String({ minLength: 1 }),
        district: t.String({ minLength: 1 })
      })
    }
  )
  // --- Lead capture (FR-4) --------------------------------------------------
  .post(
    '/leads',
    async ({ body, set, headers, request }) => {
      if (!isLeadSource(body.source)) {
        set.status = 422
        return { ok: false, error: 'INVALID_SOURCE' }
      }
      const result = await createLead(
        {
          fullName: String(body.fullName ?? ''),
          phone: String(body.phone ?? ''),
          email: body.email ? String(body.email) : undefined,
          citySlug: String(body.city ?? ''),
          districtSlug: String(body.district ?? ''),
          address: String(body.address ?? ''),
          packageSlug: body.package ? String(body.package) : undefined,
          preferredDate: body.preferredDate ? String(body.preferredDate) : undefined,
          source: body.source,
          consent: body.consent === true,
          website: body.website ? String(body.website) : undefined,
          turnstileToken: body.turnstileToken ? String(body.turnstileToken) : undefined
        },
        clientIp(headers as Record<string, string | null>)
      )
      // Honeypot trips pretend success so bots get no signal (FR-4.4).
      if (!result.ok && result.error === 'HONEYPOT') return { ok: true, id: null }
      set.status = statusFor(result)
      if (!result.ok) return { ok: false, error: result.error }
      return { ok: true, id: result.id, duplicate: result.duplicate }
    },
    {
      body: t.Object({
        fullName: t.String(),
        phone: t.String(),
        email: t.Optional(t.String()),
        city: t.String(),
        district: t.String(),
        address: t.String(),
        package: t.Optional(t.String()),
        preferredDate: t.Optional(t.String()),
        source: t.String(),
        consent: t.Boolean(),
        website: t.Optional(t.String()),
        turnstileToken: t.Optional(t.String())
      })
    }
  )
  // --- Area request (FR-5.1) --------------------------------------------------
  .post(
    '/area-requests',
    async ({ body, set, headers, request }) => {
      const result = await createAreaRequest(
        {
          fullName: String(body.fullName ?? ''),
          phone: String(body.phone ?? ''),
          citySlug: String(body.city ?? ''),
          districtSlug: String(body.district ?? ''),
          notifyWhenAvailable: body.notifyWhenAvailable === true,
          website: body.website ? String(body.website) : undefined,
          turnstileToken: body.turnstileToken ? String(body.turnstileToken) : undefined
        },
        clientIp(headers as Record<string, string | null>)
      )
      if (!result.ok && result.error === 'HONEYPOT') return { ok: true, id: null }
      set.status = statusFor(result)
      if (!result.ok) return { ok: false, error: result.error }
      return { ok: true, id: result.id }
    },
    {
      body: t.Object({
        fullName: t.String(),
        phone: t.String(),
        city: t.String(),
        district: t.String(),
        notifyWhenAvailable: t.Optional(t.Boolean()),
        website: t.Optional(t.String()),
        turnstileToken: t.Optional(t.String())
      })
    }
  )
