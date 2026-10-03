<script lang="ts">
  /**
   * Shared lead-capture form (PRD FR-4.1) used by /daftar and the checker's
   * waitlist path. Honeypot + UU PDP consent per FR-4.4/FR-4.5, inline
   * validation errors mapped from the API's error codes, success state per
   * §6.4 Flow B.
   */
  import { onMount } from 'svelte'
  import { PACKAGES, WA_NUMBER } from '$lib/data/home'
  import Turnstile from '$lib/components/Turnstile.svelte'

  interface CityOption {
    slug: string
    name: string
  }
  interface DistrictOption {
    slug: string
    name: string
  }

  export interface Prefill {
    package?: string
    city?: string
    district?: string
    source?: string
  }

  let {
    prefill = {} as Prefill,
    title = 'Daftar ASN.NET',
    intro = 'Isi data berikut — tim kami menghubungimu maksimal 1×24 jam kerja.'
  }: { prefill?: Prefill; title?: string; intro?: string } = $props()

  // Form state
  let fullName = $state('')
  let phone = $state('')
  let email = $state('')
  let city = $state('')
  let district = $state('')
  let address = $state('')
  let pkg = $state('')
  let preferredDate = $state('')
  let consent = $state(false)
  // Honeypot (FR-4.4): hidden from users, attractive to bots.
  let website = $state('')
  // Turnstile (FR-4.4): token from the widget; empty string when the widget
  // is not rendered (no PUBLIC_TURNSTILE_SITE_KEY) — backend decides.
  let turnstileToken = $state('')

  // Data state
  let cities = $state<CityOption[]>([])
  let districts = $state<DistrictOption[]>([])
  let loadingCities = $state(true)
  let loadingDistricts = $state(false)

  // Submission state
  let submitting = $state(false)
  let formError = $state('')
  let fieldErrors = $state<Record<string, string>>({})
  let successLeadId = $state<number | null>(null)
  /** FR-4.3: the API flags re-submissions within 30 days via `duplicate:true`. */
  let duplicateNotice = $state(false)

  const FIELD_KEYS: Record<string, string> = {
    name: 'fullName',
    phone: 'phone',
    email: 'email',
    city: 'city',
    district: 'district',
    package: 'package',
    address: 'address',
    date: 'preferredDate'
  }

  const FIELD_LABELS: Record<string, string> = {
    fullName: 'nama lengkap',
    phone: 'nomor WhatsApp',
    email: 'email',
    city: 'kota / kabupaten',
    district: 'kecamatan',
    address: 'alamat pemasangan',
    package: 'paket',
    preferredDate: 'tanggal pemasangan'
  }

  /** Mirror of backend LEAD_SOURCES (FR-4.3) — unknown/absent falls back. */
  const SOURCES = ['homepage_checker', 'package_card', 'product_page', 'promo_page', 'contact_page', 'waitlist']
  function resolvedSource(): string {
    const s = $state.snapshot(prefill).source
    return s && SOURCES.includes(s) ? s : 'homepage_checker'
  }

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
      if (prefill.city && cities.some((c) => c.slug === prefill.city)) {
        city = prefill.city
        await loadDistricts(city, prefill.district)
      }
      if (prefill.package && PACKAGES.some((k) => k.slug === prefill.package)) pkg = prefill.package
    } catch {
      cities = []
    } finally {
      loadingCities = false
    }
  })

  const today = new Date().toISOString().slice(0, 10)

  function submit(e: SubmitEvent) {
    e.preventDefault()

    // FR-4.2 client-side validation
    fieldErrors = {}
    if (fullName.trim().length < 3) fieldErrors.fullName = 'Nama lengkap minimal 3 karakter.'
    // Accept local (08xx), national (62xxx) and E.164 (+62xxx); the backend
    // normalizes to E.164 +62 (FR-4.2).
    if (!/^\+?\d{8,16}$/.test(phone.replace(/[\s\-()]/g, ''))) {
      fieldErrors.phone = 'Format nomor tidak valid. Contoh: 081234567890.'
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Format email tidak valid.'
    if (!city) fieldErrors.city = 'Pilih kota / kabupaten.'
    if (!district) fieldErrors.district = 'Pilih kecamatan.'
    if (address.trim().length < 10) fieldErrors.address = 'Alamat minimal 10 karakter agar teknisi mudah menemukan lokasi.'
    if (!consent) fieldErrors.consent = 'Persetujuan diperlukan untuk melanjutkan.'
    if (Object.keys(fieldErrors).length > 0) return

    submitting = true
    formError = ''
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        phone: phone.replace(/[\s\-()]/g, ''),
        email: email.trim() || undefined,
        city,
        district,
        address: address.trim(),
        package: pkg || undefined,
        preferredDate: preferredDate || undefined,
        source: resolvedSource(),
        consent,
        website,
        turnstileToken: turnstileToken || undefined
      })
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          id?: number | null
          duplicate?: boolean
          error?: string
        }
        if (res.ok && data.ok) {
          successLeadId = data.id ?? 0
          duplicateNotice = data.duplicate === true
          return
        }
        formError =
          res.status === 429
            ? 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.'
            : res.status === 403
              ? 'Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.'
              : 'Pendaftaran gagal dikirim. Coba lagi, atau hubungi kami via WhatsApp.'
        // Surface a server-side field error on the matching input (FR-4.2).
        if (data.error?.startsWith('INVALID_')) {
          const key = FIELD_KEYS[data.error.slice('INVALID_'.length).toLowerCase()]
          if (key) fieldErrors[key] = `Periksa kembali ${FIELD_LABELS[key]}.`
        }
        if (data.error === 'CONSENT_REQUIRED') {
          fieldErrors.consent = 'Persetujuan diperlukan untuk melanjutkan.'
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

<div class="mx-auto w-full max-w-2xl">
  {#if successLeadId !== null}
    <!-- §6.4 Flow B success state -->
    <div class="glossy rounded-2xl border border-asn-blue-500/40 bg-white/90 p-8 text-center shadow-xl shadow-asn-blue-700/5">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-asn-blue-300/20 text-3xl">{duplicateNotice ? '📨' : '✅'}</div>
      <h2 class="mb-2 text-xl font-extrabold text-asn-ink-900">{duplicateNotice ? 'Kami sudah punya permintaanmu!' : 'Pendaftaran terkirim!'}</h2>
      {#if duplicateNotice}
        <p class="mb-6 text-sm text-asn-ink-900/70">
          Ternyata kamu sudah mendaftar untuk area ini belakangan ini, {fullName}. Tenang — datamu satu paket
          <strong class="text-asn-blue-700">#ASN-{successLeadId}</strong> dan tim kami tetap akan menghubungi {phone} maksimal 1×24 jam kerja.
          Tidak perlu daftar ulang 👍
        </p>
      {:else}
        <p class="mb-6 text-sm text-asn-ink-900/70">
          Terima kasih, <strong>{fullName}</strong>. Nomor referensi kamu
          <strong class="text-asn-blue-700">#ASN-{successLeadId}</strong> — tim kami akan menghubungi {phone} maksimal 1×24 jam kerja.
        </p>
      {/if}
      <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a href="https://wa.me/{WA_NUMBER}" class="glossy rounded-full px-5 py-2.5 text-sm font-bold text-asn-blue-700">Chat WhatsApp</a>
        <a href="/" class="btn-primary rounded-full px-5 py-2.5 text-sm font-bold">Kembali ke beranda</a>
      </div>
    </div>
  {:else}
    <form class="glossy rounded-2xl border border-asn-silver-400/70 bg-white/90 p-6 sm:p-8" novalidate onsubmit={submit}>
      <h2 class="mb-1 text-xl font-extrabold text-asn-ink-900">{title}</h2>
      <p class="mb-6 text-sm text-asn-ink-900/70">{intro}</p>

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
        <label class="block sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Email (opsional)</span>
          <input
            type="email"
            bind:value={email}
            autocomplete="email"
            class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
          />
          {#if fieldErrors.email}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.email}</span>{/if}
        </label>

        <label class="block" for="city">
          <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kota / Kabupaten *</span>
          <select
            id="city"
            name="city"
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
        <label class="block" for="district">
          <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kecamatan *</span>
          <select
            id="district"
            name="district"
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

        <label class="block sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Alamat pemasangan *</span>
          <input
            type="text"
            bind:value={address}
            autocomplete="street-address"
            class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
          />
          {#if fieldErrors.address}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.address}</span>{/if}
        </label>

        <label class="block" for="pkg">
          <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Paket (opsional)</span>
          <select
            id="pkg"
            name="package"
            bind:value={pkg}
            class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
          >
            <option value="">Belum menentukan</option>
            {#each PACKAGES as p (p.slug)}
              <option value={p.slug}>{p.name}</option>
            {/each}
          </select>
        </label>
        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Tanggal pemasangan (opsional)</span>
          <input
            type="date"
            bind:value={preferredDate}
            min={today}
            class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
          />
        </label>
      </div>

      <!-- Honeypot (FR-4.4): visually hidden, tab-focusable off, filled only by bots -->
      <div class="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label for="hp-website">Website</label>
        <input id="hp-website" type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} />
      </div>

      <!-- Turnstile (FR-4.4): renders only when PUBLIC_TURNSTILE_SITE_KEY is set -->
      <Turnstile onToken={(tk) => (turnstileToken = tk)} />

      <!-- FR-4.5 UU PDP consent -->
      <label class="mt-5 flex items-start gap-3 rounded-xl bg-asn-blue-300/10 px-4 py-3">
        <input type="checkbox" bind:checked={consent} class="mt-0.5 h-5 w-5 shrink-0 accent-asn-blue-700" />
        <span class="text-xs leading-relaxed text-asn-ink-900/75">
          Saya setuju agar ASN.NET memproses data pribadi saya (nama, nomor WhatsApp, email, alamat) untuk keperluan pemasangan layanan,
          sesuai <a href="/privacy" class="font-bold text-asn-blue-700 underline underline-offset-2">Kebijakan Privasi</a> dan UU PDP No. 27/2022. *
        </span>
      </label>
      {#if fieldErrors.consent}<span class="mt-1 block text-xs font-medium text-red-600">{fieldErrors.consent}</span>{/if}

      {#if formError}
        <div class="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
      {/if}

      <button type="submit" class="btn-primary mt-5 w-full rounded-xl py-3.5 text-sm font-bold disabled:opacity-50" disabled={submitting}>
        {submitting ? 'Mengirim…' : 'Kirim Pendaftaran'}
      </button>
    </form>
  {/if}
</div>
