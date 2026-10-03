import { and, asc, eq, isNull } from 'drizzle-orm'
import { db } from '../db/client'
import { cities, contentBlocks, coverageAreas, districts, packageAreaPrices, packages, products } from '../db/schema'

/**
 * Coverage resolution per PRD FR-1.2: (city, district) → status + packages
 * with the effective price for the area (§12: most-specific override wins,
 * then the package base price).
 */
export async function resolveCoverage(citySlug: string, districtSlug: string) {
  const [city] = await db.select().from(cities).where(eq(cities.slug, citySlug)).limit(1)
  if (!city) return null

  const [district] = await db
    .select()
    .from(districts)
    .where(and(eq(districts.cityId, city.id), eq(districts.slug, districtSlug)))
    .limit(1)
  if (!district) return null

  const [cov] = await db
    .select()
    .from(coverageAreas)
    .where(and(eq(coverageAreas.cityId, city.id), eq(coverageAreas.districtId, district.id)))
    .limit(1)

  let status: 'available' | 'coming_soon' | 'not_available' = cov?.status ?? 'not_available'

  // Package list with effective price (§12 effective-price resolver).
  let pkgs: {
    slug: string
    name: string
    speedMbps: number
    priceIdr: number
    basePriceIdr: number
  }[] = []
  if (status === 'available') {
    const base = await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(asc(packages.sortOrder))
    const overrides = await db
      .select()
      .from(packageAreaPrices)
      .where(and(eq(packageAreaPrices.cityId, city.id), eq(packageAreaPrices.isActive, true)))

    pkgs = base
      .map((p) => {
        const districtOverride = overrides.find((o) => o.packageId === p.id && o.districtId === district.id)
        const cityOverride = overrides.find((o) => o.packageId === p.id && o.districtId === null)
        const price = districtOverride?.priceIdr ?? cityOverride?.priceIdr ?? p.basePriceIdr
        return {
          slug: p.slug,
          name: p.name,
          speedMbps: p.speedMbps,
          priceIdr: price,
          basePriceIdr: p.basePriceIdr
        }
      })
      .filter((p) => p.priceIdr !== null)
  }

  return { status, city: { name: city.name }, district: { name: district.name }, packages: pkgs }
}

/** Active cities with coverage stats and starting prices (PRD FR-1.1 & FR-8.2). */
export async function listCities() {
  const activeCities = await db
    .select({
      id: cities.id,
      slug: cities.slug,
      name: cities.name,
      province: cities.province
    })
    .from(cities)
    .where(eq(cities.isActive, true))
    .orderBy(asc(cities.province), asc(cities.name))

  const allDistricts = await db
    .select({
      id: districts.id,
      cityId: districts.cityId,
      name: districts.name
    })
    .from(districts)

  const allCoverage = await db
    .select({
      cityId: coverageAreas.cityId,
      districtId: coverageAreas.districtId,
      status: coverageAreas.status
    })
    .from(coverageAreas)

  const activePackages = await db
    .select({
      id: packages.id,
      basePriceIdr: packages.basePriceIdr
    })
    .from(packages)
    .where(eq(packages.isActive, true))

  const cityOverrides = await db
    .select({
      packageId: packageAreaPrices.packageId,
      cityId: packageAreaPrices.cityId,
      priceIdr: packageAreaPrices.priceIdr
    })
    .from(packageAreaPrices)
    .where(and(eq(packageAreaPrices.isActive, true), isNull(packageAreaPrices.districtId)))

  return activeCities.map((city) => {
    const cityDistricts = allDistricts.filter((d) => d.cityId === city.id)
    const totalDistricts = cityDistricts.length
    const availableDistricts = allCoverage.filter(
      (c) => c.cityId === city.id && c.status === 'available'
    ).length

    let minPriceIdr: number | null = null
    for (const pkg of activePackages) {
      const override = cityOverrides.find((o) => o.cityId === city.id && o.packageId === pkg.id)
      const effectivePrice = override?.priceIdr ?? pkg.basePriceIdr
      if (minPriceIdr === null || effectivePrice < minPriceIdr) {
        minPriceIdr = effectivePrice
      }
    }

    return {
      id: city.id,
      slug: city.slug,
      name: city.name,
      province: city.province,
      totalDistricts,
      availableDistricts,
      minPriceIdr: minPriceIdr ?? 199000
    }
  })
}

