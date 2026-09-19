<script lang="ts">
  import { onMount } from 'svelte'
  import type { Component } from 'svelte'
  import PosterFiber from './PosterFiber.svelte'
  import { decideTier, type HeroVariant, type SceneTier } from '$lib/scenes/tier'

  /** A/B scene variant (PRD §7.2): concept A fiber strands (default) or concept B fiber globe. */
  function readVariant(): HeroVariant {
    if (typeof window === 'undefined') return 'a'
    return new URLSearchParams(window.location.search).get('hero') === 'b' ? 'b' : 'a'
  }

  let tier = $state<SceneTier>('poster')
  let variant = $state<HeroVariant>('a')
  let Scene3D = $state<null | Component<{ lite?: boolean; variant?: HeroVariant }>>(null)

  onMount(async () => {
    tier = decideTier()
    variant = readVariant()
    if (tier !== 'poster') {
      try {
        // Lazy-load the WebGL bundle only when the device earns it (PRD §7.2).
        const mod = await import('./Hero3D.svelte')
        Scene3D = mod.default as Component<{ lite?: boolean; variant?: HeroVariant }>
      } catch {
        tier = 'poster'
      }
    }
  })
</script>

<div class="absolute inset-0">
  {#if Scene3D}
    <Scene3D lite={tier === 'lite'} {variant} />
  {:else}
    <PosterFiber />
  {/if}
</div>
