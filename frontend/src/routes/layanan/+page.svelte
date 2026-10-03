<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import AsnLogo from '$lib/components/AsnLogo.svelte'
  import TiltCard from '$lib/components/TiltCard.svelte'
  import MetallicIcon from '$lib/components/MetallicIcon.svelte'
  import { WA_URL } from '$lib/data/home'

  interface ProductFeature {
    name: string
    fiber: boolean | string
    stream: boolean | string
    mesh: boolean | string
    business: boolean | string
  }

  const productsList = [
    {
      slug: 'fiber',
      name: 'ASN.NET Fiber',
      icon: 'gauge' as const,
      tagline: 'Internet rumah flagship — super cepat, stabil, tanpa batas kuota.',
      audience: 'Keluarga, WFH, & Pelajar (5–15 perangkat)',
      startPrice: 199000,
      badge: 'Paling Populer',
      highlights: [
        '100% Kabel Fiber Optic Murni',
        'Unlimited Kuota Tanpa FUP',
        'Gratis Biaya Sewa WiFi Modem',
        'Kecepatan Simetris Download & Upload'
      ]
    },
    {
      slug: 'stream',
      name: 'ASN.NET Stream',
      icon: 'tv' as const,
      tagline: 'Koneksi fiber kencang dipadukan dengan bundle akun hiburan OTT.',
      audience: 'Pencinta Serial, Film, & Live Streaming',
      startPrice: 349000,
      badge: 'Bundle Hemat',
      highlights: [
        'Semua keunggulan ASN.NET Fiber',
        'Bonus Akun Streaming Premium (OTT)',
        'Jalur Bandwidth Khusus Streaming 4K',
        'Dukungan Multi-Screen Bersamaan'
      ]
    },
    {
      slug: 'mesh',
      name: 'ASN.NET Mesh',
      icon: 'mesh' as const,
      tagline: 'WiFi merata ke setiap sudut rumah bertingkat tanpa dead-zone.',
      audience: 'Rumah Tingkat, Luas > 150m², & Kantor Ruko',
      startPrice: 399000,
      badge: 'Zero Dead-Zone',
      highlights: [
        'Termasuk Unit Mesh Node Tambahan',
        'Satu Nama WiFi (Seamless Roaming)',
        'Sinyal Tembus Dinding Lebih Kuat',
        'Manajemen Jaringan Cerdas Otomatis'
      ]
    },
    {
      slug: 'business',
      name: 'ASN.NET Business',
      icon: 'building' as const,
      tagline: 'Koneksi dedicated kelas korporat untuk operasional bisnis andal.',
      audience: 'UKM, Kantor, Cafe, & Usaha Mandiri',
      startPrice: 599000,
      badge: 'SLA 99.5%',
      highlights: [
        'Garansi Service Level Agreement (SLA)',
        'Opsi Static IP Public Dedicated',
        'Prioritas Penanganan Gangguan < 2 Jam',
        'Faktur Pajak & Bukti Pembayaran Resmi'
      ]
    }
  ]

  const comparisonFeatures: ProductFeature[] = [
    { name: 'Teknologi Jaringan', fiber: '100% Fiber Optic', stream: '100% Fiber Optic', mesh: 'Fiber + Mesh AP', business: 'Dedicated Fiber' },
    { name: 'Kebijakan Kuota', fiber: 'Tanpa FUP', stream: 'Tanpa FUP', mesh: 'Tanpa FUP', business: 'Tanpa FUP (Dedicated)' },
    { name: 'Rasio Kecepatan (DL:UL)', fiber: '1:1 Simetris', stream: '1:1 Simetris', mesh: '1:1 Simetris', business: '1:1 Dedicated' },
    { name: 'Perangkat Hardware', fiber: 'Optical Modem WiFi', stream: 'Modem WiFi + OTT Pass', mesh: 'Modem + Mesh Node', business: 'Enterprise Router' },
    { name: 'SLA Garansi Uptime', fiber: '99.0%', stream: '99.0%', mesh: '99.0%', business: '99.5% Komersial' },
    { name: 'Opsi Static IP', fiber: false, stream: false, mesh: false, business: 'Tersedia' },
    { name: 'Dukungan Pelanggan', fiber: '24/7 Standar', stream: '24/7 Standar', mesh: '24/7 Standar', business: '24/7 Dedicated NOC' }
  ]

  function formatIdr(n: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  }

  const breadcrumbsSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://asn.net.id/' },
      { '@type': 'ListItem', position: 2, name: 'Layanan', item: 'https://asn.net.id/layanan' }
    ]
  })
</script>

<svelte:head>
  <title>Layanan Internet Fiber — ASN.NET</title>
  <meta
    name="description"
    content="Temukan layanan internet fiber ASN.NET: Fiber rumah unlimited, Stream bundle OTT hiburan, Mesh WiFi seluruh sudut rumah, dan Business kelas korporat."
  />
  <link rel="canonical" href="https://asn.net.id/layanan" />
  <meta property="og:title" content="Layanan Internet Fiber — ASN.NET" />
  <meta property="og:description" content="Pilihan koneksi 100% fiber optik murni tanpa FUP untuk rumah, hiburan, dan bisnis Anda." />
  <meta property="og:type" content="website" />
  {@html `<script type="application/ld+json">${breadcrumbsSchema}</script>`}
</svelte:head>

