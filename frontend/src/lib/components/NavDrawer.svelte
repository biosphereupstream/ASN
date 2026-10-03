<script lang="ts">
  import { fly } from 'svelte/transition'
  import { WA_NUMBER } from '$lib/data/home'
  import AsnLogo from './AsnLogo.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()

  const links = [
    { href: '/layanan', label: 'Layanan' },
    { href: '/paket', label: 'Paket' },
    { href: '/city', label: 'Cakupan Kota' },
    { href: '/promo', label: 'Promo' },
    { href: '/kontak', label: 'Kontak' }
  ]

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reducedMotion ? 0 : 240

  function close() {
    open = false
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Slide-over navigation drawer (PRD §8: hamburger + drawer < lg, full nav ≥ lg) -->
{#if open}
  <div class="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
    <button
      class="absolute inset-0 h-full w-full cursor-default bg-asn-ink-900/30 backdrop-blur-sm"
      aria-label="Tutup menu"
      onclick={close}
    ></button>
    <nav
      class="absolute top-0 right-0 flex h-full w-72 max-w-[85%] flex-col overflow-y-auto bg-white p-6 shadow-2xl"
      in:fly={{ x: 320, duration }}
      out:fly={{ x: 320, duration: reducedMotion ? 0 : 200 }}
    >
      <div class="mb-4 flex items-center justify-between">
        <span class="flex items-center gap-2">
          <AsnLogo size={30} />
          <span class="text-lg font-extrabold">ASN<span class="text-asn-blue-500">.</span>NET</span>
        </span>
        <button class="grid h-11 w-11 place-items-center rounded-xl glossy" aria-label="Tutup menu" onclick={close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {#each links as l (l.href)}
        <a href={l.href} class="rounded-xl px-4 py-3 text-base font-bold hover:bg-asn-blue-300/15" onclick={close}>
          {l.label}
        </a>
      {/each}
      <div class="mt-auto space-y-2 pt-4">
        <a href="/daftar" class="btn-primary block rounded-xl py-3 text-center text-sm font-bold" onclick={close}>
          Langganan Sekarang
        </a>
        <a href="https://wa.me/{WA_NUMBER}" class="glossy block rounded-xl py-3 text-center text-sm font-bold" onclick={close}>
          Chat WhatsApp
        </a>
      </div>
    </nav>
  </div>
{/if}
