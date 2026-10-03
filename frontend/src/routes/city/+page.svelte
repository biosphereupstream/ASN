<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import type { CityDirectoryItem } from './+page'

  let { data } = $props<{ data: { cities: CityDirectoryItem[] } }>()

  let searchQuery = $state('')

  function formatRupiah(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  let filteredCities = $derived(
    data.cities.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    })
  )

  let groupedByProvince = $derived.by(() => {
    const map: Record<string, CityDirectoryItem[]> = {}
    for (const c of filteredCities) {
      if (!map[c.province]) {
        map[c.province] = []
      }
      map[c.province].push(c)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://asn.net.id/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cakupan Kota',
        item: 'https://asn.net.id/city'
      }
    ]
  }
</script>

<svelte:head>
  <title>Cakupan Jaringan Fiber Optik ASN.NET — Daftar Kota & Kabupaten</title>
  <meta
    name="description"
    content="Daftar lengkap kota dan kabupaten yang telah terjangkau jaringan internet fiber optik ASN.NET tanpa FUP dengan kecepatan hingga 300 Mbps."
  />
  <link rel="canonical" href="https://asn.net.id/city" />
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col bg-asn-silver-100/40 text-asn-ink-900 font-sans selection:bg-asn-blue-500 selection:text-white">
  <SiteHeader active="city" />

  <main class="flex-grow pt-24 pb-16">
    <!-- Breadcrumbs -->
    <nav class="mx-auto max-w-6xl px-5 py-3 text-xs text-asn-ink-900/60" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2">
        <li>
          <a href="/" class="hover:text-asn-blue-700 transition">Beranda</a>
        </li>
        <li class="text-asn-silver-400">/</li>
        <li class="font-semibold text-asn-ink-900" aria-current="page">Daftar Kota</li>
      </ol>
    </nav>

    <!-- Hero Section -->
    <section class="mx-auto max-w-6xl px-5 pt-6 pb-10 text-center">
      <div class="inline-flex items-center gap-2 rounded-full bg-asn-blue-500/10 px-3.5 py-1 text-xs font-bold text-asn-blue-700 mb-4 border border-asn-blue-500/20">
        <span class="h-2 w-2 rounded-full bg-asn-blue-600 animate-pulse"></span>
        Jaringan Fiber 100% Optik ASN.NET
      </div>

      <h1 class="text-3xl sm:text-5xl font-black text-asn-ink-900 tracking-tight max-w-3xl mx-auto leading-tight mb-4">
        Pilih Area Domisili Kamu
      </h1>

      <p class="text-sm sm:text-base text-asn-ink-900/70 max-w-2xl mx-auto leading-relaxed mb-8">
        Jaringan internet fiber optik berkecepatan tinggi tanpa batasan kuota (FUP) telah hadir di berbagai kota dan kabupaten. Temukan ketersediaan layanan di wilayah Anda.
      </p>

      <!-- Search Bar -->
      <div class="max-w-xl mx-auto relative">
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Cari nama kota atau provinsi (cth: Bekasi, Bogor, Jakarta)..."
          class="w-full rounded-full border border-asn-silver-400/60 bg-white px-5 py-3.5 pl-12 text-sm text-asn-ink-900 shadow-sm focus:border-asn-blue-500 focus:outline-none focus:ring-2 focus:ring-asn-blue-500/20 transition"
        />
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-asn-ink-900/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-asn-ink-900/40 hover:text-asn-ink-900"
          >
            Reset
          </button>
        {/if}
      </div>
    </section>

    <!-- Directory Content -->
    <section class="mx-auto max-w-6xl px-5 py-4">
      {#if groupedByProvince.length === 0}
        <div class="card p-10 bg-white text-center max-w-lg mx-auto border border-asn-silver-400/30">
          <div class="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-base font-bold text-asn-ink-900 mb-1">Kota Tidak Ditemukan</h2>
          <p class="text-xs text-asn-ink-900/60 mb-5">
            Tidak ada kota atau kabupaten yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              onclick={() => (searchQuery = '')}
              class="glossy rounded-full px-4 py-2 text-xs font-bold"
            >
              Hapus Filter
            </button>
            <a href="/request-area" class="btn-primary rounded-full px-4 py-2 text-xs font-bold">
              Ajukan Request Area
            </a>
          </div>
        </div>
      {:else}
        <div class="space-y-10">
          {#each groupedByProvince as [province, citiesList] (province)}
            <div class="space-y-4">
              <div class="flex items-center gap-3 border-b border-asn-silver-400/40 pb-2">
                <h2 class="text-lg sm:text-xl font-black text-asn-ink-900">
                  {province}
                </h2>
                <span class="rounded-full bg-asn-blue-500/10 px-2.5 py-0.5 text-xs font-extrabold text-asn-blue-700">
                  {citiesList.length} Kota / Kab
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {#each citiesList as city (city.slug)}
                  <div class="card p-5 bg-white hover:border-asn-blue-500/40 transition-all flex flex-col justify-between group shadow-xs">
                    <div>
                      <div class="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span class="text-[11px] font-semibold text-asn-ink-900/50 block">
                            {city.province}
                          </span>
                          <h3 class="text-lg font-black text-asn-ink-900 group-hover:text-asn-blue-700 transition">
                            {city.name}
                          </h3>
                        </div>

                        {#if city.availableDistricts > 0}
                          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {city.availableDistricts} Aktif
                          </span>
                        {:else}
                          <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700">
                            Segera Hadir
                          </span>
                        {/if}
                      </div>

                      <p class="text-xs text-asn-ink-900/70 mb-4">
                        Cakupan jaringan fiber optik mencakup <strong class="text-asn-ink-900">{city.totalDistricts} kecamatan</strong> di area {city.name}.
                      </p>
                    </div>

                    <div class="pt-4 border-t border-asn-silver-400/20 flex items-center justify-between">
                      <div>
                        <span class="text-[10px] text-asn-ink-900/50 uppercase font-bold block">Harga Mulai</span>
                        <span class="text-xs font-bold text-asn-blue-700">
                          Rp {formatRupiah(city.minPriceIdr)}<span class="text-[10px] text-asn-ink-900/60 font-normal">/bln</span>
                        </span>
                      </div>

                      <a
                        href="/city/{city.slug}"
                        class="btn-primary rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                      >
                        Lihat Area & Paket
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Request Area Callout Banner (PRD FR-8.2) -->
    <section class="mx-auto max-w-6xl px-5 pt-12">
      <div class="card p-8 sm:p-10 bg-gradient-to-r from-asn-blue-900 to-asn-blue-800 text-white rounded-3xl relative overflow-hidden shadow-lg">
        <div class="relative z-10 max-w-2xl">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-asn-blue-200 mb-3 backdrop-blur-xs">
            Ekspansi Jaringan Fiber ASN.NET
          </span>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Kota Anda Belum Terdaftar dalam Cakupan?
          </h2>
          <p class="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
            ASN.NET terus memperluas jaringan kabel fiber optik ke berbagai perumahan dan kecamatan setiap bulannya. Daftarkan wilayah Anda agar tim teknis kami memprioritaskan instalasi fiber optik di lokasi Anda.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <a
              href="/request-area"
              class="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-asn-blue-900 hover:bg-asn-silver-100 transition shadow-sm"
            >
              Ajukan Request Area Sekarang
            </a>
            <a
              href="/#cek"
              class="rounded-full border border-white/30 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              Cek Alamat Rumah
            </a>
          </div>
        </div>

        <div class="absolute -right-8 -bottom-10 h-64 w-64 rounded-full bg-asn-blue-500/20 blur-3xl pointer-events-none"></div>
      </div>
    </section>
  </main>

  <SiteFooter />
</div>
