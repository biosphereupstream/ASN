import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { CITIES_DATA } from '$lib/data/coverageData'

export const GET: RequestHandler = async ({ setHeaders }) => {
  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
  })
  return json(CITIES_DATA)
}
