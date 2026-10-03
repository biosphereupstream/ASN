<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import type { CityDetailData } from './+page'

  let { data } = $props<{ data: { cityDetail: CityDetailData } }>()

  let city = $derived(data.cityDetail.city)
  let districts = $derived(data.cityDetail.districts)
  let packages = $derived(data.cityDetail.packages)
  let branch = $derived(data.cityDetail.branch)

  let districtFilter = $state<'all' | 'available' | 'coming_soon'>('all')
  let openFaq = $state<number | null>(null)

  function toggleFaq(index: number) {
    openFaq = openFaq === index ? null : index
  }

  function formatRupiah(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  let availableCount = $derived(districts.filter((d) => d.status === 'available').length)
  let comingSoonCount = $derived(districts.filter((d) => d.status === 'coming_soon').length)

  let filteredDistricts = $derived(
    districts.filter((d) => {
      if (districtFilter === 'all') return true
      return d.status === districtFilter
    })
  )

  const faqs = $derived([
    {
      q: `Apakah ASN.NET sudah menjangkau seluruh area ${city.name}?`,
      a: `Jaringan ASN.NET saat ini telah aktif di ${city.availableDistricts} kecamatan di ${city.name} dan terus bertambah setiap bulannya. Anda dapat memeriksa daftar kecamatan yang telah ter-cover pada tabel cakupan di atas.`
    },
    {
      q: `Berapa lama proses pemasangan WiFi ASN.NET di ${city.name}?`,
      a: `Setelah pendaftaran online diverifikasi, tim teknisi ASN.NET area ${city.name} akan menghubungi Anda untuk konfirmasi jadwal instalasi. Pemasangan umumnya dilakukan dalam 1–3 hari kerja.`
    },
    {
      q: `Apakah ada biaya sewa modem atau instalasi di ${city.name}?`,
      a: `Seluruh paket internet ASN.NET di ${city.name} sudah termasuk gratis biaya sewa modem WiFi optik dan gratis biaya pemasangan standar tanpa biaya tersembunyi.`
    },
    {
      q: `Bagaimana jika alamat saya di ${city.name} belum tercover?`,
      a: `Anda dapat mengisi formulir Request Area. Setiap permintaan baru akan dievaluasi oleh tim perencanaan jaringan kami untuk memprioritaskan penarikan kabel fiber ke wilayah Anda.`
    }
  ])

  // JSON-LD Structured Data
  let breadcrumbJsonLd = $derived({
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
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `https://asn.net.id/city/${city.slug}`
      }
    ]
  })

  let serviceJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Layanan Internet Fiber ASN.NET ${city.name}`,
    serviceType: 'Fiber Broadband Internet',
    provider: {
      '@type': 'Organization',
      name: 'ASN.NET'
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.province
      }
    }
  })

  let faqJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  })

  let productsJsonLd = $derived(
    packages.map((pkg) => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${pkg.name} — ${city.name}`,
      description: `Paket internet fiber optik ${pkg.speedMbps} Mbps di ${city.name} tanpa FUP.`,
      offers: {
        '@type': 'Offer',
        price: pkg.priceIdr,
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
        url: `https://asn.net.id/city/${city.slug}#paket-kota`
      }
    }))
  )
</script>

