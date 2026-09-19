import { db } from './client'
import {
  adminUsers,
  cities,
  contentBlocks,
  coverageAreas,
  districts,
  packageAreaPrices,
  packages,
  products,
  promos
} from './schema'
import { eq } from 'drizzle-orm'

/**
 * Seed per PRD §10.4: cities + districts + packages + promo so the site is
 * demonstrable on day one. Idempotent — skipped when cities already exist.
 */
export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select({ id: cities.id }).from(cities).limit(1)
  if (existing.length > 0) return

  console.log('[seed] empty database — inserting demo data…')

  // --- Cities & districts -------------------------------------------------
  const cityRows = await db
    .insert(cities)
    .values([
      { name: 'Kota Bogor', slug: 'kota-bogor', province: 'Jawa Barat' },
      { name: 'Kabupaten Bogor', slug: 'kabupaten-bogor', province: 'Jawa Barat' },
      { name: 'Kota Bekasi', slug: 'kota-bekasi', province: 'Jawa Barat' },
      { name: 'Jakarta Selatan', slug: 'jakarta-selatan', province: 'DKI Jakarta' },
      { name: 'Kota Depok', slug: 'kota-depok', province: 'Jawa Barat' },
      { name: 'Bandung', slug: 'bandung', province: 'Jawa Barat' }
    ])
    .returning({ id: cities.id, slug: cities.slug })
  const cityId = Object.fromEntries(cityRows.map((c) => [c.slug, c.id])) as Record<string, number>

  const districtPlan: Record<string, string[]> = {
    'kota-bogor': ['Cibinong', 'Gunung Sindur', 'Parung', 'Tamansari'],
    'kabupaten-bogor': ['Cibinong', 'Citeureup', 'Sukaraja', 'Babakan Madang'],
    'kota-bekasi': ['Bekasi Timur', 'Bekasi Barat', 'Rawalumbu'],
    'jakarta-selatan': ['Tebet', 'Kebayoran Baru', 'Pasar Minggu'],
    'kota-depok': ['Beji', 'Sawangan', 'Cimanggis'],
    bandung: ['Coblong', 'Sukajadi', 'Buahbatu']
  }
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const districtRows = await db
    .insert(districts)
    .values(
      Object.entries(districtPlan).flatMap(([citySlug, names]) =>
        names.map((name) => ({ cityId: cityId[citySlug]!, name, slug: slugify(name) }))
      )
    )
    .returning({ id: districts.id, cityId: districts.cityId, name: districts.name, slug: districts.slug })
  const dKey = (citySlug: string, name: string) => `${citySlug}/${slugify(name)}`
  const districtId = Object.fromEntries(
    districtRows.map((d) => {
      const citySlug = cityRows.find((c) => c.id === d.cityId)!.slug
      return [dKey(citySlug, d.name), d.id]
    })
  ) as Record<string, number>

  // --- Coverage status per district (FR-1.3) ------------------------------
  const available = [
    dKey('kota-bogor', 'Cibinong'),
    dKey('kabupaten-bogor', 'Citeureup'),
    dKey('kota-bekasi', 'Bekasi Timur'),
    dKey('kota-bekasi', 'Rawalumbu'),
    dKey('jakarta-selatan', 'Tebet'),
    dKey('kota-depok', 'Beji'),
    dKey('bandung', 'Coblong')
  ]
  const comingSoon = [dKey('kota-bogor', 'Gunung Sindur'), dKey('kota-depok', 'Sawangan')]

  await db.insert(coverageAreas).values(
    districtRows.map((d) => {
      const citySlug = cityRows.find((c) => c.id === d.cityId)!.slug
      const key = dKey(citySlug, d.name)
      return {
        cityId: d.cityId,
        districtId: d.id,
        status: available.includes(key) ? ('available' as const) : comingSoon.includes(key) ? ('coming_soon' as const) : ('not_available' as const)
      }
    })
  )

  // --- Products & packages (FR-2) -----------------------------------------
  const productRows = await db
    .insert(products)
    .values([
      { key: 'fiber' as const, name: 'ASN.NET Fiber', tagline: 'Internet rumah flagship — cepat, stabil, unlimited.', sortOrder: 1 },
      { key: 'stream' as const, name: 'ASN.NET Stream', tagline: 'Fiber + hiburan: bundle akun streaming favorit.', sortOrder: 2 },
      { key: 'mesh' as const, name: 'ASN.NET Mesh', tagline: 'WiFi pekat sampai sudut terjauh.', sortOrder: 3 },
      { key: 'business' as const, name: 'ASN.NET Business', tagline: 'Dedicated & prioritas untuk UKM dan kantor.', sortOrder: 4 }
    ])
    .returning({ id: products.id, key: products.key })
  const productId = Object.fromEntries(productRows.map((p) => [p.key, p.id])) as Record<string, number>

  const packageRows = await db
    .insert(packages)
    .values([
      {
        productId: productId['fiber']!,
        slug: 'fiber-50',
        name: 'ASN.NET Fiber 50',
        speedMbps: 50,
        basePriceIdr: 199000,
        devicesMin: 5,
        devicesMax: 8,
        features: ['Unlimited tanpa FUP', 'Gratis instalasi & modem'],
        sortOrder: 1
      },
      {
        productId: productId['fiber']!,
        slug: 'fiber-100',
        name: 'ASN.NET Fiber 100',
        speedMbps: 100,
        basePriceIdr: 299000,
        devicesMin: 8,
        devicesMax: 10,
        features: ['Unlimited tanpa FUP', 'Gratis instalasi & modem', 'Prioritas bantuan 24/7'],
        sortOrder: 2
      },
      {
        productId: productId['fiber']!,
        slug: 'fiber-300',
        name: 'ASN.NET Fiber 300',
        speedMbps: 300,
        basePriceIdr: 499000,
        devicesMin: 12,
        devicesMax: 15,
        features: ['Unlimited tanpa FUP', 'Gratis instalasi & modem', 'DDoS-protected gaming route'],
        sortOrder: 3
      },
      {
        productId: productId['stream']!,
        slug: 'stream-100',
        name: 'ASN.NET Stream 100',
        speedMbps: 100,
        basePriceIdr: 349000,
        devicesMin: 8,
        devicesMax: 12,
        features: ['Semua benefit Fiber 100', 'Bundle akun streaming (OTT)', 'Bandwidth video diprioritaskan'],
        sortOrder: 4
      }
    ])
    .returning({ id: packages.id, slug: packages.slug })
  const pkgId = Object.fromEntries(packageRows.map((p) => [p.slug, p.id])) as Record<string, number>

  // --- Per-area price override (FR-2.3): Fiber 100 promo price in Bekasi ---
  await db.insert(packageAreaPrices).values([
    {
      packageId: pkgId['fiber-100']!,
      cityId: cityId['kota-bekasi']!,
      districtId: null,
      priceIdr: 279000
    }
  ])

  // --- Promo (FR-3) ---------------------------------------------------------
  await db.insert(promos).values({
    name: 'Harbolnas 2026',
    badgeText: 'Promo Harbolnas: Bayar 3 Bulan, Gratis 1 Bulan!',
    description: 'Berlaku untuk paket Stream & Fiber 100 ke atas hingga akhir bulan ini.',
    tnc: 'Harga sudah termasuk pajak. Tidak dapat digabung dengan promo lain.',
    discountType: 'free_months' as const,
    discountValue: 1,
    scope: { packages: ['stream-100', 'fiber-100', 'fiber-300'] },
    startsAt: new Date('2026-09-01T00:00:00Z'),
    endsAt: new Date('2026-12-31T23:59:59Z')
  })

  // --- CMS-lite defaults (FR-6.2) ------------------------------------------
  await db.insert(contentBlocks).values({
    key: 'hero',
    data: {
      headline: 'Internet Fiber Super Cepat untuk Rumah & Bisnismu',
      subheadline: 'Koneksi stabil 100% fiber optik, unlimited, gratis modem.',
      badges: ['100% Fiber Optic', 'Gratis Modem', 'Kuota Tanpa Batas']
    }
  })

  // --- Dev admin account (placeholder hash — real auth is FR-7.1, later) ---
  await db.insert(adminUsers).values({
    email: 'admin@asn.net',
    passwordHash: 'dev-only:changeme',
    name: 'Admin ASN.NET',
    role: 'admin' as const
  })

  console.log('[seed] done: 6 cities, 22 districts, 4 packages, 1 promo')
}

export async function coverageCounts(): Promise<{ cities: number; available: number }> {
  const [c] = await db.select({ id: cities.id }).from(cities).limit(1)
  const av = await db.select({ id: coverageAreas.id }).from(coverageAreas).where(eq(coverageAreas.status, 'available'))
  return { cities: c ? 1 : 0, available: av.length }
}

// Allow `bun run db:seed` to (re)seed manually.
if (import.meta.main) {
  await seedIfEmpty()
}
