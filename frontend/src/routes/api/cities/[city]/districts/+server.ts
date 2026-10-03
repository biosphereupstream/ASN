import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { DISTRICTS_BY_CITY } from '$lib/data/coverageData'

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const citySlug = params.city
  const districts = DISTRICTS_BY_CITY[citySlug]

  if (!districts) {
    return json({ error: 'CITY_NOT_FOUND' }, { status: 404 })
  }

  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
  })
  return json(districts)
}