<svelte:head>
  <title>Internet Fiber Optik {city.name} — Paket WiFi Murah & Cepat | ASN.NET</title>
  <meta
    name="description"
    content="Layanan internet fiber optik murni di {city.name} tanpa FUP. Kecepatan hingga 300 Mbps, gratis modem & instalasi. Cek jangkauan kecamatanmu sekarang!"
  />
  <link rel="canonical" href="https://asn.net.id/city/{city.slug}" />
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(serviceJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`}
  {#each productsJsonLd as prodJson}
    {@html `<script type="application/ld+json">${JSON.stringify(prodJson)}</script>`}
  {/each}
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
        <li>
          <a href="/city" class="hover:text-asn-blue-700 transition">Cakupan Kota</a>
        </li>
        <li class="text-asn-silver-400">/</li>
        <li class="font-semibold text-asn-ink-900" aria-current="page">{city.name}</li>
      </ol>
    </nav>

    <!-- Localized Hero Section -->
    <section class="mx-auto max-w-6xl px-5 pt-6 pb-12">
      <div class="text-center max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 rounded-full bg-asn-blue-500/10 px-3.5 py-1 text-xs font-bold text-asn-blue-700 mb-4 border border-asn-blue-500/20">
          <span class="h-2 w-2 rounded-full bg-asn-blue-600 animate-pulse"></span>
          Jaringan Fiber Optik {city.name}, {city.province}
        </div>

        <h1 class="text-3xl sm:text-5xl font-black text-asn-ink-900 tracking-tight leading-tight mb-4">
          Internet Fiber Optik Terbaik di {city.name}
        </h1>

        <p class="text-sm sm:text-base text-asn-ink-900/70 leading-relaxed mb-8">
          Koneksi 100% fiber optik murni tanpa batasan kuota (FUP) di seluruh area {city.name}. Hadir di <strong class="text-asn-ink-900">{city.availableDistricts} kecamatan aktif</strong> dengan kecepatan simetris hingga 300 Mbps dan latensi ultra-rendah.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="#paket-kota" class="btn-primary rounded-full px-6 py-2.5 text-xs font-bold shadow-sm">
            Lihat Paket {city.name}
          </a>
          <a href="#kecamatan-kota" class="glossy rounded-full px-6 py-2.5 text-xs font-bold">
            Cek Daftar Kecamatan ({districts.length})
          </a>
        </div>
      </div>
    </section>

    <!-- Interactive District Coverage Grid Section -->
    <section id="kecamatan-kota" class="mx-auto max-w-6xl px-5 py-12 border-t border-asn-silver-400/30">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span class="text-xs font-bold text-asn-blue-700 uppercase tracking-wider block mb-1">Cek Ketersediaan Area</span>
          <h2 class="text-2xl sm:text-3xl font-black text-asn-ink-900">
            Cakupan Kecamatan di {city.name}
          </h2>
          <p class="text-xs text-asn-ink-900/60 mt-1">
            Pilih kecamatan tempat tinggal Anda untuk langsung mendaftar atau bergabung dalam antrean prioritas.
          </p>
        </div>

        <!-- Filter Tabs -->
        <div class="inline-flex rounded-full bg-asn-silver-200/60 p-1 text-xs font-bold">
          <button
            type="button"
            onclick={() => (districtFilter = 'all')}
            class="rounded-full px-3.5 py-1.5 transition {districtFilter === 'all' ? 'bg-white text-asn-ink-900 shadow-xs' : 'text-asn-ink-900/60 hover:text-asn-ink-900'}"
          >
            Semua ({districts.length})
          </button>
          <button
            type="button"
            onclick={() => (districtFilter = 'available')}
            class="rounded-full px-3.5 py-1.5 transition {districtFilter === 'available' ? 'bg-white text-emerald-700 shadow-xs' : 'text-asn-ink-900/60 hover:text-asn-ink-900'}"
          >
            Tersedia ({availableCount})
          </button>
          {#if comingSoonCount > 0}
            <button
              type="button"
              onclick={() => (districtFilter = 'coming_soon')}
              class="rounded-full px-3.5 py-1.5 transition {districtFilter === 'coming_soon' ? 'bg-white text-amber-700 shadow-xs' : 'text-asn-ink-900/60 hover:text-asn-ink-900'}"
            >
              Segera Hadir ({comingSoonCount})
            </button>
          {/if}
        </div>
      </div>

      <!-- District Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredDistricts as d (d.slug)}
          <div class="card p-4 bg-white hover:border-asn-blue-500/40 transition flex items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 class="text-sm font-bold text-asn-ink-900">
                Kecamatan {d.name}
              </h3>
              <div class="mt-1">
                {#if d.status === 'available'}
                  <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Jaringan Aktif
                  </span>
                {:else if d.status === 'coming_soon'}
                  <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                    <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Segera Hadir
                  </span>
                {:else}
                  <span class="text-[11px] font-medium text-asn-ink-900/50">
                    Belum Terjangkau
                  </span>
                {/if}
              </div>
            </div>

            <div>
              {#if d.status === 'available'}
                <a
                  href="/daftar?city={city.slug}&district={d.slug}&source=city_page"
                  class="btn-primary rounded-full px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                >
                  Daftar
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              {:else if d.status === 'coming_soon'}
                <a
                  href="/request-area?city={city.slug}&district={d.slug}&source=waitlist"
                  class="glossy rounded-full px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:text-amber-900"
                >
                  Waitlist
                </a>
              {:else}
                <a
                  href="/request-area?city={city.slug}&district={d.slug}"
                  class="rounded-full bg-asn-silver-200/70 hover:bg-asn-silver-300 px-3 py-1.5 text-xs font-bold text-asn-ink-900/70 transition"
                >
                  Request
                </a>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Local Package Catalog Section -->
    <section id="paket-kota" class="mx-auto max-w-6xl px-5 py-12 border-t border-asn-silver-400/30">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-xs font-bold text-asn-blue-700 uppercase tracking-wider block mb-1">Paket Khusus Wilayah</span>
        <h2 class="text-2xl sm:text-3xl font-black text-asn-ink-900">
          Pilihan Paket Internet di {city.name}
        </h2>
        <p class="text-xs sm:text-sm text-asn-ink-900/60 mt-1">
          Koneksi fiber murni tanpa batasan kuota. Sudah termasuk gratis sewa modem optik dan instalasi standar.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each packages as pkg (pkg.slug)}
          <div class="card p-5 bg-white hover:border-asn-blue-500/50 transition flex flex-col justify-between shadow-xs group {pkg.sortOrder === 2 ? 'ring-2 ring-asn-blue-500/30' : ''}">
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="rounded-full bg-asn-blue-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-asn-blue-700">
                  {pkg.productName}
                </span>

                {#if pkg.isPriceOverridden}
                  <span class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                    Promo {city.name}
                  </span>
                {/if}
              </div>

              <h3 class="text-base font-black text-asn-ink-900 group-hover:text-asn-blue-700 transition">
                {pkg.name}
              </h3>

              <div class="my-4">
                <div class="text-2xl font-black text-asn-ink-900">
                  {pkg.speedMbps} <span class="text-xs font-normal text-asn-ink-900/60">Mbps</span>
                </div>
                {#if pkg.isPriceOverridden}
                  <div class="text-[11px] text-asn-ink-900/40 line-through">
                    Rp {formatRupiah(pkg.basePriceIdr)}/bln
                  </div>
                {/if}
                <div class="text-lg font-black text-asn-blue-700">
                  Rp {formatRupiah(pkg.priceIdr)}<span class="text-[11px] font-normal text-asn-ink-900/60">/bln</span>
                </div>
              </div>

              <!-- Features -->
              <ul class="space-y-2 py-3 border-t border-asn-silver-400/20 text-xs">
                {#each pkg.features as f}
                  <li class="flex items-start gap-1.5">
                    <span class="text-emerald-500 font-bold shrink-0">✓</span>
                    <span class="text-asn-ink-900/80">{f}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <div class="pt-4 border-t border-asn-silver-400/20">
              <a
                href="/daftar?package={pkg.slug}&city={city.slug}&source=city_page"
                class="btn-primary w-full text-center rounded-full py-2.5 text-xs font-bold shadow-xs block"
              >
                Pilih Paket Ini
              </a>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Local Value Propositions -->
    <section class="mx-auto max-w-6xl px-5 py-12 border-t border-asn-silver-400/30">
      <div class="text-center max-w-2xl mx-auto mb-8">
        <h2 class="text-xl sm:text-2xl font-black text-asn-ink-900">
          Mengapa Warga {city.name} Memilih ASN.NET?
        </h2>
        <p class="text-xs sm:text-sm text-asn-ink-900/60 mt-1">
          Kualitas layanan internet andal dengan dukungan tim operasional dan teknisi langsung di wilayah Anda.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="card p-5 bg-white border border-asn-silver-400/30 shadow-xs">
          <div class="h-10 w-10 rounded-xl bg-asn-blue-500/10 text-asn-blue-700 flex items-center justify-center font-black mb-3">
            01
          </div>
          <h3 class="text-sm font-bold text-asn-ink-900 mb-1">Teknisi Lokal Siaga</h3>
          <p class="text-xs text-asn-ink-900/70 leading-relaxed">
            Tim lapangan berposko di {city.name} untuk respon cepat saat jadwal pemasangan maupun penanganan kendala jaringan.
          </p>
        </div>

        <div class="card p-5 bg-white border border-asn-silver-400/30 shadow-xs">
          <div class="h-10 w-10 rounded-xl bg-asn-blue-500/10 text-asn-blue-700 flex items-center justify-center font-black mb-3">
            02
          </div>
          <h3 class="text-sm font-bold text-asn-ink-900 mb-1">100% Kabel Fiber Optik</h3>
          <p class="text-xs text-asn-ink-900/70 leading-relaxed">
            Menggunakan serat optik murni tanpa tembaga tua. Kecepatan simetris tahan terhadap gangguan cuaca hujan di {city.name}.
          </p>
        </div>

        <div class="card p-5 bg-white border border-asn-silver-400/30 shadow-xs">
          <div class="h-10 w-10 rounded-xl bg-asn-blue-500/10 text-asn-blue-700 flex items-center justify-center font-black mb-3">
            03
          </div>
          <h3 class="text-sm font-bold text-asn-ink-900 mb-1">Unlimited Tanpa FUP</h3>
          <p class="text-xs text-asn-ink-900/70 leading-relaxed">
            Bebas streaming 4K, video conference, dan gaming sekeluarga sepuasnya tanpa khawatir batas kuota bulanan habis.
          </p>
        </div>

        <div class="card p-5 bg-white border border-asn-silver-400/30 shadow-xs">
          <div class="h-10 w-10 rounded-xl bg-asn-blue-500/10 text-asn-blue-700 flex items-center justify-center font-black mb-3">
            04
          </div>
          <h3 class="text-sm font-bold text-asn-ink-900 mb-1">Bebas Biaya Sewa Modem</h3>
          <p class="text-xs text-asn-ink-900/70 leading-relaxed">
            Perangkat modem router WiFi berstandar tinggi sudah dipinjamkan gratis selama berlangganan aktif.
          </p>
        </div>
      </div>
    </section>

    <!-- Localized FAQ Accordion -->
    <section class="mx-auto max-w-4xl px-5 py-12 border-t border-asn-silver-400/30">
      <div class="text-center max-w-xl mx-auto mb-8">
        <h2 class="text-xl sm:text-2xl font-black text-asn-ink-900">
          Pertanyaan Umum seputar ASN.NET di {city.name}
        </h2>
        <p class="text-xs text-asn-ink-900/60 mt-1">
          Informasi praktis sebelum Anda melakukan pendaftaran layanan.
        </p>
      </div>

      <div class="space-y-3">
        {#each faqs as faq, i}
          <div class="card bg-white border border-asn-silver-400/30 overflow-hidden shadow-xs">
            <button
              type="button"
              onclick={() => toggleFaq(i)}
              class="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-asn-ink-900 hover:text-asn-blue-700 transition"
              aria-expanded={openFaq === i}
            >
              <span>{faq.q}</span>
              <svg
                class="h-4 w-4 shrink-0 transition-transform {openFaq === i ? 'rotate-180 text-asn-blue-700' : 'text-asn-ink-900/40'}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {#if openFaq === i}
              <div class="px-4 pb-4 pt-1 text-xs text-asn-ink-900/70 leading-relaxed border-t border-asn-silver-400/20">
                {faq.a}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Local Branch Contact Card -->
    {#if branch}
      <section class="mx-auto max-w-4xl px-5 pt-8">
        <div class="card p-6 bg-gradient-to-r from-asn-silver-100 to-white border border-asn-silver-400/40 rounded-2xl shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-[10px] font-extrabold text-asn-blue-700 uppercase tracking-wider block mb-1">
                Layanan Pelanggan & Kantor Cabang
              </span>
              <h3 class="text-base font-black text-asn-ink-900">
                {branch.name}
              </h3>
              <p class="text-xs text-asn-ink-900/70 mt-1 max-w-md">
                {branch.address}
              </p>
              <div class="flex items-center gap-4 mt-2 text-xs font-semibold text-asn-ink-900/80">
                <span>Telp: {branch.phone}</span>
              </div>
            </div>

            <div class="shrink-0">
              <a
                href="https://wa.me/{branch.whatsapp}?text=Halo%20ASN.NET%20{encodeURIComponent(city.name)}%2C%20saya%20ingin%20bertanya%20mengenai%20pemasangan%20internet%20fiber."
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-xs transition"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Chat WhatsApp Cabang
              </a>
            </div>
          </div>
        </div>
      </section>
    {/if}
  </main>

  <SiteFooter />
</div>
