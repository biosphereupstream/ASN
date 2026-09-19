import * as THREE from 'three'
import { useThrelte } from '@threlte/core'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export interface Glow {
  composer: EffectComposer
  render: () => void
  dispose: () => void
}

/**
 * Subtle bloom for the full tier (PRD §7.2: "no heavy post-processing" on lite).
 *
 * Switches Threlte to manual rendering and renders each frame through an
 * EffectComposer with a gentle UnrealBloomPass. Only white/bright cores (pulse
 * centers, city nodes) cross the threshold, so the glow stays restrained.
 *
 * Must be called during scene-component initialization (it reads Threlte context).
 * The scene then calls `glow.render()` at the end of its `useTask` loop.
 */
export function useGlow(strength = 0.45, radius = 0.55, threshold = 0.85): Glow {
  const { scene, renderer, camera, size, dpr } = useThrelte()

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera.current))
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(Math.max(1, size.current.width), Math.max(1, size.current.height)),
    strength,
    radius,
    threshold
  )
  composer.addPass(bloom)
  // Converts linear → sRGB at the end (replaces the renderer's implicit conversion).
  composer.addPass(new OutputPass())

  // Keep the composer in sync with canvas size and DPR (subscriptions fire immediately).
  const unsubSize = size.subscribe((s) => {
    if (s.width > 0 && s.height > 0) composer.setSize(s.width, s.height)
  })
  const unsubDpr = dpr.subscribe((p) => composer.setPixelRatio(p))

  return {
    composer,
    render: () => composer.render(),
    dispose: () => {
      unsubSize()
      unsubDpr()
      bloom.dispose()
      composer.dispose()
    }
  }
}
