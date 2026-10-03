import { expect, test } from '@playwright/test'

/**
 * Lead-flow E2E (PRD FR-4 / §6.4 Flows A→C) against the dev stack
 * (frontend :5199 proxying /api/* → backend :3001 with seeded PGlite data).
 *
 * Tests run serially (workers: 1) because submissions share one per-IP rate
 * limit and one seeded database. Phone numbers are unique per test to avoid
 * the 30-day duplicate rule cross-contaminating assertions.
 *
 * The dev rate limit is 5 submissions per IP per minute (FR-4.4) and Playwright
 * comes from 127.0.0.1 like everything else, so tests that need a *successful*
 * submission pace themselves: on the 429 banner they wait 65s and retry once.
 */

const RATE_LIMIT_MSG = 'Terlalu banyak percobaan'

/**
 * Submits via fillAndSubmit and, if the dev per-IP rate limit (5/min) tripped,
 * waits 65s and retries once. Only use where the test genuinely needs a
 * successful submission.
 */
async function fillAndSubmitPatient(
  page: import('@playwright/test').Page,
  data: { fullName: string; phone: string; address?: string; consent?: boolean }
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await fillAndSubmit(page, data)
    const limited = await page.getByText(RATE_LIMIT_MSG).isVisible().catch(() => false)
    if (!limited) return
    await page.waitForTimeout(65_000)
  }
}

// NOTE: fillAndSubmitPatient is intentionally awaited without a surrounding
// expect on the banner — the success assertions below are the real check.

/**
 * Waits until the cities fetch (fired in onMount, i.e. after SvelteKit
 * hydration) has enabled the first select — guarantees the form's submit
 * handler is attached before anything clicks it.
 */
async function waitForFormReady(page: import('@playwright/test').Page) {
  await expect(page.locator('select').nth(0)).toBeEnabled({ timeout: 15_000 })
}

/**
 * Unique local-format phone per run — the backend's 30-day duplicate rule is
 * keyed on phone+city and the dev DB persists between runs, so a constant
 * number would turn every submission after the first into a duplicate.
 */
function uniquePhone(): string {
  return `0812${Date.now().toString().slice(-8)}`
}

/**
 * Fills the /daftar form and submits.
 * Uses role/attribute selectors rather than getByLabel — the form wraps inputs
 * in <label> elements whose text also lands on the consent checkbox, which
 * makes label-text resolution ambiguous to strict mode.
 */
async function fillAndSubmit(
  page: import('@playwright/test').Page,
  data: { fullName: string; phone: string; address?: string; consent?: boolean }
) {
  await waitForFormReady(page)
  await page.getByRole('textbox', { name: 'Nama lengkap' }).fill(data.fullName)
  await page.locator('input[type="tel"]').fill(data.phone)
  await page.locator('select').nth(0).selectOption('kota-bekasi')
  await page.locator('select').nth(1).selectOption({ index: 1 }) // first district of Kota Bekasi
  await page.getByRole('textbox', { name: 'Alamat pemasangan' }).fill(data.address ?? 'Jl. E2E Test No. 99, RT 001/RW 002')
  const consent = page.locator('input[type="checkbox"]').first()
  if ((data.consent ?? true) && !(await consent.isChecked())) await consent.check()
  await page.getByRole('button', { name: 'Kirim Pendaftaran' }).click()
}

