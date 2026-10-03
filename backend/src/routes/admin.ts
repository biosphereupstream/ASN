import { Elysia, t } from 'elysia'
import {
  ALL_ADMIN_ROLES,
  CATALOG_ROLES,
  CONTENT_ROLES,
  COVERAGE_ROLES,
  LEADS_ROLES,
  USER_MGMT_ROLES,
  createAdminUser,
  listAdminUsers,
  login,
  logout,
  pruneExpiredSessions,
  resetAdminUserPassword,
  resolveActor,
  updateAdminUser,
  type AdminActor,
  type AdminRole
} from '../services/auth.service'
import {
  createPackage,
  deletePackageAreaPrice,
  listAdminPackages,
  listProducts,
  reorderPackages,
  updatePackage
} from '../services/packageAdmin.service'
import {
  getContentBlock,
  listAllContentBlocks,
  upsertContentBlock
} from '../services/contentAdmin.service'
import {
  bulkUpdateStatus,
  exportLeadsCsv,
  LEAD_STATUSES,
  listLeads,
  newLeadsCount,
  updateLeadNotes,
  updateLeadStatus,
  type LeadStatus
} from '../services/leads.service'
import {
  bulkSetCoverageStatus,
  coverageMatrix,
  createCity,
  createDistrict,
  demandByDistrict,
  priceMatrix,
  setCoverageStatus,
  setPackageAreaPrice,
  type CoverageStatus
} from '../services/coverageAdmin.service'
import { db } from '../db/client'
import { areaRequests } from '../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Admin API surface (PRD FR-7 / §13), all guarded by the session cookie:
 *
 *   POST   /api/admin/login                       → session cookie
 *   POST   /api/admin/logout
 *   GET    /api/admin/me
 *   GET    /api/admin/leads?status=&city=&package=&source=&since=&q=&page=
 *   PATCH  /api/admin/leads/:id                   → { status?, notes? }
 *   POST   /api/admin/leads/bulk                  → { ids, status }
 *   GET    /api/admin/leads/export.csv            → text/csv
 *   GET    /api/admin/coverage                    → full matrix
 *   PUT    /api/admin/coverage/:cityId/:districtId → { status }
 *   POST   /api/admin/coverage/bulk               → { cityId, districtIds, status }
 *   POST   /api/admin/cities | /api/admin/districts
 *   GET    /api/admin/demand                      → per-district aggregation
 *   GET    /api/admin/prices  |  PUT /api/admin/prices
 *   PATCH  /api/admin/area-requests/:id           → mark reviewed
 */

const SESSION_COOKIE = 'asn_admin_session'
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/'
} as const

async function actorFromCookie(cookieValue: string | undefined): Promise<AdminActor | null> {
  return resolveActor(cookieValue)
}

function error(set: { status?: number | string }, code: number, value: unknown) {
  set.status = code
  return value
}

