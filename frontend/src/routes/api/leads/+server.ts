import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Simple in-memory deduplication store for serverless instance lifespan
const recentSubmissions = new Map<string, number>()

function normalizePhoneId(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, '')
  const bare = digits.replace(/^\+/, '')
  let national: string
  if (bare.startsWith('62')) national = `0${bare.slice(2)}`
  else if (bare.startsWith('0')) national = bare
  else if (bare.startsWith('8')) national = `0${bare}`
  else national = bare

  if (!/^08[1-9]\d{6,10}$/.test(national)) return null
  return `+62${national.slice(1)}`
}

export const POST: RequestHandler = async ({ request }) => {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'INVALID_JSON' }, { status: 400 })
  }

  // Honeypot trips: silently swallow bots so they get no signal (FR-4.4)
  if (body.website && String(body.website).trim().length > 0) {
    return json({ ok: true, id: null })
  }

  const fullName = String(body.fullName ?? '').trim()
  if (fullName.length < 2) {
    return json({ ok: false, error: 'INVALID_NAME' }, { status: 422 })
  }

  const normalizedPhone = normalizePhoneId(String(body.phone ?? ''))
  if (!normalizedPhone) {
    return json({ ok: false, error: 'INVALID_PHONE' }, { status: 422 })
  }

  if (body.consent !== true) {
    return json({ ok: false, error: 'CONSENT_REQUIRED' }, { status: 422 })
  }

  const city = String(body.city ?? '').trim()
  const district = String(body.district ?? '').trim()
  const address = String(body.address ?? '').trim()

  if (!city || !district) {
    return json({ ok: false, error: 'INVALID_AREA' }, { status: 422 })
  }

  if (address.length < 5) {
    return json({ ok: false, error: 'INVALID_ADDRESS' }, { status: 422 })
  }

  const dedupKey = `${normalizedPhone}:${city}`
  const now = Date.now()
  const lastTime = recentSubmissions.get(dedupKey)
  const isDuplicate = !!(lastTime && now - lastTime < 30 * 24 * 60 * 60 * 1000)
  recentSubmissions.set(dedupKey, now)

  const leadId = Math.floor(100000 + Math.random() * 900000)

  if (isDuplicate) {
    return json({ ok: true, id: leadId, duplicate: true })
  }

  return json({ ok: true, id: leadId })
}
