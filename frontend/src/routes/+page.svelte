<script lang="ts">
  import { onMount } from 'svelte'
  import HeroFiber from '$lib/components/HeroFiber.svelte'
  import NavDrawer from '$lib/components/NavDrawer.svelte'
  import AsnLogo from '$lib/components/AsnLogo.svelte'
  import ValueProps from '$lib/components/sections/ValueProps.svelte'
  import ProductLines from '$lib/components/sections/ProductLines.svelte'
  import PackageHighlights from '$lib/components/sections/PackageHighlights.svelte'
  import HowItWorks from '$lib/components/sections/HowItWorks.svelte'
  import PromoBanner from '$lib/components/sections/PromoBanner.svelte'
  import StatsStrip from '$lib/components/sections/StatsStrip.svelte'
  import FaqTeaser from '$lib/components/sections/FaqTeaser.svelte'
  import FinalCta from '$lib/components/sections/FinalCta.svelte'
  import { formatIdr } from '$lib/data/home'

  interface CityOption {
    slug: string
    name: string
  }
  interface DistrictOption {
    slug: string
    name: string
  }
  interface PkgOption {
    slug: string
    name: string
    speedMbps: number
    priceIdr: number
    basePriceIdr: number
  }
  interface CoverageResult {
    status: 'available' | 'coming_soon' | 'not_available'
    city: { name: string }
    district: { name: string }
    packages: PkgOption[]
  }

  // Coverage checker state (PRD §6.3) — served by GET /api/* (backend workspace, PRD §10.3).
  let cities = $state<CityOption[]>([])
  let districts = $state<DistrictOption[]>([])
  let city = $state('')
  let district = $state('')
  let loadingCities = $state(true)
  let loadingDistricts = $state(false)
  let citiesFailed = $state(false)
  let checking = $state(false)
  let checkFailed = $state(false)
  let result = $state<CoverageResult | null>(null)

  async function loadCities() {
    citiesFailed = false
    loadingCities = true
    try {
      const res = await fetch('/api/cities')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      cities = (await res.json()) as CityOption[]
    } catch {
      citiesFailed = true
    } finally {
      loadingCities = false
    }
  }

  async function onCityChange(e?: Event) {
    if (e?.currentTarget) {
      city = (e.currentTarget as HTMLSelectElement).value
    }
    district = ''
    result = null
    districts = []
    if (!city) return
    loadingDistricts = true
    try {
      const res = await fetch(`/api/cities/${city}/districts`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      districts = (await res.json()) as DistrictOption[]
    } catch {
      districts = []
    } finally {
      loadingDistricts = false
    }
  }

  async function checkCoverage() {
    if (!city || !district) return
    checking = true
    checkFailed = false
    result = null
    try {
      const res = await fetch(`/api/coverage?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`)
      if (res.status === 404) {
        checkFailed = true
      } else if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      } else {
        result = (await res.json()) as CoverageResult
      }
    } catch {
      checkFailed = true
    } finally {
      checking = false
    }
  }

  onMount(loadCities)

  let menuOpen = $state(false)
</script>

<svelte:head>
  <title>ASN.NET — Internet Fiber Super Cepat untuk Rumah & Bisnismu</title>
  <meta
    name="description"
    content="ASN.NET adalah provider internet fiber optik rumah super cepat. 100% fiber optic, kuota tanpa batas, gratis modem. Cek cakupan area kamu sekarang!"
  />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
</svelte:head>

