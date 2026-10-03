import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

type Role = 'admin' | 'marketing' | 'sales' | 'noc'

const ROLE_ALLOWED_ROUTES: Record<Role, string[]> = {
  admin: ['/admin/leads', '/admin/coverage', '/admin/demand', '/admin/packages', '/admin/content', '/admin/users'],
  marketing: ['/admin/leads', '/admin/demand', '/admin/packages', '/admin/content'],
  sales: ['/admin/leads'],
  noc: ['/admin/coverage', '/admin/demand']
}

const DEFAULT_ROUTE_FOR_ROLE: Record<Role, string> = {
  admin: '/admin/leads',
  marketing: '/admin/leads',
  sales: '/admin/leads',
  noc: '/admin/coverage'
}

/**
 * Server-side guard for the whole /admin tree (PRD §13 / FR-7). The SvelteKit server
 * validates the session and role permissions, rendering the shell for allowed routes
 * or redirecting unauthorized users to their permitted default tab.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
  const { actor } = locals

  if (!actor) {
    if (url.pathname.startsWith('/admin/login')) return { actor: null }
    redirect(302, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`)
  }

  // Already logged in, visiting login page -> redirect to default
  if (url.pathname.startsWith('/admin/login')) {
    redirect(302, DEFAULT_ROUTE_FOR_ROLE[actor.role])
  }

  // Direct visit to /admin root -> redirect to role's default landing tab
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    redirect(302, DEFAULT_ROUTE_FOR_ROLE[actor.role])
  }

  // Route permission check
  const allowed = ROLE_ALLOWED_ROUTES[actor.role] || []
  const isAllowed = allowed.some((route) => url.pathname.startsWith(route))

  if (!isAllowed) {
    const fallback = DEFAULT_ROUTE_FOR_ROLE[actor.role]
    redirect(302, `${fallback}?denied=1`)
  }

  return { actor }
}
