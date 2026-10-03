<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import MetallicIcon from '$lib/components/MetallicIcon.svelte'
  import TiltCard from '$lib/components/TiltCard.svelte'
  import { WA_NUMBER } from '$lib/data/home'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  // Interactive Device Slider State
  let deviceCount = $state(8)

  function formatIdr(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
  }

  // Find the best recommended package based on deviceCount
  const recommendedPackage = $derived.by(() => {
    if (!data.packages || data.packages.length === 0) return null
    // Find package where devicesMin <= deviceCount <= devicesMax, or closest
    const match = data.packages.find((p) => deviceCount >= p.devicesMin && deviceCount <= p.devicesMax)
    if (match) return match
    if (deviceCount < data.packages[0].devicesMin) return data.packages[0]
    return data.packages[data.packages.length - 1]
  })

  // FAQ open/close state (null = all closed)
  let openFaq = $state<number | null>(null)

  // Structured Data Schema
  const breadcrumbSchema = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://asn.net.id/' },
        { '@type': 'ListItem', position: 2, name: 'Layanan', item: 'https://asn.net.id/layanan' },
        { '@type': 'ListItem', position: 3, name: data.product.name, item: `https://asn.net.id/layanan/${data.product.key}` }
      ]
    })
  )

  const productSchema = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.product.name,
      description: data.product.tagline,
      brand: { '@type': 'Brand', name: 'ASN.NET' },
      offers: data.packages.map((pkg) => ({
        '@type': 'Offer',
        name: pkg.name,
        price: pkg.priceIdr,
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
        url: `https://asn.net.id/daftar?package=${pkg.slug}&source=product_page`
      }))
    })
  )
</script>

<svelte:head>
  <title>{data.product.name} — Internet Fiber Cepat & Stabil | ASN.NET</title>
  <meta name="description" content="{data.product.headline}. {data.product.tagline}" />
  <link rel="canonical" href="https://asn.net.id/layanan/{data.product.key}" />
  <meta property="og:title" content="{data.product.name} — ASN.NET" />
  <meta property="og:description" content="{data.product.tagline}" />
  <meta property="og:type" content="product" />
  {@html `<script type="application/ld+json">${breadcrumbSchema}</script>`}
  {@html `<script type="application/ld+json">${productSchema}</script>`}
</svelte:head>

