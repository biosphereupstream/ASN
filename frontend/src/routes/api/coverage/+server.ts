import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { CITIES_DATA, DISTRICTS_BY_CITY, getEffectivePackages } from '$lib/data/coverageData'

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  const citySlug = url.searchParams.get('city')?.trim()
  const districtSlug = url.searchParams.get('district')?.trim()

  if (!citySlug || !districtSlug) {
    return json({ error: 'AREA_NOT_FOUND' }, { status: 404 })
  }

  const city = CITIES_DATA.find((c) => c.slug === citySlug)
  const districts = DISTRICTS_BY_CITY[citySlug]
  const district = districts?.find((d) => d.slug === districtSlug)

  if (!city || !district) {
    return json({ error: 'AREA_NOT_FOUND' }, { status: 404 })
  }

  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
  })

  const packages = district.status === 'available' ? getEffectivePackages(citySlug) : []

  return json({
    status: district.status,
    city: { id: city.id, name: city.name, slug: city.slug, province: city.province },
    district: { id: district.id, name: district.name, slug: district.slug, status: district.status },
    packages
  })
}
