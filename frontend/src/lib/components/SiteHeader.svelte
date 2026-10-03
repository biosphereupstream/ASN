<script lang="ts">
  import AsnLogo from './AsnLogo.svelte'
  import NavDrawer from './NavDrawer.svelte'

  let { active = '' }: { active?: string } = $props()
  let menuOpen = $state(false)
</script>

<header class="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
  <a href="/" class="flex items-center gap-2.5">
    <AsnLogo size={38} />
    <span class="flex flex-col leading-none">
      <span class="text-lg font-extrabold tracking-tight">ASN<span class="text-asn-blue-500">.</span>NET</span>
      <span class="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-asn-silver-600 uppercase">Smart Service, Strong Network</span>
    </span>
  </a>

  <nav class="hidden items-center gap-7 text-sm font-medium text-asn-ink-900/70 lg:flex">
    <a class="transition hover:text-asn-blue-700 {active === 'layanan' ? 'text-asn-blue-700 font-bold' : ''}" href="/layanan">Layanan</a>
    <a class="transition hover:text-asn-blue-700 {active === 'paket' ? 'text-asn-blue-700 font-bold' : ''}" href="/paket">Paket</a>
    <a class="transition hover:text-asn-blue-700 {active === 'city' ? 'text-asn-blue-700 font-bold' : ''}" href="/city">Cakupan Kota</a>
    <a class="transition hover:text-asn-blue-700 {active === 'promo' ? 'text-asn-blue-700 font-bold' : ''}" href="/promo">Promo</a>
    <a class="transition hover:text-asn-blue-700 {active === 'kontak' ? 'text-asn-blue-700 font-bold' : ''}" href="/kontak">Kontak</a>
  </nav>

  <div class="flex items-center gap-3">
    <a href="/daftar" class="btn-primary hidden rounded-full px-5 py-2.5 text-sm font-bold sm:inline-flex shadow-xs">
      Langganan Sekarang
    </a>
    <button
      class="grid h-11 w-11 place-items-center rounded-xl glossy lg:hidden cursor-pointer"
      aria-label="Buka menu"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = true)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  </div>
</header>

<NavDrawer bind:open={menuOpen} />
