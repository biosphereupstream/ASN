<script lang="ts">
  /**
   * Area request (PRD FR-5.1 / §6.4 Flow C): waitlist form for districts
   * where ASN.NET is not yet available. Deep links from the checker:
   * /request-area?city=X&district=Y
   */
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { WA_NUMBER } from '$lib/data/home'
  import Turnstile from '$lib/components/Turnstile.svelte'

  interface CityOption {
    slug: string
    name: string
  }
  interface DistrictOption {
    slug: string
    name: string
  }

  const q = page.url.searchParams
  const prefillCity = q.get('city') ?? ''
  const prefillDistrict = q.get('district') ?? ''

  let fullName = $state('')
  let phone = $state('')
  let city = $state('')
  let district = $state('')
  let notifyWhenAvailable = $state(true)
  let website = $state('') // honeypot
  let turnstileToken = $state('') // Turnstile (FR-4.4); empty when widget absent

  let cities = $state<CityOption[]>([])
  let districts = $state<DistrictOption[]>([])
  let loadingCities = $state(true)
  let loadingDistricts = $state(false)

  let submitting = $state(false)
  let formError = $state('')
  let fieldErrors = $state<Record<string, string>>({})
  let success = $state(false)

  async function loadDistricts(citySlug: string, preselect?: string) {
    loadingDistricts = true
    try {
      const res = await fetch(`/api/cities/${citySlug}/districts`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      districts = (await res.json()) as DistrictOption[]
      if (preselect && districts.some((d) => d.slug === preselect)) district = preselect
    } catch {
      districts = []
    } finally {
      loadingDistricts = false
    }
  }

  onMount(async () => {
    try {
      const res = await fetch('/api/cities')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      cities = (await res.json()) as CityOption[]
      if (prefillCity && cities.some((c) => c.slug === prefillCity)) {
        city = prefillCity
        await loadDistricts(city, prefillDistrict)
      }
    } catch {
      cities = []
    } finally {
      loadingCities = false
    }
  })

  function submit(e: SubmitEvent) {
    e.preventDefault()
    fieldErrors = {}
    if (fullName.trim().length < 3) fieldErrors.fullName = 'Nama lengkap minimal 3 karakter.'
    // Accept local (08xx) / national (62xxx) formats; backend normalizes to E.164.
    if (!/^\+?\d{8,16}$/.test(phone.replace(/[\s\-()]/g, ''))) {
      fieldErrors.phone = 'Format nomor tidak valid. Contoh: 081234567890.'
    }
    if (!city) fieldErrors.city = 'Pilih kota / kabupaten.'
    if (!district) fieldErrors.district = 'Pilih kecamatan.'
    if (Object.keys(fieldErrors).length > 0) return

    submitting = true
    formError = ''
    fetch('/api/area-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        phone: phone.replace(/[\s\-()]/g, ''),
        city,
        district,
        notifyWhenAvailable: notifyWhenAvailable,
        website,
        turnstileToken: turnstileToken || undefined
      })
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: number | null; error?: string }
        if (res.ok && data.ok) {
          success = true
          return
        }
        formError =
          res.status === 429
            ? 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.'
            : 'Pengiriman gagal. Coba lagi, atau hubungi kami via WhatsApp.'
        if (data.error === 'DUPLICATE_RECENT') {
          formError = 'Kamu sudah mengirim permintaan untuk area ini belakangan ini. Kami catat kok — terima kasih!'
          success = true
        }
      })
      .catch(() => {
        formError = 'Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.'
      })
      .finally(() => {
        submitting = false
      })
  }
</script>

<svelte:head>
  <title>Request Area — Minta ASN.NET Datang ke Lokasimu</title>
  <meta
    name="description"
    content="ASN.NET belum tersedia di areamu? Ajukan permintaan area — semakin banyak peminat, semakin cepat kami membangun jaringan di lokasimu."
  />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
</svelte:head>

