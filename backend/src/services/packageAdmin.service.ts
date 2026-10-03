import { asc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { packages, products, packageAreaPrices } from '../db/schema'
import { recordAudit, type AdminActor } from './auth.service'

export interface CreatePackageInput {
  productId: number
  name: string
  slug?: string
  speedMbps: number
  basePriceIdr: number
  devicesMin: number
  devicesMax: number
  features?: string[]
}

export interface UpdatePackageInput {
  productId?: number
  name?: string
  slug?: string
  speedMbps?: number
  basePriceIdr?: number
  devicesMin?: number
  devicesMax?: number
  features?: string[]
  isActive?: boolean
}

export async function listAdminPackages() {
  const rows = await db
    .select({
      id: packages.id,
      productId: packages.productId,
      productKey: products.key,
      productName: products.name,
      slug: packages.slug,
      name: packages.name,
      speedMbps: packages.speedMbps,
      basePriceIdr: packages.basePriceIdr,
      devicesMin: packages.devicesMin,
      devicesMax: packages.devicesMax,
      features: packages.features,
      sortOrder: packages.sortOrder,
      isActive: packages.isActive
    })
    .from(packages)
    .innerJoin(products, eq(packages.productId, products.id))
    .orderBy(asc(packages.sortOrder), asc(packages.id))

  return rows
}

export async function listProducts() {
  return await db
    .select({
      id: products.id,
      key: products.key,
      name: products.name,
      tagline: products.tagline,
      isActive: products.isActive
    })
    .from(products)
    .orderBy(asc(products.sortOrder))
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createPackage(input: CreatePackageInput, actor: AdminActor) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name)

  const [maxOrder] = await db
    .select({ max: sql<number>`coalesce(max(${packages.sortOrder}), 0)` })
    .from(packages)

  const nextOrder = (maxOrder?.max ?? 0) + 1

  const [row] = await db
    .insert(packages)
    .values({
      productId: input.productId,
      name: input.name.trim(),
      slug,
      speedMbps: input.speedMbps,
      basePriceIdr: input.basePriceIdr,
      devicesMin: input.devicesMin,
      devicesMax: input.devicesMax,
      features: input.features ?? [],
      sortOrder: nextOrder,
      isActive: true
    })
    .returning()

  await recordAudit(actor, 'package', row.id, 'create', { ...input, slug, sortOrder: nextOrder })
  return row
}

export async function updatePackage(id: number, input: UpdatePackageInput, actor: AdminActor) {
  const updates: Record<string, unknown> = {}

  if (input.productId !== undefined) updates.productId = input.productId
  if (input.name !== undefined) updates.name = input.name.trim()
  if (input.slug !== undefined) updates.slug = slugify(input.slug)
  if (input.speedMbps !== undefined) updates.speedMbps = input.speedMbps
  if (input.basePriceIdr !== undefined) updates.basePriceIdr = input.basePriceIdr
  if (input.devicesMin !== undefined) updates.devicesMin = input.devicesMin
  if (input.devicesMax !== undefined) updates.devicesMax = input.devicesMax
  if (input.features !== undefined) updates.features = input.features
  if (input.isActive !== undefined) updates.isActive = input.isActive

  if (Object.keys(updates).length === 0) return null

  const [row] = await db
    .update(packages)
    .set(updates)
    .where(eq(packages.id, id))
    .returning()

  if (row) {
    await recordAudit(actor, 'package', id, 'update', updates)
  }
  return row ?? null
}

export async function reorderPackages(orderedIds: number[], actor: AdminActor) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(packages)
      .set({ sortOrder: i + 1 })
      .where(eq(packages.id, orderedIds[i]))
  }
  await recordAudit(actor, 'package', null, 'reorder', { orderedIds })
  return { ok: true }
}

export async function deletePackageAreaPrice(id: number, actor: AdminActor) {
  const [deleted] = await db
    .delete(packageAreaPrices)
    .where(eq(packageAreaPrices.id, id))
    .returning()

  if (deleted) {
    await recordAudit(actor, 'package_area_price', id, 'delete', { deleted })
  }
  return !!deleted
}
