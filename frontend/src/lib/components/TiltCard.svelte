<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children, maxDeg = 10 }: { children: Snippet; maxDeg?: number } = $props()

  let el: HTMLDivElement | null = $state(null)
  let rx = $state(0) // rotateX (pitch)
  let ry = $state(0) // rotateY (yaw)
  let gx = $state(50) // glare x %
  let gy = $state(50) // glare y %
  let glare = $state(0) // glare opacity
  let engaged = $state(false)
  let enabled = false

  $effect(() => {
    // 3D tilt only for mouse-like pointers and when motion is welcome (PRD §8 cross-cutting rules).
    enabled =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  function onMove(e: PointerEvent) {
    if (!enabled || !el) return
    const r = el.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    ry = (nx - 0.5) * 2 * maxDeg
    rx = -(ny - 0.5) * 2 * (maxDeg * 0.8)
    gx = nx * 100
    gy = ny * 100
    glare = 1
    engaged = true
  }

  function onLeave() {
    rx = 0
    ry = 0
    glare = 0
    engaged = false
  }
</script>

<!--
  3D tilt card (PRD §7.3): pointer-driven rotate + glossy radial glare that tracks
  the pointer like a reflection sweeping across glass.
-->
<div
  bind:this={el}
  class="tilt-card"
  class:engaged
  role="presentation"
  style="--rx:{rx}deg; --ry:{ry}deg; --gx:{gx}%; --gy:{gy}%; --glare:{glare}"
  onpointermove={onMove}
  onpointerleave={onLeave}
>
  {@render children()}
  <div class="tilt-glare" aria-hidden="true"></div>
</div>

<style>
  .tilt-card {
    position: relative;
    border-radius: 1rem;
    transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
    transform-style: preserve-3d;
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      filter 260ms;
    will-change: transform;
  }
  .tilt-card.engaged {
    transition: transform 70ms linear;
    filter: drop-shadow(0 24px 28px rgba(3, 105, 161, 0.16));
  }
  .tilt-glare {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--glare, 0);
    transition: opacity 220ms ease;
    background: radial-gradient(
      420px circle at var(--gx, 50%) var(--gy, 50%),
      rgba(255, 255, 255, 0.55),
      rgba(125, 211, 252, 0.14) 42%,
      transparent 68%
    );
  }
  @media (hover: none), (prefers-reduced-motion: reduce) {
    .tilt-card {
      transform: none;
    }
    .tilt-glare {
      display: none;
    }
  }
</style>