<div class="min-h-screen bg-white text-asn-ink-900 flex flex-col justify-between">
  <div>
    <SiteHeader active="layanan" />

    <!-- Hero Section -->
    <section class="relative overflow-hidden py-14 px-5 text-center bg-radial from-asn-blue-300/20 via-white to-white">
      <div class="mx-auto max-w-3xl space-y-4">
        <span class="inline-block rounded-full bg-asn-blue-500/15 px-3 py-1 text-xs font-bold text-asn-blue-700 tracking-wide uppercase">
          Koneksi Tanpa Kompromi
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-asn-ink-900 leading-tight">
          Layanan Internet Fiber untuk Setiap Kebutuhan Anda
        </h1>
        <p class="text-sm sm:text-base text-asn-ink-900/70 max-w-2xl mx-auto leading-relaxed">
          Dari koneksi rumah yang stabil, tayangan hiburan streaming tanpa jeda, jangkauan sinyal rumah bertingkat, hingga konektivitas bisnis kelas profesional.
        </p>

        <div class="pt-3 flex flex-wrap items-center justify-center gap-3">
          <a href="/paket" class="btn-primary rounded-full px-6 py-2.5 text-xs font-bold shadow-sm">
            Lihat Semua Paket Internet
          </a>
          <a href="/#cek" class="glossy rounded-full px-6 py-2.5 text-xs font-bold">
            Cek Cakupan Area
          </a>
        </div>
      </div>
    </section>

    <!-- 4 Product Lines Cards -->
    <section class="mx-auto max-w-6xl px-5 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each productsList as prod (prod.slug)}
          <div class="card p-6 bg-white hover:border-asn-blue-500/50 transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div class="flex items-center justify-between gap-3 mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 rounded-2xl bg-asn-blue-500/10 flex items-center justify-center text-asn-blue-700">
                    <MetallicIcon name={prod.icon} />
                  </div>
                  <div>
                    <h2 class="text-xl font-black text-asn-ink-900 group-hover:text-asn-blue-700 transition">
                      {prod.name}
                    </h2>
                    <span class="text-[11px] font-semibold text-asn-ink-900/50">{prod.audience}</span>
                  </div>
                </div>

                <span class="rounded-full bg-asn-blue-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-asn-blue-700">
                  {prod.badge}
                </span>
              </div>

              <p class="text-xs text-asn-ink-900/70 leading-relaxed mb-4">
                {prod.tagline}
              </p>

              <!-- Highlights list -->
              <div class="space-y-2 py-3 border-t border-asn-silver-400/30 text-xs">
                {#each prod.highlights as hl}
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-500 font-extrabold">✓</span>
                    <span class="text-asn-ink-900/80">{hl}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-asn-silver-400/30 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-semibold uppercase text-asn-ink-900/50 block">Mulai dari</span>
                <span class="text-lg font-black text-asn-ink-900">{formatIdr(prod.startPrice)}</span>
                <span class="text-xs text-asn-ink-900/50">/bln</span>
              </div>

              <a
                href="/layanan/{prod.slug}"
                class="btn-primary rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Lihat Detail & Paket</span>
                <span>→</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Side-by-side Feature Comparison Matrix Table -->
    <section class="mx-auto max-w-6xl px-5 py-12">
      <div class="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <h2 class="text-2xl font-black tracking-tight text-asn-ink-900">Perbandingan Fitur Layanan</h2>
        <p class="text-xs text-asn-ink-900/60">Bandingkan spesifikasi teknis dan kelebihan setiap varian layanan ASN.NET.</p>
      </div>

      <div class="card bg-white p-4 sm:p-6 overflow-x-auto shadow-sm">
        <table class="w-full text-left text-xs min-w-[600px]">
          <thead class="border-b border-asn-silver-400/40 text-[11px] font-bold text-asn-ink-900/60 uppercase">
            <tr>
              <th class="py-3 px-3">Fitur & Spesifikasi</th>
              <th class="py-3 px-3 text-asn-blue-700">Fiber (Rumah)</th>
              <th class="py-3 px-3">Stream (OTT)</th>
              <th class="py-3 px-3">Mesh (Luas)</th>
              <th class="py-3 px-3 text-asn-ink-900">Business (Kantor)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-asn-silver-400/20">
            {#each comparisonFeatures as feat}
              <tr class="hover:bg-asn-silver-100/30">
                <td class="py-3.5 px-3 font-bold text-asn-ink-900">{feat.name}</td>
                <td class="py-3.5 px-3 font-semibold text-asn-blue-700">{feat.fiber}</td>
                <td class="py-3.5 px-3">{feat.stream}</td>
                <td class="py-3.5 px-3">{feat.mesh}</td>
                <td class="py-3.5 px-3 font-bold text-asn-ink-900">
                  {#if feat.business === true}
                    <span class="text-emerald-600 font-bold">✓ Ya</span>
                  {:else if feat.business === false}
                    <span class="text-asn-silver-400">—</span>
                  {:else}
                    {feat.business}
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Consultation CTA strip -->
    <section class="mx-auto max-w-4xl px-5 py-8">
      <div class="card p-8 bg-gradient-to-r from-asn-blue-500/10 via-white to-asn-blue-300/10 border border-asn-blue-500/30 text-center space-y-4">
        <h3 class="text-xl font-extrabold text-asn-ink-900">Masih ragu memilih layanan yang sesuai?</h3>
        <p class="text-xs text-asn-ink-900/70 max-w-md mx-auto">
          Tim spesialis kami siap membantu menganalisis denah rumah atau kebutuhan bandwidth kantor Anda secara gratis.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2"
          >
            <span>💬</span> Konsultasi via WhatsApp
          </a>
          <a href="/paket" class="glossy rounded-full px-5 py-2.5 text-xs font-bold">
            Buka Katalog Lengkap
          </a>
        </div>
      </div>
    </section>
  </div>

  <SiteFooter />
</div>
