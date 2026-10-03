import type { PageLoad } from './$types'

export interface CityDirectoryItem {
  id: number
  slug: string
  name: string
  province: string
  totalDistricts: number
  availableDistricts: number
  minPriceIdr: number
}

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/cities')
    if (!res.ok) {
      return { cities: [] as CityDirectoryItem[] }
    }
    const cities: CityDirectoryItem[] = await res.json()
    return { cities }
  } catch {
    return { cities: [] as CityDirectoryItem[] }
  }
}
