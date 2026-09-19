<script lang="ts">
  /**
   * PT Advance Service Network Indonesia — brand mark.
   * SVG recreation of the official logo: blue gradient mountain "A" chevrons
   * with an apex diamond, encircled by the segmented gray orbit ring with
   * network nodes. Gradient stops follow the PRD §7.1 brand palette.
   */
  let { size = 36, withRing = true }: { size?: number; withRing?: boolean } = $props()

  // Unique gradient id per instance — the logo can render several times per page.
  const uid = $props.id()
</script>

<svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id={`asn-logo-${uid}`} x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#0369a1" />
      <stop offset="0.55" stop-color="#38bdf8" />
      <stop offset="1" stop-color="#7dd3fc" />
    </linearGradient>
  </defs>

  <!-- Segmented orbit ring with network nodes (upper + lower arcs) -->
  {#if withRing}
    <g stroke="#a9b0bb" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M 12.2,22.5 A 22 22 0 0 1 51.8,22.5" />
      <path d="M 14.6,45.5 A 22 22 0 0 0 49.4,45.5" />
    </g>
    <g fill="#a9b0bb">
      <circle cx="10.6" cy="25.2" r="2.4" />
      <circle cx="53.4" cy="25.2" r="2.4" />
      <circle cx="12.9" cy="48.1" r="2.4" />
      <circle cx="51.1" cy="48.1" r="2.4" />
    </g>
  {/if}

  <!-- Mountain "A" mark: apex diamond + twin peaks -->
  <g fill={`url(#asn-logo-${uid})`}>
    <path d="M32 8 L36 14 L32 18.5 L28 14 Z" />
    <path d="M30.2 21.5 L18.5 45.5 L27.5 45.5 L33.2 30.8 Z" />
    <path d="M33.8 21.5 L45.5 45.5 L36.5 45.5 L30.8 30.8 Z" />
    <path d="M35 33.5 L29.5 45.5 L40.5 45.5 Z" />
  </g>
</svg>
