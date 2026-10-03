import type { Handle } from '@sveltejs/kit'

/**
 * Resolves the admin session actor on every request (PRD FR-7.1 / §13).
 * The backend owns auth; here we only translate the session cookie into an
 * actor for server-side guards. Failures simply mean "no actor".
 */
const DEFAULT_NEON_BACKEND = 'https://br-fancy-art-b3qeo6vx-api.compute.c-4.ap-southeast-1.aws.neon.tech'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.actor = null

  const cookie = event.cookies.get('asn_admin_session')
  if (cookie) {
    try {
      const primary =
        process.env.NEON_FUNCTION_API_BASE_URL ||
        process.env.BACKEND_URL ||
        (process.env.NODE_ENV === 'production' ? DEFAULT_NEON_BACKEND : 'http://127.0.0.1:3001')

      let res: Response
      try {
        res = await fetch(`${primary}/api/admin/me`, {
          headers: { cookie: `asn_admin_session=${cookie}` }
        })
      } catch (err) {
        if (primary !== DEFAULT_NEON_BACKEND) {
          res = await fetch(`${DEFAULT_NEON_BACKEND}/api/admin/me`, {
            headers: { cookie: `asn_admin_session=${cookie}` }
          })
        } else {
          throw err
        }
      }

      if (res.ok) {
        const data = (await res.json()) as { actor: App.Locals['actor'] }
        event.locals.actor = data.actor
      }
    } catch {
      // Backend unreachable → treat as logged out; admin pages redirect to login.
    }
  }

  return resolve(event)
}