export const adminRoutes = new Elysia({ prefix: '/api/admin' })
  // --- Auth ---------------------------------------------------------------
  .post(
    '/login',
    async ({ body, set, cookie }) => {
      const result = await login(body.email, body.password)
      if (!result.ok) {
        set.status = result.error === 'RATE_LIMITED' ? 429 : 401
        return { error: result.error }
      }
      cookie[SESSION_COOKIE]?.set({
        value: result.token,
        ...COOKIE_OPTIONS,
        expires: result.expiresAt,
        maxAge: 7 * 24 * 60 * 60
      })
      return { actor: result.actor }
    },
    {
      body: t.Object({ email: t.String({ minLength: 3 }), password: t.String({ minLength: 1 }) })
    }
  )
  .post('/logout', async ({ cookie }) => {
    const token = cookie[SESSION_COOKIE]?.value as string | undefined as string | undefined
    if (token) await logout(token)
    cookie[SESSION_COOKIE]?.set({ value: '', ...COOKIE_OPTIONS, maxAge: 0 })
    return { ok: true }
  })
  .get('/me', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    return { actor }
  })

  // --- Leads inbox (FR-7.4) — sales/marketing/admin --------------------------
  .get(
    '/leads',
    async ({ set, cookie, query }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      const status = LEAD_STATUSES.includes(query.status as LeadStatus) ? (query.status as LeadStatus) : undefined
      const since = query.since ? new Date(query.since) : undefined
      const sources = ['homepage_checker', 'package_card', 'product_page', 'promo_page', 'contact_page', 'waitlist'] as const
      type LeadSource = (typeof sources)[number]
      const source = sources.includes(query.source as LeadSource) ? (query.source as LeadSource) : undefined
      return {
        ...(await listLeads({
          status,
          citySlug: query.city || undefined,
          packageSlug: query.package || undefined,
          source,
          since: since && !Number.isNaN(since.getTime()) ? since : undefined,
          q: query.q || undefined,
          page: query.page ? Number(query.page) : undefined,
          pageSize: query.pageSize ? Number(query.pageSize) : undefined
        })),
        newCount: await newLeadsCount()
      }
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        city: t.Optional(t.String()),
        package: t.Optional(t.String()),
        source: t.Optional(t.String()),
        since: t.Optional(t.String()),
        q: t.Optional(t.String()),
        page: t.Optional(t.String()),
        pageSize: t.Optional(t.String())
      })
    }
  )
  .patch(
    '/leads/:id',
    async ({ set, cookie, params, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!LEADS_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })

      let statusResult: unknown = undefined
      let notesResult: unknown = undefined
      if (body.status !== undefined) {
        if (!LEAD_STATUSES.includes(body.status as LeadStatus)) return error(set, 422, { error: 'BAD_STATUS' })
        statusResult = await updateLeadStatus(params.id, body.status as LeadStatus, actor)
        if (!statusResult) return error(set, 404, { error: 'LEAD_NOT_FOUND' })
      }
      if (body.notes !== undefined) {
        notesResult = await updateLeadNotes(params.id, body.notes, actor)
        if (!notesResult) return error(set, 404, { error: 'LEAD_NOT_FOUND' })
      }
      if (statusResult === undefined && notesResult === undefined) return error(set, 422, { error: 'EMPTY_UPDATE' })
      return { ok: true }
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: t.Object({ status: t.Optional(t.String()), notes: t.Optional(t.String()) })
    }
  )
  .post(
    '/leads/bulk',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!LEADS_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      if (!LEAD_STATUSES.includes(body.status as LeadStatus)) return error(set, 422, { error: 'BAD_STATUS' })
      if (body.ids.length === 0) return error(set, 422, { error: 'EMPTY_IDS' })
      const updated = await bulkUpdateStatus(body.ids, body.status as LeadStatus, actor)
      return { updated }
    },
    {
      body: t.Object({ ids: t.Array(t.Numeric(), { minItems: 1 }), status: t.String() })
    }
  )
  .get(
    '/leads/export.csv',
    async ({ set, cookie, query }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      const status = LEAD_STATUSES.includes(query.status as LeadStatus) ? (query.status as LeadStatus) : undefined
      const since = query.since && !Number.isNaN(new Date(query.since).getTime()) ? new Date(query.since) : undefined
      const sources = ['homepage_checker', 'package_card', 'product_page', 'promo_page', 'contact_page', 'waitlist'] as const
      type LeadSource = (typeof sources)[number]
      const source = sources.includes(query.source as LeadSource) ? (query.source as LeadSource) : undefined
      const csv = await exportLeadsCsv({
        status,
        citySlug: query.city || undefined,
        packageSlug: query.package || undefined,
        source,
        since
      })
      set.headers['Content-Type'] = 'text/csv; charset=utf-8'
      set.headers['Content-Disposition'] = `attachment; filename="asnnet-leads-${new Date().toISOString().slice(0, 10)}.csv"`
      return csv
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        city: t.Optional(t.String()),
        package: t.Optional(t.String()),
        source: t.Optional(t.String()),
        since: t.Optional(t.String())
      })
    }
  )

  // --- Coverage management (FR-7.2) — noc/admin -------------------------------
  .get('/coverage', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    return { cities: await coverageMatrix() }
  })
  .put(
    '/coverage/:cityId/:districtId',
    async ({ set, cookie, params, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!COVERAGE_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      const row = await setCoverageStatus(params.cityId, params.districtId, body.status as CoverageStatus, actor)
      if (!row) return error(set, 404, { error: 'DISTRICT_NOT_IN_CITY' })
      return row
    },
    {
      params: t.Object({ cityId: t.Numeric(), districtId: t.Numeric() }),
      body: t.Object({ status: t.String() })
    }
  )
  .post(
    '/coverage/bulk',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!COVERAGE_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      const updated = await bulkSetCoverageStatus(body.cityId, body.districtIds, body.status as CoverageStatus, actor)
      return { updated }
    },
    {
      body: t.Object({ cityId: t.Numeric(), districtIds: t.Array(t.Numeric(), { minItems: 1 }), status: t.String() })
    }
  )
  .post(
    '/cities',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!COVERAGE_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      const row = await createCity(body)
      if (!row) return error(set, 409, { error: 'CITY_EXISTS' })
      return row
    },
    { body: t.Object({ name: t.String({ minLength: 2 }), province: t.String({ minLength: 2 }) }) }
  )
  .post(
    '/districts',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!COVERAGE_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      return await createDistrict(body.cityId, body.name)
    },
    { body: t.Object({ cityId: t.Numeric(), name: t.String({ minLength: 2 }) }) }
  )

  // --- Demand view (FR-5.2) + area requests ----------------------------------
  .get('/demand', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    return { districts: await demandByDistrict() }
  })
  .patch(
    '/area-requests/:id',
    async ({ set, cookie, params }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      const updated = await db
        .update(areaRequests)
        .set({ status: 'reviewed' })
        .where(eq(areaRequests.id, params.id))
        .returning({ id: areaRequests.id })
      if (updated.length === 0) return error(set, 404, { error: 'NOT_FOUND' })
      return { ok: true }
    },
    { params: t.Object({ id: t.Numeric() }) }
  )

  // --- Price matrix (FR-7.3 read/write) ---------------------------------------
  .get('/prices', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    return await priceMatrix()
  })
  .put(
    '/prices',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!['admin', 'marketing'].includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      return await setPackageAreaPrice(body.packageId, body.cityId, body.districtId ?? null, body.priceIdr, actor)
    },
    {
      body: t.Object({
        packageId: t.Numeric(),
        cityId: t.Numeric(),
        districtId: t.Optional(t.Numeric()),
        priceIdr: t.Numeric({ minimum: 0 })
      })
    }
  )
  .delete(
    '/prices/:id',
    async ({ set, cookie, params }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!CATALOG_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      const ok = await deletePackageAreaPrice(params.id, actor)
      if (!ok) return error(set, 404, { error: 'OVERRIDE_NOT_FOUND' })
      return { ok: true }
    },
    { params: t.Object({ id: t.Numeric() }) }
  )

  // --- Package catalog CRUD (FR-7.3) — admin/marketing -----------------------
  .get('/packages', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    if (!CATALOG_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
    return {
      packages: await listAdminPackages(),
      products: await listProducts()
    }
  })
  .post(
    '/packages',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!CATALOG_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })

      try {
        const pkg = await createPackage(
          {
            productId: body.productId,
            name: body.name,
            slug: body.slug || undefined,
            speedMbps: body.speedMbps,
            basePriceIdr: body.basePriceIdr,
            devicesMin: body.devicesMin,
            devicesMax: body.devicesMax,
            features: body.features
          },
          actor
        )
        return { ok: true, package: pkg }
      } catch (err: unknown) {
        const msg = (err as Error)?.message || ''
        if (msg.includes('unique') || msg.includes('duplicate')) {
          return error(set, 409, { error: 'SLUG_EXISTS' })
        }
        return error(set, 422, { error: 'INVALID_PACKAGE_DATA' })
      }
    },
    {
      body: t.Object({
        productId: t.Numeric(),
        name: t.String({ minLength: 2 }),
        slug: t.Optional(t.String()),
        speedMbps: t.Numeric({ minimum: 1 }),
        basePriceIdr: t.Numeric({ minimum: 0 }),
        devicesMin: t.Numeric({ minimum: 1 }),
        devicesMax: t.Numeric({ minimum: 1 }),
        features: t.Optional(t.Array(t.String()))
      })
    }
  )
  .patch(
    '/packages/:id',
    async ({ set, cookie, params, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!CATALOG_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })

      try {
        const pkg = await updatePackage(params.id, body, actor)
        if (!pkg) return error(set, 404, { error: 'PACKAGE_NOT_FOUND' })
        return { ok: true, package: pkg }
      } catch (err: unknown) {
        const msg = (err as Error)?.message || ''
        if (msg.includes('unique') || msg.includes('duplicate')) {
          return error(set, 409, { error: 'SLUG_EXISTS' })
        }
        return error(set, 422, { error: 'INVALID_PACKAGE_DATA' })
      }
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: t.Object({
        productId: t.Optional(t.Numeric()),
        name: t.Optional(t.String({ minLength: 2 })),
        slug: t.Optional(t.String()),
        speedMbps: t.Optional(t.Numeric({ minimum: 1 })),
        basePriceIdr: t.Optional(t.Numeric({ minimum: 0 })),
        devicesMin: t.Optional(t.Numeric({ minimum: 1 })),
        devicesMax: t.Optional(t.Numeric({ minimum: 1 })),
        features: t.Optional(t.Array(t.String())),
        isActive: t.Optional(t.Boolean())
      })
    }
  )
  .post(
    '/packages/reorder',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!CATALOG_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      await reorderPackages(body.orderedIds, actor)
      return { ok: true }
    },
    {
      body: t.Object({ orderedIds: t.Array(t.Numeric(), { minItems: 1 }) })
    }
  )

  // --- Content blocks CMS (FR-6 / FR-7.6) — admin/marketing ------------------
  .get('/content', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    if (!CONTENT_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
    return { blocks: await listAllContentBlocks() }
  })
  .put(
    '/content/:key',
    async ({ set, cookie, params, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!CONTENT_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
      const block = await upsertContentBlock(params.key, body.data, actor)
      return { ok: true, block }
    },
    {
      params: t.Object({ key: t.String() }),
      body: t.Object({ data: t.Record(t.String(), t.Any()) })
    }
  )

  // --- Admin users management (FR-7.1 / FR-7.5) — admin only ----------------
  .get('/users', async ({ set, cookie }) => {
    const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
    if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
    if (!USER_MGMT_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })
    return { users: await listAdminUsers() }
  })
  .post(
    '/users',
    async ({ set, cookie, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!USER_MGMT_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })

      const result = await createAdminUser(
        {
          email: body.email,
          name: body.name,
          role: body.role as AdminRole,
          password: body.password
        },
        actor
      )
      if (!result.ok) {
        if (result.error === 'EMAIL_EXISTS') return error(set, 409, { error: 'EMAIL_EXISTS' })
        return error(set, 422, { error: result.error })
      }
      return { ok: true, user: result.user }
    },
    {
      body: t.Object({
        email: t.String({ minLength: 3 }),
        name: t.String({ minLength: 2 }),
        role: t.String(),
        password: t.String({ minLength: 6 })
      })
    }
  )
  .patch(
    '/users/:id',
    async ({ set, cookie, params, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!USER_MGMT_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })

      const result = await updateAdminUser(
        params.id,
        {
          name: body.name,
          role: body.role as AdminRole | undefined,
          isActive: body.isActive
        },
        actor
      )
      if (!result.ok) {
        if (result.error === 'USER_NOT_FOUND') return error(set, 404, { error: 'USER_NOT_FOUND' })
        if (result.error === 'CANNOT_DEACTIVATE_SELF') return error(set, 400, { error: 'CANNOT_DEACTIVATE_SELF' })
        if (result.error === 'CANNOT_DEMOTE_SELF') return error(set, 400, { error: 'CANNOT_DEMOTE_SELF' })
        return error(set, 422, { error: result.error })
      }
      return { ok: true }
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        role: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean())
      })
    }
  )
  .post(
    '/users/:id/reset-password',
    async ({ set, cookie, params, body }) => {
      const actor = await actorFromCookie(cookie[SESSION_COOKIE]?.value as string | undefined)
      if (!actor) return error(set, 401, { error: 'UNAUTHENTICATED' })
      if (!USER_MGMT_ROLES.includes(actor.role)) return error(set, 403, { error: 'FORBIDDEN' })

      const result = await resetAdminUserPassword(params.id, body.password, actor)
      if (!result.ok) return error(set, 404, { error: 'USER_NOT_FOUND' })
      return { ok: true }
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: t.Object({
        password: t.String({ minLength: 6 })
      })
    }
  )

  // Small on-boot hygiene so expired sessions don't accumulate.
  .onStart(async () => {
    await pruneExpiredSessions().catch(() => undefined)
  })
