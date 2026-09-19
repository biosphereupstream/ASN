export type SceneTier = 'full' | 'lite' | 'poster'

/** Hero scene variant — concept A (fiber strands) or concept B (fiber globe). PRD §7.2. */
export type HeroVariant = 'a' | 'b'

/**
 * Decides how the 3D hero renders on this device (PRD §7.2):
 * - 'poster' → static poster + CSS light-sweep (no WebGL, reduced motion, very weak devices)
 * - 'lite'   → Threlte scene with reduced DPR and fewer particles (low-core devices)
 * - 'full'   → complete scene with parallax and all pulses
 */
export function decideTier(): SceneTier {
  if (typeof window === 'undefined') return 'poster'

  // Honor prefers-reduced-motion: static poster only.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'poster'

  // WebGL2 support check (Threlte/Three targets WebGL2).
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2')
  if (!gl) return 'poster'

  // Very weak devices get the poster too (PRD: hardwareConcurrency <= 4 heuristic).
  const cores = navigator.hardwareConcurrency ?? 4
  const mobile = window.matchMedia('(pointer: coarse)').matches
  if (cores <= 2 || (mobile && cores <= 4)) return 'poster'

  return mobile ? 'lite' : 'full'
}
