<script lang="ts">
  import { page } from '$app/state'
  import AsnLogo from '$lib/components/AsnLogo.svelte'

  let { data, children } = $props()

  const nav = $derived([
    { href: '/admin/leads', label: 'Leads' },
    { href: '/admin/coverage', label: 'Coverage' },
    { href: '/admin/demand', label: 'Demand' }
  ])

  const roleBadge = {
    admin: 'bg-asn-blue-500/15 text-asn-blue-700',
    marketing: 'bg-purple-500/10 text-purple-700',
    sales: 'bg-emerald-500/10 text-emerald-700',
    noc: 'bg-amber-500/10 text-amber-700'
  } as const
</script>

{#snippet navLink(item)}
  <a
    href={item.href}
    class="rounded-lg px-3 py-2 text-sm font-semibold transition {page.url.pathname.startsWith(item.href) ? 'bg-asn-blue-500/10 text-asn-blue-700' : 'text-asn-ink-900/60 hover:bg-asn-silver-100'}"
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
      <a href="/admin/leads" class="flex items-center gap-2.5">
        <AsnLogo size={32} />
        <span class="flex flex-col leading-none">
          <span class="text-sm font-extrabold tracking-tight">ASN<span class="text-asn-blue-500">.</span>NET Admin</span>
          <span class="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-asn-silver-600 uppercase">Back-office</span>
        </span>
      </a>

      <nav class="flex items-center gap-1">
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
            <button class="glossy rounded-lg px-3 py-2 text-xs font-bold hover:border-asn-blue-500/50" type="submit">Keluar</button>
          </form>
        {/if}
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-5 py-8">
    {@render children()}
  </main>
</div>
