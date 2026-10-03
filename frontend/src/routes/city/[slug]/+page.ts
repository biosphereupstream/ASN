import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export interface CityDistrict {
  id: number
  name: string
  slug: string
  status: 'available' | 'coming_soon' | 'not_available'
}

export interface CityPackage {
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

export interface CityBranch {
  name: string
  address: string
  phone: string
  whatsapp: string
}

export interface CityDetailData {
  city: {
    id: number
    name: string
    slug: string
    province: string
    totalDistricts: number
    availableDistricts: number
  }
  districts: CityDistrict[]
  packages: CityPackage[]
  branch: CityBranch | null
}

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/cities/${params.slug}`)
  if (!res.ok) {
    error(404, 'Kota tidak ditemukan atau belum terdaftar')
  }
  const cityDetail: CityDetailData = await res.json()
  return { cityDetail }
}
