import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

const DEFAULT_NEON_BACKEND = 'https://br-fancy-art-b3qeo6vx-api.compute.c-4.ap-southeast-1.aws.neon.tech'

async function callBackend(path: string, init?: RequestInit): Promise<Response> {
  const primary =
    process.env.NEON_FUNCTION_API_BASE_URL ||
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === 'production' ? DEFAULT_NEON_BACKEND : 'http://127.0.0.1:3001')
  try {
    return await fetch(`${primary}${path}`, init)
  } catch (err) {
    if (primary !== DEFAULT_NEON_BACKEND) {
      return await fetch(`${DEFAULT_NEON_BACKEND}${path}`, init)
    }
    throw err
  }
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.actor) redirect(302, '/admin/leads')
  // Surface dev credentials only outside production.
  return { devHint: process.env.NODE_ENV !== 'production', error: url.searchParams.get('error') }
}

export const actions: Actions = {
  async default({ request, cookies, fetch, url }) {
    const form = await request.formData()
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')

    let res: Response
    try {
      res = await callBackend('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
    } catch {
      return fail(502, { error: 'BACKEND_UNREACHABLE' })
    }

    if (!res.ok) {
      const status = res.status === 429 ? 'RATE_LIMITED' : 'INVALID_CREDENTIALS'
      redirect(302, `/admin/login?error=${status}`)
    }

    const setCookie = res.headers.get('set-cookie') ?? ''
    const token = /asn_admin_session=([^;]+)/.exec(setCookie)?.[1]
    if (!token) redirect(302, '/admin/login?error=INVALID_CREDENTIALS')

    cookies.set('asn_admin_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    const next = url.searchParams.get('next')
    redirect(302, next && next.startsWith('/admin') ? next : '/admin/leads')
  }
}
