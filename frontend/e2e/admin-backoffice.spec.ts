import { expect, test, type Page } from '@playwright/test'

/**
 * E2E tests for the ASN.NET Admin Back-Office extensions (FR-6 / FR-7):
 * - RBAC & Navigation visibility per role
 * - Route protection & redirection for unauthorized paths
 * - Package Catalog CRUD & Area Price Matrix overrides
 * - CMS-lite Content Editor for site copy blocks
 * - Admin User Management with self-protection guards
 */

async function loginAs(page: Page, email: string, pass = 'admin123') {
  await page.goto('/admin/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(pass)
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page).toHaveURL(/\/admin\/(leads|coverage)/)
}

test.describe('Admin Back-Office — RBAC & Navigation', () => {
  test('admin role sees all modules in the navigation header', async ({ page }) => {
    await loginAs(page, 'admin@asn.net')

    const nav = page.locator('header nav')
    await expect(nav.getByRole('link', { name: 'Leads' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Coverage' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Demand' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Paket & Harga' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Konten CMS' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Pengguna' })).toBeVisible()
  })

  test('sales role sees only Leads and is blocked from unauthorized routes', async ({ page }) => {
    await loginAs(page, 'sales@asn.net')

    const nav = page.locator('header nav')
    await expect(nav.getByRole('link', { name: 'Leads' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Paket & Harga' })).not.toBeVisible()
    await expect(nav.getByRole('link', { name: 'Konten CMS' })).not.toBeVisible()
    await expect(nav.getByRole('link', { name: 'Pengguna' })).not.toBeVisible()

    // Deep-link to /admin/packages should be intercepted and redirected to default tab
    await page.goto('/admin/packages')
    await expect(page).toHaveURL(/\/admin\/leads/)
    await expect(page.getByText('Akses Terbatas')).toBeVisible()

    // Deep-link to /admin/users should also be blocked
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/admin\/leads/)
    await expect(page.getByText('Akses Terbatas')).toBeVisible()
  })
})

test.describe('Admin Back-Office — Packages & Price Matrix', () => {
  test('can list, create new package and toggle active status', async ({ page }) => {
    await loginAs(page, 'admin@asn.net')
    await page.goto('/admin/packages')

    // Verify existing packages list loaded
    await expect(page.getByText('ASN.NET Fiber 50')).toBeVisible()
    await expect(page.getByText('ASN.NET Fiber 100')).toBeVisible()

    // Open create package modal
    await page.getByRole('button', { name: '+ Tambah Paket Baru' }).click()
    await expect(page.getByRole('heading', { name: 'Tambah Paket Internet Baru' })).toBeVisible()

    const uniquePkgName = `Fiber Turbo ${Date.now().toString().slice(-4)}`
    await page.locator('#modal-pkg-name').fill(uniquePkgName)
    await page.locator('#modal-pkg-speed').fill('250')
    await page.locator('#modal-pkg-price').fill('389000')

    await page.getByRole('button', { name: 'Simpan Paket' }).click()

    // Verify package appears in the list
    await expect(page.getByText('Paket baru berhasil ditambahkan')).toBeVisible()
    await expect(page.getByText(uniquePkgName)).toBeVisible()
  })

  test('can configure per-area price override in Matriks Harga Area tab', async ({ page }) => {
    await loginAs(page, 'admin@asn.net')
    await page.goto('/admin/packages')

    // Switch to price matrix tab
    await page.getByRole('button', { name: /Matriks Harga Area/ }).click()
    await expect(page.getByRole('heading', { name: 'Set Harga Khusus Area' })).toBeVisible()

    // Select city and fill price override
    await page.locator('#override-price-input').fill('175000')
    await page.getByRole('button', { name: 'Simpan Harga Khusus' }).click()

    await expect(page.getByText('Harga khusus area berhasil disimpan')).toBeVisible()
    await expect(page.getByText('Rp 175.000')).toBeVisible()
  })
})

test.describe('Admin Back-Office — CMS Content Manager', () => {
  test('can edit and save homepage hero copy and navigate tabs', async ({ page }) => {
    await loginAs(page, 'admin@asn.net')
    await page.goto('/admin/content')

    // Verify tabs are present
    await expect(page.getByRole('button', { name: 'Hero Banner' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Keunggulan Layanan/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /FAQ/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Metrik & Statistik/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Kantor Cabang/ })).toBeVisible()

    // Update hero headline
    const headlineInput = page.locator('#hero-headline-input')
    await expect(headlineInput).toBeVisible()
    const updatedHeadline = 'Internet Fiber Super Cepat ASN.NET (E2E Verified)'
    await headlineInput.fill(updatedHeadline)

    // Save active block
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()
    await expect(page.getByText('Konten HERO berhasil disimpan dan dipublikasikan!')).toBeVisible()

    // Navigate to FAQ tab and back to verify persistence
    await page.getByRole('button', { name: /FAQ/ }).click()
    await expect(page.getByRole('heading', { name: 'Daftar Tanya Jawab (FAQ)' })).toBeVisible()

    await page.getByRole('button', { name: 'Hero Banner' }).click()
    await expect(page.locator('#hero-headline-input')).toHaveValue(updatedHeadline)
  })
})

test.describe('Admin Back-Office — User Management', () => {
  test('can list users, enforce self-protection, and create/reset user', async ({ page }) => {
    await loginAs(page, 'admin@asn.net')
    await page.goto('/admin/users')

    // Check users table
    await expect(page.getByRole('heading', { name: 'Manajemen Pengguna Admin' })).toBeVisible()
    await expect(page.getByText('admin@asn.net')).toBeVisible()
    await expect(page.getByText('sales@asn.net')).toBeVisible()

    // Check self-protection on admin account
    const selfRow = page.locator('tr', { hasText: 'admin@asn.net' })
    await expect(selfRow.getByText('Anda')).toBeVisible()
    await selfRow.getByRole('button', { name: 'Edit' }).click()

    await expect(page.getByText('Anda tidak dapat mengubah peran Anda sendiri.')).toBeVisible()
    await expect(page.locator('#edit-role-input')).toBeDisabled()
    await expect(page.locator('input[type="checkbox"]')).toBeDisabled()
    await page.getByRole('button', { name: 'Batal' }).click()

    // Create a new marketing staff member
    await page.getByRole('button', { name: '+ Tambah Pengguna Baru' }).click()
    const newStaffEmail = `staff-${Date.now().toString().slice(-4)}@asn.net`
    await page.locator('#create-name-input').fill('Staff Marketing E2E')
    await page.locator('#create-email-input').fill(newStaffEmail)
    await page.locator('#create-role-input').selectOption('marketing')
    await page.locator('#create-pwd-input').fill('password123')
    await page.getByRole('button', { name: 'Buat Pengguna' }).click()

    await expect(page.getByText(/berhasil dibuat/)).toBeVisible()
    const newStaffRow = page.locator('tr', { hasText: newStaffEmail })
    await expect(newStaffRow).toBeVisible()
    await expect(newStaffRow.getByText('marketing', { exact: true })).toBeVisible()

    // Reset password for the new staff
    await newStaffRow.getByRole('button', { name: 'Reset Password' }).click()
    await page.locator('#reset-pwd-input').fill('newpassword123')
    await page.getByRole('button', { name: 'Ubah Password' }).click()
    await expect(page.getByText(/berhasil diubah/)).toBeVisible()
  })
})
