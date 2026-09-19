<script lang="ts">
  import { reveal } from '$lib/reveal'
</script>

<!-- PRD §6.2 #6 — active promo banner (CMS-driven in production; static demo now) -->
<section class="mx-auto w-full max-w-6xl content-w px-5 py-8" use:reveal>
  <div class="promo-metal relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10">
    <div class="sheen" aria-hidden="true"></div>
    <div class="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-extrabold tracking-widest text-white/80 uppercase">Promo Terbatas</p>
        <h3 class="mt-1 text-xl font-extrabold text-white sm:text-2xl">
          Bayar 3 Bulan, <span class="text-asn-blue-300">Gratis 1 Bulan!</span>
        </h3>
        <p class="mt-1 text-sm text-white/85">Berlaku untuk paket Stream &amp; Fiber 100 ke atas hingga akhir bulan ini.</p>
      </div>
      <a href="/promo" class="btn-white shrink-0 rounded-full px-6 py-3 text-sm font-extrabold">
        Lihat Semua Promo
      </a>
    </div>
  </div>
</section>

<style>
  /* Metallic blue banner — brand gradient with glossy top light */
  .promo-metal {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0) 42%),
      linear-gradient(120deg, #7dd3fc 0%, #38bdf8 42%, #0369a1 100%);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.55),
      0 20px 44px -16px rgba(3, 105, 161, 0.5);
  }

  .btn-white {
    background: #ffffff;
    color: #0369a1;
    border: 1px solid rgba(3, 105, 161, 0.2);
    box-shadow: 0 10px 22px -10px rgba(4, 42, 66, 0.55);
  }

  /* Slow sheen sweeping across the banner (decorative only) */
  .sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg, transparent 35%, rgba(255, 255, 255, 0.28) 50%, transparent 65%);
    animation: promo-sheen 7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    pointer-events: none;
  }
  @keyframes promo-sheen {
    0% {
      transform: translateX(-120%);
    }
    55%,
    100% {
      transform: translateX(120%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sheen {
      animation: none;
      opacity: 0;
    }
  }
</style>
