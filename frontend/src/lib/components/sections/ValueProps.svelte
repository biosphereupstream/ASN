<script lang="ts">
  import { VALUE_PROPS } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
  import MetallicIcon from '../MetallicIcon.svelte'
  import TiltCard from '../TiltCard.svelte'
</script>

<!-- PRD §6.2 #2 — value props with floating metallic icons (§7.3) -->
<section class="mx-auto w-full max-w-6xl content-w px-5 py-16">
  <div class="grid gap-4 sm:grid-cols-3">
    {#each VALUE_PROPS as vp, i}
      <div use:reveal={{ delay: i * 90 }}>
        <TiltCard maxDeg={6}>
          <div class="glossy h-full rounded-2xl p-6">
            <MetallicIcon name={vp.icon} floatDelay={i * 0.9} />
            <h3 class="mt-4 text-base font-extrabold">{vp.title}</h3>
            <p class="mt-1.5 text-sm text-asn-ink-900/60">{vp.desc}</p>
          </div>
        </TiltCard>
      </div>
    {/each}
  </div>
</section>
