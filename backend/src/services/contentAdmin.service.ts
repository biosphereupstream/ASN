import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { contentBlocks } from '../db/schema'
import { recordAudit, type AdminActor } from './auth.service'

export const DEFAULT_CONTENT_BLOCKS: Record<string, Record<string, unknown>> = {
  hero: {
    headline: 'Internet Fiber Super Cepat untuk Rumah & Bisnismu',
    subheadline: 'Koneksi stabil 100% fiber optik, unlimited, gratis modem.',
    badges: ['100% Fiber Optic', 'Gratis Modem', 'Kuota Tanpa Batas']
  },
  value_props: {
    items: [
      { icon: 'modem', title: 'Gratis WiFi Modem', desc: 'Berlangganan ASN.NET tanpa harus bayar sewa modem.' },
      { icon: 'fiber', title: '100% Fiber Optic', desc: 'Koneksi stabil bikin aktivitas digital kamu makin lancar.' },
      { icon: 'infinity', title: 'Kuota Tanpa Batas', desc: 'Bebas internetan tanpa takut kehabisan kuota.' }
    ]
  },
  faqs: {
    items: [
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
        q: 'Bagaimana cara cek area apakah tercover?',
        a: 'Gunakan fitur Cek Cakupan di halaman depan. Pilih kota dan kecamatan tempat tinggalmu.'
      }
    ]
  },
  stats: {
    items: [
      { value: '12+', label: 'Kota tercakup & terus bertambah' },
      { value: '50rb', label: 'Rumah & bisnis terhubung' },
      { value: '99,9%', label: 'Uptime jaringan bulanan' },
      { value: '1×24', label: 'Jam jadwal pemasangan' }
    ]
  },
  branches: {
    items: [
      {
        city: 'Kota Bekasi',
        name: 'Kantor Cabang Bekasi',
        address: 'Jl. Ahmad Yani No. 88, Bekasi Selatan',
        phone: '021-88991234',
        whatsapp: '+6281234567890'
      },
      {
        city: 'Jakarta Selatan',
        name: 'Kantor Cabang Jakarta',
        address: 'Jl. TB Simatupang No. 12, Cilandak, Jakarta Selatan',
        phone: '021-78901234',
        whatsapp: '+6281234567891'
      }
    ]
  }
}

export async function listAllContentBlocks() {
  const rows = await db.select().from(contentBlocks)
  const map: Record<string, { data: Record<string, unknown>; updatedAt?: Date }> = {}

  for (const [key, defaultData] of Object.entries(DEFAULT_CONTENT_BLOCKS)) {
    map[key] = { data: defaultData }
  }

  for (const r of rows) {
    map[r.key] = { data: r.data, updatedAt: r.updatedAt }
  }

  return map
}

export async function getContentBlock(key: string) {
  const [row] = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.key, key))
    .limit(1)

  if (row) {
    return { key: row.key, data: row.data, updatedAt: row.updatedAt }
  }

  if (DEFAULT_CONTENT_BLOCKS[key]) {
    return { key, data: DEFAULT_CONTENT_BLOCKS[key] }
  }

  return null
}

export async function upsertContentBlock(key: string, data: Record<string, unknown>, actor: AdminActor) {
  const [row] = await db
    .insert(contentBlocks)
    .values({
      key,
      data,
      updatedBy: actor.id,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: [contentBlocks.key],
      set: {
        data,
        updatedBy: actor.id,
        updatedAt: new Date()
      }
    })
    .returning()

  await recordAudit(actor, 'content_block', row.id, 'upsert', { key, data })
  return row
}
