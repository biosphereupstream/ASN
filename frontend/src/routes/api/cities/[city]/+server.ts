import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import {
  BRANCHES_DATA,
  CITIES_DATA,
  DISTRICTS_BY_CITY,
  getEffectivePackages
} from '$lib/data/coverageData'

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const citySlug = params.city
  const city = CITIES_DATA.find((c) => c.slug === citySlug)

  if (!city) {
    return json({ error: 'CITY_NOT_FOUND' }, { status: 404 })
  }

  const districts = DISTRICTS_BY_CITY[citySlug] ?? []
  const availableDistricts = districts.filter((d) => d.status === 'available').length
  const packages = getEffectivePackages(citySlug)
  const branch = BRANCHES_DATA[citySlug] ?? {
    name: `ASN.NET Layanan Pelanggan ${city.name}`,
    address: `Sentra Layanan & Dukungan Fiber, ${city.name}`,
    phone: '0800-1-ASN-NET',
    whatsapp: '6285694072344'
  }

  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
  })

  return json({
    city: {
      id: city.id,
      name: city.name,
      slug: city.slug,
      province: city.province,
      totalDistricts: districts.length,
      availableDistricts
    },
    districts,
    packages,
    branch
  })
}