<div class="min-h-screen bg-white text-asn-ink-900 flex flex-col justify-between">
  <div>
    <SiteHeader active="layanan" />

    <!-- Breadcrumb bar -->
    <div class="mx-auto max-w-6xl px-5 pt-3 pb-1 text-xs text-asn-ink-900/50 flex items-center gap-1.5">
      <a href="/" class="hover:text-asn-ink-900">Home</a>
      <span>/</span>
      <a href="/layanan" class="hover:text-asn-ink-900">Layanan</a>
      <span>/</span>
      <span class="text-asn-ink-900 font-semibold">{data.product.name}</span>
    </div>

    <!-- Hero Section -->
    <section class="relative overflow-hidden py-12 px-5 bg-radial from-asn-blue-300/20 via-white to-white border-b border-asn-silver-400/30">
      <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="space-y-4 max-w-2xl text-center md:text-left">
          <span class="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider {data.product.badgeColor}">
            {data.product.badge}
          </span>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-asn-ink-900 leading-tight">
            {data.product.headline}
          </h1>
          <p class="text-sm sm:text-base text-asn-ink-900/70 leading-relaxed">
            {data.product.tagline}
          </p>

          <div class="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <a href="#paket" class="btn-primary rounded-full px-6 py-2.5 text-xs font-bold shadow-sm">
              Pilih Paket {data.product.name}
            </a>
            <a href="/#cek" class="glossy rounded-full px-6 py-2.5 text-xs font-bold">
              Cek Cakupan Wilayah
            </a>
          </div>
        </div>

        <div class="h-36 w-36 sm:h-44 sm:w-44 rounded-3xl glossy flex items-center justify-center text-asn-blue-600 shadow-md shrink-0">
          <MetallicIcon name={data.product.icon} />
        </div>
      </div>
    </section>

    <!-- Interactive Device Recommendation Slider -->
    <section class="mx-auto max-w-5xl px-5 py-12">
      <div class="card p-6 sm:p-8 bg-gradient-to-br from-white to-asn-blue-50/40 border border-asn-blue-500/30 shadow-sm">
        <div class="max-w-2xl mx-auto text-center space-y-3">
          <span class="text-xs font-extrabold text-asn-blue-700 uppercase tracking-widest">Kalkulator Kebutuhan Kecepatan</span>
          <h2 class="text-xl sm:text-2xl font-black text-asn-ink-900">
            Berapa banyak perangkat yang terhubung bersamaan?
          </h2>
          <p class="text-xs text-asn-ink-900/60">
            Geser slider di bawah ini untuk melihat rekomendasi paket internet yang paling pas agar semua orang bebas buffering.
          </p>

          <!-- Slider control -->
          <div class="py-6 space-y-3">
            <div class="flex items-center justify-center gap-3">
              <span class="text-3xl font-black text-asn-blue-600 font-mono">{deviceCount}</span>
              <span class="text-sm font-bold text-asn-ink-900/70">Perangkat aktif</span>
            </div>

            <input
              type="range"
              min="2"
              max={data.product.sliderMax}
              step="1"
              bind:value={deviceCount}
              class="w-full max-w-md h-2.5 bg-asn-silver-400/40 rounded-lg appearance-none cursor-pointer accent-asn-blue-500"
            />

            <div class="flex justify-between max-w-md mx-auto text-[11px] font-bold text-asn-ink-900/40 px-1">
              <span>2 Perangkat</span>
              <span>10 Perangkat</span>
              <span>{data.product.sliderMax}+ Perangkat</span>
            </div>
          </div>

          <!-- Highlight recommendation result -->
          {#if recommendedPackage}
            <div class="rounded-2xl bg-white border border-asn-blue-500/40 p-4 shadow-sm inline-flex flex-col sm:flex-row items-center gap-4 text-left">
              <div class="rounded-xl bg-asn-blue-500/10 px-3.5 py-2 text-center shrink-0">
                <span class="text-[10px] uppercase font-bold text-asn-blue-700 block">Rekomendasi</span>
                <span class="text-lg font-black text-asn-blue-600">{recommendedPackage.speedMbps} Mbps</span>
              </div>
              <div class="space-y-0.5">
                <h4 class="text-sm font-extrabold text-asn-ink-900">{recommendedPackage.name}</h4>
                <p class="text-xs text-asn-ink-900/60">
                  Ideal untuk {recommendedPackage.devicesMin}–{recommendedPackage.devicesMax} perangkat · {formatIdr(recommendedPackage.priceIdr)}/bln
                </p>
              </div>
              <a
                href="/daftar?package={recommendedPackage.slug}&source=product_page"
                class="btn-primary rounded-xl px-4 py-2 text-xs font-bold shrink-0 self-stretch sm:self-auto text-center"
              >
                Pilih Paket Ini
              </a>
            </div>
          {/if}
        </div>
      </div>
    </section>

    <!-- Package Tiers Grid -->
    <section id="paket" class="mx-auto max-w-6xl px-5 py-8">
      <div class="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-asn-ink-900">
          Pilihan Paket {data.product.name}
        </h2>
        <p class="text-xs text-asn-ink-900/60">
          Semua paket 100% fiber optik murni, tanpa FUP, dan gratis biaya peminjaman modem.
        </p>
      </div>

      {#if data.packages.length === 0}
        <div class="card p-12 text-center text-xs text-asn-ink-900/50">
          Belum ada paket yang aktif untuk kategori ini.
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each data.packages as pkg (pkg.id)}
            {@const isMatch = recommendedPackage?.id === pkg.id}
            <div
              class="card p-6 bg-white flex flex-col justify-between transition-all duration-200 relative {isMatch ? 'ring-2 ring-asn-blue-500 shadow-md -translate-y-1' : 'hover:border-asn-blue-500/50'}"
            >
              {#if isMatch}
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-asn-blue-500 text-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  ★ Rekomendasi Anda
                </div>
              {/if}

              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-asn-blue-500/10 text-asn-blue-700">
                    {pkg.speedMbps} Mbps
                  </span>
                  <span class="text-[11px] font-semibold text-asn-ink-900/50">
                    {pkg.devicesMin}–{pkg.devicesMax} Perangkat
                  </span>
                </div>

                <h3 class="text-xl font-black text-asn-ink-900 mb-1">{pkg.name}</h3>

                <!-- Price -->
                <div class="my-4 py-3 border-y border-asn-silver-400/30">
                  <span class="text-2xl font-black text-asn-ink-900">{formatIdr(pkg.priceIdr)}</span>
                  <span class="text-xs text-asn-ink-900/50">/bulan</span>
                  <span class="text-[10px] text-emerald-600 font-bold block mt-0.5">Sudah termasuk PPN 11%</span>
                </div>

                <!-- Features list -->
                {#if pkg.features && pkg.features.length > 0}
                  <ul class="space-y-2 text-xs text-asn-ink-900/80 mb-6">
                    {#each pkg.features as feat}
                      <li class="flex items-start gap-2">
                        <span class="text-emerald-500 font-bold shrink-0">✓</span>
                        <span>{feat}</span>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>

              <div>
                <a
                  href="/daftar?package={pkg.slug}&source=product_page"
                  class="w-full block text-center rounded-xl py-2.5 text-xs font-bold transition shadow-xs {isMatch ? 'btn-primary' : 'glossy hover:border-asn-blue-500'}"
                >
                  Langganan Sekarang
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Key Product Features List -->
    <section class="mx-auto max-w-5xl px-5 py-12">
      <div class="card p-8 bg-asn-silver-100/40 border border-asn-silver-400/40">
        <h2 class="text-xl font-extrabold text-asn-ink-900 mb-6 text-center">
          Keunggulan Utama {data.product.name}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {#each data.product.features as feature}
            <div class="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-asn-silver-400/30">
              <span class="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                ✓
              </span>
              <span class="font-medium text-asn-ink-900/80 leading-relaxed">{feature}</span>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- Product FAQ Section -->
    <section class="mx-auto max-w-4xl px-5 py-12">
      <div class="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <h2 class="text-2xl font-black tracking-tight text-asn-ink-900">
          Pertanyaan Umum tentang {data.product.name}
        </h2>
        <p class="text-xs text-asn-ink-900/60">Jawaban atas hal-hal yang sering ditanyakan seputar layanan ini.</p>
      </div>

      <div class="space-y-3">
        {#each data.product.faqs as faq, i}
          {@const isOpen = openFaq === i}
          <div class="card bg-white transition border border-asn-silver-400/40 overflow-hidden">
            <button
              class="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-asn-ink-900 cursor-pointer"
              onclick={() => (openFaq = isOpen ? null : i)}
            >
              <span>{faq.q}</span>
              <span class="text-asn-blue-600 text-sm font-black transition-transform {isOpen ? 'rotate-180' : ''}">
                ▾
              </span>
            </button>
            {#if isOpen}
              <div class="px-4 pb-4 pt-1 text-xs text-asn-ink-900/70 leading-relaxed border-t border-asn-silver-400/20">
                {faq.a}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Consultation Strip -->
    <section class="mx-auto max-w-4xl px-5 py-8">
      <div class="card p-8 bg-white border border-asn-blue-500/30 text-center space-y-4 shadow-sm">
        <h3 class="text-xl font-extrabold text-asn-ink-900">Butuh bantuan konsultasi teknis?</h3>
        <p class="text-xs text-asn-ink-900/70 max-w-md mx-auto">
          Hubungi tim spesialis kami langsung melalui WhatsApp untuk pengecekan lokasi atau kustomisasi kebutuhan jaringan Anda.
        </p>
        <div class="pt-2">
          <a
            href="https://wa.me/{WA_NUMBER}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary rounded-full px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
          >
            <span>💬</span> Chat WhatsApp Sekarang
          </a>
        </div>
      </div>
    </section>
  </div>

  <SiteFooter />
</div>
