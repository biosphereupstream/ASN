<script lang="ts">
  /**
   * Public lead capture (PRD FR-4): /daftar with URL prefill.
   * Deep links: /daftar?package=fiber-100&city=bekasi&district=bekasi-timur&source=package_card
   */
  import { page } from '$app/state'
  import LeadForm, { type Prefill } from '$lib/components/LeadForm.svelte'

  let prefill = $derived<Prefill>({
    package: page.url.searchParams.get('package') ?? undefined,
    city: page.url.searchParams.get('city') ?? undefined,
    district: page.url.searchParams.get('district') ?? undefined,
    source: page.url.searchParams.get('source') ?? undefined
  })
</script>

<svelte:head>
  <title>Daftar ASN.NET — Pemasangan Internet Fiber Rumah</title>
  <meta
    name="description"
    content="Daftar pemasangan ASN.NET: internet fiber super cepat untuk rumah dan bisnis. Isi formulir, tim kami menghubungi maksimal 1×24 jam kerja."
  />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
</svelte:head>

<main class="relative min-h-screen overflow-x-clip bg-white">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute -top-40 left-[-10%] h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
    style="background: radial-gradient(circle, rgba(125, 211, 252, 0.35), transparent 70%)"
  ></div>

  <section class="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-14">
    <nav class="mb-8 flex items-center justify-between" aria-label="Navigasi">
      <a href="/" class="flex items-center gap-2 text-sm font-bold text-asn-ink-900/70 transition hover:text-asn-blue-700">
        ← Beranda
      </a>
      <a
        href="https://wa.me/622150919981"
        class="glossy rounded-full px-4 py-2 text-sm font-bold text-asn-blue-700 transition hover:border-asn-blue-500/60"
      >
        Butuh bantuan? WhatsApp
      </a>
    </nav>

    <LeadForm {prefill} />
  </section>
</main>
