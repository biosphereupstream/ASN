import { expect, test } from '@playwright/test'

/**
 * E2E tests for Dedicated FAQ & Knowledge Hub (PRD §6.1 / §6.2 / FR-6 / FR-8.3):
 * - Category filter pills with count badges
 * - Real-time keyword search across questions & answers
 * - Single-active expandable accordions
 * - Empty search state with reset & WhatsApp fallback
 * - Homepage FAQ teaser deep-link to /faq
 */

test.describe('Dedicated FAQ Hub — /faq', () => {
  test('renders hero, category filter pills with counts, and filters questions by category', async ({ page }) => {
    await page.goto('/faq')

    await expect(page).toHaveTitle(/Pusat Bantuan & Pertanyaan Umum \(FAQ\) — ASN\.NET/)
    await expect(page.getByRole('heading', { name: 'Pertanyaan yang Sering Diajukan' })).toBeVisible()

    // Breadcrumbs
    await expect(page.getByLabel('Breadcrumb').getByText('FAQ')).toBeVisible()

    // Category buttons
    const categoryBar = page.getByRole('toolbar', { name: 'Kategori FAQ' })
    const allBtn = categoryBar.getByRole('button', { name: /^Semua/i })
    const pemasanganBtn = categoryBar.getByRole('button', { name: /^Pemasangan & Aktivasi/i })
    const paketBtn = categoryBar.getByRole('button', { name: /^Paket & Tagihan/i })
    const teknisBtn = categoryBar.getByRole('button', { name: /^Teknis & WiFi/i })
    const cakupanBtn = categoryBar.getByRole('button', { name: /^Cakupan & Jangkauan/i })

    await expect(allBtn).toBeVisible()
    await expect(pemasanganBtn).toBeVisible()
    await expect(paketBtn).toBeVisible()
    await expect(teknisBtn).toBeVisible()
    await expect(cakupanBtn).toBeVisible()

    // Default view shows multiple categories
    await expect(page.getByText('Berapa lama proses pemasangan internet fiber ASN.NET?')).toBeVisible()
    await expect(page.getByText('Apa yang dimaksud dengan Unlimited tanpa batasan FUP?')).toBeVisible()

    // Filter by "Paket & Tagihan"
    await paketBtn.click()
    await expect(page.getByText('Apa yang dimaksud dengan Unlimited tanpa batasan FUP?')).toBeVisible()
    await expect(page.getByText('Kapan tanggal jatuh tempo pembayaran tagihan bulanan?')).toBeVisible()
    await expect(page.getByText('Berapa lama proses pemasangan internet fiber ASN.NET?')).not.toBeVisible()

    // Switch back to "Semua"
    await allBtn.click()
    await expect(page.getByText('Berapa lama proses pemasangan internet fiber ASN.NET?')).toBeVisible()
  })

  test('live keyword search filters questions in real-time and handles empty search', async ({ page }) => {
    await page.goto('/faq')

    const searchInput = page.getByPlaceholder(/Cari pertanyaan atau kata kunci/)
    await expect(searchInput).toBeVisible()

    // Search for "latensi"
    await searchInput.fill('latensi')
    await expect(page.getByText('Berapa latensi (ping) koneksi ASN.NET untuk bermain game online?')).toBeVisible()
    await expect(page.getByText('Berapa lama proses pemasangan internet fiber ASN.NET?')).not.toBeVisible()

    // Search non-existent keyword
    await searchInput.fill('xyz-kata-tidak-ada-dalam-faq-123')
    await expect(page.getByRole('heading', { name: 'Pertanyaan Tidak Ditemukan' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Tanya CS via WhatsApp/i })).toBeVisible()

    // Reset search using "Hapus Filter" button
    await page.getByRole('button', { name: 'Hapus Filter' }).click()
    await expect(page.getByText('Berapa lama proses pemasangan internet fiber ASN.NET?')).toBeVisible()
  })

  test('single-active accordion toggles open and collapses other items', async ({ page }) => {
    await page.goto('/faq')

    // Find first question button
    const q1Button = page.getByRole('button', { name: /Berapa lama proses pemasangan internet fiber ASN\.NET\?/i })
    await expect(q1Button).toBeVisible()
    await expect(q1Button).toHaveAttribute('aria-expanded', 'false')

    // Click to expand question 1 (with toPass for hydration safety)
    await expect(async () => {
      await q1Button.click()
      await expect(page.getByText(/Setelah formulir pendaftaran online Anda diverifikasi/i)).toBeVisible({ timeout: 1500 })
    }).toPass({ timeout: 10000 })

    await expect(q1Button).toHaveAttribute('aria-expanded', 'true')

    // Click question 2: "Dokumen apa saja yang diperlukan untuk mendaftar?"
    const q2Button = page.getByRole('button', { name: /Dokumen apa saja yang diperlukan untuk mendaftar\?/i })
    await expect(q2Button).toBeVisible()
    await q2Button.click()

    await expect(page.getByText(/Pendaftaran sangat mudah dan tanpa ribet/i)).toBeVisible()
    await expect(q2Button).toHaveAttribute('aria-expanded', 'true')

    // Question 1 should now be collapsed
    await expect(q1Button).toHaveAttribute('aria-expanded', 'false')
  })

  test('homepage teaser and site footer link to /faq', async ({ page }) => {
    // Check homepage FAQ teaser link
    await page.goto('/')
    const teaserLink = page.getByRole('link', { name: /Lihat semua pertanyaan →/i })
    await expect(teaserLink).toBeVisible()
    await teaserLink.click()
    await expect(page).toHaveURL('/faq')

    // Check footer link
    const footerFaqLink = page.locator('footer').getByRole('link', { name: 'Tanya Jawab (FAQ)' })
    await expect(footerFaqLink).toBeVisible()
    await expect(footerFaqLink).toHaveAttribute('href', '/faq')
  })
})
