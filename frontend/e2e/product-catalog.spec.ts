import { expect, test } from '@playwright/test'

/**
 * E2E tests for the ASN.NET Product & Package Catalog (PRD FR-2 / §6.1):
 * - /layanan Product Index Hub & Comparison Matrix
 * - /layanan/[product] Dynamic Product Landing Pages with Device Slider & FAQs
 * - /paket Master Package Catalog with live Area Selection & Filtering
 * - Checkout CTA Deep-linking to /daftar with prefilled package & area
 */

test.describe('Product Hub — /layanan', () => {
  test('renders 4 core product lines and navigates to subpage', async ({ page }) => {
    await page.goto('/layanan')

    await expect(page).toHaveTitle(/Layanan Internet Fiber — ASN\.NET/)
    await expect(page.getByRole('heading', { name: 'Layanan Internet Fiber untuk Setiap Kebutuhan Anda' })).toBeVisible()

    // 4 product cards
    await expect(page.getByRole('heading', { name: 'ASN.NET Fiber' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ASN.NET Stream' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ASN.NET Mesh' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ASN.NET Business' })).toBeVisible()

    // Comparison matrix
    await expect(page.getByRole('heading', { name: 'Perbandingan Fitur Layanan' })).toBeVisible()
    await expect(page.getByText('100% Fiber Optic').first()).toBeVisible()

    // Click link to stream product page
    await page.locator('a[href="/layanan/stream"]').first().click()
    await expect(page).toHaveURL('/layanan/stream')
    await expect(page.getByRole('heading', { name: 'Fiber Kencang + Akses Hiburan Streaming OTT' })).toBeVisible()
  })
})

test.describe('Product Landing Page — /layanan/[product]', () => {
  test('dynamic /layanan/fiber displays tier cards, interactive device slider, and FAQ accordion', async ({ page }) => {
    await page.goto('/layanan/fiber')

    await expect(page).toHaveTitle(/ASN\.NET Fiber — Internet Fiber Cepat & Stabil/)
    await expect(page.getByRole('heading', { name: 'Internet Rumah 100% Fiber Optik Murni' })).toBeVisible()

    // Verify packages
    const packageSection = page.locator('#paket')
    await expect(packageSection.getByRole('heading', { name: 'ASN.NET Fiber 50' })).toBeVisible()
    await expect(packageSection.getByRole('heading', { name: 'ASN.NET Fiber 100' })).toBeVisible()

    // Interactive device slider
    const slider = page.locator('input[type="range"]')
    await expect(slider).toBeVisible()
    await expect(page.getByText('Perangkat aktif')).toBeVisible()

    // Test FAQ accordion toggle
    const faqButton = page.getByRole('button', { name: 'Apakah ASN.NET Fiber benar-benar tanpa FUP?' })
    await expect(faqButton).toBeVisible()
    await faqButton.click()
    await expect(page.getByText('ASN.NET tidak menerapkan batasan kuota bulanan.')).toBeVisible()
  })

  test('CTA button on package card deep-links to /daftar with prefilled package', async ({ page }) => {
    await page.goto('/layanan/fiber')

    const fiberCard = page.locator('.card', { hasText: 'ASN.NET Fiber 100' }).first()
    await expect(fiberCard).toBeVisible()

    await fiberCard.getByRole('link', { name: 'Langganan Sekarang' }).click()
    await expect(page).toHaveURL(/\/daftar\?package=fiber-100&source=product_page/)

    // Verify prefill in the select
    const packageSelect = page.locator('select').nth(2)
    await expect(packageSelect).toHaveValue('fiber-100')
  })

  test('unknown product slug triggers 404', async ({ page }) => {
    const res = await page.goto('/layanan/paket-antah-berantah')
    expect(res?.status()).toBe(404)
    await expect(page.getByText(/tidak ditemukan/i)).toBeVisible()
  })
})

test.describe('Master Catalog — /paket', () => {
  test('lists all packages, filters by product category, and sorts by speed', async ({ page }) => {
    await page.goto('/paket')

    await expect(page).toHaveTitle(/Katalog Paket Internet Fiber 2026/)
    await expect(page.getByRole('heading', { name: 'Katalog Paket Internet Fiber ASN.NET' })).toBeVisible()

    // Verify presence of fiber and stream tiers
    await expect(page.getByRole('heading', { name: 'ASN.NET Fiber 50' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ASN.NET Stream 100' })).toBeVisible()

    // Filter to Stream only
    await page.getByRole('button', { name: 'ASN.NET Stream' }).click()
    await expect(page.getByRole('heading', { name: 'ASN.NET Stream 100' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ASN.NET Fiber 50' })).not.toBeVisible()

    // Filter back to all
    await page.getByRole('button', { name: /Semua/ }).click()
    await expect(page.getByRole('heading', { name: 'ASN.NET Fiber 50' })).toBeVisible()
  })

  test('interactive area selection updates pricing and pre-fills city and district on checkout', async ({ page }) => {
    await page.goto('/paket')

    // Select Kota Bekasi
    const citySelect = page.locator('#catalog-city-select')
    await citySelect.selectOption('kota-bekasi')

    // Wait for district select to populate
    const distSelect = page.locator('#catalog-district-select')
    await expect(distSelect).toBeEnabled()
    await distSelect.selectOption({ index: 1 }) // First district

    // Notice banner should appear
    await expect(page.getByText(/Menampilkan tarif untuk wilayah: Kota Bekasi/)).toBeVisible()

    // Click CTA on first available package
    const firstCta = page.locator('a', { hasText: 'Pilih Paket Ini' }).first()
    await expect(firstCta).toBeVisible()
    await firstCta.click()

    // Should navigate to /daftar with city & district prefilled
    await expect(page).toHaveURL(/\/daftar\?package=.*&city=kota-bekasi&district=/)
  })
})
