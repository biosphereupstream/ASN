import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Offline studio-like PMREM environment (no external HDR fetch) that gives the
 * chrome/metal materials their reflections. Returns a cleanup function.
 */
export function applyStudioEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer): () => void {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = env.texture
  return () => {
    env.dispose()
    pmrem.dispose()
    scene.environment = null
  }
}
