import { and, asc, count, desc, eq, gte, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { cities, districts, leads, packages } from '../db/schema'
import { recordAudit, type AdminActor } from './auth.service'

/**
 * Leads inbox service per PRD FR-7.4 / §13:
 * - filtered, paginated list (status, city, package, source, search)
 * - status pipeline `new → contacted → scheduled → installed → lost`
 * - internal notes, bulk status updates, CSV export
 */

export const LEAD_STATUSES = ['new', 'contacted', 'scheduled', 'installed', 'lost'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export interface LeadFilters {
  status?: LeadStatus
  citySlug?: string
  packageSlug?: string
  source?: (typeof leads.$inferSelect)['source']
  since?: Date
  q?: string
  page?: number
  pageSize?: number
}

export async function listLeads(f: LeadFilters) {
  const page = Math.max(1, f.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, f.pageSize ?? 25))

  const where = []
  if (f.status) where.push(eq(leads.status, f.status))
  if (f.citySlug) where.push(eq(cities.slug, f.citySlug))
  if (f.packageSlug) where.push(eq(packages.slug, f.packageSlug))
  if (f.source) where.push(eq(leads.source, f.source))
  if (f.since) where.push(gte(leads.createdAt, f.since))
  if (f.q) {
    const like = `%${f.q}%`
    where.push(or(ilike(leads.fullName, like), ilike(leads.phone, like), ilike(leads.address, like)))
  }
  const filter = where.length > 0 ? and(...where) : undefined

  const rows = await db
    .select({
      id: leads.id,
      fullName: leads.fullName,
      phone: leads.phone,
      email: leads.email,
      address: leads.address,
      citySlug: cities.slug,
      cityName: cities.name,
      districtName: districts.name,
      packageSlug: packages.slug,
      packageName: packages.name,
      source: leads.source,
      status: leads.status,
      duplicateOf: leads.duplicateOf,
      notes: leads.notes,
      preferredDate: leads.preferredDate,
      createdAt: leads.createdAt
    })
    .from(leads)
    .innerJoin(cities, eq(leads.cityId, cities.id))
    .innerJoin(districts, eq(leads.districtId, districts.id))
    .leftJoin(packages, eq(leads.packageId, packages.id))
    .where(filter)
    .orderBy(desc(leads.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const [totals] = await db
    .select({ total: count() })
    .from(leads)
    .innerJoin(cities, eq(leads.cityId, cities.id))
    .leftJoin(packages, eq(leads.packageId, packages.id))
    .where(filter)

  return { rows, total: totals?.total ?? 0, page, pageSize }
}

export async function updateLeadStatus(id: number, status: LeadStatus, actor: AdminActor) {
  const [row] = await db.select({ id: leads.id, status: leads.status }).from(leads).where(eq(leads.id, id)).limit(1)
  if (!row) return null
  await db.update(leads).set({ status }).where(eq(leads.id, id))
  await recordAudit(actor, 'lead', id, 'status_update', { from: row.status, to: status })
  return { id, status }
}

export async function updateLeadNotes(id: number, notes: string, actor: AdminActor) {
  const [row] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, id)).limit(1)
  if (!row) return null
  await db.update(leads).set({ notes }).where(eq(leads.id, id))
  await recordAudit(actor, 'lead', id, 'notes_update', { length: notes.length })
  return { id }
}

/** Bulk status update (§13 bulk actions). Returns the number of rows updated. */
export async function bulkUpdateStatus(ids: number[], status: LeadStatus, actor: AdminActor) {
  if (ids.length === 0) return 0
  const updated = await db
    .update(leads)
    .set({ status })
    .where(inArray(leads.id, ids))
    .returning({ id: leads.id })
  await recordAudit(actor, 'lead', null, 'bulk_status_update', { ids, to: status, count: updated.length })
  return updated.length
}

/** CSV export honoring the same filters (FR-7.4). */
export async function exportLeadsCsv(f: LeadFilters): Promise<string> {
  const { rows } = await listLeads({ ...f, page: 1, pageSize: 100 })
  const header = 'id,created_at,name,phone,email,city,district,address,package,source,status,notes'
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  const lines = rows.map((r) =>
    [
      r.id,
      r.createdAt?.toISOString(),
      esc(r.fullName),
      esc(r.phone),
      esc(r.email),
      esc(r.cityName),
      esc(r.districtName),
      esc(r.address),
      esc(r.packageName),
      esc(r.source),
      esc(r.status),
      esc(r.notes)
    ].join(',')
  )
  return [header, ...lines].join('\n')
}

/** Inbox badge count: leads awaiting first contact. */
export async function newLeadsCount(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(leads).where(eq(leads.status, 'new'))
  return row?.n ?? 0
}

/** Tiny helper so routes can validate a phone format uniformly (FR-4.1). */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

// Re-exported for route-layer aggregates (demand view joins on these).
export const leadTable = leads
export const sqlHelper = sql
export const ascHelper = asc
