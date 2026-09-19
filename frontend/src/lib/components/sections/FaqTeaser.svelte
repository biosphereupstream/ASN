<script lang="ts">
  import { slide } from 'svelte/transition'
  import { FAQS } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
  import SectionHead from './SectionHead.svelte'

  let open = $state<number | null>(0)

  function toggle(i: number) {
    open = open === i ? null : i
  }
</script>

<!-- PRD §6.2 #8 — FAQ teaser (top 4, accordion; full FAQ page ships with FR-6 CMS-lite) -->
<section class="mx-auto w-full max-w-3xl px-5 py-16">
  <SectionHead
    eyebrow="FAQ"
    title="Pertanyaan yang sering ditanyakan"
  />
  <div class="space-y-3">
    {#each FAQS as f, i}
      <div class="glossy overflow-hidden rounded-2xl" use:reveal={{ delay: i * 70 }}>
        <button class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onclick={() => toggle(i)} aria-expanded={open === i}>
          <span class="text-sm font-bold sm:text-base">{f.q}</span>
          <svg
            class="shrink-0 text-asn-blue-500 transition-transform duration-300"
            class:rotate-180={open === i}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {#if open === i}
          <div class="px-5 pb-5" transition:slide={{ duration: 260 }}>
            <p class="text-sm leading-relaxed text-asn-ink-900/65">{f.a}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="mt-6 text-center" use:reveal>
    <a href="/faq" class="text-sm font-bold text-asn-blue-700 underline-offset-4 hover:underline">
      Lihat semua pertanyaan →
    </a>
  </div>
</section>
