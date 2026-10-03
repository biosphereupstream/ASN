import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://asn.net.id/sitemap.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600'
    }
  })
}
