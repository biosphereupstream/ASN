import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export interface ProductConfig {
  key: 'fiber' | 'stream' | 'mesh' | 'business'
  name: string
  headline: string
  tagline: string
  icon: 'gauge' | 'tv' | 'mesh' | 'building'
  badge: string
  badgeColor: string
  features: string[]
  faqs: { q: string; a: string }[]
  sliderMax: number
}

const PRODUCTS_CONFIG: Record<string, ProductConfig> = {
  fiber: {
    key: 'fiber',
    name: 'ASN.NET Fiber',
    headline: 'Internet Rumah 100% Fiber Optik Murni',
    tagline: 'Koneksi simetris download & upload super stabil tanpa batasan kuota (FUP) untuk aktivitas seluruh keluarga.',
    icon: 'gauge',
    badge: 'Flagship Rumah',
    badgeColor: 'bg-asn-blue-500/15 text-asn-blue-700',
    sliderMax: 20,
    features: [
      '100% Kabel Fiber Optik Murni langsung ke rumah Anda',
      'Download dan Upload 1:1 Simetris tanpa kompresi berlebih',
      'Unlimited kuota tanpa batas pemakaian wajar (FUP)',
      'Gratis peminjaman Optical Network Terminal (ONT) WiFi Router',
      'Dukungan customer service dan tim teknisi 24/7'
    ],
    faqs: [
      {
        q: 'Apakah ASN.NET Fiber benar-benar tanpa FUP?',
        a: 'Benar. ASN.NET tidak menerapkan batasan kuota bulanan. Anda dapat mengunduh, menonton, atau bermain game sepuasnya dengan kecepatan konstan setiap saat.'
      },
      {
        q: 'Berapa rasio kecepatan upload dan download?',
        a: 'Jaringan kami beroperasi dengan rasio simetris 1:1. Mengunggah file besar, video conference, dan siaran langsung sama cepatnya dengan mengunduh.'
      },
      {
        q: 'Apakah ada biaya sewa modem bulanan?',
        a: 'Tidak ada. Modem WiFi diserahkan selama Anda berlangganan tanpa tambahan biaya sewa bulanan.'
      }
    ]
  },
  stream: {
    key: 'stream',
    name: 'ASN.NET Stream',
    headline: 'Fiber Kencang + Akses Hiburan Streaming OTT',
    tagline: 'Internet fiber optik dengan rute prioritas video bandwidth 4K plus bundel akun streaming favorit.',
    icon: 'tv',
    badge: 'Bundle Streaming',
    badgeColor: 'bg-purple-500/15 text-purple-700',
    sliderMax: 25,
    features: [
      'Semua keunggulan koneksi 100% fiber optik simetris',
      'Bundel akun platform streaming (OTT) terpopuler',
      'Traffic prioritization untuk video 4K & live sports tanpa jeda buffer',
      'Dukungan multi-screen untuk menonton bersama di berbagai layar TV & tablet',
      'Gratis instalasi & modem WiFi high-throughput'
    ],
    faqs: [
      {
        q: 'Layanan OTT apa saja yang termasuk dalam bundel?',
        a: 'Bundel Stream mencakup akses akun streaming premium mitra ASN.NET seperti video streaming series, film box office, dan tayangan olahraga langsung.'
      },
      {
        q: 'Apakah menonton streaming akan mengganggu anggota keluarga lain yang sedang WFH?',
        a: 'Tidak. ASN.NET Stream menggunakan Quality of Service (QoS) pintar yang memisahkan kanal video dengan kanal browsing/meeting sehingga keduanya berjalan lancar.'
      }
    ]
  },
  mesh: {
    key: 'mesh',
    name: 'ASN.NET Mesh',
    headline: 'WiFi Seluruh Sudut Rumah Bebas Dead-Zone',
    tagline: 'Kombinasi koneksi fiber optik dan unit Mesh Access Point untuk jangkauan sinyal merata di rumah bertingkat.',
    icon: 'mesh',
    badge: 'Jangkauan Luas',
    badgeColor: 'bg-emerald-500/15 text-emerald-700',
    sliderMax: 30,
    features: [
      'Termasuk 1 unit modem utama + unit Mesh Access Point tambahan',
      'Teknologi Seamless Roaming: satu SSID otomatis berpindah tanpa putus',
      'Menjangkau rumah bertingkat 2–3 lantai dan luas lebih dari 150m²',
      'Menghilangkan blind-spot dan sinyal lemah di balik dinding beton',
      'Instalasi rapi dan konfigurasi optimal oleh tim teknisi bersertifikat'
    ],
    faqs: [
      {
        q: 'Bagaimana cara kerja teknologi WiFi Mesh?',
        a: 'Unit modem utama dan node mesh berkomunikasi secara nirkabel atau via kabel LAN membentuk satu jaringan selimut. Ponsel atau laptop Anda berpindah otomatis ke sinyal terkuat tanpa jeda reconnect.'
      },
      {
        q: 'Apakah bisa menambah unit mesh node jika rumah sangat luas?',
        a: 'Bisa. Sistem mesh ASN.NET modular dan dapat ditambahkan unit node ekstra sesuai luas bangunan rumah Anda.'
      }
    ]
  },
  business: {
    key: 'business',
    name: 'ASN.NET Business',
    headline: 'Koneksi Dedicated Kelas Korporat & UKM',
    tagline: 'Jalur internet dedicated dengan jaminan uptime SLA 99.5%, opsi Static IP publik, dan respons gangguan prioritas.',
    icon: 'building',
    badge: 'Enterprise & UKM',
    badgeColor: 'bg-amber-500/15 text-amber-700',
    sliderMax: 40,
    features: [
      'Garansi Service Level Agreement (SLA) Uptime 99.5% secara komersial',
      'Opsi Static IP Public Dedicated untuk server, CCTV, & VPN kantor',
      'Jalur koneksi prioritas bypass congesti jam sibuk',
      'Dedicated NOC support dengan waktu tanggap penanganan < 2 jam',
      'Dukungan faktur pajak resmi dan pembayaran korporat'
    ],
    faqs: [
      {
        q: 'Apakah paket Business mendapatkan Static IP publik?',
        a: 'Ya, paket ASN.NET Business menyediakan opsi Static IP publik untuk kemudahan akses server, sistem ERP, VPN, dan kamera CCTV jarak jauh.'
      },
      {
        q: 'Bagaimana jika terjadi gangguan jaringan pada kantor kami?',
        a: 'Pelanggan Business memiliki jalur hotline darurat langsung ke tim NOC dengan jaminan eskalasi penanganan dalam hitungan menit.'
      }
    ]
  }
}

export const load: PageLoad = async ({ params, fetch }) => {
  const productKey = params.product.toLowerCase()
  const config = PRODUCTS_CONFIG[productKey]

  if (!config) {
    throw error(404, `Layanan '${params.product}' tidak ditemukan`)
  }

  let packages: Array<{
    id: number
    slug: string
    name: string
    speedMbps: number
    basePriceIdr: number
    priceIdr: number
    devicesMin: number
    devicesMax: number
    features: string[]
  }> = []

  try {
    const res = await fetch(`/api/packages?product=${productKey}`)
    if (res.ok) {
      const data = await res.json()
      packages = data.packages || []
    }
  } catch {
    // Graceful fallback
  }

  return {
    product: config,
    packages
  }
}
