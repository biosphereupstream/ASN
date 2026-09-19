import * as THREE from 'three'

export interface Strand {
  curve: THREE.CatmullRomCurve3
  radius: number
  color: number
  emissive: number
  metalness: number
  opacity: number
  /** Base emissive intensity — the breathing animation modulates around this (0 = inert silver). */
  glow: number
}

/** Where the fiber strands plug in — the chrome orb's center (kept in sync with HeroScene.svelte). */
export const ORB_CENTER = new THREE.Vector3(2.9, 0.75, 0)

/**
 * Builds a helical fiber curve: a braided strand that sweeps from far off-screen,
 * coils with decreasing amplitude, and converges into the orb (or any `to` point).
 */
function fiberCurve(opts: {
  from: [number, number, number]
  to?: THREE.Vector3
  /** Full helix revolutions along the run. */
  turns: number
  /** Starting phase offset so the bundle braids instead of mirroring. */
  phase: number
  /** Wave amplitude multiplier (braid width). */
  bloom?: number
}): THREE.CatmullRomCurve3 {
  const to = opts.to ?? ORB_CENTER
  const points: THREE.Vector3[] = []
  const N = 10
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const ease = t * t * (3 - 2 * t) // smoothstep: gentle start, accelerating into the orb
    const spread = 1 - ease * 0.92 // coil tightens as it approaches the orb
    const angle = opts.phase + opts.turns * t * Math.PI * 2
    points.push(
      new THREE.Vector3(
        THREE.MathUtils.lerp(opts.from[0], to.x, ease),
        THREE.MathUtils.lerp(opts.from[1], to.y, ease) + Math.sin(angle) * 0.6 * spread * (opts.bloom ?? 1),
        THREE.MathUtils.lerp(opts.from[2], to.z, ease) + Math.cos(angle) * 0.8 * spread * (opts.bloom ?? 1)
      )
    )
  }
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.65)
}

function strand(
  curve: THREE.CatmullRomCurve3,
  radius: number,
  color: number,
  emissive: number,
  metalness: number,
  opacity: number,
  glow: number
): Strand {
  return { curve, radius, color, emissive, metalness, opacity, glow }
}

/**
 * PRD §7.2 scene concept A — glowing blue fiber strands braiding into the chrome orb,
 * one bright accent sweeping over it, two brushed-silver conductors.
 */
export const STRANDS: Strand[] = [
  strand(fiberCurve({ from: [-9.5, -2.4, 1.6], turns: 1.15, phase: 0.0, bloom: 1.15 }), 0.055, 0x38bdf8, 0x38bdf8, 0.35, 0.95, 0.6),
  strand(fiberCurve({ from: [-9.5, -2.0, -1.2], turns: 0.85, phase: 1.4, bloom: 1.0 }), 0.042, 0x7dd3fc, 0x7dd3fc, 0.35, 0.9, 0.55),
  strand(fiberCurve({ from: [-9.5, -2.9, -2.2], turns: 1.35, phase: 2.6, bloom: 1.3 }), 0.034, 0x0369a1, 0x0369a1, 0.35, 0.85, 0.5),
  strand(fiberCurve({ from: [-9.5, -1.5, 2.4], turns: 0.7, phase: 3.9, bloom: 0.9 }), 0.03, 0x38bdf8, 0x7dd3fc, 0.35, 0.8, 0.45),
  // Accent strand that arcs over the orb instead of plugging in
  strand(fiberCurve({ from: [-9.5, -1.2, 0.6], to: new THREE.Vector3(4.6, 2.1, 1.4), turns: 0.9, phase: 5.1, bloom: 1.1 }), 0.026, 0x38bdf8, 0x7dd3fc, 0.35, 0.75, 0.5),
  // Brushed-silver conductors (metalness > 0.8 → no emissive)
  strand(fiberCurve({ from: [-9.5, -2.8, 0.4], turns: 1.0, phase: 0.9, bloom: 1.05 }), 0.028, 0xe8ecf1, 0x000000, 0.95, 0.9, 0),
  strand(fiberCurve({ from: [-9.5, -1.8, -1.8], turns: 1.2, phase: 3.2, bloom: 1.2 }), 0.024, 0xc3cbd6, 0x000000, 0.95, 0.85, 0)
]

export interface Pulse {
  strand: number
  speed: number
  phase: number
  size: number
}

/** Light pulses ride along strands: strand index, speed, phase offset, sphere size. */
export const PULSES: Pulse[] = [
  { strand: 0, speed: 0.22, phase: 0, size: 0.09 },
  { strand: 1, speed: 0.16, phase: 0.45, size: 0.075 },
  { strand: 2, speed: 0.13, phase: 0.7, size: 0.07 },
  { strand: 3, speed: 0.19, phase: 0.25, size: 0.06 },
  { strand: 5, speed: 0.11, phase: 0.55, size: 0.05 }
]

export const LITE_PULSES: Pulse[] = PULSES.slice(0, 3)
