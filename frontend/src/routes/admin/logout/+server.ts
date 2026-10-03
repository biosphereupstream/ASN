import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

/**
 * Logout endpoint (PRD §13): clears the admin session cookie, best-effort
 * deletes the backend session record, then returns to the login page.
 */
export const POST: RequestHandler = async ({ cookies, fetch }) => {
  const token = cookies.get('asn_admin_session')
  cookies.delete('asn_admin_session', { path: '/' })

  if (token) {
    try {
      const backend = process.env.NEON_FUNCTION_API_BASE_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001'
      await fetch(`${backend}/api/admin/logout`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` }
      })
    } catch {
      // Backend down — cookie is cleared anyway; the session record expires.
    }
  }

  redirect(302, '/admin/login')
}
