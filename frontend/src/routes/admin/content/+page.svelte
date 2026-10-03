<script lang="ts">
  import { onMount } from 'svelte'

  type TabKey = 'hero' | 'value_props' | 'faqs' | 'stats' | 'branches'

  interface HeroData {
    headline: string
    subheadline: string
    badges: string[]
  }

  interface ValuePropItem {
    icon: string
    title: string
    desc: string
  }

  interface FaqItem {
    q: string
    a: string
  }

  interface StatItem {
    value: string
    label: string
  }

  interface BranchItem {
    city: string
    name: string
    address: string
    phone: string
    whatsapp: string
  }

  let activeTab = $state<TabKey>('hero')
  let loading = $state(true)
  let saving = $state(false)
  let errorMsg = $state<string | null>(null)
  let successMsg = $state<string | null>(null)

  // Forms state
  let heroForm = $state<HeroData>({
    headline: '',
    subheadline: '',
    badges: []
  })
  let newBadge = $state('')

  let valuePropsForm = $state<{ items: ValuePropItem[] }>({
    items: []
  })

  let faqsForm = $state<{ items: FaqItem[] }>({
    items: []
  })

  let statsForm = $state<{ items: StatItem[] }>({
    items: []
  })

  let branchesForm = $state<{ items: BranchItem[] }>({
    items: []
  })

  async function loadContent() {
    loading = true
    errorMsg = null
    try {
      const res = await fetch('/api/admin/content')
      if (!res.ok) throw new Error('Gagal memuat blok konten')
      const body = await res.json()
      const blocks = body.blocks || {}

      if (blocks.hero?.data) {
        heroForm = {
          headline: String(blocks.hero.data.headline || ''),
          subheadline: String(blocks.hero.data.subheadline || ''),
          badges: Array.isArray(blocks.hero.data.badges) ? [...blocks.hero.data.badges] : []
        }
      }

      if (blocks.value_props?.data?.items) {
        valuePropsForm = { items: JSON.parse(JSON.stringify(blocks.value_props.data.items)) }
      }

      if (blocks.faqs?.data?.items) {
        faqsForm = { items: JSON.parse(JSON.stringify(blocks.faqs.data.items)) }
      }

      if (blocks.stats?.data?.items) {
        statsForm = { items: JSON.parse(JSON.stringify(blocks.stats.data.items)) }
      }

      if (blocks.branches?.data?.items) {
        branchesForm = { items: JSON.parse(JSON.stringify(blocks.branches.data.items)) }
      }
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Terjadi kesalahan memuat konten'
    } finally {
      loading = false
    }
  }

  async function saveActiveBlock() {
    saving = true
    errorMsg = null
    try {
      let dataToSave: Record<string, unknown> = {}
      if (activeTab === 'hero') dataToSave = heroForm as unknown as Record<string, unknown>
      else if (activeTab === 'value_props') dataToSave = valuePropsForm as unknown as Record<string, unknown>
      else if (activeTab === 'faqs') dataToSave = faqsForm as unknown as Record<string, unknown>
      else if (activeTab === 'stats') dataToSave = statsForm as unknown as Record<string, unknown>
      else if (activeTab === 'branches') dataToSave = branchesForm as unknown as Record<string, unknown>

      const res = await fetch(`/api/admin/content/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToSave })
      })

      if (!res.ok) throw new Error('Gagal menyimpan perubahan konten')
      successMsg = `Konten ${activeTab.toUpperCase()} berhasil disimpan dan dipublikasikan!`
      setTimeout(() => (successMsg = null), 4000)
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Gagal menyimpan konten'
    } finally {
      saving = false
    }
  }

  function addBadge() {
    if (!newBadge.trim()) return
    heroForm.badges = [...heroForm.badges, newBadge.trim()]
    newBadge = ''
  }

  function removeBadge(index: number) {
    heroForm.badges = heroForm.badges.filter((_, i) => i !== index)
  }

  function addFaq() {
    faqsForm.items = [
      ...faqsForm.items,
      { q: 'Pertanyaan baru?', a: 'Jawaban detail untuk pertanyaan ini.' }
    ]
  }

  function removeFaq(index: number) {
    faqsForm.items = faqsForm.items.filter((_, i) => i !== index)
  }

  function addStat() {
    statsForm.items = [...statsForm.items, { value: '100%', label: 'Label metrik baru' }]
  }

  function removeStat(index: number) {
    statsForm.items = statsForm.items.filter((_, i) => i !== index)
  }

  function addBranch() {
    branchesForm.items = [
      ...branchesForm.items,
      {
        city: 'Kota Baru',
        name: 'Kantor Cabang',
        address: 'Alamat lengkap kantor',
        phone: '021-000000',
        whatsapp: '+62812000000'
      }
    ]
  }

  function removeBranch(index: number) {
    branchesForm.items = branchesForm.items.filter((_, i) => i !== index)
  }

  onMount(() => {
    loadContent()
  })
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-black tracking-tight text-asn-ink-900">Manajemen Konten CMS</h1>
      <p class="text-xs text-asn-ink-900/60 mt-1">Ubah headline website, nilai keunggulan, FAQ, metrik, dan kantor cabang secara langsung tanpa deploy kode.</p>
    </div>

    <button
      onclick={saveActiveBlock}
      disabled={saving || loading}
      class="asn-btn-primary rounded-lg px-5 py-2.5 text-xs font-bold self-start sm:self-auto cursor-pointer disabled:opacity-50 shadow-sm flex items-center gap-1.5"
    >
      <span>💾</span> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
    </button>
  </div>

  <!-- Messages -->
  {#if successMsg}
    <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between">
      <span>✓ {successMsg}</span>
      <button onclick={() => (successMsg = null)} class="text-emerald-900 hover:opacity-75">✕</button>
    </div>
  {/if}

  {#if errorMsg}
    <div class="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-800 flex items-center justify-between">
      <span>⚠️ {errorMsg}</span>
      <button onclick={() => (errorMsg = null)} class="text-rose-900 hover:opacity-75">✕</button>
    </div>
  {/if}

  <!-- Section Tabs -->
  <div class="border-b border-asn-silver-400/40 flex items-center gap-2 overflow-x-auto">
    <button
      onclick={() => (activeTab = 'hero')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap {activeTab === 'hero' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      Hero Banner
    </button>
    <button
      onclick={() => (activeTab = 'value_props')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap {activeTab === 'value_props' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      Keunggulan Layanan ({valuePropsForm.items.length})
    </button>
    <button
      onclick={() => (activeTab = 'faqs')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap {activeTab === 'faqs' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      FAQ ({faqsForm.items.length})
    </button>
    <button
      onclick={() => (activeTab = 'stats')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap {activeTab === 'stats' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      Metrik & Statistik ({statsForm.items.length})
    </button>
    <button
      onclick={() => (activeTab = 'branches')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap {activeTab === 'branches' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      Kantor Cabang ({branchesForm.items.length})
    </button>
  </div>

  {#if loading}
    <div class="card p-12 text-center text-xs text-asn-ink-900/50">Memuat data konten...</div>
  {:else if activeTab === 'hero'}
    <!-- Hero Block Editor -->
    <div class="card p-6 bg-white space-y-5 max-w-3xl">
      <div>
        <h2 class="text-sm font-extrabold text-asn-ink-900">Hero Section Homepage</h2>
        <p class="text-xs text-asn-ink-900/60">Teks utama yang tampil di atas lipatan layar pertama kali pengunjung membuka website.</p>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <label for="hero-headline-input" class="block font-bold text-asn-ink-900/70 mb-1">Headline Utama</label>
          <input
            id="hero-headline-input"
            type="text"
            bind:value={heroForm.headline}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 text-sm font-bold text-asn-ink-900"
          />
        </div>

        <div>
          <label for="hero-subheadline-input" class="block font-bold text-asn-ink-900/70 mb-1">Subheadline / Penjelas</label>
          <textarea
            id="hero-subheadline-input"
            rows="3"
            bind:value={heroForm.subheadline}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
          ></textarea>
        </div>

        <div>
          <span class="block font-bold text-asn-ink-900/70 mb-1">Pill Badges Kepercayaan</span>
          <div class="flex flex-wrap gap-2 mb-2">
            {#each heroForm.badges as badge, i}
              <div class="flex items-center gap-1.5 bg-asn-blue-500/10 text-asn-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                <span>{badge}</span>
                <button type="button" onclick={() => removeBadge(i)} class="hover:text-asn-blue-900 text-xs font-extrabold cursor-pointer">✕</button>
              </div>
            {/each}
          </div>

          <div class="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Badge baru (misal: 100% Fiber Optic)..."
              bind:value={newBadge}
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addBadge())}
              class="flex-1 rounded-lg border border-asn-silver-400 px-3 py-1.5 text-xs"
            />
            <button type="button" onclick={addBadge} class="glossy rounded-lg px-3 py-1.5 font-bold cursor-pointer">
              + Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === 'value_props'}
    <!-- Value Props Editor -->
    <div class="space-y-4 max-w-3xl">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-extrabold text-asn-ink-900">3 Kartu Nilai Keunggulan (Value Props Strip)</h2>
          <p class="text-xs text-asn-ink-900/60">Tampil tepat di bawah hero 3D untuk menyoroti keunggulan utama layanan.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        {#each valuePropsForm.items as item, i}
          <div class="card p-5 bg-white space-y-3">
            <div class="flex items-center justify-between border-b border-asn-silver-400/30 pb-2">
              <span class="font-extrabold text-xs text-asn-blue-700">Kartu #{i + 1}</span>
              <span class="text-[11px] font-mono text-asn-silver-600">Icon: {item.icon}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label for="vp-icon-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Tipe Ikon 3D</label>
                <select id="vp-icon-input-{i}" bind:value={item.icon} class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 bg-white">
                  <option value="modem">Modem (WiFi)</option>
                  <option value="fiber">Fiber (Kabel Optik)</option>
                  <option value="infinity">Infinity (Tanpa Batas)</option>
                  <option value="gauge">Gauge (Speedometer)</option>
                  <option value="tv">TV / Streaming</option>
                  <option value="mesh">Mesh AP</option>
                  <option value="building">Gedung / Bisnis</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="vp-title-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Judul Keunggulan</label>
                <input
                  id="vp-title-input-{i}"
                  type="text"
                  bind:value={item.title}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 font-bold"
                />
              </div>
            </div>

            <div>
              <label for="vp-desc-input-{i}" class="block text-xs font-bold text-asn-ink-900/70 mb-1">Deskripsi Singkat</label>
              <textarea
                id="vp-desc-input-{i}"
                rows="2"
                bind:value={item.desc}
                class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 text-xs"
              ></textarea>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'faqs'}
    <!-- FAQ Editor -->
    <div class="space-y-4 max-w-3xl">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-extrabold text-asn-ink-900">Daftar Tanya Jawab (FAQ)</h2>
          <p class="text-xs text-asn-ink-900/60">Tampil di bagian FAQ teaser homepage serta halaman pusat bantuan.</p>
        </div>

        <button onclick={addFaq} class="glossy rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer">
          + Tambah Tanya Jawab
        </button>
      </div>

      <div class="space-y-3">
        {#each faqsForm.items as faq, i}
          <div class="card p-4 bg-white space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-asn-ink-900/50">Pertanyaan #{i + 1}</span>
              <button onclick={() => removeFaq(i)} class="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer">Hapus</button>
            </div>

            <div class="text-xs space-y-2">
              <div>
                <label for="faq-q-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Pertanyaan</label>
                <input
                  id="faq-q-input-{i}"
                  type="text"
                  bind:value={faq.q}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label for="faq-a-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Jawaban</label>
                <textarea
                  id="faq-a-input-{i}"
                  rows="3"
                  bind:value={faq.a}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
                ></textarea>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'stats'}
    <!-- Stats Editor -->
    <div class="space-y-4 max-w-3xl">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-extrabold text-asn-ink-900">Metrik & Statistik Kredibilitas</h2>
          <p class="text-xs text-asn-ink-900/60">Angka pencapaian ASN.NET yang ditampilkan di section statistik.</p>
        </div>

        <button onclick={addStat} class="glossy rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer">
          + Tambah Metrik
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each statsForm.items as stat, i}
          <div class="card p-4 bg-white space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-asn-ink-900/50">Stat #{i + 1}</span>
              <button onclick={() => removeStat(i)} class="text-rose-600 hover:text-rose-800 font-bold cursor-pointer">Hapus</button>
            </div>
            <div>
              <label for="stat-val-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Nilai Angka / Huruf</label>
              <input
                id="stat-val-input-{i}"
                type="text"
                placeholder="e.g. 99,9%"
                bind:value={stat.value}
                class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 font-black text-base text-asn-blue-600"
              />
            </div>
            <div>
              <label for="stat-lbl-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Keterangan / Label</label>
              <input
                id="stat-lbl-input-{i}"
                type="text"
                placeholder="e.g. Uptime jaringan bulanan"
                bind:value={stat.label}
                class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
              />
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if activeTab === 'branches'}
    <!-- Branches Editor -->
    <div class="space-y-4 max-w-3xl">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-extrabold text-asn-ink-900">Daftar Kantor Cabang</h2>
          <p class="text-xs text-asn-ink-900/60">Informasi alamat, nomor telepon, dan WhatsApp per cabang yang ditampilkan di footer & halaman kontak.</p>
        </div>

        <button onclick={addBranch} class="glossy rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer">
          + Tambah Cabang
        </button>
      </div>

      <div class="space-y-4">
        {#each branchesForm.items as branch, i}
          <div class="card p-5 bg-white space-y-3 text-xs">
            <div class="flex items-center justify-between border-b border-asn-silver-400/30 pb-2">
              <span class="font-extrabold text-asn-blue-700">Cabang #{i + 1}</span>
              <button onclick={() => removeBranch(i)} class="text-rose-600 hover:text-rose-800 font-bold cursor-pointer">Hapus</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="branch-city-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Kota / Wilayah</label>
                <input
                  id="branch-city-input-{i}"
                  type="text"
                  placeholder="e.g. Kota Bekasi"
                  bind:value={branch.city}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label for="branch-name-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Nama Kantor</label>
                <input
                  id="branch-name-input-{i}"
                  type="text"
                  placeholder="e.g. Kantor Cabang Bekasi"
                  bind:value={branch.name}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 font-bold"
                />
              </div>
            </div>

            <div>
              <label for="branch-addr-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">Alamat Lengkap</label>
              <textarea
                id="branch-addr-input-{i}"
                rows="2"
                placeholder="Jl..."
                bind:value={branch.address}
                class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="branch-phone-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">No. Telepon</label>
                <input
                  id="branch-phone-input-{i}"
                  type="text"
                  placeholder="021-..."
                  bind:value={branch.phone}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
                />
              </div>
              <div>
                <label for="branch-wa-input-{i}" class="block font-bold text-asn-ink-900/70 mb-1">WhatsApp</label>
                <input
                  id="branch-wa-input-{i}"
                  type="text"
                  placeholder="+628..."
                  bind:value={branch.whatsapp}
                  class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
