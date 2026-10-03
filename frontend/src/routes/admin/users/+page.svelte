<script lang="ts">
  import { onMount } from 'svelte'

  interface AdminUser {
    id: number
    email: string
    name: string
    role: 'admin' | 'marketing' | 'sales' | 'noc'
    isActive: boolean
    lastLoginAt: string | null
  }

  let { data } = $props<{ data: { actor: { id: number; email: string; name: string; role: string } } }>()

  let usersList = $state<AdminUser[]>([])
  let loading = $state(true)
  let saving = $state(false)
  let errorMsg = $state<string | null>(null)
  let successMsg = $state<string | null>(null)

  // Create User Modal
  let showCreateModal = $state(false)
  let newName = $state('')
  let newEmail = $state('')
  let newRole = $state<'admin' | 'marketing' | 'sales' | 'noc'>('marketing')
  let newPassword = $state('')

  // Edit User Modal
  let showEditModal = $state(false)
  let editingUser = $state<AdminUser | null>(null)
  let editName = $state('')
  let editRole = $state<'admin' | 'marketing' | 'sales' | 'noc'>('marketing')
  let editIsActive = $state(true)

  // Reset Password Modal
  let showResetModal = $state(false)
  let resetUser = $state<AdminUser | null>(null)
  let resetPassword = $state('')

  const roleBadgeStyle = {
    admin: 'bg-asn-blue-500/15 text-asn-blue-700',
    marketing: 'bg-purple-500/10 text-purple-700',
    sales: 'bg-emerald-500/10 text-emerald-700',
    noc: 'bg-amber-500/10 text-amber-700'
  } as const

  async function loadUsers() {
    loading = true
    errorMsg = null
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Gagal memuat daftar pengguna admin')
      const body = await res.json()
      usersList = body.users || []
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Terjadi kesalahan'
    } finally {
      loading = false
    }
  }

  function openCreate() {
    newName = ''
    newEmail = ''
    newRole = 'marketing'
    newPassword = ''
    errorMsg = null
    showCreateModal = true
  }

  function openEdit(user: AdminUser) {
    editingUser = user
    editName = user.name
    editRole = user.role
    editIsActive = user.isActive
    errorMsg = null
    showEditModal = true
  }

  function openReset(user: AdminUser) {
    resetUser = user
    resetPassword = ''
    errorMsg = null
    showResetModal = true
  }

  async function handleCreate() {
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      errorMsg = 'Semua field wajib diisi'
      return
    }
    saving = true
    errorMsg = null
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          password: newPassword
        })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (body.error === 'EMAIL_EXISTS') throw new Error('Email tersebut sudah terdaftar')
        throw new Error('Gagal membuat pengguna baru')
      }
      successMsg = `Pengguna ${newName} (${newRole}) berhasil dibuat`
      showCreateModal = false
      await loadUsers()
      setTimeout(() => (successMsg = null), 4000)
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Gagal membuat pengguna'
    } finally {
      saving = false
    }
  }

  async function handleUpdate() {
    if (!editingUser) return
    saving = true
    errorMsg = null
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          role: editRole,
          isActive: editIsActive
        })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (body.error === 'CANNOT_DEACTIVATE_SELF') throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri')
        if (body.error === 'CANNOT_DEMOTE_SELF') throw new Error('Anda tidak dapat mengubah peran admin Anda sendiri')
        throw new Error('Gagal memperbarui pengguna')
      }
      successMsg = `Pengguna ${editName} berhasil diperbarui`
      showEditModal = false
      await loadUsers()
      setTimeout(() => (successMsg = null), 4000)
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Gagal memperbarui pengguna'
    } finally {
      saving = false
    }
  }

  async function handleResetPassword() {
    if (!resetUser || !resetPassword) {
      errorMsg = 'Password baru wajib diisi'
      return
    }
    if (resetPassword.length < 6) {
      errorMsg = 'Password minimal 6 karakter'
      return
    }
    saving = true
    errorMsg = null
    try {
      const res = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword })
      })
      if (!res.ok) throw new Error('Gagal mereset password')
      successMsg = `Password untuk ${resetUser.name} berhasil diubah`
      showResetModal = false
      setTimeout(() => (successMsg = null), 4000)
    } catch (err: unknown) {
      errorMsg = (err as Error).message || 'Gagal mereset password'
    } finally {
      saving = false
    }
  }

  onMount(() => {
    loadUsers()
  })
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-black tracking-tight text-asn-ink-900">Manajemen Pengguna Admin</h1>
      <p class="text-xs text-asn-ink-900/60 mt-1">Kelola staf, hak akses per peran (RBAC), dan kredensial back-office ASN.NET.</p>
    </div>

    <button
      onclick={openCreate}
      class="asn-btn-primary rounded-lg px-4 py-2.5 text-xs font-bold self-start sm:self-auto cursor-pointer flex items-center gap-1.5 shadow-sm"
    >
      <span>+</span> Tambah Pengguna Baru
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

  <!-- Users Table Card -->
  <div class="card p-5 bg-white space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-extrabold text-asn-ink-900">Daftar Akun Back-Office</h2>
      <span class="text-xs text-asn-ink-900/50">{usersList.length} akun terdaftar</span>
    </div>

    {#if loading}
      <div class="p-12 text-center text-xs text-asn-ink-900/50">Memuat daftar pengguna...</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-asn-silver-400/50 text-[11px] font-bold text-asn-ink-900/50 uppercase">
            <tr>
              <th class="py-2.5 px-3">Nama</th>
              <th class="py-2.5 px-3">Email</th>
              <th class="py-2.5 px-3">Peran / Hak Akses</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Login Terakhir</th>
              <th class="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-asn-silver-400/30">
            {#each usersList as u (u.id)}
              {@const isSelf = data.actor?.id === u.id}
              <tr class="hover:bg-asn-silver-100/30 {isSelf ? 'bg-asn-blue-500/5' : ''}">
                <td class="py-3 px-3 font-bold text-asn-ink-900 flex items-center gap-2">
                  <span>{u.name}</span>
                  {#if isSelf}
                    <span class="text-[10px] font-extrabold text-asn-blue-600 bg-asn-blue-100 px-1.5 py-0.2 rounded">Anda</span>
                  {/if}
                </td>
                <td class="py-3 px-3 font-mono text-asn-ink-900/70">{u.email}</td>
                <td class="py-3 px-3">
                  <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide {roleBadgeStyle[u.role]}">
                    {u.role}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-bold {u.isActive ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'}">
                    {u.isActive ? 'Aktif' : 'Non-aktif'}
                  </span>
                </td>
                <td class="py-3 px-3 text-asn-ink-900/50">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('id-ID') : 'Belum pernah login'}
                </td>
                <td class="py-3 px-3 text-right space-x-1">
                  <button
                    onclick={() => openReset(u)}
                    class="glossy rounded px-2.5 py-1 text-[11px] font-bold hover:border-asn-blue-500 cursor-pointer"
                  >
                    Reset Password
                  </button>
                  <button
                    onclick={() => openEdit(u)}
                    class="asn-btn-primary rounded px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                  >
                    Edit
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

<!-- Create User Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asn-ink-900/60 backdrop-blur-xs">
    <div class="card bg-white w-full max-w-md p-6 space-y-4 shadow-xl">
      <div class="flex items-center justify-between border-b border-asn-silver-400/40 pb-3">
        <h2 class="text-base font-black text-asn-ink-900">Tambah Pengguna Baru</h2>
        <button onclick={() => (showCreateModal = false)} class="text-asn-ink-900/50 hover:text-asn-ink-900 text-sm font-bold">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label for="create-name-input" class="block font-bold text-asn-ink-900/70 mb-1">Nama Lengkap</label>
          <input
            id="create-name-input"
            type="text"
            placeholder="e.g. Sinta Dewi"
            bind:value={newName}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
          />
        </div>

        <div>
          <label for="create-email-input" class="block font-bold text-asn-ink-900/70 mb-1">Alamat Email</label>
          <input
            id="create-email-input"
            type="email"
            placeholder="e.g. sinta@asn.net"
            bind:value={newEmail}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
          />
        </div>

        <div>
          <label for="create-role-input" class="block font-bold text-asn-ink-900/70 mb-1">Peran / Hak Akses</label>
          <select id="create-role-input" bind:value={newRole} class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 bg-white">
            <option value="marketing">Marketing (Kelola Paket, Promosi, Konten CMS, Leads)</option>
            <option value="sales">Sales (Kelola Leads & Follow-up)</option>
            <option value="noc">NOC (Kelola Cakupan Wilayah & Permintaan Area)</option>
            <option value="admin">Admin (Akses Penuh Semua Modul & Pengguna)</option>
          </select>
        </div>

        <div>
          <label for="create-pwd-input" class="block font-bold text-asn-ink-900/70 mb-1">Password Sementara</label>
          <input
            id="create-pwd-input"
            type="password"
            placeholder="Minimal 6 karakter"
            bind:value={newPassword}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-asn-silver-400/40 pt-4">
        <button onclick={() => (showCreateModal = false)} class="glossy rounded-lg px-4 py-2 text-xs font-bold cursor-pointer">
          Batal
        </button>
        <button
          onclick={handleCreate}
          disabled={saving}
          class="asn-btn-primary rounded-lg px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Membuat...' : 'Buat Pengguna'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal && editingUser}
  {@const isSelf = data.actor?.id === editingUser.id}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asn-ink-900/60 backdrop-blur-xs">
    <div class="card bg-white w-full max-w-md p-6 space-y-4 shadow-xl">
      <div class="flex items-center justify-between border-b border-asn-silver-400/40 pb-3">
        <h2 class="text-base font-black text-asn-ink-900">Edit Pengguna: {editingUser.email}</h2>
        <button onclick={() => (showEditModal = false)} class="text-asn-ink-900/50 hover:text-asn-ink-900 text-sm font-bold">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label for="edit-name-input" class="block font-bold text-asn-ink-900/70 mb-1">Nama Lengkap</label>
          <input
            id="edit-name-input"
            type="text"
            bind:value={editName}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
          />
        </div>

        <div>
          <label for="edit-role-input" class="block font-bold text-asn-ink-900/70 mb-1">Peran / Hak Akses</label>
          <select
            id="edit-role-input"
            bind:value={editRole}
            disabled={isSelf}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2 bg-white disabled:opacity-50"
          >
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="noc">NOC</option>
            <option value="admin">Admin</option>
          </select>
          {#if isSelf}
            <p class="text-[10px] text-asn-ink-900/50 mt-1">Anda tidak dapat mengubah peran Anda sendiri.</p>
          {/if}
        </div>

        <div class="pt-1">
          <label class="flex items-center gap-2 cursor-pointer font-bold text-asn-ink-900/80 {isSelf ? 'opacity-50 cursor-not-allowed' : ''}">
            <input
              type="checkbox"
              bind:checked={editIsActive}
              disabled={isSelf}
              class="rounded"
            />
            <span>Akun Aktif (Dapat Login ke Back-Office)</span>
          </label>
          {#if isSelf}
            <p class="text-[10px] text-asn-ink-900/50 mt-1">Anda tidak dapat menonaktifkan akun Anda sendiri.</p>
          {/if}
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-asn-silver-400/40 pt-4">
        <button onclick={() => (showEditModal = false)} class="glossy rounded-lg px-4 py-2 text-xs font-bold cursor-pointer">
          Batal
        </button>
        <button
          onclick={handleUpdate}
          disabled={saving}
          class="asn-btn-primary rounded-lg px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Reset Password Modal -->
{#if showResetModal && resetUser}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asn-ink-900/60 backdrop-blur-xs">
    <div class="card bg-white w-full max-w-md p-6 space-y-4 shadow-xl">
      <div class="flex items-center justify-between border-b border-asn-silver-400/40 pb-3">
        <h2 class="text-base font-black text-asn-ink-900">Reset Password: {resetUser.name}</h2>
        <button onclick={() => (showResetModal = false)} class="text-asn-ink-900/50 hover:text-asn-ink-900 text-sm font-bold">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <p class="text-asn-ink-900/70">Masukkan password baru untuk akun <strong>{resetUser.email}</strong>. Sesi aktif pengguna ini akan diakhiri.</p>

        <div>
          <label for="reset-pwd-input" class="block font-bold text-asn-ink-900/70 mb-1">Password Baru</label>
          <input
            id="reset-pwd-input"
            type="password"
            placeholder="Minimal 6 karakter"
            bind:value={resetPassword}
            class="w-full rounded-lg border border-asn-silver-400 px-3 py-2"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-asn-silver-400/40 pt-4">
        <button onclick={() => (showResetModal = false)} class="glossy rounded-lg px-4 py-2 text-xs font-bold cursor-pointer">
          Batal
        </button>
        <button
          onclick={handleResetPassword}
          disabled={saving}
          class="asn-btn-primary rounded-lg px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Mereset...' : 'Ubah Password'}
        </button>
      </div>
    </div>
  </div>
{/if}
