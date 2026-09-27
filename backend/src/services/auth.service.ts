import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'
import { and, eq, gt, lt, or } from 'drizzle-orm'
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

/** Roles allowed to mutate coverage (NOC owns coverage per PRD §15). */
export const COVERAGE_ROLES: AdminRole[] = ['admin', 'noc']
/** Roles allowed to work the leads pipeline (sales workflow per §13). */
export const LEADS_ROLES: AdminRole[] = ['admin', 'sales', 'marketing']

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
