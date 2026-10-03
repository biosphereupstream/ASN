import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'
import { and, asc, eq, gt, lt, or } from 'drizzle-orm'
import { db } from '../db/client'
import { adminSessions, adminUsers, auditLogs } from '../db/schema'

/**
 * Admin auth per PRD FR-7.1:
 * - email + password (argon2id via Bun.password)
 * - session cookie: opaque random token in an httpOnly SameSite=Lax cookie;
 *   the DB stores only the token's SHA-256 hash (server-side revocation).
 * - roles: admin | marketing | sales | noc (enforced per-route below).
 *
 * Login is rate-limited per email+IP to blunt credential stuffing; all
 * admin mutations land in `audit_logs` (§13) via `recordAudit`.
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_LOGIN_ATTEMPTS = 8

export interface AdminActor {
  id: number
  email: string
  name: string
  role: 'admin' | 'marketing' | 'sales' | 'noc'
}

export type AdminRole = AdminActor['role']
export const ALL_ADMIN_ROLES: AdminRole[] = ['admin', 'marketing', 'sales', 'noc']

/** Roles allowed to mutate coverage (NOC owns coverage per PRD §15). */
export const COVERAGE_ROLES: AdminRole[] = ['admin', 'noc']
/** Roles allowed to work the leads pipeline (sales workflow per §13). */
export const LEADS_ROLES: AdminRole[] = ['admin', 'sales', 'marketing']
/** Roles allowed to manage packages & prices. */
export const CATALOG_ROLES: AdminRole[] = ['admin', 'marketing']
/** Roles allowed to edit CMS content blocks. */
export const CONTENT_ROLES: AdminRole[] = ['admin', 'marketing']
/** Roles allowed to manage admin users. */
export const USER_MGMT_ROLES: AdminRole[] = ['admin']

// --- In-memory login rate limiting (per process; fine for a single-node dev API) ---
const attempts = new Map<string, { count: number; firstAt: number }>()
const WINDOW_MS = 15 * 60 * 1000

function loginRateLimited(key: string): boolean {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now })
    return false
  }
  rec.count += 1
  return rec.count > MAX_LOGIN_ATTEMPTS
}

// --- Token helpers ---------------------------------------------------------

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function constantTimeEquals(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

// --- Login / logout --------------------------------------------------------

export async function login(
  email: string,
  password: string
): Promise<{ ok: true; token: string; expiresAt: Date; actor: AdminActor } | { ok: false; error: 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'INACTIVE' }> {
  if (loginRateLimited(email.toLowerCase())) {
    return { ok: false, error: 'RATE_LIMITED' }
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1)

  // Uniform failure for unknown email / wrong password / inactive user.
  const hash = user?.passwordHash ?? 'asnnet-dummy-hash'
  const passwordOk = await Bun.password.verify(password, hash).catch(() => false)
  if (!user || !user.isActive || !passwordOk) {
    return { ok: false, error: 'INVALID_CREDENTIALS' }
  }

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.insert(adminSessions).values({ userId: user.id, tokenHash: hashToken(token), expiresAt })

  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id))
  attempts.delete(email.toLowerCase())

  return {
    ok: true,
    token,
    expiresAt,
    actor: { id: user.id, email: user.email, name: user.name, role: user.role }
  }
}

export async function logout(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)))
}

// --- Session resolution ----------------------------------------------------

export async function resolveActor(token: string | undefined): Promise<AdminActor | null> {
  if (!token) return null
  const [row] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      expiresAt: adminSessions.expiresAt
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1)

  if (!row || !row.isActive) return null
  return { id: row.id, email: row.email, name: row.name, role: row.role }
}

// --- Audit trail (§13, FR-7.7) ----------------------------------------------

export async function recordAudit(
  actor: AdminActor | null,
  entity: string,
  entityId: number | null,
  action: string,
  diff: Record<string, unknown>
): Promise<void> {
  await db.insert(auditLogs).values({
    actorId: actor?.id ?? null,
    entity,
    entityId,
    action,
    diff
  })
}