test.describe('/daftar lead form', () => {
  test('deep-link prefill fills city, district and package', async ({ page }) => {
    await page.goto('/daftar?package=fiber-100&city=kota-bekasi&district=bekasi-timur&source=package_card')

    const selects = page.locator('select')
    await expect(selects.nth(0)).toHaveValue('kota-bekasi')
    await expect(selects.nth(1)).toHaveValue('bekasi-timur')
    await expect(selects.nth(2)).toHaveValue('fiber-100')
  })

  test('happy path: submit succeeds and shows reference number', async ({ page }) => {
    await page.goto('/daftar')
    const phone = uniquePhone()
    await fillAndSubmitPatient(page, { fullName: 'E2E Happy Path', phone })

    await expect(page.getByRole('heading', { name: 'Pendaftaran terkirim!' })).toBeVisible()
    await expect(page.getByText(/#ASN-\d+/)).toBeVisible()
    await expect(page.getByText('E2E Happy Path')).toBeVisible()
  })

  test('validation errors: client-side blocks bad input before any network POST', async ({ page }) => {
    await page.goto('/daftar')
    await waitForFormReady(page) // hydration gate — otherwise the click fires pre-attachment

    const postPromise = page.waitForRequest((r) => r.url().includes('/api/leads'), { timeout: 3000 }).catch(() => null)
    await page.getByRole('button', { name: 'Kirim Pendaftaran' }).click()
    const post = await postPromise

    expect(post).toBeNull() // nothing left the page
    await expect(page.getByText('Nama lengkap minimal 3 karakter.')).toBeVisible()
    await expect(page.getByText(/Format nomor tidak valid/)).toBeVisible()
    await expect(page.getByText('Pilih kota / kabupaten.')).toBeVisible()
    await expect(page.getByText('Pilih kecamatan.')).toBeVisible()
    await expect(page.getByText(/Alamat minimal 10 karakter/)).toBeVisible()
    await expect(page.getByText('Persetujuan diperlukan untuk melanjutkan.')).toBeVisible()
  })

  test('server-side duplicate detection shows the friendly re-submission notice', async ({ page }) => {
    const phone = uniquePhone()

    await page.goto('/daftar')
    await fillAndSubmitPatient(page, { fullName: 'E2E Duplikat', phone })
    await expect(page.getByRole('heading', { name: 'Pendaftaran terkirim!' })).toBeVisible()

    // Same phone + city within 30 days → duplicate:true (FR-4.3)
    await page.goto('/daftar')
    await fillAndSubmitPatient(page, { fullName: 'E2E Duplikat', phone })
    await expect(page.getByRole('heading', { name: 'Kami sudah punya permintaanmu!' })).toBeVisible()
    await expect(page.getByText(/Tidak perlu daftar ulang/)).toBeVisible()
  })

  test('honeypot: filled website field is silently swallowed, no lead created', async ({ page }) => {
    await page.goto('/daftar')
    await waitForFormReady(page)

    // The bot fills the visible fields AND the visually-hidden honeypot.
    const phone = uniquePhone()
    await page.getByRole('textbox', { name: 'Nama lengkap' }).fill('Bot McBotface')
    await page.locator('input[type="tel"]').fill(phone)
    await page.locator('select').nth(0).selectOption('kota-bekasi')
    await page.locator('select').nth(1).selectOption({ index: 1 })
    await page.getByRole('textbox', { name: 'Alamat pemasangan' }).fill('Jl. Spam Bot No. 1, Cyber City')
    await page.locator('input[name="website"]').fill('http://spam.example')
    const consent = page.locator('input[type="checkbox"]').first()
    if (!(await consent.isChecked())) await consent.check()

    await page.getByRole('button', { name: 'Kirim Pendaftaran' }).click()

    // API pretends success (FR-4.4) so the bot learns nothing — but the fake
    // reference id 0 exposes it: real leads are serial from 1 (see #ASN-N).
    await expect(page.getByRole('heading', { name: 'Pendaftaran terkirim!' })).toBeVisible()
    await expect(page.getByText(/#ASN-0\b/)).toBeVisible()
  })
})

async function runChecker(page: import('@playwright/test').Page, city: string, district: string) {
  await page.goto('/')
  const checkerSelects = page.locator('section select')
  await expect(checkerSelects.nth(0)).toBeEnabled({ timeout: 15_000 })
  await expect(checkerSelects.nth(0).locator('option')).not.toHaveCount(1, { timeout: 15_000 })
  await checkerSelects.nth(0).selectOption(city)
  await expect(checkerSelects.nth(1)).toBeEnabled({ timeout: 15_000 })
  await checkerSelects.nth(1).selectOption(district)
  // Enabled only once city+district are chosen (and the page is hydrated).
  await expect(page.getByRole('button', { name: 'Cek Cakupan' })).toBeEnabled({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Cek Cakupan' }).click()
}

test.describe('checker → /request-area (Flow C)', () => {
  test('not-available district offers Request Area, form records the request', async ({ page }) => {
    // Buahbatu (Bandung) is seeded as not_available
    await runChecker(page, 'bandung', 'buahbatu')

    const banner = page.getByText(/belum tersedia di Kecamatan Buahbatu/)
    await expect(banner).toBeVisible()
    await page.getByRole('link', { name: 'Request Area' }).click()

    await expect(page).toHaveURL(/\/request-area\?city=bandung&district=buahbatu/)
    const raSelects = page.locator('select')
    await expect(raSelects.nth(0)).toHaveValue('bandung')
    await expect(raSelects.nth(1)).toHaveValue('buahbatu')

    await page.getByRole('textbox', { name: 'Nama lengkap' }).fill('E2E Request Area')
    await page.locator('input[type="tel"]').fill(uniquePhone())
    await page.getByRole('button', { name: 'Kirim Permintaan Area' }).click()

    if (await page.getByText(RATE_LIMIT_MSG).isVisible().catch(() => false)) {
      await page.waitForTimeout(65_000)
      await page.getByRole('button', { name: 'Kirim Permintaan Area' }).click()
      if (await page.getByText(RATE_LIMIT_MSG).isVisible().catch(() => false)) {
        await page.waitForTimeout(65_000)
        await page.getByRole('button', { name: 'Kirim Permintaan Area' }).click()
      }
    }
    await expect(page.getByRole('heading', { name: 'Permintaan area tercatat!' })).toBeVisible()
    await expect(page.getByText(/Permintaan untuk Buahbatu/)).toBeVisible()
  })

  test('coming-soon district offers the waitlist link', async ({ page }) => {
    // Sawangan (Kota Depok) is seeded as coming_soon
    await runChecker(page, 'kota-depok', 'sawangan')

    // The waitlist link sits next to the banner <strong>, not inside it —
    // resolve it unscoped (same reason as the Request Area link above).
    await expect(page.getByText(/Segera hadir di Kecamatan Sawangan/)).toBeVisible()
    await expect(page.getByRole('link', { name: /Kabari saya begitu tersedia/ })).toHaveAttribute(
      'href',
      /\/request-area\?city=kota-depok&district=sawangan/
    )
  })
})
