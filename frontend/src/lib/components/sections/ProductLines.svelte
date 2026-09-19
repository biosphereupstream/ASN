<script lang="ts">
  import { PRODUCTS } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
  import MetallicIcon from '../MetallicIcon.svelte'
  import SectionHead from './SectionHead.svelte'
  import TiltCard from '../TiltCard.svelte'
</script>

<!-- PRD §6.2 #3 — product lines preview with 3D tilt cards -->
<section class="mx-auto w-full max-w-6xl content-w px-5 py-16">
  <SectionHead
    eyebrow="Layanan"
    title="Satu jaringan, empat solusi"
    lede="Dari internet rumah sampai koneksi kantor — semuanya lewat serat optik murni."
  />
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each PRODUCTS as p, i}
      <div use:reveal={{ delay: i * 80 }}>
        <TiltCard>
          <a href={`/layanan/${p.slug}`} class="glossy block h-full rounded-2xl p-6">
            <MetallicIcon name={p.icon} floatDelay={i * 0.7} />
            <h3 class="mt-4 text-base font-extrabold">{p.name}</h3>
            <p class="mt-1.5 text-sm text-asn-ink-900/60">{p.tagline}</p>
            <span class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-asn-blue-700">
              Lihat detail
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </TiltCard>
      </div>
    {/each}
  </div>
</section>