/** Housekeeping: drop expired sessions and stale login-attempt counters. */
export async function pruneExpiredSessions(): Promise<void> {
  await db.delete(adminSessions).where(or(lt(adminSessions.expiresAt, new Date()), lt(adminSessions.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))))
}

// Exported for tests / tooling that want to seed a real hash.
export function constantTimeEqualsExport(a: string, b: string): boolean {
  return constantTimeEquals(a, b)
}

// --- Admin user management (FR-7.1 / FR-7.5) -------------------------------

export async function listAdminUsers() {
  return await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.id))
}

export async function createAdminUser(
  input: { email: string; name: string; role: AdminRole; password: string },
  actor: AdminActor
): Promise<{ ok: true; user: { id: number; email: string; name: string; role: AdminRole } } | { ok: false; error: 'EMAIL_EXISTS' | 'INVALID_ROLE' }> {
  if (!ALL_ADMIN_ROLES.includes(input.role)) {
    return { ok: false, error: 'INVALID_ROLE' }
  }

  const normalizedEmail = input.email.toLowerCase().trim()
  const [existing] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail))
    .limit(1)

  if (existing) {
    return { ok: false, error: 'EMAIL_EXISTS' }
  }

  const passwordHash = await Bun.password.hash(input.password, {
    algorithm: 'argon2id',
    memoryCost: 19456,
    timeCost: 2
  })

  const [created] = await db
    .insert(adminUsers)
    .values({
      email: normalizedEmail,
      passwordHash,
      name: input.name.trim(),
      role: input.role,
      isActive: true
    })
    .returning({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role
    })

  await recordAudit(actor, 'admin_user', created.id, 'create', {
    email: normalizedEmail,
    name: input.name.trim(),
    role: input.role
  })

  return { ok: true, user: created }
}

export async function updateAdminUser(
  id: number,
  input: { name?: string; role?: AdminRole; isActive?: boolean },
  actor: AdminActor
): Promise<{ ok: true } | { ok: false; error: 'USER_NOT_FOUND' | 'CANNOT_DEACTIVATE_SELF' | 'CANNOT_DEMOTE_SELF' | 'INVALID_ROLE' }> {
  if (input.role !== undefined && !ALL_ADMIN_ROLES.includes(input.role)) {
    return { ok: false, error: 'INVALID_ROLE' }
  }

  if (id === actor.id) {
    if (input.isActive === false) {
      return { ok: false, error: 'CANNOT_DEACTIVATE_SELF' }
    }
    if (input.role !== undefined && input.role !== 'admin') {
      return { ok: false, error: 'CANNOT_DEMOTE_SELF' }
    }
  }

  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) updates.name = input.name.trim()
  if (input.role !== undefined) updates.role = input.role
  if (input.isActive !== undefined) updates.isActive = input.isActive

  if (Object.keys(updates).length === 0) return { ok: true }

  const [updated] = await db
    .update(adminUsers)
    .set(updates)
    .where(eq(adminUsers.id, id))
    .returning({ id: adminUsers.id })

  if (!updated) return { ok: false, error: 'USER_NOT_FOUND' }

  // If user is deactivated, revoke all active sessions immediately
  if (input.isActive === false) {
    await db.delete(adminSessions).where(eq(adminSessions.userId, id))
  }

  await recordAudit(actor, 'admin_user', id, 'update', updates)
  return { ok: true }
}

export async function resetAdminUserPassword(
  id: number,
  newPassword: string,
  actor: AdminActor
): Promise<{ ok: true } | { ok: false; error: 'USER_NOT_FOUND' }> {
  const [user] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1)

  if (!user) return { ok: false, error: 'USER_NOT_FOUND' }

  const passwordHash = await Bun.password.hash(newPassword, {
    algorithm: 'argon2id',
    memoryCost: 19456,
    timeCost: 2
  })

  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id))

  // Invalidate sessions for that user (if not actor resetting their own password)
  if (id !== actor.id) {
    await db.delete(adminSessions).where(eq(adminSessions.userId, id))
  }

  await recordAudit(actor, 'admin_user', id, 'reset_password', {})
  return { ok: true }
}

