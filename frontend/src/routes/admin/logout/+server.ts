import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

/**
 * Logout endpoint (PRD §13): clears the admin session cookie, best-effort
 * deletes the backend session record, then returns to the login page.
 */
const DEFAULT_NEON_BACKEND = 'https://br-fancy-art-b3qeo6vx-api.compute.c-4.ap-southeast-1.aws.neon.tech'

export const POST: RequestHandler = async ({ cookies, fetch }) => {
  const token = cookies.get('asn_admin_session')
  cookies.delete('asn_admin_session', { path: '/' })

  if (token) {
    try {
      const primary =
        process.env.NEON_FUNCTION_API_BASE_URL ||
        process.env.BACKEND_URL ||
        (process.env.NODE_ENV === 'production' ? DEFAULT_NEON_BACKEND : 'http://127.0.0.1:3001')

      try {
        await fetch(`${primary}/api/admin/logout`, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` }
        })
      } catch {
        if (primary !== DEFAULT_NEON_BACKEND) {
          await fetch(`${DEFAULT_NEON_BACKEND}/api/admin/logout`, {
            method: 'POST',
            headers: { authorization: `Bearer ${token}` }
          })
        }
      }
    } catch {
      // Backend down — cookie is cleared anyway; the session record expires.
    }
  }

  redirect(302, '/admin/login')
}
