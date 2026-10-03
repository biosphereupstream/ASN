export interface CityItem {
  id: number
  name: string
  slug: string
  province: string
  totalDistricts: number
  availableDistricts: number
  minPriceIdr: number
}

export interface DistrictItem {
  id: number
  name: string
  slug: string
  status: 'available' | 'coming_soon' | 'not_available'
}

export interface PackageItem {
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
}

export interface BranchInfo {
  name: string
  address: string
  phone: string
  whatsapp: string
}

export const CITIES_DATA: CityItem[] = [
  { id: 1, name: 'Kota Bogor', slug: 'kota-bogor', province: 'Jawa Barat', totalDistricts: 4, availableDistricts: 1, minPriceIdr: 199000 },
  { id: 2, name: 'Kabupaten Bogor', slug: 'kabupaten-bogor', province: 'Jawa Barat', totalDistricts: 4, availableDistricts: 1, minPriceIdr: 199000 },
  { id: 3, name: 'Kota Bekasi', slug: 'kota-bekasi', province: 'Jawa Barat', totalDistricts: 3, availableDistricts: 2, minPriceIdr: 199000 },
  { id: 4, name: 'Jakarta Selatan', slug: 'jakarta-selatan', province: 'DKI Jakarta', totalDistricts: 3, availableDistricts: 1, minPriceIdr: 199000 },
  { id: 5, name: 'Kota Depok', slug: 'kota-depok', province: 'Jawa Barat', totalDistricts: 3, availableDistricts: 1, minPriceIdr: 199000 },
  { id: 6, name: 'Bandung', slug: 'bandung', province: 'Jawa Barat', totalDistricts: 3, availableDistricts: 1, minPriceIdr: 199000 }
]

export const DISTRICTS_BY_CITY: Record<string, DistrictItem[]> = {
  'kota-bogor': [
    { id: 1, name: 'Cibinong', slug: 'cibinong', status: 'available' },
    { id: 2, name: 'Gunung Sindur', slug: 'gunung-sindur', status: 'coming_soon' },
    { id: 3, name: 'Parung', slug: 'parung', status: 'not_available' },
    { id: 4, name: 'Tamansari', slug: 'tamansari', status: 'not_available' }
  ],
  'kabupaten-bogor': [
    { id: 5, name: 'Citeureup', slug: 'citeureup', status: 'available' },
    { id: 6, name: 'Cibinong', slug: 'cibinong', status: 'not_available' },
    { id: 7, name: 'Sukaraja', slug: 'sukaraja', status: 'not_available' },
    { id: 8, name: 'Babakan Madang', slug: 'babakan-madang', status: 'not_available' }
  ],
  'kota-bekasi': [
    { id: 9, name: 'Bekasi Timur', slug: 'bekasi-timur', status: 'available' },
    { id: 10, name: 'Rawalumbu', slug: 'rawalumbu', status: 'available' },
    { id: 11, name: 'Bekasi Barat', slug: 'bekasi-barat', status: 'not_available' }
  ],
  'jakarta-selatan': [
    { id: 12, name: 'Tebet', slug: 'tebet', status: 'available' },
    { id: 13, name: 'Kebayoran Baru', slug: 'kebayoran-baru', status: 'not_available' },
    { id: 14, name: 'Pasar Minggu', slug: 'pasar-minggu', status: 'not_available' }
  ],
  'kota-depok': [
    { id: 15, name: 'Beji', slug: 'beji', status: 'available' },
    { id: 16, name: 'Sawangan', slug: 'sawangan', status: 'coming_soon' },
    { id: 17, name: 'Cimanggis', slug: 'not_available', status: 'not_available' }
  ],
  bandung: [
    { id: 18, name: 'Coblong', slug: 'coblong', status: 'available' },
    { id: 19, name: 'Sukajadi', slug: 'sukajadi', status: 'not_available' },
    { id: 20, name: 'Buahbatu', slug: 'buahbatu', status: 'not_available' }
  ]
}

export const BASE_PACKAGES: Omit<PackageItem, 'priceIdr' | 'isPriceOverridden'>[] = [
  {
    id: 1,
    productId: 1,
    productKey: 'fiber',
    productName: 'ASN.NET Fiber',
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
    id: 2,
    productId: 1,
    productKey: 'fiber',
    productName: 'ASN.NET Fiber',
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
    id: 3,
    productId: 1,
    productKey: 'fiber',
    productName: 'ASN.NET Fiber',
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
    id: 4,
    productId: 2,
    productKey: 'stream',
    productName: 'ASN.NET Stream',
    slug: 'stream-100',
    name: 'ASN.NET Stream 100',
    speedMbps: 100,
    basePriceIdr: 349000,
    devicesMin: 8,
    devicesMax: 12,
    features: ['Semua benefit Fiber 100', 'Bundle akun streaming (OTT)', 'Bandwidth video diprioritaskan'],
    sortOrder: 4
  }
]

export const PRICE_OVERRIDES: Record<string, Record<string, number>> = {
  'kota-bekasi': {
    'fiber-100': 279000
  }
}

export const BRANCHES_DATA: Record<string, BranchInfo> = {
  'kota-bekasi': {
    name: 'ASN.NET Kantor Cabang Bekasi',
    address: 'Jl. Ahmad Yani No. 88, Bekasi Selatan, Kota Bekasi 17141',
    phone: '(021) 8899-7711',
    whatsapp: '628111222333'
  },
  'kota-bogor': {
    name: 'ASN.NET Kantor Cabang Bogor',
    address: 'Jl. Pajajaran No. 45, Bogor Tengah, Kota Bogor 16128',
    phone: '(0251) 833-4455',
    whatsapp: '628111222334'
  },
  'kabupaten-bogor': {
    name: 'ASN.NET Service Point Cibinong',
    address: 'Jl. Tegar Beriman No. 12, Cibinong, Kab. Bogor 16914',
    phone: '(021) 8790-1234',
    whatsapp: '628111222335'
  },
  'jakarta-selatan': {
    name: 'ASN.NET Flagship Tebet',
    address: 'Jl. Tebet Barat Dalam Raya No. 18, Tebet, Jakarta Selatan 12810',
    phone: '(021) 829-5566',
    whatsapp: '628111222336'
  },
  'kota-depok': {
    name: 'ASN.NET Hub Margonda',
    address: 'Jl. Margonda Raya No. 120, Beji, Kota Depok 16423',
    phone: '(021) 7720-3344',
    whatsapp: '628111222337'
  },
  bandung: {
    name: 'ASN.NET Hub Dago',
    address: 'Jl. Ir. H. Juanda No. 84, Coblong, Kota Bandung 40132',
    phone: '(022) 250-9988',
    whatsapp: '628111222338'
  }
}

export function getEffectivePackages(citySlug?: string): PackageItem[] {
  const overrides = citySlug ? PRICE_OVERRIDES[citySlug] : undefined
  return BASE_PACKAGES.map((p) => {
    const override = overrides?.[p.slug]
    const price = override ?? p.basePriceIdr
    return {
      ...p,
      priceIdr: price,
      isPriceOverridden: price !== p.basePriceIdr
    }
  })
}
