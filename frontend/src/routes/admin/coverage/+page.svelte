<script lang="ts">
  import { onMount } from 'svelte'

  interface DistrictRow {
    id: number
    cityId: number
    name: string
    slug: string
    status: 'available' | 'coming_soon' | 'not_available' | null
    updatedAt: string | null
  }
  interface CityMatrix {
    id: number
    name: string
    slug: string
    province: string
    isActive: boolean
    districts: DistrictRow[]
  }

  const STATUS_LABEL: Record<string, string> = {
    available: 'Tersedia',
    coming_soon: 'Segera',
    not_available: 'Belum'
  }
  const STATUS_STYLE: Record<string, string> = {
    available: 'bg-emerald-500/15 text-emerald-700',
    coming_soon: 'bg-amber-500/15 text-amber-700',
    not_available: 'bg-asn-silver-400/40 text-asn-ink-900/50'
  }

  let cities = $state<CityMatrix[]>([])
  let loading = $state(true)
  let failed = $state(false)
  let saving = $state(false)
  let bulkStatus = $state<'available' | 'coming_soon' | 'not_available'>('available')
  let bulkCity = $state<number | null>(null)
  let newCityName = $state('')
  let newCityProvince = $state('')
  let newDistrictCity = $state<number | null>(null)
  let newDistrictName = $state('')

  async function loadMatrix() {
    loading = true
    failed = false
    try {
      const res = await fetch('/api/admin/coverage')
      if (!res.ok) throw new Error(String(res.status))
      cities = ((await res.json()) as { cities: CityMatrix[] }).cities
      if (bulkCity === null && cities.length > 0) bulkCity = cities[0]!.id
      if (newDistrictCity === null && cities.length > 0) newDistrictCity = cities[0]!.id
    } catch {
      failed = true
    } finally {
      loading = false
    }
  }

  async function setStatus(cityId: number, district: DistrictRow, status: NonNullable<DistrictRow['status']>) {
    saving = true
    try {
      const res = await fetch(`/api/admin/coverage/${cityId}/${district.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) district.status = status
    } finally {
      saving = false
    }
  }

  async function applyBulk() {
    if (bulkCity === null) return
    saving = true
    try {
      const city = cities.find((c) => c.id === bulkCity)!
      const ids = city.districts.map((d) => d.id)
      const res = await fetch('/api/admin/coverage/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cityId: bulkCity, districtIds: ids, status: bulkStatus })
      })
      if (res.ok) {
        city.districts.forEach((d) => (d.status = bulkStatus))
      }
    } finally {
      saving = false
    }
  }

  async function addCity() {
    if (!newCityName.trim() || !newCityProvince.trim()) return
    saving = true
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newCityName, province: newCityProvince })
      })
      if (res.ok) {
        newCityName = ''
        newCityProvince = ''
        await loadMatrix()
      }
    } finally {
      saving = false
    }
  }

  async function addDistrict() {
    if (newDistrictCity === null || !newDistrictName.trim()) return
    saving = true
    try {
      const res = await fetch('/api/admin/districts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cityId: newDistrictCity, name: newDistrictName })
      })
      if (res.ok) {
        newDistrictName = ''
        await loadMatrix()
      }
    } finally {
      saving = false
    }
  }

  onMount(loadMatrix)
</script>

<svelte:head>
  <title>Coverage — ASN.NET Admin</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight">Coverage Management</h1>
    <p class="mt-1 text-sm text-asn-ink-900/55">Set status ketersediaan per kecamatan (role: admin / noc).</p>
  </div>
  <div class="flex items-center gap-2">
    <select bind:value={bulkCity} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
      {#each cities as c (c.id)}
        <option value={c.id}>{c.name}</option>
      {/each}
    </select>
    <select bind:value={bulkStatus} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
      {#each ['available', 'coming_soon', 'not_available'] as s}
        <option value={s}>{STATUS_LABEL[s]}</option>
      {/each}
    </select>
    <button class="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold" disabled={saving || bulkCity === null} onclick={applyBulk}>
      Bulk-set semua kecamatan
    </button>
  </div>
</div>

{#if failed}
  <div class="rounded-2xl border border-asn-silver-400 bg-asn-silver-100 px-4 py-3 text-sm text-asn-ink-900/70">
    Gagal memuat matrix.
    <button class="font-bold text-asn-blue-700 underline" onclick={loadMatrix}>Muat ulang</button>
  </div>
{:else if loading}
  <p class="text-sm text-asn-ink-900/50">Memuat matrix cakupan…</p>
{:else}
  <div class="grid gap-5">
    {#each cities as city (city.id)}
      <section class="glossy rounded-2xl p-5">
        <header class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="font-extrabold">{city.name}</h2>
            <p class="text-xs text-asn-ink-900/50">{city.province} · {city.districts.length} kecamatan</p>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide text-asn-silver-600">{city.slug}</span>
        </header>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {#each city.districts as district (district.id)}
            <div class="flex items-center justify-between gap-2 rounded-xl border border-asn-silver-400/50 bg-white/70 px-3 py-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{district.name}</p>
                {#if district.updatedAt}
                  <p class="text-[10px] text-asn-ink-900/40">{new Date(district.updatedAt).toLocaleDateString('id-ID')}</p>
                {/if}
              </div>
              <select
                class="rounded-lg px-2 py-1.5 text-xs font-bold {district.status ? STATUS_STYLE[district.status] : ''}"
                value={district.status ?? 'not_available'}
                disabled={saving}
                onchange={(e) => setStatus(city.id, district, e.currentTarget.value as NonNullable<DistrictRow['status']>)}
              >
                {#each ['available', 'coming_soon', 'not_available'] as s}
                  <option value={s}>{STATUS_LABEL[s]}</option>
                {/each}
              </select>
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <!-- Add city / district -->
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    <form class="glossy grid gap-3 rounded-2xl p-5" onsubmit={(e) => { e.preventDefault(); addCity() }}>
      <p class="text-sm font-extrabold">Tambah Kota / Kabupaten</p>
      <input bind:value={newCityName} placeholder="Nama kota (mis. Kota Tangerang)" required class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm" />
      <input bind:value={newCityProvince} placeholder="Provinsi" required class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm" />
      <button class="btn-primary rounded-xl py-2.5 text-sm font-bold" type="submit" disabled={saving}>Tambah kota</button>
    </form>
    <form class="glossy grid gap-3 rounded-2xl p-5" onsubmit={(e) => { e.preventDefault(); addDistrict() }}>
      <p class="text-sm font-extrabold">Tambah Kecamatan</p>
      <select bind:value={newDistrictCity} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
        {#each cities as c (c.id)}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
      <input bind:value={newDistrictName} placeholder="Nama kecamatan" required class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm" />
      <button class="btn-primary rounded-xl py-2.5 text-sm font-bold" type="submit" disabled={saving}>Tambah kecamatan</button>
    </form>
  </div>
{/if}
