import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { CITIES_DATA, DISTRICTS_BY_CITY } from '$lib/data/coverageData'

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

  if (body.website && String(body.website).trim().length > 0) {
    return json({ ok: true, id: null })
  }

  const fullName = String(body.fullName ?? '').trim()
  if (fullName.length < 2) {
    return json({ ok: false, error: 'INVALID_NAME' }, { status: 422 })
  }

  const phone = normalizePhoneId(String(body.phone ?? ''))
  if (!phone) {
    return json({ ok: false, error: 'INVALID_PHONE' }, { status: 422 })
  }

  const citySlug = String(body.citySlug ?? '').trim()
  const districtSlug = String(body.districtSlug ?? '').trim()

  const city = CITIES_DATA.find((c) => c.slug === citySlug)
  if (!city) {
    return json({ ok: false, error: 'INVALID_CITY' }, { status: 422 })
  }

  const district = DISTRICTS_BY_CITY[citySlug]?.find((d) => d.slug === districtSlug)
  if (!district) {
    return json({ ok: false, error: 'INVALID_DISTRICT' }, { status: 422 })
  }

  const reqId = Math.floor(100000 + Math.random() * 900000)
  return json({ ok: true, id: reqId })
}
