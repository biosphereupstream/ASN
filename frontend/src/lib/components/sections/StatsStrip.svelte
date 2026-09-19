<script lang="ts">
  import { STATS } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
</script>

<!-- PRD §6.2 #7 — stats strip (configurable; testimonials variant ships with CMS-lite) -->
<section class="mx-auto w-full max-w-6xl content-w px-5 py-16" use:reveal>
  <dl class="glossy grid grid-cols-2 gap-6 rounded-3xl px-6 py-10 text-center lg:grid-cols-4">
    {#each STATS as s, i}
      <div>
        <dd class="stat-metal text-3xl font-extrabold tracking-tight sm:text-4xl" style="animation-delay: {i * 0.6}s">
          {s.value}
        </dd>
        <dt class="mt-1.5 text-xs font-semibold text-asn-ink-900/55 sm:text-sm">{s.label}</dt>
      </div>
    {/each}
  </dl>
</section>

<style>
  /* Chrome-gradient stat numerals */
  .stat-metal {
    background: linear-gradient(100deg, #0369a1 0%, #38bdf8 45%, #7dd3fc 70%, #38bdf8 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
</style>
