<script lang="ts">
  import { slide } from 'svelte/transition'
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import { WA_NUMBER } from '$lib/data/home'
  import type { FaqCategory, FaqItem } from '$lib/data/faqs'

  let { data } = $props<{ data: { faqs: FaqItem[] } }>()

  let activeCategory = $state<FaqCategory>('all')
  let searchQuery = $state('')
  let openIndex = $state<number | null>(null)

  function toggleAccordion(index: number) {
    openIndex = openIndex === index ? null : index
  }

  function setCategory(cat: FaqCategory) {
    activeCategory = cat
    openIndex = null
  }

  let filteredFaqs = $derived(
    data.faqs.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false
      }
      // Search filter
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    })
  )

  // Category counts
  let allCount = $derived(data.faqs.length)
  let pemasanganCount = $derived(data.faqs.filter((f) => f.category === 'pemasangan').length)
  let paketCount = $derived(data.faqs.filter((f) => f.category === 'paket').length)
  let teknisCount = $derived(data.faqs.filter((f) => f.category === 'teknis').length)
  let cakupanCount = $derived(data.faqs.filter((f) => f.category === 'cakupan').length)

  // JSON-LD Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://asn.net.id/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: 'https://asn.net.id/faq'
      }
    ]
  }

  let faqPageJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  })
</script>

