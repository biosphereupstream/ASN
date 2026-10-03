<script lang="ts">
  import { page } from '$app/state'
  import AsnLogo from '$lib/components/AsnLogo.svelte'

  let { data, children } = $props()

  interface NavItem {
    href: string
    label: string
    roles: Array<'admin' | 'marketing' | 'sales' | 'noc'>
  }

  const allNavItems: NavItem[] = [
    { href: '/admin/leads', label: 'Leads', roles: ['admin', 'marketing', 'sales'] },
    { href: '/admin/coverage', label: 'Coverage', roles: ['admin', 'noc'] },
    { href: '/admin/demand', label: 'Demand', roles: ['admin', 'marketing', 'noc'] },
    { href: '/admin/packages', label: 'Paket & Harga', roles: ['admin', 'marketing'] },
    { href: '/admin/content', label: 'Konten CMS', roles: ['admin', 'marketing'] },
    { href: '/admin/users', label: 'Pengguna', roles: ['admin'] }
  ]

  const nav = $derived(
    data.actor
      ? allNavItems.filter((item) => item.roles.includes(data.actor.role))
      : []
  )

  const roleBadge = {
    admin: 'bg-asn-blue-500/15 text-asn-blue-700',
    marketing: 'bg-purple-500/10 text-purple-700',
    sales: 'bg-emerald-500/10 text-emerald-700',
    noc: 'bg-amber-500/10 text-amber-700'
  } as const

  let showDeniedBanner = $state(false)

  $effect(() => {
    if (page.url.searchParams.get('denied') === '1') {
      showDeniedBanner = true
      // Clear param without reload
      const u = new URL(window.location.href)
      u.searchParams.delete('denied')
      window.history.replaceState({}, '', u.toString())
    }
  })
</script>

{#snippet navLink(item: NavItem)}
  <a
    href={item.href}
    class="rounded-lg px-3 py-2 text-sm font-semibold transition {page.url.pathname.startsWith(item.href) ? 'bg-asn-blue-500/10 text-asn-blue-700 font-bold' : 'text-asn-ink-900/60 hover:bg-asn-silver-100 hover:text-asn-ink-900'}"
  >
    {item.label}
  </a>
{/snippet}

<svelte:head>
  <title>Admin — ASN.NET</title>
</svelte:head>

<div class="min-h-screen bg-asn-silver-100/60 text-asn-ink-900">
  <!-- Top bar -->
  <header class="sticky top-0 z-30 border-b border-asn-silver-400/50 bg-white/85 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
      <a href={nav[0]?.href ?? '/admin/leads'} class="flex items-center gap-2.5">
        <AsnLogo size={32} />
        <span class="flex flex-col leading-none">
          <span class="text-sm font-extrabold tracking-tight">ASN<span class="text-asn-blue-500">.</span>NET Admin</span>
          <span class="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-asn-silver-600 uppercase">Back-office</span>
        </span>
      </a>

      <nav class="flex items-center gap-1 overflow-x-auto">
        {#each nav as item (item.href)}
          {@render navLink(item)}
        {/each}
      </nav>

      <div class="flex items-center gap-3">
        {#if data.actor}
          <span class="hidden text-xs text-asn-ink-900/50 sm:inline">{data.actor.email}</span>
          <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide {roleBadge[data.actor.role]}">
            {data.actor.role}
          </span>
          <form method="POST" action="/admin/logout">
            <button class="glossy rounded-lg px-3 py-2 text-xs font-bold hover:border-asn-blue-500/50 cursor-pointer" type="submit">Keluar</button>
          </form>
        {/if}
      </div>
    </div>
  </header>

  {#if showDeniedBanner}
    <div class="bg-amber-500/15 border-b border-amber-500/30 px-5 py-2.5 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-3">
      <span>⚠️ <strong>Akses Terbatas:</strong> Anda dialihkan ke halaman default karena peran Anda tidak memiliki izin untuk halaman tersebut.</span>
      <button onclick={() => showDeniedBanner = false} class="underline text-amber-900 hover:opacity-75 cursor-pointer">Tutup</button>
    </div>
  {/if}

  <main class="mx-auto max-w-6xl px-5 py-8">
    {@render children()}
  </main>
</div>
