<script lang="ts">
  import { WA_NUMBER } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
  import SectionHead from './SectionHead.svelte'
</script>

<!-- PRD §6.2 #9 — final CTA before footer -->
<section class="mx-auto w-full max-w-6xl content-w px-5 pt-8 pb-20" use:reveal>
  <div class="relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-10">
    <!-- soft metallic glow backdrop -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl" style="background: radial-gradient(closest-side, rgba(125, 211, 252, 0.45), transparent)"></div>
    </div>
    <div class="relative z-10">
      <SectionHead
        eyebrow="Siap Bermigrasi ke Fiber"
        title="Sekarang giliran rumahmu yang super cepat"
        lede="Cek cakupan, pilih paket, tim kami datang dalam 1×24 jam."
      />
      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="/daftar?source=promo_page" class="btn-primary rounded-full px-8 py-3.5 text-sm font-extrabold">Langganan Sekarang</a>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo ASN.NET, saya mau tanya paket untuk area saya.')}`}
          class="glossy rounded-full px-8 py-3.5 text-sm font-extrabold"
        >
          Chat WhatsApp
        </a>
      </div>
    </div>
  </div>
</section>
