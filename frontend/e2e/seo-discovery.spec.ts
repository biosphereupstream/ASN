import { expect, test } from '@playwright/test'

/**
 * E2E tests for Technical SEO & Discoverability (PRD FR-8.4 / §6.1):
 * - Dynamic /sitemap.xml endpoint indexing all static, product, and city routes
 * - Dynamic /robots.txt blocking /admin/ and /api/ and pointing to sitemap
 * - 301 permanent redirects: /kebijakan-privasi -> /privacy, /terms -> /persyaratan-layanan
 * - Terms of Service page (/persyaratan-layanan) rendering with Indonesian ISP clauses
 */

test.describe('Technical SEO & Discoverability', () => {
  test('dynamic /sitemap.xml returns compliant XML with all static, product, and city landing pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/xml')

    const xml = await res.text()
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    // Static pages
    expect(xml).toContain('<loc>https://asn.net.id</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/paket</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/city</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/layanan</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/daftar</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/request-area</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/privacy</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/persyaratan-layanan</loc>')

    // 4 Core product lines
    expect(xml).toContain('<loc>https://asn.net.id/layanan/fiber</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/layanan/stream</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/layanan/mesh</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/layanan/business</loc>')

    // Active city landing pages
    expect(xml).toContain('<loc>https://asn.net.id/city/kota-bekasi</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/city/kota-bogor</loc>')
    expect(xml).toContain('<loc>https://asn.net.id/city/jakarta-selatan</loc>')

    // Metadata tags
    expect(xml).toContain('<priority>1.0</priority>')
    expect(xml).toContain('<changefreq>daily</changefreq>')
    expect(xml).toContain('<priority>0.8</priority>')
  })

  test('dynamic /robots.txt blocks /admin/ and /api/ and references sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/plain')

    const text = await res.text()
    expect(text).toContain('User-agent: *')
    expect(text).toContain('Allow: /')
    expect(text).toContain('Disallow: /admin/')
    expect(text).toContain('Disallow: /api/')
    expect(text).toContain('Sitemap: https://asn.net.id/sitemap.xml')
  })

  test('bilingual 301 permanent redirects work correctly', async ({ request, page }) => {
    // 301 redirect for /kebijakan-privasi -> /privacy
    const resPrivacy = await request.get('/kebijakan-privasi', { maxRedirects: 0 })
    expect(resPrivacy.status()).toBe(301)
    expect(resPrivacy.headers()['location']).toBe('/privacy')

    // Browser navigation follows redirect
    await page.goto('/kebijakan-privasi')
    await expect(page).toHaveURL('/privacy')
    await expect(page.getByRole('heading', { name: 'Kebijakan Privasi' })).toBeVisible()

    // 301 redirect for /terms -> /persyaratan-layanan
    const resTerms = await request.get('/terms', { maxRedirects: 0 })
    expect(resTerms.status()).toBe(301)
    expect(resTerms.headers()['location']).toBe('/persyaratan-layanan')

    // Browser navigation follows redirect
    await page.goto('/terms')
    await expect(page).toHaveURL('/persyaratan-layanan')
    await expect(page.getByRole('heading', { name: 'Syarat dan Ketentuan Layanan' })).toBeVisible()
  })

  test('Terms of Service (/persyaratan-layanan) renders full legal clauses and footer link', async ({ page }) => {
    await page.goto('/persyaratan-layanan')

    await expect(page).toHaveTitle(/Syarat dan Ketentuan Layanan — ASN\.NET/)
    await expect(page.getByRole('heading', { name: 'Syarat dan Ketentuan Layanan' })).toBeVisible()

    // Key clauses
    await expect(page.getByRole('heading', { name: /Definisi & Ruang Lingkup/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Pendaftaran & Pemasangan Jaringan/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Kebijakan Pemakaian Wajar & Larangan Reselling/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Perangkat Pinjam Pakai & Garansi/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Tagihan & Pembayaran Bulanan/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Service Level Agreement/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Penghentian & Pemutusan Berlangganan/i })).toBeVisible()

    // Footer link
    const footerLink = page.locator('footer').getByRole('link', { name: 'Syarat & Ketentuan' })
    await expect(footerLink).toBeVisible()
    await expect(footerLink).toHaveAttribute('href', '/persyaratan-layanan')
  })
})
