<script lang="ts">
  import { onMount } from 'svelte'

  interface Product {
    id: number
    key: string
    name: string
    tagline: string
    isActive: boolean
  }

  interface PackageRow {
    id: number
    productId: number
    productKey: string
    productName: string
    slug: string
    name: string
    speedMbps: number
    basePriceIdr: number
    devicesMin: number
    devicesMax: number
    features: string[]
    sortOrder: number
    isActive: boolean
  }

  interface OverrideRow {
    id: number
    packageId: number
    cityId: number
    districtId: number | null
    priceIdr: number
    isActive: boolean
  }

  interface City {
    id: number
    name: string
    slug: string
    districts: { id: number; name: string }[]
  }

  let activeTab = $state<'packages' | 'prices'>('packages')
  let packagesList = $state<PackageRow[]>([])
  let productsList = $state<Product[]>([])
  let overridesList = $state<OverrideRow[]>([])
  let citiesList = $state<City[]>([])

  let loading = $state(true)
  let saving = $state(false)
  let errorMsg = $state<string | null>(null)
  let successMsg = $state<string | null>(null)

  // Package filter
  let selectedProductFilter = $state<string>('all')

  // Create / Edit modal state
  let showModal = $state(false)
  let editingPackageId = $state<number | null>(null)
  let formProductId = $state<number>(1)
  let formName = $state('')
  let formSlug = $state('')
  let formSpeed = $state(100)
  let formBasePrice = $state(299000)
  let formDevMin = $state(5)
  let formDevMax = $state(10)
  let formFeatures = $state<string[]>(['Unlimited tanpa FUP', 'Gratis instalasi & modem'])
  let formNewFeature = $state('')
  let formIsActive = $state(true)

  // Price override form state
  let priceFormPkgId = $state<number | null>(null)
  let priceFormCityId = $state<number | null>(null)
  let priceFormDistrictId = $state<number | null>(null)
  let priceFormPriceIdr = $state<number>(299000)

  function formatIdr(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
  }

  const filteredPackages = $derived(
    selectedProductFilter === 'all'
      ? packagesList
      : packagesList.filter((p) => p.productKey === selectedProductFilter)
  )

  const selectedPriceCity = $derived(citiesList.find((c) => c.id === priceFormCityId))

  async function loadData() {
    loading = true
    errorMsg = null
    try {
      const [pkgRes, priceRes, covRes] = await Promise.all([
        fetch('/api/admin/packages'),
        fetch('/api/admin/prices'),
        fetch('/api/admin/coverage')
      ])

      if (!pkgRes.ok) throw new Error('Gagal memuat daftar paket')
      const pkgData = await pkgRes.json()
      packagesList = pkgData.packages || []
      productsList = pkgData.products || []

      if (priceRes.ok) {
        const priceData = await priceRes.json()
        overridesList = priceData.overrides || []
      }

      if (covRes.ok) {
        const covData = await covRes.json()
        citiesList = covData.cities || []
      }

      if (packagesList.length > 0 && !priceFormPkgId) {
        priceFormPkgId = packagesList[0].id
      }
      if (citiesList.length > 0 && !priceFormCityId) {
        priceFormCityId = citiesList[0].id
      }
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Terjadi kesalahan saat memuat data'
    } finally {
      loading = false
    }
  }

  function openCreateModal() {
    editingPackageId = null
    formProductId = productsList[0]?.id ?? 1
    formName = ''
    formSlug = ''
    formSpeed = 100
    formBasePrice = 299000
    formDevMin = 5
    formDevMax = 10
    formFeatures = ['Unlimited tanpa FUP', 'Gratis instalasi & modem']
    formNewFeature = ''
    formIsActive = true
    errorMsg = null
    showModal = true
  }

  function openEditModal(pkg: PackageRow) {
    editingPackageId = pkg.id
    formProductId = pkg.productId
    formName = pkg.name
    formSlug = pkg.slug
    formSpeed = pkg.speedMbps
    formBasePrice = pkg.basePriceIdr
    formDevMin = pkg.devicesMin
    formDevMax = pkg.devicesMax
    formFeatures = [...(pkg.features || [])]
    formNewFeature = ''
    formIsActive = pkg.isActive
    errorMsg = null
    showModal = true
  }

  function addFeature() {
    if (!formNewFeature.trim()) return
    formFeatures = [...formFeatures, formNewFeature.trim()]
    formNewFeature = ''
  }

  function removeFeature(index: number) {
    formFeatures = formFeatures.filter((_, i) => i !== index)
  }

  async function savePackage() {
    if (!formName.trim()) {
      errorMsg = 'Nama paket wajib diisi'
      return
    }
    saving = true
    errorMsg = null
    try {
      if (editingPackageId) {
        const res = await fetch(`/api/admin/packages/${editingPackageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: formProductId,
            name: formName.trim(),
            slug: formSlug.trim() || undefined,
            speedMbps: Number(formSpeed),
            basePriceIdr: Number(formBasePrice),
            devicesMin: Number(formDevMin),
            devicesMax: Number(formDevMax),
            features: formFeatures,
            isActive: formIsActive
          })
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error === 'SLUG_EXISTS' ? 'Slug sudah digunakan paket lain' : 'Gagal memperbarui paket')
        }
        successMsg = 'Paket berhasil diperbarui'
      } else {
        const res = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: formProductId,
            name: formName.trim(),
            slug: formSlug.trim() || undefined,
            speedMbps: Number(formSpeed),
            basePriceIdr: Number(formBasePrice),
            devicesMin: Number(formDevMin),
            devicesMax: Number(formDevMax),
            features: formFeatures
          })
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error === 'SLUG_EXISTS' ? 'Slug sudah digunakan paket lain' : 'Gagal membuat paket baru')
        }
        successMsg = 'Paket baru berhasil ditambahkan'
      }
      showModal = false
      await loadData()
      setTimeout(() => (successMsg = null), 4000)
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Gagal menyimpan paket'
    } finally {
      saving = false
    }
  }

  async function toggleActive(pkg: PackageRow) {
    saving = true
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pkg.isActive })
      })
      if (res.ok) {
        pkg.isActive = !pkg.isActive
        successMsg = `Status ${pkg.name} diubah menjadi ${pkg.isActive ? 'Aktif' : 'Non-aktif'}`
        setTimeout(() => (successMsg = null), 3000)
      }
    } finally {
      saving = false
    }
  }

  async function movePackage(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= packagesList.length) return

    const newOrder = [...packagesList]
    const temp = newOrder[index]
    newOrder[index] = newOrder[targetIndex]
    newOrder[targetIndex] = temp

    packagesList = newOrder
    saving = true
    try {
      await fetch('/api/admin/packages/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newOrder.map((p) => p.id) })
      })
      successMsg = 'Urutan paket berhasil diperbarui'
      setTimeout(() => (successMsg = null), 3000)
    } catch {
      await loadData()
    } finally {
      saving = false
    }
  }

  async function savePriceOverride() {
    if (!priceFormPkgId || !priceFormCityId) return
    saving = true
    errorMsg = null
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: priceFormPkgId,
          cityId: priceFormCityId,
          districtId: priceFormDistrictId || undefined,
          priceIdr: Number(priceFormPriceIdr)
        })
      })
      if (!res.ok) throw new Error('Gagal menyimpan harga khusus area')
      successMsg = 'Harga khusus area berhasil disimpan'
      setTimeout(() => (successMsg = null), 4000)
      await loadData()
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Gagal menyimpan harga'
    } finally {
      saving = false
    }
  }

  async function deleteOverride(id: number) {
    if (!confirm('Hapus harga khusus ini dan kembalikan ke harga dasar paket?')) return
    saving = true
    try {
      const res = await fetch(`/api/admin/prices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        overridesList = overridesList.filter((o) => o.id !== id)
        successMsg = 'Harga khusus berhasil dihapus'
        setTimeout(() => (successMsg = null), 3000)
      }
    } finally {
      saving = false
    }
  }

  onMount(() => {
    loadData()
  })
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-black tracking-tight text-asn-ink-900">Katalog Paket & Matriks Harga</h1>
      <p class="text-xs text-asn-ink-900/60 mt-1">Kelola tier paket internet, kecepatan, fitur, dan penyesuaian tarif per wilayah.</p>
    </div>

    {#if activeTab === 'packages'}
      <button
        onclick={openCreateModal}
        class="asn-btn-primary rounded-lg px-4 py-2.5 text-xs font-bold self-start sm:self-auto cursor-pointer flex items-center gap-1.5 shadow-sm"
      >
        <span>+</span> Tambah Paket Baru
      </button>
    {/if}
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

  <!-- Tabs Navigation -->
  <div class="border-b border-asn-silver-400/40 flex items-center gap-2">
    <button
      onclick={() => (activeTab = 'packages')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer {activeTab === 'packages' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      Daftar Paket ({packagesList.length})
    </button>
    <button
      onclick={() => (activeTab = 'prices')}
      class="pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer {activeTab === 'prices' ? 'border-asn-blue-500 text-asn-blue-700' : 'border-transparent text-asn-ink-900/50 hover:text-asn-ink-900'}"
    >
      Matriks Harga Area ({overridesList.length})
    </button>
  </div>

  {#if loading}
    <div class="card p-12 text-center text-xs text-asn-ink-900/50">Memuat data paket dan harga...</div>
  {:else if activeTab === 'packages'}
    <!-- Tab 1: Package List -->
    <div class="space-y-4">
      <!-- Filter bar -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <span class="text-xs font-semibold text-asn-ink-900/50 mr-1">Filter Lini:</span>
        <button
          onclick={() => (selectedProductFilter = 'all')}
          class="rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition {selectedProductFilter === 'all' ? 'bg-asn-blue-500 text-white' : 'bg-white border border-asn-silver-400/50 text-asn-ink-900/70 hover:bg-asn-silver-100'}"
        >
          Semua ({packagesList.length})
        </button>
        {#each productsList as prod}
          {@const count = packagesList.filter((p) => p.productId === prod.id).length}
          <button
            onclick={() => (selectedProductFilter = prod.key)}
            class="rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition {selectedProductFilter === prod.key ? 'bg-asn-blue-500 text-white' : 'bg-white border border-asn-silver-400/50 text-asn-ink-900/70 hover:bg-asn-silver-100'}"
          >
            {prod.name} ({count})
          </button>
        {/each}
      </div>

      <!-- Packages Grid / Table -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredPackages as pkg, index (pkg.id)}
          <div class="card p-5 flex flex-col justify-between transition hover:border-asn-blue-500/40 relative {pkg.isActive ? 'bg-white' : 'bg-asn-silver-100/40 opacity-75'}">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-asn-blue-500/10 text-asn-blue-700">
                  {pkg.productName}
                </span>
                <div class="flex items-center gap-1">
                  <!-- Sort order buttons -->
                  <button
                    disabled={index === 0 || saving}
                    onclick={() => movePackage(index, 'up')}
                    class="p-1 text-xs rounded hover:bg-asn-silver-100 text-asn-ink-900/60 disabled:opacity-30 cursor-pointer"
                    title="Naikkan urutan"
                  >
                    ▲
                  </button>
                  <button
                    disabled={index === packagesList.length - 1 || saving}
                    onclick={() => movePackage(index, 'down')}
                    class="p-1 text-xs rounded hover:bg-asn-silver-100 text-asn-ink-900/60 disabled:opacity-30 cursor-pointer"
                    title="Turunkan urutan"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <div class="flex items-baseline justify-between gap-2">
                <h3 class="text-base font-extrabold text-asn-ink-900">{pkg.name}</h3>
                <span class="text-xs font-black text-asn-blue-600 bg-asn-blue-50 px-2 py-0.5 rounded">
                  {pkg.speedMbps} Mbps
                </span>
              </div>
              <p class="text-[11px] font-mono text-asn-silver-600 mt-0.5">{pkg.slug}</p>

              <div class="mt-3 py-2 border-y border-asn-silver-400/30 flex items-center justify-between">
                <div>
                  <span class="text-lg font-black text-asn-ink-900">{formatIdr(pkg.basePriceIdr)}</span>
                  <span class="text-[11px] text-asn-ink-900/50">/bln</span>
                </div>
                <div class="text-[11px] text-right font-medium text-asn-ink-900/60">
                  {pkg.devicesMin}–{pkg.devicesMax} Perangkat
                </div>
              </div>

              {#if pkg.features && pkg.features.length > 0}
                <ul class="mt-3 space-y-1 text-xs text-asn-ink-900/70">
                  {#each pkg.features as feat}
                    <li class="flex items-center gap-1.5">
                      <span class="text-emerald-500 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>

            <!-- Footer actions -->
            <div class="mt-5 pt-3 border-t border-asn-silver-400/30 flex items-center justify-between gap-2">
              <button
                onclick={() => toggleActive(pkg)}
                disabled={saving}
                class="rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer transition {pkg.isActive ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25' : 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25'}"
              >
                {pkg.isActive ? '● Aktif' : '○ Non-aktif'}
              </button>

              <button
                onclick={() => openEditModal(pkg)}
                class="glossy rounded-lg px-3 py-1.5 text-xs font-bold hover:border-asn-blue-500 cursor-pointer"
              >
                Edit Paket
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Tab 2: Area Price Matrix -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Add / Edit override card -->
      <div class="card p-5 h-fit space-y-4 bg-white">
        <h2 class="text-sm font-extrabold text-asn-ink-900">Set Harga Khusus Area</h2>
        <p class="text-xs text-asn-ink-900/60">Buat penyesuaian tarif untuk wilayah tertentu (misal: promo lokal atau ongkos jaringan khusus).</p>

        <div class="space-y-3 pt-2">
          <div>
            <label for="override-pkg-select" class="block text-xs font-bold text-asn-ink-900/70 mb-1">Pilih Paket</label>
            <select id="override-pkg-select" bind:value={priceFormPkgId} class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 text-xs bg-white">
              {#each packagesList as p}
                <option value={p.id}>{p.name} (Dasar: {formatIdr(p.basePriceIdr)})</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="override-city-select" class="block text-xs font-bold text-asn-ink-900/70 mb-1">Pilih Kota / Kabupaten</label>
            <select id="override-city-select" bind:value={priceFormCityId} class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 text-xs bg-white">
              {#each citiesList as c}
                <option value={c.id}>{c.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="override-dist-select" class="block text-xs font-bold text-asn-ink-900/70 mb-1">Kecamatan (Opsional)</label>
            <select id="override-dist-select" bind:value={priceFormDistrictId} class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 text-xs bg-white">
              <option value={null}>Semua Kecamatan di {selectedPriceCity?.name ?? 'Kota Ini'}</option>
              {#if selectedPriceCity}
                {#each selectedPriceCity.districts as d}
                  <option value={d.id}>{d.name}</option>
                {/each}
              {/if}
            </select>
          </div>

          <div>
            <label for="override-price-input" class="block text-xs font-bold text-asn-ink-900/70 mb-1">Tarif Khusus (IDR / Bulan)</label>
            <input
              id="override-price-input"
              type="number"
              step="5000"
              bind:value={priceFormPriceIdr}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 text-xs bg-white"
            />
          </div>

          <button
            onclick={savePriceOverride}
            disabled={saving}
            class="asn-btn-primary w-full rounded-lg py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 mt-2"
          >
            {saving ? 'Menyimpan...' : 'Simpan Harga Khusus'}
          </button>
        </div>
      </div>

      <!-- Overrides List Table -->
      <div class="card p-5 lg:col-span-2 bg-white space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-extrabold text-asn-ink-900">Daftar Penyesuaian Harga Wilayah</h2>
          <span class="text-xs text-asn-ink-900/50">{overridesList.length} override aktif</span>
        </div>

        {#if overridesList.length === 0}
          <div class="p-8 text-center text-xs text-asn-ink-900/50 bg-asn-silver-100/40 rounded-lg">
            Belum ada harga khusus wilayah yang dikonfigurasi. Semua wilayah menggunakan harga dasar masing-masing paket.
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-asn-silver-400/50 text-[11px] font-bold text-asn-ink-900/50 uppercase">
                <tr>
                  <th class="py-2.5 px-3">Paket</th>
                  <th class="py-2.5 px-3">Kota</th>
                  <th class="py-2.5 px-3">Kecamatan</th>
                  <th class="py-2.5 px-3">Tarif Khusus</th>
                  <th class="py-2.5 px-3">Harga Dasar</th>
                  <th class="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-asn-silver-400/30">
                {#each overridesList as ov (ov.id)}
                  {@const pkg = packagesList.find((p) => p.id === ov.packageId)}
                  {@const city = citiesList.find((c) => c.id === ov.cityId)}
                  {@const dist = city?.districts.find((d) => d.id === ov.districtId)}
                  <tr class="hover:bg-asn-silver-100/30">
                    <td class="py-3 px-3 font-bold text-asn-ink-900">{pkg?.name ?? `Paket #${ov.packageId}`}</td>
                    <td class="py-3 px-3">{city?.name ?? `Kota #${ov.cityId}`}</td>
                    <td class="py-3 px-3">
                      {#if dist}
                        <span class="font-semibold text-asn-ink-900">{dist.name}</span>
                      {:else}
                        <span class="italic text-asn-ink-900/40">Semua kecamatan</span>
                      {/if}
                    </td>
                    <td class="py-3 px-3 font-black text-asn-blue-600">{formatIdr(ov.priceIdr)}</td>
                    <td class="py-3 px-3 text-asn-ink-900/60">{pkg ? formatIdr(pkg.basePriceIdr) : '—'}</td>
                    <td class="py-3 px-3 text-right">
                      <button
                        onclick={() => deleteOverride(ov.id)}
                        disabled={saving}
                        class="text-rose-600 hover:text-rose-800 font-bold text-xs p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Hapus dan kembalikan ke harga dasar"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Create / Edit Package Modal -->
{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asn-ink-900/60 backdrop-blur-xs">
    <div class="card bg-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
      <div class="flex items-center justify-between border-b border-asn-silver-400/40 pb-3">
        <h2 class="text-base font-black text-asn-ink-900">
          {editingPackageId ? 'Edit Paket Internet' : 'Tambah Paket Internet Baru'}
        </h2>
        <button onclick={() => (showModal = false)} class="text-asn-ink-900/50 hover:text-asn-ink-900 text-sm font-bold">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label for="modal-prod-select" class="block font-bold text-asn-ink-900/70 mb-1">Lini Produk</label>
          <select id="modal-prod-select" bind:value={formProductId} class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 bg-white">
            {#each productsList as prod}
              <option value={prod.id}>{prod.name} ({prod.key})</option>
            {/each}
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="modal-pkg-name" class="block font-bold text-asn-ink-900/70 mb-1">Nama Paket</label>
            <input
              id="modal-pkg-name"
              type="text"
              placeholder="e.g. ASN.NET Fiber 100"
              bind:value={formName}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
            />
          </div>
          <div>
            <label for="modal-pkg-slug" class="block font-bold text-asn-ink-900/70 mb-1">Slug (Opsional)</label>
            <input
              id="modal-pkg-slug"
              type="text"
              placeholder="e.g. fiber-100"
              bind:value={formSlug}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="modal-pkg-speed" class="block font-bold text-asn-ink-900/70 mb-1">Kecepatan (Mbps)</label>
            <input
              id="modal-pkg-speed"
              type="number"
              min="1"
              bind:value={formSpeed}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
            />
          </div>
          <div>
            <label for="modal-pkg-price" class="block font-bold text-asn-ink-900/70 mb-1">Harga Dasar (IDR / Bulan)</label>
            <input
              id="modal-pkg-price"
              type="number"
              step="5000"
              min="0"
              bind:value={formBasePrice}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="modal-pkg-devmin" class="block font-bold text-asn-ink-900/70 mb-1">Min. Perangkat</label>
            <input
              id="modal-pkg-devmin"
              type="number"
              min="1"
              bind:value={formDevMin}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
            />
          </div>
          <div>
            <label for="modal-pkg-devmax" class="block font-bold text-asn-ink-900/70 mb-1">Maks. Perangkat</label>
            <input
              id="modal-pkg-devmax"
              type="number"
              min="1"
              bind:value={formDevMax}
              class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
            />
          </div>
        </div>

        <!-- Features list -->
        <div>
          <span class="block font-bold text-asn-ink-900/70 mb-1">Daftar Fitur / Benefit</span>
          <div class="space-y-1.5 mb-2">
            {#each formFeatures as feat, i}
              <div class="flex items-center gap-2 bg-asn-silver-100/50 p-1.5 rounded">
                <span class="text-emerald-500 font-bold text-xs">✓</span>
                <span class="text-xs flex-1">{feat}</span>
                <button
                  type="button"
                  onclick={() => removeFeature(i)}
                  class="text-rose-500 hover:text-rose-700 font-bold px-1.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>

          <div class="flex gap-2">
            <input
              type="text"
              placeholder="Tambahkan poin fitur..."
              bind:value={formNewFeature}
              onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              class="flex-1 rounded-lg border border-asn-silver-400 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onclick={addFeature}
              class="glossy rounded-lg px-3 py-1.5 font-bold cursor-pointer"
            >
              + Tambah
            </button>
          </div>
        </div>

        {#if editingPackageId}
          <div class="pt-1">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-asn-ink-900/80">
              <input type="checkbox" bind:checked={formIsActive} class="rounded" />
              <span>Paket ini aktif dan dapat dipilih publik</span>
            </label>
          </div>
        {/if}
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-asn-silver-400/40 pt-4">
        <button
          onclick={() => (showModal = false)}
          class="glossy rounded-lg px-4 py-2 text-xs font-bold cursor-pointer"
        >
          Batal
        </button>
        <button
          onclick={savePackage}
          disabled={saving}
          class="asn-btn-primary rounded-lg px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Paket'}
        </button>
      </div>
    </div>
  </div>
{/if}
