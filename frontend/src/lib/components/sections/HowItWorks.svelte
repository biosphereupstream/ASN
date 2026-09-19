<script lang="ts">
  import { STEPS } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
  import MetallicIcon from '../MetallicIcon.svelte'
  import SectionHead from './SectionHead.svelte'
</script>

<!-- PRD §6.2 #5 — how it works: Cek Cakupan → Pilih Paket → Jadwal Pemasangan -->
<section class="mx-auto w-full max-w-6xl content-w px-5 py-16">
  <SectionHead
    eyebrow="Cara Bergabung"
    title="Tiga langkah, langsung terhubung"
  />
  <ol class="relative grid gap-8 sm:grid-cols-3">
    {#each STEPS as step, i}
      <li use:reveal={{ delay: i * 120 }} class="relative text-center">
        {#if i < STEPS.length - 1}
          <!-- connector line between steps -->
          <div class="connector" aria-hidden="true"></div>
        {/if}
        <div class="mx-auto w-fit">
          <MetallicIcon name={step.icon} floatDelay={i * 0.8} />
        </div>
        <div class="mt-3 text-xs font-extrabold tracking-widest text-asn-blue-500 uppercase">Langkah {i + 1}</div>
        <h3 class="mt-1 text-base font-extrabold">{step.title}</h3>
        <p class="mx-auto mt-1.5 max-w-[26ch] text-sm text-asn-ink-900/60">{step.desc}</p>
      </li>
    {/each}
  </ol>
</section>

<style>
  .connector {
    position: absolute;
    top: 22px;
    left: calc(50% + 44px);
    width: calc(100% - 88px);
    height: 2px;
    background: linear-gradient(90deg, rgba(125, 211, 252, 0.9), rgba(195, 203, 214, 0.55));
  }
  @media (max-width: 639px) {
    .connector {
      display: none;
    }
  }
</style>
