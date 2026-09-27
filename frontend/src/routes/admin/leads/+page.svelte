<script lang="ts">
  import { onMount } from 'svelte'

  interface LeadRow {
    id: number
    fullName: string
    phone: string
    email: string | null
    address: string
    citySlug: string
    cityName: string
    districtName: string
    packageSlug: string | null
    packageName: string | null
    source: string
    status: 'new' | 'contacted' | 'scheduled' | 'installed' | 'lost'
    duplicateOf: number | null
    notes: string
    preferredDate: string | null
    createdAt: string
  }

  const STATUSES = ['new', 'contacted', 'scheduled', 'installed', 'lost'] as const
  const STATUS_LABEL: Record<string, string> = {
    new: 'Baru',
    contacted: 'Dihubungi',
    scheduled: 'Terjadwal',
    installed: 'Terpasang',
    lost: 'Gagal'
  }
  const STATUS_STYLE: Record<string, string> = {
    new: 'bg-asn-blue-500/15 text-asn-blue-700',
    contacted: 'bg-amber-500/15 text-amber-700',
    scheduled: 'bg-purple-500/15 text-purple-700',
    installed: 'bg-emerald-500/15 text-emerald-700',
    lost: 'bg-asn-silver-400/40 text-asn-ink-900/50'
  }

  let rows = $state<LeadRow[]>([])
  let total = $state(0)
  let newCount = $state(0)
  let page = $state(1)
  const pageSize = 25
  let loading = $state(true)
  let failed = $state(false)
  let savingId = $state<number | null>(null)
  let noteDraft = $state<Record<number, string>>({})
  let noteOpenId = $state<number | null>(null)
  let selected = $state<Set<number>>(new Set())
  let bulkStatus = $state<'new' | 'contacted' | 'scheduled' | 'installed' | 'lost'>('contacted')

  // Filters
  let fStatus = $state('')
  let fCity = $state('')
  let fPackage = $state('')
  let fSource = $state('')
  let fQ = $state('')
  let fSince = $state('')

  let cities = $state<{ slug: string; name: string }[]>([])
  let packages = $state<{ slug: string; name: string }[]>([])

  function query(): string {
    const p = new URLSearchParams()
    if (fStatus) p.set('status', fStatus)
    if (fCity) p.set('city', fCity)
    if (fPackage) p.set('package', fPackage)
    if (fSource) p.set('source', fSource)
    if (fQ) p.set('q', fQ)
    if (fSince) p.set('since', fSince)
    p.set('page', String(page))
    p.set('pageSize', String(pageSize))
    return p.toString()
  }

  async function loadLeads() {
    loading = true
    failed = false
    try {
      const res = await fetch(`/api/admin/leads?${query()}`)
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { rows: LeadRow[]; total: number; newCount: number }
      rows = data.rows
      total = data.total
      newCount = data.newCount
      selected = new Set()
    } catch {
      failed = true
    } finally {
      loading = false
    }
  }

  async function setStatus(lead: LeadRow, status: LeadRow['status']) {
    savingId = lead.id
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) lead.status = status
    } finally {
      savingId = null
    }
  }

  async function saveNotes(lead: LeadRow) {
    const notes = noteDraft[lead.id]
    if (notes === undefined) return (noteOpenId = null)
    savingId = lead.id
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      if (res.ok) {
        lead.notes = notes
        noteOpenId = null
      }
    } finally {
      savingId = null
    }
  }

  async function applyBulk() {
    if (selected.size === 0) return
    savingId = -1
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], status: bulkStatus })
      })
      if (res.ok) await loadLeads()
    } finally {
      savingId = null
    }
  }

  function toggle(id: number) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selected = next
  }

  function toggleAll() {
    selected = selected.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))
  }

  const allSelected = $derived(rows.length > 0 && selected.size === rows.length)
  const pages = $derived(Math.max(1, Math.ceil(total / pageSize)))

  function waLink(phone: string, name: string, pkg: string | null) {
    const text = encodeURIComponent(
      `Halo ${name}, saya tim ASN.NET. Menindaklanjuti permintaan pemasangan${pkg ? ` ${pkg}` : ''} Anda. Kapan waktu yang pas untuk kami hubungi?`
    )
    const digits = phone.replace(/[^0-9]/g, '').replace(/^0/, '62')
    return `https://wa.me/${digits}?text=${text}`
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  }

  onMount(async () => {
    await loadLeads()
    // Filter option sources (best-effort; the inbox works without them).
    try {
      const [c, p] = await Promise.all([fetch('/api/cities'), fetch('/api/admin/prices')])
      if (c.ok) cities = await c.json()
      if (p.ok) packages = ((await p.json()) as { packages: { slug: string; name: string }[] }).packages
    } catch {
      /* filters stay empty */
    }
  })
