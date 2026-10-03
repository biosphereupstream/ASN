import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { CITIES_DATA, DISTRICTS_BY_CITY, getEffectivePackages } from '$lib/data/coverageData'

const PRODUCTS = [
  { id: 1, key: 'fiber', name: 'ASN Fiber Home', tagline: 'Internet Rumah Tanpa Batas', heroCopy: 'Koneksi internet fiber optik ultra-cepat dan simetris untuk kebutuhan browsing, streaming 4K, dan smart home seluruh keluarga.', features: ['Kecepatan simetris 1:1', 'Unlimited tanpa FUP', 'Gratis instalasi standar', 'Router Wi-Fi dual band'], sortOrder: 1 },
  { id: 2, key: 'business', name: 'ASN Fiber Bisnis', tagline: 'Koneksi Andal untuk Usaha', heroCopy: 'Internet dedicated kecepatan tinggi dengan jaminan SLA 99.8%, IP statis, dan prioritas routing bisnis.', features: ['SLA uptime 99.8%', 'IP Statis Publik', 'Dedicated bandwidth 1:1', 'Prioritas dukungan teknis'], sortOrder: 2 },
  { id: 3, key: 'gamer', name: 'ASN Gamer Pro', tagline: 'Latency Rendah, Jalur Khusus', heroCopy: 'Jalur routing khusus game server internasional dengan ultra-low ping dan zero packet loss.', features: ['Jalur gaming dedicated', 'Optimasi ping & jitter', 'NAT Type Open', 'Router Wi-Fi 6 Gaming'], sortOrder: 3 },
  { id: 4, key: 'cctv', name: 'ASN Cloud Protect', tagline: 'Keamanan Pintar Berbasis Cloud', heroCopy: 'Integrasi CCTV pintar dengan penyimpanan cloud terenkripsi dan live streaming 24 jam.', features: ['Penyimpanan cloud aman', 'Live view smartphone', 'Deteksi gerakan pintar', 'Dukungan teknisi'], sortOrder: 4 }
]

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  const productKey = url.searchParams.get('product')?.trim()
  const citySlug = url.searchParams.get('city')?.trim()
  const districtSlug = url.searchParams.get('district')?.trim()

  let pkgs = getEffectivePackages(citySlug)
  if (productKey && productKey !== 'all') {
    pkgs = pkgs.filter((p) => p.productKey === productKey)
  }

  let selectedArea: { city: { id: number; name: string; slug: string }; district?: { id: number; name: string; slug: string } } | undefined

  if (citySlug) {
    const city = CITIES_DATA.find((c) => c.slug === citySlug)
    if (city) {
      const districts = DISTRICTS_BY_CITY[citySlug]
      const district = districtSlug ? districts?.find((d) => d.slug === districtSlug) : undefined
      selectedArea = {
        city: { id: city.id, name: city.name, slug: city.slug },
        district: district ? { id: district.id, name: district.name, slug: district.slug } : undefined
      }
    }
  }

  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
  })

  return json({
    products: PRODUCTS,
    selectedArea,
    packages: pkgs
  })
}
