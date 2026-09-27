import type { Handle } from '@sveltejs/kit'

/**
 * Resolves the admin session actor on every request (PRD FR-7.1 / §13).
 * The backend owns auth; here we only translate the session cookie into an
 * actor for server-side guards. Failures simply mean "no actor".
 */
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.actor = null

  const cookie = event.cookies.get('asn_admin_session')
  if (cookie) {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/admin/me', {
        headers: { cookie: `asn_admin_session=${cookie}` }
      })
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