const DEFAULT_BRANCHES: Record<string, { name: string; address: string; phone: string; whatsapp: string }> = {
  'kota-bekasi': {
    name: 'ASN.NET Kantor Cabang Bekasi',
    address: 'Jl. Ahmad Yani No. 88, Bekasi Selatan, Kota Bekasi 17141',
    phone: '(021) 8899-7711',
    whatsapp: '6285694072344'
  },
  'kota-bogor': {
    name: 'ASN.NET Kantor Cabang Bogor',
    address: 'Jl. Pajajaran No. 45, Bogor Tengah, Kota Bogor 16128',
    phone: '(0251) 833-4455',
    whatsapp: '6285694072344'
  },
  'kabupaten-bogor': {
    name: 'ASN.NET Service Point Cibinong',
    address: 'Jl. Tegar Beriman No. 12, Cibinong, Kab. Bogor 16914',
    phone: '(021) 8790-1234',
    whatsapp: '6285694072344'
  },
  'jakarta-selatan': {
    name: 'ASN.NET Flagship Tebet',
    address: 'Jl. Tebet Barat Dalam Raya No. 18, Tebet, Jakarta Selatan 12810',
    phone: '(021) 829-5566',
    whatsapp: '6285694072344'
  },
  'kota-depok': {
    name: 'ASN.NET Hub Margonda',
    address: 'Jl. Margonda Raya No. 120, Beji, Kota Depok 16423',
    phone: '(021) 7720-3344',
    whatsapp: '6285694072344'
  },
  bandung: {
    name: 'ASN.NET Hub Dago',
    address: 'Jl. Ir. H. Juanda No. 84, Coblong, Kota Bandung 40132',
    phone: '(022) 250-9988',
    whatsapp: '6285694072344'
  }
}

export interface CityDetail {
  city: {
    id: number
    name: string
    slug: string
    province: string
    totalDistricts: number
    availableDistricts: number
  }
  districts: {
    id: number
    name: string
    slug: string
    status: 'available' | 'coming_soon' | 'not_available'
  }[]
  packages: {
    id: number
    productId: number
    productKey: string
    productName: string
    slug: string
    name: string
    speedMbps: number
    basePriceIdr: number
    priceIdr: number
    isPriceOverridden: boolean
    devicesMin: number
    devicesMax: number
    features: string[]
    sortOrder: number
  }[]
  branch: {
    name: string
    address: string
    phone: string
    whatsapp: string
  } | null
}

/** Comprehensive city landing page bundle (PRD FR-8.2). */
export async function getCityDetail(citySlug: string): Promise<CityDetail | null> {
  const [city] = await db
    .select()
    .from(cities)
    .where(and(eq(cities.slug, citySlug), eq(cities.isActive, true)))
    .limit(1)

  if (!city) return null

  // Fetch districts
  const cityDistricts = await db
    .select({
      id: districts.id,
      name: districts.name,
      slug: districts.slug
    })
    .from(districts)
    .where(eq(districts.cityId, city.id))
    .orderBy(asc(districts.name))

  // Fetch coverage status for districts
  const coverageRows = await db
    .select({
      districtId: coverageAreas.districtId,
      status: coverageAreas.status
    })
    .from(coverageAreas)
    .where(eq(coverageAreas.cityId, city.id))

  const coverageMap = new Map(coverageRows.map((c) => [c.districtId, c.status]))

  const mappedDistricts = cityDistricts.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    status: (coverageMap.get(d.id) ?? 'not_available') as 'available' | 'coming_soon' | 'not_available'
  }))

  const availableDistricts = mappedDistricts.filter((d) => d.status === 'available').length

  // Packages with city-level price overrides
  const pkgs = await db
    .select({
      id: packages.id,
      productId: packages.productId,
      productKey: products.key,
      productName: products.name,
      slug: packages.slug,
      name: packages.name,
      speedMbps: packages.speedMbps,
      basePriceIdr: packages.basePriceIdr,
      devicesMin: packages.devicesMin,
      devicesMax: packages.devicesMax,
      features: packages.features,
      sortOrder: packages.sortOrder
    })
    .from(packages)
    .innerJoin(products, eq(packages.productId, products.id))
    .where(eq(packages.isActive, true))
    .orderBy(asc(packages.sortOrder))

  const cityOverrides = await db
    .select()
    .from(packageAreaPrices)
    .where(
      and(
        eq(packageAreaPrices.cityId, city.id),
        eq(packageAreaPrices.isActive, true),
        isNull(packageAreaPrices.districtId)
      )
    )

  const mappedPackages = pkgs.map((p) => {
    const override = cityOverrides.find((o) => o.packageId === p.id)
    const price = override?.priceIdr ?? p.basePriceIdr
    return {
      ...p,
      priceIdr: price,
      isPriceOverridden: price !== p.basePriceIdr
    }
  })

  // Branch office lookup
  let branch = DEFAULT_BRANCHES[city.slug] ?? null
  const [branchBlock] = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.key, 'branches'))
    .limit(1)

  if (branchBlock?.data && typeof branchBlock.data === 'object') {
    const custom = (branchBlock.data as Record<string, { name: string; address: string; phone: string; whatsapp: string }>)[city.slug]
    if (custom) {
      branch = custom
    }
  }

  if (!branch) {
    branch = {
      name: `ASN.NET Layanan Pelanggan ${city.name}`,
      address: `Sentra Layanan & Dukungan Fiber, ${city.name}`,
      phone: '0800-1-ASN-NET',
      whatsapp: '6285694072344'
    }
  }

  return {
    city: {
      id: city.id,
      name: city.name,
      slug: city.slug,
      province: city.province,
      totalDistricts: mappedDistricts.length,
      availableDistricts
    },
    districts: mappedDistricts,
    packages: mappedPackages,
    branch
  }
}