</script>

<svelte:head>
  <title>Leads — ASN.NET Admin</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight">Leads Inbox</h1>
    <p class="mt-1 text-sm text-asn-ink-900/55">
      {newCount} lead menunggu kontak pertama · {total} total sesuai filter
    </p>
  </div>
  <a href={`/api/admin/leads/export.csv?${query()}`} class="glossy rounded-xl px-4 py-2.5 text-sm font-bold hover:border-asn-blue-500/50">
    ⬇ Export CSV
  </a>
</div>

<!-- Filters -->
<div class="glossy mb-5 grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-6">
  <select bind:value={fStatus} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
    <option value="">Semua status</option>
    {#each STATUSES as s}
      <option value={s}>{STATUS_LABEL[s]}</option>
    {/each}
  </select>
  <select bind:value={fCity} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
    <option value="">Semua kota</option>
    {#each cities as c (c.slug)}
      <option value={c.slug}>{c.name}</option>
    {/each}
  </select>
  <select bind:value={fPackage} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
    <option value="">Semua paket</option>
    {#each packages as p (p.slug)}
      <option value={p.slug}>{p.name}</option>
    {/each}
  </select>
  <select bind:value={fSource} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm">
    <option value="">Semua sumber</option>
    {#each ['homepage_checker', 'package_card', 'product_page', 'promo_page', 'contact_page', 'waitlist'] as s}
      <option value={s}>{s}</option>
    {/each}
  </select>
  <input
    type="date"
    bind:value={fSince}
    class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm"
    title="Sejak tanggal"
  />
  <div class="flex gap-2">
    <input
      bind:value={fQ}
      placeholder="Cari nama / telepon / alamat…"
      class="min-w-0 flex-1 rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2.5 text-sm"
    />
    <button class="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold" onclick={() => { page = 1; loadLeads() }}>Cari</button>
  </div>
</div>

<!-- Bulk bar -->
{#if selected.size > 0}
  <div class="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-asn-blue-500/40 bg-asn-blue-300/10 px-4 py-3 text-sm">
    <span class="font-bold">{selected.size} dipilih</span>
    <select bind:value={bulkStatus} class="rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-2 text-sm">
      {#each STATUSES as s}
        <option value={s}>{STATUS_LABEL[s]}</option>
      {/each}
    </select>
    <button class="btn-primary rounded-xl px-4 py-2 text-sm font-bold" disabled={savingId === -1} onclick={applyBulk}>
      {savingId === -1 ? 'Menyimpan…' : 'Terapkan status'}
    </button>
  </div>
{/if}

{#if failed}
  <div class="rounded-2xl border border-asn-silver-400 bg-asn-silver-100 px-4 py-3 text-sm text-asn-ink-900/70">
    Gagal memuat leads.
    <button class="font-bold text-asn-blue-700 underline" onclick={loadLeads}>Muat ulang</button>
  </div>
{:else if loading}
  <p class="text-sm text-asn-ink-900/50">Memuat leads…</p>
{:else if rows.length === 0}
  <div class="glossy rounded-2xl p-10 text-center text-sm text-asn-ink-900/50">Tidak ada lead sesuai filter.</div>
{:else}
  <div class="overflow-x-auto">
    <table class="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
      <thead>
        <tr class="text-left text-xs font-bold uppercase tracking-wide text-asn-ink-900/45">
          <th class="px-3 py-2"><input type="checkbox" checked={allSelected} onchange={toggleAll} class="h-4 w-4" /></th>
          <th class="px-3 py-2">Lead</th>
          <th class="px-3 py-2">Area</th>
          <th class="px-3 py-2">Paket</th>
          <th class="px-3 py-2">Sumber</th>
          <th class="px-3 py-2">Status</th>
          <th class="px-3 py-2">Masuk</th>
          <th class="px-3 py-2">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as lead (lead.id)}
          <tr class="border-t border-asn-silver-400/40 align-top hover:bg-white/60">
            <td class="px-3 py-3">
              <input type="checkbox" checked={selected.has(lead.id)} onchange={() => toggle(lead.id)} class="h-4 w-4" />
            </td>
            <td class="px-3 py-3">
              <p class="font-bold">
                {lead.fullName}
                {#if lead.duplicateOf}
                  <span class="ml-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700" title="Duplikat dari lead #{lead.duplicateOf}">dup</span>
                {/if}
              </p>
              <p class="text-xs text-asn-ink-900/55">{lead.phone}{lead.email ? ` · ${lead.email}` : ''}</p>
              <p class="max-w-[220px] truncate text-xs text-asn-ink-900/40" title={lead.address}>{lead.address}</p>
              {#if noteOpenId === lead.id}
                <div class="mt-2">
                  <textarea
                    bind:value={noteDraft[lead.id]}
                    rows="3"
                    placeholder="Catatan internal…"
                    class="w-full rounded-lg border border-asn-silver-400/60 bg-white/80 px-2 py-1.5 text-xs"
                  >{lead.notes}</textarea>
                  <div class="mt-1 flex gap-2">
                    <button class="btn-primary rounded-lg px-3 py-1.5 text-xs font-bold" disabled={savingId === lead.id} onclick={() => saveNotes(lead)}>Simpan</button>
                    <button class="text-xs text-asn-ink-900/50 underline" onclick={() => (noteOpenId = null)}>Batal</button>
                  </div>
                </div>
              {:else if lead.notes}
                <p class="mt-1 max-w-[220px] truncate text-xs text-asn-blue-700/80" title={lead.notes}>📝 {lead.notes}</p>
              {/if}
            </td>
            <td class="px-3 py-3">
              <p>{lead.cityName}</p>
              <p class="text-xs text-asn-ink-900/55">{lead.districtName}</p>
            </td>
            <td class="px-3 py-3 text-xs">{lead.packageName ?? '—'}</td>
            <td class="px-3 py-3 text-xs text-asn-ink-900/55">{lead.source}</td>
            <td class="px-3 py-3">
              <select
                class="rounded-lg px-2 py-1.5 text-xs font-bold {STATUS_STYLE[lead.status]}"
                value={lead.status}
                disabled={savingId === lead.id}
                onchange={(e) => setStatus(lead, e.currentTarget.value as LeadRow['status'])}
              >
                {#each STATUSES as s}
                  <option value={s}>{STATUS_LABEL[s]}</option>
                {/each}
              </select>
            </td>
            <td class="px-3 py-3 text-xs text-asn-ink-900/55">{fmtDate(lead.createdAt)}</td>
            <td class="px-3 py-3">
              <div class="flex flex-col gap-1.5">
                <a href={waLink(lead.phone, lead.fullName, lead.packageName)} target="_blank" rel="noreferrer" class="text-xs font-bold text-emerald-600 hover:underline">
                  WhatsApp
                </a>
                <button
                  class="text-left text-xs text-asn-ink-900/50 underline underline-offset-2"
                  onclick={() => {
                    noteOpenId = lead.id
                    noteDraft[lead.id] = lead.notes
                  }}
                >
                  Catatan
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if pages > 1}
    <div class="mt-4 flex items-center justify-center gap-3 text-sm">
      <button class="glossy rounded-lg px-3 py-2 font-bold disabled:opacity-40" disabled={page <= 1} onclick={() => { page -= 1; loadLeads() }}>← Sebelumnya</button>
      <span class="text-asn-ink-900/55">Halaman {page} / {pages}</span>
      <button class="glossy rounded-lg px-3 py-2 font-bold disabled:opacity-40" disabled={page >= pages} onclick={() => { page += 1; loadLeads() }}>Selanjutnya →</button>
    </div>
  {/if}
{/if}
