<script lang="ts">
  import { onMount } from 'svelte'

  interface DemandRow {
    districtId: number
    districtName: string
    cityName: string
    requests: number
  }

  let rows = $state<DemandRow[]>([])
  let loading = $state(true)
  let failed = $state(false)

  async function load() {
    loading = true
    failed = false
    try {
      const res = await fetch('/api/admin/demand')
      if (!res.ok) throw new Error(String(res.status))
      rows = ((await res.json()) as { districts: DemandRow[] }).districts
    } catch {
      failed = true
    } finally {
      loading = false
    }
  }

  const max = $derived(Math.max(1, ...rows.map((r) => r.requests)))
  const top = $derived(rows.filter((r) => r.requests > 0))

  onMount(load)
</script>

<svelte:head>
  <title>Demand — ASN.NET Admin</title>
</svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-extrabold tracking-tight">Demand per Kecamatan</h1>
  <p class="mt-1 text-sm text-asn-ink-900/55">Area requests teragregasi (FR-5.2) — "di mana kita bangun berikutnya?"</p>
</div>

{#if failed}
  <div class="rounded-2xl border border-asn-silver-400 bg-asn-silver-100 px-4 py-3 text-sm text-asn-ink-900/70">
    Gagal memuat.
    <button class="font-bold text-asn-blue-700 underline" onclick={load}>Muat ulang</button>
  </div>
{:else if loading}
  <p class="text-sm text-asn-ink-900/50">Memuat agregasi…</p>
{:else if top.length === 0}
  <div class="glossy rounded-2xl p-10 text-center text-sm text-asn-ink-900/50">
    Belum ada area request. Data muncul otomatis saat pengunjung mengirim permintaan dari cek cakupan.
  </div>
{:else}
  <div class="glossy grid gap-2.5 rounded-2xl p-5">
    {#each top as row (row.districtId)}
      <div class="flex items-center gap-3">
        <div class="w-52 shrink-0 truncate text-sm font-semibold" title="{row.districtName} — {row.cityName}">
          {row.districtName}
          <span class="text-xs font-normal text-asn-ink-900/45">· {row.cityName}</span>
        </div>
        <div class="h-6 flex-1 overflow-hidden rounded-lg bg-asn-silver-400/25">
          <div
            class="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-asn-blue-600 to-asn-blue-400 pr-2 text-[11px] font-bold text-white"
            style="width: {Math.max(8, (row.requests / max) * 100)}%"
          >
            {row.requests}
          </div>
        </div>
      </div>
    {/each}
  </div>
  <p class="mt-3 text-xs text-asn-ink-900/45">{top.length} kecamatan dengan permintaan · {rows.length} kecamatan total</p>
{/if}
