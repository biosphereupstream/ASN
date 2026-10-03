import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ fetch }) => {
  const domain = 'https://asn.net.id'
  const today = new Date().toISOString().split('T')[0]

  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/paket', priority: '0.9', changefreq: 'daily' },
    { path: '/city', priority: '0.9', changefreq: 'daily' },
    { path: '/layanan', priority: '0.8', changefreq: 'weekly' },
    { path: '/layanan/fiber', priority: '0.8', changefreq: 'weekly' },
    { path: '/layanan/stream', priority: '0.8', changefreq: 'weekly' },
    { path: '/layanan/mesh', priority: '0.8', changefreq: 'weekly' },
    { path: '/layanan/business', priority: '0.8', changefreq: 'weekly' },
    { path: '/daftar', priority: '0.7', changefreq: 'monthly' },
    { path: '/request-area', priority: '0.7', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { path: '/persyaratan-layanan', priority: '0.5', changefreq: 'monthly' },
    { path: '/faq', priority: '0.7', changefreq: 'weekly' }
  ]

  let cityRoutes: { path: string; priority: string; changefreq: string }[] = []
  try {
    const res = await fetch('/api/cities')
    if (res.ok) {
      const cities: { slug: string }[] = await res.json()
      cityRoutes = cities.map((c) => ({
        path: `/city/${c.slug}`,
        priority: '0.8',
        changefreq: 'weekly'
      }))
    }
  } catch {
    cityRoutes = []
  }

  const allUrls = [...staticRoutes, ...cityRoutes]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${domain}${u.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
    }
  })
}