<svelte:head>
  <title>Pusat Bantuan & Pertanyaan Umum (FAQ) — ASN.NET</title>
  <meta
    name="description"
    content="Temukan jawaban lengkap seputar pemasangan internet fiber optik ASN.NET, paket unlimited tanpa FUP, pembayaran, WiFi, dan jangkauan area."
  />
  <link rel="canonical" href="https://asn.net.id/faq" />
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqPageJsonLd)}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col bg-asn-silver-100/40 text-asn-ink-900 font-sans selection:bg-asn-blue-500 selection:text-white">
  <SiteHeader />

  <main class="flex-grow pt-24 pb-16">
    <!-- Breadcrumbs -->
    <nav class="mx-auto max-w-4xl px-5 py-3 text-xs text-asn-ink-900/60" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2">
        <li>
          <a href="/" class="hover:text-asn-blue-700 transition">Beranda</a>
        </li>
        <li class="text-asn-silver-400">/</li>
        <li class="font-semibold text-asn-ink-900" aria-current="page">FAQ</li>
      </ol>
    </nav>

    <!-- Hero Header -->
    <section class="mx-auto max-w-4xl px-5 pt-4 pb-8 text-center">
      <div class="inline-flex items-center gap-2 rounded-full bg-asn-blue-500/10 px-3.5 py-1 text-xs font-bold text-asn-blue-700 mb-4 border border-asn-blue-500/20">
        Pusat Bantuan & Tanya Jawab
      </div>

      <h1 class="text-3xl sm:text-5xl font-black text-asn-ink-900 tracking-tight max-w-2xl mx-auto leading-tight mb-3">
        Pertanyaan yang Sering Diajukan
      </h1>

      <p class="text-xs sm:text-sm text-asn-ink-900/70 max-w-xl mx-auto leading-relaxed mb-8">
        Temukan informasi lengkap mengenai layanan fiber optik ASN.NET, keunggulan tanpa FUP, metode pembayaran, hingga panduan teknis jaringan.
      </p>

      <!-- Live Search Box -->
      <div class="max-w-xl mx-auto relative mb-8">
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Cari pertanyaan atau kata kunci (cth: FUP, modem, tagihan, ruko)..."
          class="w-full rounded-full border border-asn-silver-400/60 bg-white px-5 py-3.5 pl-12 text-sm text-asn-ink-900 shadow-xs focus:border-asn-blue-500 focus:outline-none focus:ring-2 focus:ring-asn-blue-500/20 transition"
        />
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-asn-ink-900/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-asn-ink-900/40 hover:text-asn-ink-900"
          >
            Reset
          </button>
        {/if}
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Kategori FAQ">
        <button
          type="button"
          onclick={() => setCategory('all')}
          class="rounded-full px-4 py-2 text-xs font-bold transition {activeCategory === 'all' ? 'bg-asn-blue-700 text-white shadow-xs' : 'bg-white text-asn-ink-900/70 hover:bg-asn-silver-200/60 border border-asn-silver-400/30'}"
        >
          Semua ({allCount})
        </button>
        <button
          type="button"
          onclick={() => setCategory('pemasangan')}
          class="rounded-full px-4 py-2 text-xs font-bold transition {activeCategory === 'pemasangan' ? 'bg-asn-blue-700 text-white shadow-xs' : 'bg-white text-asn-ink-900/70 hover:bg-asn-silver-200/60 border border-asn-silver-400/30'}"
        >
          Pemasangan & Aktivasi ({pemasanganCount})
        </button>
        <button
          type="button"
          onclick={() => setCategory('paket')}
          class="rounded-full px-4 py-2 text-xs font-bold transition {activeCategory === 'paket' ? 'bg-asn-blue-700 text-white shadow-xs' : 'bg-white text-asn-ink-900/70 hover:bg-asn-silver-200/60 border border-asn-silver-400/30'}"
        >
          Paket & Tagihan ({paketCount})
        </button>
        <button
          type="button"
          onclick={() => setCategory('teknis')}
          class="rounded-full px-4 py-2 text-xs font-bold transition {activeCategory === 'teknis' ? 'bg-asn-blue-700 text-white shadow-xs' : 'bg-white text-asn-ink-900/70 hover:bg-asn-silver-200/60 border border-asn-silver-400/30'}"
        >
          Teknis & WiFi ({teknisCount})
        </button>
        <button
          type="button"
          onclick={() => setCategory('cakupan')}
          class="rounded-full px-4 py-2 text-xs font-bold transition {activeCategory === 'cakupan' ? 'bg-asn-blue-700 text-white shadow-xs' : 'bg-white text-asn-ink-900/70 hover:bg-asn-silver-200/60 border border-asn-silver-400/30'}"
        >
          Cakupan & Jangkauan ({cakupanCount})
        </button>
      </div>
    </section>

    <!-- FAQ Accordion Section -->
    <section class="mx-auto max-w-4xl px-5 py-4">
      {#if filteredFaqs.length === 0}
        <div class="card p-10 bg-white text-center max-w-md mx-auto border border-asn-silver-400/30 shadow-xs">
          <div class="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-base font-bold text-asn-ink-900 mb-1">Pertanyaan Tidak Ditemukan</h2>
          <p class="text-xs text-asn-ink-900/60 mb-5">
            Tidak ada jawaban yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              onclick={() => { searchQuery = ''; activeCategory = 'all' }}
              class="glossy rounded-full px-4 py-2 text-xs font-bold"
            >
              Hapus Filter
            </button>
            <a
              href="https://wa.me/{WA_NUMBER}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary rounded-full px-4 py-2 text-xs font-bold"
            >
              Tanya CS via WhatsApp
            </a>
          </div>
        </div>
      {:else}
        <div class="space-y-3">
          {#each filteredFaqs as item, i (item.id)}
            <div class="card bg-white border border-asn-silver-400/30 rounded-2xl overflow-hidden shadow-xs hover:border-asn-blue-500/30 transition">
              <button
                type="button"
                onclick={() => toggleAccordion(i)}
                class="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 font-bold text-sm sm:text-base text-asn-ink-900 hover:text-asn-blue-700 transition"
                aria-expanded={openIndex === i}
              >
                <div>
                  <span class="inline-block rounded-md bg-asn-blue-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-asn-blue-700 mb-1.5">
                    {item.categoryLabel}
                  </span>
                  <div class="leading-snug">{item.q}</div>
                </div>
                <svg
                  class="h-5 w-5 shrink-0 transition-transform duration-200 mt-1 {openIndex === i ? 'rotate-180 text-asn-blue-700' : 'text-asn-ink-900/40'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {#if openIndex === i}
                <div class="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-asn-ink-900/70 leading-relaxed border-t border-asn-silver-400/20" transition:slide={{ duration: 200 }}>
                  <p>{item.a}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Still Have Questions Banner -->
    <section class="mx-auto max-w-4xl px-5 pt-12">
      <div class="card p-8 sm:p-10 bg-gradient-to-r from-asn-blue-900 to-asn-blue-800 text-white rounded-3xl relative overflow-hidden shadow-lg">
        <div class="relative z-10 max-w-xl">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-asn-blue-200 mb-3 backdrop-blur-xs">
            Bantuan Pelanggan 24/7
          </span>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Masih Memiliki Pertanyaan Lain?
          </h2>
          <p class="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
            Tim Customer Support ASN.NET siap menjawab pertanyaan Anda seputar jangkauan jaringan, paket fiber, maupun panduan aktivasi secara langsung.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/{WA_NUMBER}"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-asn-blue-900 hover:bg-asn-silver-100 transition shadow-sm inline-flex items-center gap-2"
            >
              <span>💬</span> Hubungi CS via WhatsApp
            </a>
            <a
              href="/daftar"
              class="rounded-full border border-white/30 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              Daftar Langganan Sekarang
            </a>
          </div>
        </div>

        <div class="absolute -right-8 -bottom-10 h-64 w-64 rounded-full bg-asn-blue-500/20 blur-3xl pointer-events-none"></div>
      </div>
    </section>
  </main>

  <SiteFooter />
</div>
