<script lang="ts">
  import type { IconName } from '$lib/data/home'

  let { name, floatDelay = 0 }: { name: IconName; floatDelay?: number } = $props()
</script>

<!-- Floating metallic icon chip (PRD §7.3) — gradient chip carries the "metal", stroke icon sits on top. -->
<div class="micon" style="--float-delay:{floatDelay}s">
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if name === 'modem'}
      <rect x="2.5" y="13" width="19" height="7" rx="2" />
      <circle cx="6.5" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
      <path d="M15.5 16.5H19" />
      <path d="M12 13V8.5" />
      <path d="M8.8 5.8a4.5 4.5 0 0 1 6.4 0" />
    {:else if name === 'fiber'}
      <path d="M4.5 21C10 21 8 3 12 3s2 18 7.5 18" />
      <rect x="1.5" y="19" width="3" height="4" rx="1" />
      <rect x="19.5" y="19" width="3" height="4" rx="1" />
    {:else if name === 'infinity'}
      <path d="M18.5 8c2 0 3.5 1.8 3.5 4s-1.5 4-3.5 4c-4.5 0-7.5-8-13-8C3.5 8 2 9.8 2 12s1.5 4 3.5 4c5.5 0 8.5-8 13-8Z" />
    {:else if name === 'gauge'}
      <path d="M4 17a8.5 8.5 0 1 1 16 0" />
      <path d="M12 14.5 16.5 9" />
      <circle cx="12" cy="15" r="1.4" />
    {:else if name === 'tv'}
      <rect x="3" y="6.5" width="18" height="13" rx="2" />
      <path d="M8.5 3.5 12 6.5l3.5-3" />
      <path d="M10.5 11.5v3l2.5-1.5Z" fill="currentColor" stroke="none" />
    {:else if name === 'mesh'}
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="4.5" cy="6" r="1.8" />
      <circle cx="19" cy="5.5" r="1.8" />
      <circle cx="18.5" cy="18" r="1.8" />
      <circle cx="5.5" cy="18.5" r="1.8" />
      <path d="M10 10.5 6 7.4M14 10.7l3.5-3.7M13.8 13.6l3.2 3M10.2 13.6l-3.4 3.3" />
    {:else if name === 'building'}
      <rect x="5" y="3.5" width="10.5" height="17" rx="1" />
      <path d="M8 7.5h1.5M11.5 7.5H13M8 11h1.5M11.5 11H13M8 14.5h1.5M11.5 14.5H13" />
      <path d="M15.5 20.5V9H20v11.5" />
      <path d="M9.5 20.5v-3h2.5v3" />
    {/if}
  </svg>
</div>

<style>
  .micon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    color: #0369a1;
    background:
      linear-gradient(145deg, #ffffff 0%, #dceefb 40%, #b8e2fa 75%, #e9f5fd 100%);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -2px 4px rgba(3, 105, 161, 0.12),
      0 10px 18px -8px rgba(3, 105, 161, 0.35);
    animation: micon-float 6s ease-in-out infinite;
    animation-delay: var(--float-delay, 0s);
  }
  @keyframes micon-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .micon {
      animation: none;
    }
  }
</style>
