<script lang="ts">
  import { Canvas } from '@threlte/core'
  import HeroScene from './HeroScene.svelte'
  import GlobeScene from './GlobeScene.svelte'

  let { lite = false, variant = 'a' }: { lite?: boolean; variant?: 'a' | 'b' } = $props()
</script>

<Canvas renderMode="always" dpr={lite ? 1 : [1, 2]}>
  {#if variant === 'b'}
    <GlobeScene {lite} />
  {:else}
    <HeroScene {lite} />
  {/if}
</Canvas>
