<script lang="ts">
  import { PACKAGES, WA_NUMBER, formatIdr } from '$lib/data/home'
  import { reveal } from '$lib/reveal'
  import SectionHead from './SectionHead.svelte'
  import TiltCard from '../TiltCard.svelte'

  function waLink(pkgName: string): string {
    const text = encodeURIComponent(`Halo ASN.NET, saya mau tanya paket ${pkgName}.`)
    return `https://wa.me/${WA_NUMBER}?text=${text}`
  }
</script>

<!-- PRD §6.2 #4 — package highlights; card copy per §11 pattern -->
<section class="mx-auto w-full max-w-6xl content-w px-5 py-16">
  <SectionHead
    eyebrow="Paket"
    title="Pilih kecepatan sesuai kebutuhanmu"
    lede="Semua paket unlimited tanpa FUP, gratis modem dan instalasi."
  />
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each PACKAGES as pkg, i}
      <div use:reveal={{ delay: i * 80 }} class="h-full">
        <TiltCard>
          <article
            class="pkg-card glossy relative flex h-full flex-col rounded-2xl p-6 {pkg.featured ? 'pkg-featured' : ''}"
          >
            {#if pkg.badge}
              <span class="badge">{pkg.badge}</span>
            {/if}
            {#if pkg.featured}
              <span class="badge badge-blue">Paling populer</span>
            {/if}

            <h3 class="text-base font-extrabold">{pkg.name}</h3>

            <div class="mt-4 flex items-end gap-1">
              <span class="speed-metal">{pkg.speedMbps}<span class="text-lg">Mbps</span></span>
            </div>
            <p class="mt-1 text-sm font-bold text-asn-blue-700">
              {formatIdr(pkg.priceIdr)}<span class="font-medium text-asn-ink-900/50"> /bulan</span>
            </p>

            <ul class="mt-4 space-y-2 text-sm text-asn-ink-900/70">
              <li class="flex gap-2">
                <svg class="mt-0.5 shrink-0 text-asn-blue-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7" /></svg>
                Cocok digunakan {pkg.devices[0]}–{pkg.devices[1]} perangkat
              </li>
              {#each pkg.features as f}
                <li class="flex gap-2">
                  <svg class="mt-0.5 shrink-0 text-asn-blue-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7" /></svg>
                  {f}
                </li>
              {/each}
            </ul>

            <div class="mt-auto pt-5">
              <a href={`/daftar?package=${pkg.slug}`} class="btn-primary block rounded-xl py-2.5 text-center text-sm font-bold">
                Langganan Sekarang
              </a>
              <a href={waLink(pkg.name)} class="mt-2 block text-center text-xs font-semibold text-asn-ink-900/55 hover:text-asn-blue-700">
                atau tanya dulu via WhatsApp
              </a>
            </div>
          </article>
        </TiltCard>
      </div>
    {/each}
  </div>
</section>

<style>
  .speed-metal {
    font-size: 2.6rem;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  /* Featured card: metallic blue gradient frame (brand CTA color) */
  .pkg-featured {
    background:
      linear-gradient(#ffffff, #ffffff) padding-box,
      linear-gradient(160deg, #7dd3fc, #38bdf8 45%, #0369a1) border-box;
    border: 2px solid transparent;
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.04),
      0 18px 44px -14px rgba(3, 105, 161, 0.35);
  }

  .badge {
    position: absolute;
    top: -11px;
    right: 14px;
    max-width: calc(100% - 28px);
    border-radius: 999px;
    background: linear-gradient(100deg, #e8ecf1, #f4f6f9 55%, #c3cbd6);
    border: 1px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 4px 10px -4px rgba(15, 23, 42, 0.25);
    padding: 3px 11px;
    font-size: 11px;
    font-weight: 700;
    color: #334155;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .badge-blue {
    left: 14px;
    right: auto;
    background: linear-gradient(180deg, #7dd3fc, #38bdf8 70%, #2f9fdd);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.45);
    text-shadow: 0 1px 2px rgba(3, 105, 161, 0.4);
  }

  /* Diagonal reflection sweep on hover — pointer-fine devices only (PRD §7.3/§8) */
  .pkg-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, 0.65) 50%, rgba(125, 211, 252, 0.25) 54%, transparent 62%);
    transform: translateX(-110%);
  }
  @media (hover: hover) and (pointer: fine) {
    .pkg-card:hover::before {
      transition: transform 850ms cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(110%);
    }
  }
  .pkg-card {
    overflow: hidden;
  }
</style>
