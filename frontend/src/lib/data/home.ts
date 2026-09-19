/**
 * Homepage demo content — mirrors the PRD's seed-data defaults (FR-6.2: sane
 * defaults until the admin/CMS-lite and backend exist). All prices integer IDR (§12).
 */

export type IconName = 'modem' | 'fiber' | 'infinity' | 'gauge' | 'tv' | 'mesh' | 'building'

export interface Pkg {
  slug: string
  name: string
  speedMbps: number
  priceIdr: number
  devices: [number, number]
  features: string[]
  badge?: string
  featured?: boolean
}

/** Package highlights (PRD §6.2 #4) — copy pattern from §11. */
export const PACKAGES: Pkg[] = [
  {
    slug: 'fiber-50',
    name: 'ASN.NET Fiber 50',
    speedMbps: 50,
    priceIdr: 199000,
    devices: [5, 8],
    features: ['Unlimited tanpa FUP', 'Gratis instalasi & modem'],
    badge: 'Kamu lebih hemat'
  },
  {
    slug: 'fiber-100',
    name: 'ASN.NET Fiber 100',
    speedMbps: 100,
    priceIdr: 299000,
    devices: [8, 10],
    features: ['Unlimited tanpa FUP', 'Gratis instalasi & modem', 'Prioritas bantuan 24/7'],
    featured: true
  },
  {
    slug: 'fiber-300',
    name: 'ASN.NET Fiber 300',
    speedMbps: 300,
    priceIdr: 499000,
    devices: [12, 15],
    features: ['Unlimited tanpa FUP', 'Gratis instalasi & modem', 'DDoS-protected gaming route']
  },
  {
    slug: 'stream-100',
    name: 'ASN.NET Stream 100',
    speedMbps: 100,
    priceIdr: 349000,
    devices: [8, 12],
    features: ['Semua benefit Fiber 100', 'Bundle akun streaming (OTT)', 'Bandwidth video diprioritaskan'],
    badge: 'Promo Harbolnas: Bayar 3 Bulan, Gratis 1 Bulan!'
  }
]

/** Value props strip (PRD §6.2 #2) with floating metallic 3D icons (§7.3). */
export const VALUE_PROPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'modem', title: 'Gratis WiFi Modem', desc: 'Berlangganan ASN.NET tanpa harus bayar sewa modem.' },
  { icon: 'fiber', title: '100% Fiber Optic', desc: 'Koneksi stabil bikin aktivitas digital kamu makin lancar.' },
  { icon: 'infinity', title: 'Kuota Tanpa Batas', desc: 'Bebas internetan tanpa takut kehabisan kuota.' }
]

/** Product lines preview (PRD §6.2 #3). */
export const PRODUCTS: { icon: IconName; slug: string; name: string; tagline: string }[] = [
  { icon: 'gauge', slug: 'fiber', name: 'ASN.NET Fiber', tagline: 'Internet rumah flagship — cepat, stabil, unlimited.' },
  { icon: 'tv', slug: 'stream', name: 'ASN.NET Stream', tagline: 'Fiber + hiburan: bundle akun streaming favorit.' },
  { icon: 'mesh', slug: 'mesh', name: 'ASN.NET Mesh', tagline: 'WiFi pekat sampai sudut terjauh dengan access point tambahan.' },
  { icon: 'building', slug: 'business', name: 'ASN.NET Business', tagline: 'Dedicated & prioritas untuk UKM dan kantor.' }
]

/** How it works (PRD §6.2 #5). */
export const STEPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'gauge', title: 'Cek Cakupan', desc: 'Pilih kota & kecamatan, langsung ketahuan statusnya.' },
  { icon: 'modem', title: 'Pilih Paket', desc: 'Cocokkan kecepatan dengan jumlah perangkat di rumah.' },
  { icon: 'fiber', title: 'Jadwal Pemasangan', desc: 'Tim teknisi menghubungimu via WhatsApp dalam 1×24 jam.' }
]

/** Testimonials / stats strip (PRD §6.2 #7, configurable). */
export const STATS: { value: string; label: string }[] = [
  { value: '12+', label: 'Kota tercakup & terus bertambah' },
  { value: '50rb', label: 'Rumah & bisnis terhubung' },
  { value: '99,9%', label: 'Uptime jaringan bulanan' },
  { value: '1×24', label: 'Jam jadwal pemasangan' }
]

/** FAQ teaser (PRD §6.2 #8, top 4). */
export const FAQS: { q: string; a: string }[] = [
  {
    q: 'Berapa lama proses pemasangan?',
    a: 'Setelah permintaan diterima, tim kami menghubungi kamu dalam 1×24 jam untuk menjadwalkan pemasangan. Pemasangan biasanya selesai dalam 1–2 jam.'
  },
  {
    q: 'Apakah benar gratis modem?',
    a: 'Benar. Modem WiFi diserahkan selama berlangganan tanpa biaya sewa, termasuk instalasi pertama.'
  },
  {
    q: 'Apa itu Unlimited tanpa FUP?',
    a: 'Kamu bisa internetan sepuasnya tanpa batas kuota dan tanpa kebijakan pembatasan kecepatan berdasarkan volume pemakaian.'
  },
  {
    q: 'Area saya belum tercakup, bagaimana?',
    a: 'Gunakan tombol Request Area. Semakin banyak permintaan di satu kecamatan, semakin cepat kami membuka jaringan di lokasimu.'
  }
]

export const WA_NUMBER = '622150919981'

export function formatIdr(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID')
}