/** Districts for a city (FR-1.1). Returns null when the city doesn't exist. */
export async function listDistricts(citySlug: string) {
  const [city] = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, citySlug)).limit(1)
  if (!city) return null
  return db
    .select({ slug: districts.slug, name: districts.name })
    .from(districts)
    .where(eq(districts.cityId, city.id))
    .orderBy(asc(districts.name))
}

export interface PublicCatalogFilter {
  product?: string
  citySlug?: string
  districtSlug?: string
}

/** Public package catalog with optional area-override price resolution (PRD FR-2). */
export async function listPublicCatalog(filter?: PublicCatalogFilter) {
  const allProducts = await db
    .select({
      id: products.id,
      key: products.key,
      name: products.name,
      tagline: products.tagline,
      heroCopy: products.heroCopy,
      features: products.features,
      sortOrder: products.sortOrder
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.sortOrder))

  let pkgs = await db
    .select({
      id: packages.id,
      productId: packages.productId,
      productKey: products.key,
      productName: products.name,
      slug: packages.slug,
      name: packages.name,
      speedMbps: packages.speedMbps,
      basePriceIdr: packages.basePriceIdr,
      devicesMin: packages.devicesMin,
      devicesMax: packages.devicesMax,
      features: packages.features,
      sortOrder: packages.sortOrder
    })
    .from(packages)
    .innerJoin(products, eq(packages.productId, products.id))
    .where(eq(packages.isActive, true))
    .orderBy(asc(packages.sortOrder))

  if (filter?.product && filter.product !== 'all') {
    pkgs = pkgs.filter((p) => p.productKey === filter.product)
  }

  let selectedArea:
    | {
        city: { id: number; name: string; slug: string }
        district?: { id: number; name: string; slug: string }
      }
    | undefined

  if (filter?.citySlug) {
    const [city] = await db.select().from(cities).where(eq(cities.slug, filter.citySlug)).limit(1)
    if (city) {
      let district: (typeof districts.$inferSelect) | undefined
      if (filter.districtSlug) {
        const [d] = await db
          .select()
          .from(districts)
          .where(and(eq(districts.cityId, city.id), eq(districts.slug, filter.districtSlug)))
          .limit(1)
        district = d
      }

      selectedArea = {
        city: { id: city.id, name: city.name, slug: city.slug },
        district: district ? { id: district.id, name: district.name, slug: district.slug } : undefined
      }

      const overrides = await db
        .select()
        .from(packageAreaPrices)
        .where(and(eq(packageAreaPrices.cityId, city.id), eq(packageAreaPrices.isActive, true)))

      return {
        products: allProducts,
        selectedArea,
        packages: pkgs.map((p) => {
          const districtOverride = district
            ? overrides.find((o) => o.packageId === p.id && o.districtId === district.id)
            : undefined
          const cityOverride = overrides.find((o) => o.packageId === p.id && o.districtId === null)
          const price = districtOverride?.priceIdr ?? cityOverride?.priceIdr ?? p.basePriceIdr
          return {
            ...p,
            priceIdr: price,
            isPriceOverridden: price !== p.basePriceIdr
          }
        })
      }
    }
  }

  return {
    products: allProducts,
    selectedArea,
    packages: pkgs.map((p) => ({
      ...p,
      priceIdr: p.basePriceIdr,
      isPriceOverridden: false
    }))
  }
}

