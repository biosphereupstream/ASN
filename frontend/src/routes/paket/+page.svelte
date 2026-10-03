<script lang="ts">
  import { onMount } from 'svelte'
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import MetallicIcon from '$lib/components/MetallicIcon.svelte'
  import { WA_URL } from '$lib/data/home'

  interface CityItem {
    name: string
    slug: string
  }

  interface DistrictItem {
    name: string
    slug: string
  }

  interface ProductItem {
    id: number
    key: string
    name: string
    tagline: string
  }

  interface PackageItem {
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

  let packages = $state<PackageItem[]>([])
  let products = $state<ProductItem[]>([])
  let cities = $state<CityItem[]>([])
  let districts = $state<DistrictItem[]>([])

  let selectedProduct = $state<string>('all')
  let selectedCitySlug = $state<string>('')
  let selectedDistrictSlug = $state<string>('')
  let sortBy = $state<'default' | 'speed-desc' | 'price-asc' | 'price-desc'>('default')

  let loading = $state(true)
  let loadingDistricts = $state(false)
  let errorMsg = $state<string | null>(null)

  function formatIdr(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
  }

  async function loadInitial() {
    loading = true
    errorMsg = null
    try {
      const [pkgRes, cityRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/cities')
      ])

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json()
        packages = pkgData.packages || []
        products = pkgData.products || []
      }

      if (cityRes.ok) {
        cities = (await cityRes.json()) as CityItem[]
      }
    } catch (err: unknown) {
      errorMsg = 'Gagal memuat katalog paket'
    } finally {
      loading = false
    }
  }

  async function onCityChange() {
    selectedDistrictSlug = ''
    districts = []
    if (!selectedCitySlug) {
      await fetchUpdatedPackages()
      return
    }

    loadingDistricts = true
    try {
      const res = await fetch(`/api/cities/${selectedCitySlug}/districts`)
      if (res.ok) {
        districts = (await res.json()) as DistrictItem[]
      }
    } finally {
      loadingDistricts = false
    }

    await fetchUpdatedPackages()
  }

  async function onDistrictChange() {
    await fetchUpdatedPackages()
  }

  async function fetchUpdatedPackages() {
    loading = true
    try {
      const params = new URLSearchParams()
      if (selectedProduct && selectedProduct !== 'all') params.set('product', selectedProduct)
      if (selectedCitySlug) params.set('city', selectedCitySlug)
      if (selectedDistrictSlug) params.set('district', selectedDistrictSlug)

      const res = await fetch(`/api/packages?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        packages = data.packages || []
      }
    } finally {
      loading = false
    }
  }

  async function resetAreaFilter() {
    selectedCitySlug = ''
    selectedDistrictSlug = ''
    districts = []
    await fetchUpdatedPackages()
  }

  // Filter and sort packages
  const displayedPackages = $derived.by(() => {
    let list = [...packages]

    if (selectedProduct !== 'all') {
      list = list.filter((p) => p.productKey === selectedProduct)
    }

    if (sortBy === 'speed-desc') {
      list.sort((a, b) => b.speedMbps - a.speedMbps)
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceIdr - b.priceIdr)
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceIdr - a.priceIdr)
    } else {
      list.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    return list
  })

  const currentCityName = $derived(cities.find((c) => c.slug === selectedCitySlug)?.name)
  const currentDistrictName = $derived(districts.find((d) => d.slug === selectedDistrictSlug)?.name)

  const breadcrumbsSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://asn.net.id/' },
      { '@type': 'ListItem', position: 2, name: 'Katalog Paket', item: 'https://asn.net.id/paket' }
    ]
  })

  onMount(() => {
    loadInitial()
  })
</script>

<svelte:head>
  <title>Katalog Paket Internet Fiber 2026 — Harga & Kecepatan | ASN.NET</title>
  <meta
    name="description"
    content="Katalog lengkap paket internet fiber optik ASN.NET: Fiber rumah 50-300 Mbps, Stream bundle OTT, Mesh WiFi, dan Business dedicated. Tanpa FUP & gratis modem."
  />
  <link rel="canonical" href="https://asn.net.id/paket" />
  <meta property="og:title" content="Katalog Paket Internet Fiber ASN.NET" />
  <meta property="og:description" content="Pilihan paket internet cepat tanpa FUP dengan penyesuaian tarif per wilayah domisili." />
  <meta property="og:type" content="website" />
  {@html `<script type="application/ld+json">${breadcrumbsSchema}</script>`}
</svelte:head>

<div class="min-h-screen bg-white text-asn-ink-900 flex flex-col justify-between">
  <div>
    <SiteHeader active="paket" />

    <!-- Breadcrumb bar -->
    <div class="mx-auto max-w-6xl px-5 pt-3 pb-1 text-xs text-asn-ink-900/50 flex items-center gap-1.5">
      <a href="/" class="hover:text-asn-ink-900">Home</a>
      <span>/</span>
      <span class="text-asn-ink-900 font-semibold">Katalog Paket Internet</span>
    </div>

    <!-- Header Section -->
    <section class="py-10 px-5 text-center bg-radial from-asn-blue-300/15 via-white to-white">
      <div class="mx-auto max-w-3xl space-y-3">
        <span class="inline-block rounded-full bg-asn-blue-500/15 px-3 py-1 text-xs font-bold text-asn-blue-700 tracking-wide uppercase">
          Katalog Resmi 2026
        </span>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-asn-ink-900 leading-tight">
          Katalog Paket Internet Fiber ASN.NET
        </h1>
        <p class="text-xs sm:text-sm text-asn-ink-900/70 max-w-2xl mx-auto leading-relaxed">
          Temukan kecepatan yang pas untuk rumah atau tempat usaha Anda. Seluruh paket berbasis 100% fiber optik murni simetris tanpa batasan kuota (FUP).
        </p>
      </div>
    </section>

    <!-- Interactive Area Selector Banner -->
    <section class="mx-auto max-w-6xl px-5 pb-8">
      <div class="card p-6 bg-gradient-to-r from-asn-blue-500/5 via-white to-asn-blue-300/10 border border-asn-blue-500/30 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-asn-blue-700 block">Pilih Wilayah Pemasangan</span>
            <h2 class="text-base font-black text-asn-ink-900">Lihat Tarif & Ketersediaan di Area Anda</h2>
            <p class="text-xs text-asn-ink-900/60">
              Beberapa wilayah memiliki harga khusus atau promo lokal. Pilih area Anda untuk melihat tarif efektif.
            </p>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <!-- City select -->
            <div class="w-full sm:w-48">
              <label for="catalog-city-select" class="sr-only">Pilih Kota</label>
              <select
                id="catalog-city-select"
                bind:value={selectedCitySlug}
                onchange={onCityChange}
                class="w-full rounded-xl border border-asn-silver-400/80 bg-white px-3 py-2.5 text-xs font-semibold text-asn-ink-900 shadow-xs cursor-pointer"
              >
                <option value="">Semua Kota / Nasional</option>
                {#each cities as c}
                  <option value={c.slug}>{c.name}</option>
                {/each}
              </select>
            </div>

            <!-- District select -->
            <div class="w-full sm:w-48">
              <label for="catalog-district-select" class="sr-only">Pilih Kecamatan</label>
              <select
                id="catalog-district-select"
                bind:value={selectedDistrictSlug}
                onchange={onDistrictChange}
                disabled={!selectedCitySlug || loadingDistricts}
                class="w-full rounded-xl border border-asn-silver-400/80 bg-white px-3 py-2.5 text-xs font-semibold text-asn-ink-900 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Semua Kecamatan</option>
                {#each districts as d}
                  <option value={d.slug}>{d.name}</option>
                {/each}
              </select>
            </div>

            {#if selectedCitySlug}
              <button
                onclick={resetAreaFilter}
                class="glossy rounded-xl px-3 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer hover:border-asn-blue-500"
                title="Kembali ke tarif standar"
              >
                Reset Wilayah
              </button>
            {/if}
          </div>
        </div>

        {#if selectedCitySlug}
          <div class="mt-4 pt-3 border-t border-asn-silver-400/30 flex items-center justify-between text-xs text-asn-blue-700 font-bold">
            <span class="flex items-center gap-1.5">
              <span>📍</span>
              <span>Menampilkan tarif untuk wilayah: {currentCityName}{currentDistrictName ? `, Kec. ${currentDistrictName}` : ''}</span>
            </span>
          </div>
        {/if}
      </div>
    </section>

    <!-- Filters & Sort Bar -->
    <section class="mx-auto max-w-6xl px-5 pb-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-asn-silver-400/30 pb-4">
        <!-- Product filter pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onclick={() => (selectedProduct = 'all')}
            class="rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap {selectedProduct === 'all' ? 'bg-asn-blue-500 text-white shadow-xs' : 'bg-asn-silver-100 text-asn-ink-900/70 hover:bg-asn-silver-400/40'}"
          >
            Semua ({packages.length})
          </button>
          {#each products as prod}
            {@const count = packages.filter((p) => p.productId === prod.id).length}
            <button
              onclick={() => (selectedProduct = prod.key)}
              class="rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap {selectedProduct === prod.key ? 'bg-asn-blue-500 text-white shadow-xs' : 'bg-asn-silver-100 text-asn-ink-900/70 hover:bg-asn-silver-400/40'}"
            >
              {prod.name}
            </button>
          {/each}
        </div>

        <!-- Sort dropdown -->
        <div class="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span class="text-asn-ink-900/50 font-semibold">Urutkan:</span>
          <select
            bind:value={sortBy}
            class="rounded-lg border border-asn-silver-400/60 bg-white px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <option value="default">Rekomendasi</option>
            <option value="speed-desc">Kecepatan Tertinggi</option>
            <option value="price-asc">Harga Terendah</option>
            <option value="price-desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Packages Grid -->
    <section class="mx-auto max-w-6xl px-5 pb-16">
      {#if loading}
        <div class="card p-16 text-center text-xs text-asn-ink-900/50">
          Memuat daftar paket internet...
        </div>
      {:else if displayedPackages.length === 0}
        <div class="card p-16 text-center text-xs text-asn-ink-900/60 space-y-3">
          <p class="font-bold text-sm">Tidak ada paket yang sesuai dengan filter.</p>
          <p>Coba pilih lini produk lain atau reset filter wilayah Anda.</p>
          <button onclick={resetAreaFilter} class="btn-primary rounded-full px-4 py-2 text-xs font-bold">
            Lihat Semua Paket
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each displayedPackages as pkg (pkg.id)}
            {@const savings = pkg.basePriceIdr - pkg.priceIdr}
            {@const signupUrl = `/daftar?package=${pkg.slug}${selectedCitySlug ? `&city=${selectedCitySlug}` : ''}${selectedDistrictSlug ? `&district=${selectedDistrictSlug}` : ''}&source=package_card`}
            <div class="card p-6 bg-white hover:border-asn-blue-500/60 transition flex flex-col justify-between shadow-xs relative group">
              <div>
                <!-- Top badging -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-asn-blue-500/10 text-asn-blue-700">
                    {pkg.productName}
                  </span>
                  <span class="rounded-full bg-asn-blue-600 text-white px-2.5 py-0.5 text-xs font-black">
                    {pkg.speedMbps} Mbps
                  </span>
                </div>

                <h3 class="text-xl font-black text-asn-ink-900 group-hover:text-asn-blue-700 transition">
                  {pkg.name}
                </h3>
                <p class="text-[11px] font-semibold text-asn-ink-900/60 mt-0.5">
                  Ideal untuk {pkg.devicesMin}–{pkg.devicesMax} perangkat terhubung
                </p>

                <!-- Pricing Block -->
                <div class="my-4 py-3 border-y border-asn-silver-400/30">
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-asn-ink-900">{formatIdr(pkg.priceIdr)}</span>
                    <span class="text-xs text-asn-ink-900/50 font-medium">/bulan</span>
                  </div>

                  {#if pkg.isPriceOverridden && savings > 0}
                    <div class="mt-1 flex items-center gap-2">
                      <span class="text-xs text-asn-ink-900/40 line-through">{formatIdr(pkg.basePriceIdr)}</span>
                      <span class="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.2 text-[10px] font-black">
                        Hemat {formatIdr(savings)}/bln (Khusus Area)
                      </span>
                    </div>
                  {:else if pkg.isPriceOverridden}
                    <span class="text-[10px] text-asn-blue-700 font-bold block mt-1">Tarif Khusus Wilayah</span>
                  {/if}

                  <span class="text-[10px] text-asn-ink-900/50 block mt-1">Sudah termasuk PPN 11% &amp; gratis biaya modem</span>
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

              <!-- CTA -->
              <div class="pt-2">
                <a
                  href={signupUrl}
                  class="btn-primary w-full block text-center rounded-xl py-2.5 text-xs font-bold transition shadow-xs"
                >
                  Pilih Paket Ini
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Bottom FAQ & Help -->
    <section class="mx-auto max-w-4xl px-5 pb-16">
      <div class="card p-8 bg-asn-silver-100/40 border border-asn-silver-400/40 text-center space-y-3">
        <h3 class="text-lg font-black text-asn-ink-900">Perlu rekomendasi paket khusus atau survei lokasi?</h3>
        <p class="text-xs text-asn-ink-900/70 max-w-md mx-auto">
          Konsultasikan langsung dengan konsultan jaringan ASN.NET melalui WhatsApp untuk penawaran terbaik di area Anda.
        </p>
        <div class="pt-2">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="glossy rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 hover:border-asn-blue-500"
          >
            <span>💬</span> Hubungi Konsultan ASN.NET
          </a>
        </div>
      </div>
    </section>
  </div>

  <SiteFooter />
</div>
