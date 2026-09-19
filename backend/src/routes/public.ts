import { Elysia, t } from 'elysia'
import { listCities, listDistricts, resolveCoverage } from '../services/coverage.service'

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