<main class="relative min-h-screen overflow-x-clip bg-white">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
    style="background: radial-gradient(circle, rgba(125, 211, 252, 0.35), transparent 70%)"
  ></div>

  <section class="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-14">
    <nav class="mb-8 flex items-center justify-between" aria-label="Navigasi">
      <a href="/" class="flex items-center gap-2 text-sm font-bold text-asn-ink-900/70 transition hover:text-asn-blue-700">← Beranda</a>
      <a
        href="https://wa.me/{WA_NUMBER}"
        class="glossy rounded-full px-4 py-2 text-sm font-bold text-asn-blue-700 transition hover:border-asn-blue-500/60"
      >
        Butuh bantuan? WhatsApp
      </a>
    </nav>

    {#if success}
      <!-- §6.4 Flow C confirmation -->
      <div class="glossy mx-auto max-w-2xl rounded-2xl border border-asn-blue-500/40 bg-white/90 p-8 text-center shadow-xl shadow-asn-blue-700/5">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-asn-blue-300/20 text-3xl">📍</div>
        <h1 class="mb-2 text-xl font-extrabold text-asn-ink-900">Permintaan area tercatat!</h1>
        <p class="mb-6 text-sm text-asn-ink-900/70">
          Terima kasih, <strong>{fullName}</strong>. Permintaan untuk <strong>{districts.find((d) => d.slug === district)?.name ?? district}</strong>
          sudah masuk antrean kami. Semakin banyak peminat di suatu area, semakin cepat jaringan dibangun 🚀
          {#if notifyWhenAvailable}
            Kami kabari di {phone} begitu ASN.NET hadir.
          {/if}
        </p>
        <a href="/" class="btn-primary inline-block rounded-full px-5 py-2.5 text-sm font-bold">Kembali ke beranda</a>
      </div>
    {:else}
      <form class="glossy mx-auto max-w-2xl rounded-2xl border border-asn-silver-400/70 bg-white/90 p-6 sm:p-8" novalidate onsubmit={submit}>
        <h1 class="mb-1 text-xl font-extrabold text-asn-ink-900">Request Area</h1>
        <p class="mb-6 text-sm text-asn-ink-900/70">
          ASN.NET belum sampai di lokasimu? Tinggalkan data — permintaanmu langsung masuk peta rencana pembangunan jaringan kami.
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Nama lengkap *</span>
            <input
              type="text"
              bind:value={fullName}
              autocomplete="name"
              class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
            />
            {#if fieldErrors.fullName}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.fullName}</span>{/if}
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Nomor WhatsApp *</span>
            <input
              type="tel"
              bind:value={phone}
              autocomplete="tel"
              inputmode="tel"
              class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
            />
            {#if fieldErrors.phone}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.phone}</span>{/if}
          </label>

          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kota / Kabupaten *</span>
            <select
              bind:value={city}
              disabled={loadingCities || cities.length === 0}
              onchange={() => {
                district = ''
                districts = []
                if (city) void loadDistricts(city)
              }}
              class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30 disabled:opacity-50"
            >
              <option value="" disabled selected>{loadingCities ? 'Memuat…' : 'Pilih kota / kabupaten'}</option>
              {#each cities as c (c.slug)}
                <option value={c.slug}>{c.name}</option>
              {/each}
            </select>
            {#if fieldErrors.city}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.city}</span>{/if}
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kecamatan *</span>
            <select
              bind:value={district}
              disabled={!city || loadingDistricts}
              class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30 disabled:opacity-50"
            >
              <option value="" disabled selected>{loadingDistricts ? 'Memuat…' : 'Pilih kecamatan'}</option>
              {#each districts as d (d.slug)}
                <option value={d.slug}>{d.name}</option>
              {/each}
            </select>
            {#if fieldErrors.district}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.district}</span>{/if}
          </label>
        </div>

        <label class="mt-4 flex items-center gap-3 text-sm text-asn-ink-900/80">
          <input type="checkbox" bind:checked={notifyWhenAvailable} class="h-5 w-5 accent-asn-blue-700" />
          Kabari saya begitu ASN.NET tersedia di area ini
        </label>

        <!-- Honeypot (FR-4.4) -->
        <div class="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
          <label for="hp-ra-website">Website</label>
          <input id="hp-ra-website" type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} />
        </div>

        <!-- Turnstile (FR-4.4): renders only when PUBLIC_TURNSTILE_SITE_KEY is set -->
        <Turnstile onToken={(tk) => (turnstileToken = tk)} />

        {#if formError}
          <div class="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
        {/if}

        <button type="submit" class="btn-primary mt-5 w-full rounded-xl py-3.5 text-sm font-bold disabled:opacity-50" disabled={submitting}>
          {submitting ? 'Mengirim…' : 'Kirim Permintaan Area'}
        </button>
      </form>
    {/if}
  </section>
</main>
