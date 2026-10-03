import { expect, test } from '@playwright/test'

/**
 * E2E tests for ASN.NET City SEO Landing Pages (PRD FR-8.2 / FR-1.1 / §6.1):
 * - /city Directory Index with Province Grouping & Live Search
 * - /city/[slug] Localized Landing Page with District Grid, Local Packages & FAQs
 * - 1-Click CTA deep-links to /daftar with prefilled city & district
 * - Area price override display (Bekasi promo)
 * - Local branch contact with WhatsApp
 * - 404 thin-content protection for unlisted cities
 */

test.describe('City Directory Index — /city', () => {
  test('renders province groupings, coverage stats, search filter, and navigates to city page', async ({ page }) => {
    await page.goto('/city')

    await expect(page).toHaveTitle(/Cakupan Jaringan Fiber Optik ASN\.NET — Daftar Kota & Kabupaten/)
    await expect(page.getByRole('heading', { name: 'Pilih Area Domisili Kamu' })).toBeVisible()

    // Breadcrumb navigation
    await expect(page.getByLabel('Breadcrumb').getByText('Daftar Kota')).toBeVisible()

    // Province groups
    await expect(page.getByRole('heading', { name: 'Jawa Barat' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'DKI Jakarta' })).toBeVisible()

    // Cities rendered
    await expect(page.getByRole('heading', { name: 'Kota Bekasi' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Kota Bogor' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Jakarta Selatan' })).toBeVisible()

    // Request area fallback banner
    await expect(page.getByRole('heading', { name: 'Kota Anda Belum Terdaftar dalam Cakupan?' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ajukan Request Area Sekarang' })).toHaveAttribute('href', '/request-area')

    // Search filter test
    const searchInput = page.getByPlaceholder(/Cari nama kota atau provinsi/)
    await searchInput.fill('Bekasi')
    await expect(page.getByRole('heading', { name: 'Kota Bekasi' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Kota Bogor' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Jakarta Selatan' })).not.toBeVisible()

    // Reset search
    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(page.getByRole('heading', { name: 'Kota Bogor' })).toBeVisible()

    // Navigate to city page
    const bekasiCard = page.locator('.card', { hasText: 'Kota Bekasi' })
    await bekasiCard.getByRole('link', { name: /Lihat Area & Paket/i }).click()
    await expect(page).toHaveURL('/city/kota-bekasi')
  })
})

test.describe('City Landing Page — /city/[slug]', () => {
  test('renders localized hero, interactive district coverage grid, and 1-click CTA to /daftar', async ({ page }) => {
    await page.goto('/city/kota-bekasi')

    await expect(page).toHaveTitle(/Internet Fiber Optik Kota Bekasi — Paket WiFi Murah & Cepat \| ASN\.NET/)
    await expect(page.getByRole('heading', { name: 'Internet Fiber Optik Terbaik di Kota Bekasi' })).toBeVisible()

    // District coverage section
    const districtSection = page.locator('#kecamatan-kota')
    await expect(districtSection.getByRole('heading', { name: 'Cakupan Kecamatan di Kota Bekasi' })).toBeVisible()

    // Filter pills
    const allTab = districtSection.getByRole('button', { name: /Semua/i })
    const availableTab = districtSection.getByRole('button', { name: /Tersedia/i })
    await expect(allTab).toBeVisible()
    await expect(availableTab).toBeVisible()

    // Districts visible in 'all' view
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Bekasi Timur' })).toBeVisible()
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Rawalumbu' })).toBeVisible()
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Bekasi Barat' })).toBeVisible()

    // Filter to available only
    await availableTab.click()
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Bekasi Timur' })).toBeVisible()
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Rawalumbu' })).toBeVisible()
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Bekasi Barat' })).not.toBeVisible()

    // Switch back to all
    await allTab.click()
    await expect(districtSection.getByRole('heading', { name: 'Kecamatan Bekasi Barat' })).toBeVisible()

    // Click 1-click CTA on available district (Bekasi Timur)
    const bekasiTimurCard = districtSection.locator('.card', { hasText: 'Kecamatan Bekasi Timur' })
    await bekasiTimurCard.getByRole('link', { name: 'Daftar' }).click()

    await expect(page).toHaveURL(/\/daftar\?city=kota-bekasi&district=bekasi-timur&source=city_page/)

    // Wait for form hydration and check that city & district are pre-selected
    const citySelect = page.locator('select#city, select[name="city"]').first()
    await expect(citySelect).toHaveValue('kota-bekasi')

    const districtSelect = page.locator('select#district, select[name="district"]').first()
    await expect(districtSelect).toHaveValue('bekasi-timur')
  })

  test('displays local package catalog with Bekasi price override and deep-link to /daftar', async ({ page }) => {
    await page.goto('/city/kota-bekasi')

    const packageSection = page.locator('#paket-kota')
    await expect(packageSection.getByRole('heading', { name: 'Pilihan Paket Internet di Kota Bekasi' })).toBeVisible()

    // Fiber 100 has area price override in Bekasi: Rp 279.000 (overridden from 299.000)
    const fiber100Card = packageSection.locator('.card', { hasText: 'ASN.NET Fiber 100' })
    await expect(fiber100Card).toBeVisible()
    await expect(fiber100Card.getByText('Promo Kota Bekasi')).toBeVisible()
    await expect(fiber100Card.getByText('Rp 279.000')).toBeVisible()

    // Click CTA to subscribe
    await fiber100Card.getByRole('link', { name: 'Pilih Paket Ini' }).click()
    await expect(page).toHaveURL(/\/daftar\?package=fiber-100&city=kota-bekasi&source=city_page/)

    const packageSelect = page.locator('select#pkg, select[name="package"]').first()
    await expect(packageSelect).toHaveValue('fiber-100')
  })

  test('renders localized FAQ accordion and local branch contact card', async ({ page }) => {
    await page.goto('/city/kota-bekasi')

    // Localized FAQ (with toPass to ensure hydration click handler is ready)
    const faqButton = page.getByRole('button', { name: /Apakah ASN\.NET sudah menjangkau seluruh area Kota Bekasi\?/i })
    await expect(faqButton).toBeVisible()
    await expect(async () => {
      await faqButton.click()
      await expect(page.getByText(/Jaringan ASN\.NET saat ini telah aktif di .* kecamatan di Kota Bekasi/i)).toBeVisible({ timeout: 1500 })
    }).toPass({ timeout: 10000 })

    // Branch card
    await expect(page.getByText('ASN.NET Kantor Cabang Bekasi')).toBeVisible()
    await expect(page.getByText('Jl. Ahmad Yani No. 88, Bekasi Selatan, Kota Bekasi 17141')).toBeVisible()
    const waLink = page.getByRole('link', { name: /Chat WhatsApp Cabang/i })
    await expect(waLink).toBeVisible()
    await expect(waLink).toHaveAttribute('href', /wa\.me\/6285694072344/)
  })

  test('returns 404 for unlisted city slug', async ({ page }) => {
    const res = await page.goto('/city/kota-yang-tidak-ada-di-database')
    expect(res?.status()).toBe(404)
    await expect(page.getByText(/Kota tidak ditemukan/i)).toBeVisible()
  })
})
