import { and, asc, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { cities, coverageAreas, districts, packageAreaPrices, packages } from '../db/schema'

/**
 * Coverage resolution per PRD FR-1.2: (city, district) → status + packages
 * with the effective price for the area (§12: most-specific override wins,
 * then the package base price).
 */
export async function resolveCoverage(citySlug: string, districtSlug: string) {
  const [city] = await db.select().from(cities).where(eq(cities.slug, citySlug)).limit(1)
  if (!city) return null

  const [district] = await db
    .select()
    .from(districts)
    .where(and(eq(districts.cityId, city.id), eq(districts.slug, districtSlug)))
    .limit(1)
  if (!district) return null

  const [cov] = await db
    .select()
    .from(coverageAreas)
    .where(and(eq(coverageAreas.cityId, city.id), eq(coverageAreas.districtId, district.id)))
    .limit(1)

  let status: 'available' | 'coming_soon' | 'not_available' = cov?.status ?? 'not_available'

  // Package list with effective price (§12 effective-price resolver).
  let pkgs: {
    slug: string
    name: string
    speedMbps: number
    priceIdr: number
    basePriceIdr: number
  }[] = []
  if (status === 'available') {
    const base = await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(asc(packages.sortOrder))
    const overrides = await db
      .select()
      .from(packageAreaPrices)
      .where(and(eq(packageAreaPrices.cityId, city.id), eq(packageAreaPrices.isActive, true)))

    pkgs = base
      .map((p) => {
        const districtOverride = overrides.find((o) => o.packageId === p.id && o.districtId === district.id)
        const cityOverride = overrides.find((o) => o.packageId === p.id && o.districtId === null)
        const price = districtOverride?.priceIdr ?? cityOverride?.priceIdr ?? p.basePriceIdr
        return {
          slug: p.slug,
          name: p.name,
          speedMbps: p.speedMbps,
          priceIdr: price,
          basePriceIdr: p.basePriceIdr
        }
      })
      .filter((p) => p.priceIdr !== null)
  }

  return { status, city: { name: city.name }, district: { name: district.name }, packages: pkgs }
}

/** Active cities for the checker's first select (FR-1.1). */
export async function listCities() {
  return db
    .select({ slug: cities.slug, name: cities.name })
    .from(cities)
    .where(eq(cities.isActive, true))
    .orderBy(asc(cities.name))
}

/** Districts for a city (FR-1.1). Returns null when the city doesn't exist. */
export async function listDistricts(citySlug: string) {
  const [city] = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, citySlug)).limit(1)
  if (!city) return null
  return db
    .select({ slug: districts.slug, name: districts.name })
    .from(districts)
    .where(eq(districts.cityId, city.id))
    .orderBy(asc(districts.name))
}
