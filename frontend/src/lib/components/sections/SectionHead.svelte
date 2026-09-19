<script lang="ts">
  import { reveal } from '$lib/reveal'

  let { eyebrow, title, lede = '' }: { eyebrow: string; title: string; lede?: string } = $props()
</script>

<div class="mx-auto mb-10 max-w-2xl text-center" use:reveal>
  <p class="eyebrow">{eyebrow}</p>
  <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{title}</h2>
  {#if lede}<p class="mt-3 text-base text-asn-ink-900/60">{lede}</p>{/if}
</div>
