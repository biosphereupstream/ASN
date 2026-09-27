import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

/**
 * Server-side guard for the whole /admin tree (PRD §13). The SvelteKit server
 * validates the session (via hooks.server.ts → backend /api/admin/me) and only
 * renders the shell for a valid cookie; everything else lands on /admin/login.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
  const { actor } = locals

  if (!actor) {
    // Never guard the login page itself (avoids a redirect loop).
    if (url.pathname.startsWith('/admin/login')) return { actor: null }
    redirect(302, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`)
  }

  return { actor }
}
