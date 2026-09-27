import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { cities, coverageAreas, districts, packageAreaPrices, packages } from '../db/schema'
import { areaRequests } from '../db/schema'
import { recordAudit, type AdminActor } from './auth.service'

/**
 * Coverage management service per PRD FR-7.2 / §13:
 * - coverage matrix view (city → districts with status)
 * - single + bulk status set (NOC workflow: "bulk-set coverage status")
 * - city / district creation
 * - per-district demand aggregation (FR-5.2, §13 demand view)
 */

const COVERAGE_STATUSES = ['available', 'coming_soon', 'not_available'] as const
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number]

/** Full matrix: every district of every (active) city with its coverage status. */
export async function coverageMatrix() {
  const cityRows = await db.select().from(cities).orderBy(asc(cities.name))
  const districtRows = await db
    .select({
      id: districts.id,
      cityId: districts.cityId,
      name: districts.name,
      slug: districts.slug,
      status: coverageAreas.status,
      updatedAt: coverageAreas.updatedAt
    })
    .from(districts)
    .leftJoin(coverageAreas, eq(coverageAreas.districtId, districts.id))
    .orderBy(asc(districts.name))

  return cityRows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    province: c.province,
    isActive: c.isActive,
    districts: districtRows.filter((d) => d.cityId === c.id)
  }))
}

export async function setCoverageStatus(cityId: number, districtId: number, status: CoverageStatus, actor: AdminActor) {
  // Validate the pair belongs together (prevents cross-city district ids).
  const [district] = await db
    .select({ id: districts.id })
    .from(districts)
    .where(and(eq(districts.id, districtId), eq(districts.cityId, cityId)))
    .limit(1)
  if (!district) return null

  await db
    .insert(coverageAreas)
    .values({ cityId, districtId, status, updatedBy: actor.id, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [coverageAreas.cityId, coverageAreas.districtId],
      set: { status, updatedBy: actor.id, updatedAt: new Date() }
    })

  await recordAudit(actor, 'coverage', districtId, 'set_status', { cityId, status })
  return { cityId, districtId, status }
}

/** Bulk-set: one status for many districts of one city (FR-7.2). */
export async function bulkSetCoverageStatus(cityId: number, districtIds: number[], status: CoverageStatus, actor: AdminActor) {
  if (districtIds.length === 0) return 0
  const owned = await db
    .select({ id: districts.id })
    .from(districts)
    .where(and(eq(districts.cityId, cityId), inArray(districts.id, districtIds)))
  const ids = owned.map((d) => d.id)
  if (ids.length === 0) return 0

  await db
    .insert(coverageAreas)
    .values(ids.map((districtId) => ({ cityId, districtId, status, updatedBy: actor.id, updatedAt: new Date() })))
    .onConflictDoUpdate({
      target: [coverageAreas.cityId, coverageAreas.districtId],
      set: { status, updatedBy: actor.id, updatedAt: new Date() }
    })

  await recordAudit(actor, 'coverage', null, 'bulk_set_status', { cityId, districtIds: ids, status, count: ids.length })
  return ids.length
}

export async function createCity(input: { name: string; province: string }) {
  const slug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const [row] = await db
    .insert(cities)
    .values({ name: input.name.trim(), slug, province: input.province.trim() })
    .onConflictDoNothing()
    .returning()
  return row ?? null
}

export async function createDistrict(cityId: number, name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const [row] = await db
    .insert(districts)
    .values({ cityId, name: name.trim(), slug })
    .returning()
  return row
}

/** Per-district demand view (FR-5.2 / §13): area requests + coverage status. */
export async function demandByDistrict() {
  const rows = await db
    .select({
      districtId: districts.id,
      districtName: districts.name,
      cityName: cities.name,
      requests: sql<number>`count(distinct ${areaRequests.id})`.as('requests')
    })
    .from(districts)
    .innerJoin(cities, eq(districts.cityId, cities.id))
    .leftJoin(areaRequests, eq(areaRequests.districtId, districts.id))
    .groupBy(districts.id, districts.name, cities.name)
    .orderBy(desc(sql`count(distinct ${areaRequests.id})`), asc(districts.name))
  return rows
}

/** Packages with their per-area price overrides (FR-7.3 matrix editor, read side). */
export async function priceMatrix() {
  const pkgs = await db
    .select({ id: packages.id, name: packages.name, slug: packages.slug, basePriceIdr: packages.basePriceIdr })
    .from(packages)
    .orderBy(asc(packages.sortOrder))
  const overrides = await db
    .select({
      id: packageAreaPrices.id,
      packageId: packageAreaPrices.packageId,
      cityId: packageAreaPrices.cityId,
      districtId: packageAreaPrices.districtId,
      priceIdr: packageAreaPrices.priceIdr,
      isActive: packageAreaPrices.isActive
    })
    .from(packageAreaPrices)
    .where(eq(packageAreaPrices.isActive, true))
  return { packages: pkgs, overrides }
}

/** Upsert one per-area price override (FR-7.3). */
export async function setPackageAreaPrice(
  packageId: number,
  cityId: number,
  districtId: number | null,
  priceIdr: number,
  actor: AdminActor
) {
  const existing = await db
    .select({ id: packageAreaPrices.id })
    .from(packageAreaPrices)
    .where(
      and(
        eq(packageAreaPrices.packageId, packageId),
        eq(packageAreaPrices.cityId, cityId),
        districtId === null ? sql`${packageAreaPrices.districtId} is null` : eq(packageAreaPrices.districtId, districtId)
      )
    )
    .limit(1)

  let id: number
  if (existing.length > 0) {
    id = existing[0]!.id
    await db.update(packageAreaPrices).set({ priceIdr, isActive: true }).where(eq(packageAreaPrices.id, id))
  } else {
    const [row] = await db
      .insert(packageAreaPrices)
      .values({ packageId, cityId, districtId, priceIdr })
      .returning({ id: packageAreaPrices.id })
    id = row!.id
  }
  await recordAudit(actor, 'package_area_price', id, 'set_price', { packageId, cityId, districtId, priceIdr })
  return { id, priceIdr }
}