<main class="relative min-h-screen overflow-x-clip bg-white">
  <!-- Ambient sheen blobs -->
  <div
    aria-hidden="true"
    class="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full opacity-60 blur-3xl"
    style="background: radial-gradient(closest-side, rgba(125, 211, 252, 0.35), transparent)"
  ></div>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute top-[420px] left-[-12%] h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
    style="background: radial-gradient(closest-side, rgba(196, 203, 214, 0.4), transparent)"
  ></div>

  <!-- Nav -->
  <header class="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
    <a href="/" class="flex items-center gap-2.5">
      <AsnLogo size={38} />
      <span class="flex flex-col leading-none">
        <span class="text-lg font-extrabold tracking-tight">ASN<span class="text-asn-blue-500">.</span>NET</span>
        <span class="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-asn-silver-600 uppercase">Smart Service, Strong Network</span>
      </span>
    </a>
    <nav class="hidden items-center gap-7 text-sm font-medium text-asn-ink-900/70 lg:flex">
      <a class="hover:text-asn-blue-700" href="/layanan/fiber">Layanan</a>
      <a class="hover:text-asn-blue-700" href="/paket">Paket</a>
      <a class="hover:text-asn-blue-700" href="/promo">Promo</a>
      <a class="hover:text-asn-blue-700" href="/kontak">Kontak</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="/daftar" class="btn-primary hidden rounded-full px-5 py-2.5 text-sm font-bold sm:inline-flex">Langganan Sekarang</a>
      <!-- Hamburger + slide-over drawer < lg (PRD §8) -->
      <button
        class="grid h-11 w-11 place-items-center rounded-xl glossy lg:hidden"
        aria-label="Buka menu"
        aria-expanded={menuOpen}
        onclick={() => (menuOpen = true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
    </div>
  </header>
  <NavDrawer bind:open={menuOpen} />

  <!-- Hero — PRD §6.2 #1 -->
  <section class="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-6 pb-16 md:grid-cols-2 lg:max-w-[1200px] lg:grid-cols-[1.05fr_1fr] 2xl:max-w-[1320px] lg:pt-10">
    <div>
      <div class="mb-5 inline-flex items-center gap-2 rounded-full glossy px-4 py-1.5 text-xs font-semibold text-asn-blue-700">
        <span class="h-2 w-2 rounded-full bg-asn-blue-500"></span>
        100% Fiber Optic · Gratis Modem · Kuota Tanpa Batas
      </div>
      <h1 class="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]">
        Internet Fiber Super Cepat
        <span class="metal-silver-text">untuk Rumah</span>
        &amp; Bisnismu
      </h1>
      <p class="mt-5 max-w-lg text-base text-asn-ink-900/65 sm:text-lg">
        Koneksi stabil 100% fiber optik, unlimited tanpa takut kuota habis, gratis modem WiFi.
        Cek dulu — apakah area kamu sudah tercakup?
      </p>

      <!-- Coverage checker card (PRD §6.3) -->
      <div id="cek" class="glossy mt-8 max-w-lg scroll-mt-24 rounded-2xl p-5">
        <p class="mb-4 text-sm font-bold text-asn-ink-900/80">Cek ketersediaan layanan di lokasimu</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kota / Kabupaten</span>
            <select
              class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30 disabled:opacity-50"
              bind:value={city}
              onchange={onCityChange}
              disabled={loadingCities || citiesFailed}
            >
              <option value="" disabled selected>{loadingCities ? 'Memuat…' : 'Pilih kota / kabupaten'}</option>
              {#each cities as c (c.slug)}
                <option value={c.slug}>{c.name}</option>
              {/each}
            </select>
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kecamatan</span>
            <select
              class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30 disabled:opacity-50"
              bind:value={district}
              disabled={!city || loadingDistricts}
            >
              <option value="" disabled selected>{loadingDistricts ? 'Memuat…' : 'Pilih kecamatan'}</option>
              {#each districts as d (d.slug)}
                <option value={d.slug}>{d.name}</option>
              {/each}
            </select>
          </label>
        </div>
        <button
          class="btn-primary mt-4 w-full rounded-xl py-3 text-sm font-bold disabled:opacity-50"
          onclick={checkCoverage}
          disabled={!city || !district || checking}
        >
          {checking ? 'Mengecek ketersediaan layanan…' : 'Cek Cakupan'}
        </button>

        {#if citiesFailed}
          <div class="mt-4 rounded-xl border border-asn-silver-400 bg-asn-silver-100 px-4 py-3 text-sm text-asn-ink-900/70">
            Gagal memuat. Coba lagi.
            <button class="ml-1 font-bold text-asn-blue-700 underline underline-offset-2" onclick={loadCities}>Muat ulang</button>
          </div>
        {/if}

        {#if checkFailed}
          <div class="mt-4 rounded-xl border border-asn-silver-400 bg-asn-silver-100 px-4 py-3 text-sm text-asn-ink-900/70">
            Gagal memuat. Coba lagi.
            <button class="ml-1 font-bold text-asn-blue-700 underline underline-offset-2" onclick={checkCoverage}>Ulangi</button>
          </div>
        {/if}

        {#if result}
          {#if result.status === 'available'}
            <div class="mt-4 rounded-xl border border-asn-blue-500/40 bg-asn-blue-300/15 px-4 py-3 text-sm text-asn-blue-700">
              ✅ <strong>Kabar baik! ASN.NET sudah tersedia di Kecamatan {result.district.name}.</strong>
              Pilih paket favoritmu di bawah ini 👇
            </div>
            {#if result.packages.length > 0}
              <div class="mt-3 grid gap-2">
                {#each result.packages as p (p.slug)}
                  <a
                    href="/daftar?package={p.slug}&city={city}"
                    class="glossy flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition hover:border-asn-blue-500/60"
                  >
                    <span class="font-bold">{p.name}</span>
                    <span class="flex items-baseline gap-1.5">
                      {#if p.priceIdr !== p.basePriceIdr}
                        <s class="text-xs text-asn-ink-900/40">{formatIdr(p.basePriceIdr)}</s>
                      {/if}
                      <span class="font-extrabold text-asn-blue-700">{formatIdr(p.priceIdr)}<span class="text-xs font-medium text-asn-ink-900/50">/bulan</span></span>
                    </span>
                  </a>
                {/each}
              </div>
            {/if}
          {:else if result.status === 'coming_soon'}
            <div class="mt-4 rounded-xl border border-asn-blue-500/40 bg-asn-blue-300/10 px-4 py-3 text-sm text-asn-ink-900/75">
              ⏳ <strong>Segera hadir di Kecamatan {result.district.name}!</strong>
              Jaringan kami sedang dibangun di lokasimu.
              <a href="/request-area?city={city}&district={district}&source=waitlist" class="font-bold text-asn-blue-700 underline underline-offset-2">
                Kabari saya begitu tersedia
              </a>
            </div>
          {:else}
            <div class="mt-4 rounded-xl border border-asn-silver-400 bg-asn-silver-100 px-4 py-3 text-sm text-asn-ink-900/70">
              😔 <strong>Waduh, ASN.NET belum tersedia di Kecamatan {result.district.name}.</strong>
              Semakin banyak yang meminta, semakin cepat kami datang!
              <a href="/request-area?city={city}&district={district}" class="font-bold text-asn-blue-700 underline underline-offset-2">Request Area</a>
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- 3D / poster hero visual -->
    <div class="relative h-[300px] sm:h-[380px] md:h-[420px] lg:h-[520px]">
      <HeroFiber />
    </div>
  </section>

  <!-- PRD §6.2 #2–#9 — scroll-storytelling sections (§7.3) -->
  <ValueProps />
  <div class="hairline mx-auto max-w-6xl"></div>
  <ProductLines />
  <PackageHighlights />
  <div class="hairline mx-auto max-w-6xl"></div>
  <HowItWorks />
  <PromoBanner />
  <StatsStrip />
  <FaqTeaser />
  <FinalCta />

  <div class="hairline mx-auto max-w-6xl"></div>

  <footer class="mx-auto w-full max-w-6xl content-w px-5 py-10 pb-28 text-sm text-asn-silver-600 sm:pb-10">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <AsnLogo size={44} />
      <div>
        <p class="font-extrabold text-asn-ink-900/80">PT Advance Service Network Indonesia</p>
        <p class="mt-0.5 text-xs font-semibold tracking-wide">Smart Service, Strong Network</p>
        <p class="mt-1">© 2026 ASN.NET · Internet Fiber Rumah &amp; Bisnis — cakupan &amp; paket via API live</p>
      </div>
    </div>
  </footer>

  <!-- Sticky mobile CTA (PRD §8) -->
  <div class="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-asn-silver-400/40 bg-white/85 p-3 backdrop-blur sm:hidden">
    <a href="#cek" class="btn-primary flex-1 rounded-xl py-3 text-center text-sm font-bold">Cek Cakupan</a>
    <a href="https://wa.me/622150919981" class="glossy flex-1 rounded-xl py-3 text-center text-sm font-bold">WhatsApp</a>
  </div>
</main>
