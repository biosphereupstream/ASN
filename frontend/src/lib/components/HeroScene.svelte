<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core'
  import * as THREE from 'three'
  import { onMount } from 'svelte'
  import { LITE_PULSES, PULSES, STRANDS } from '$lib/scenes/heroStrands'
  import { useGlow } from '$lib/scenes/glow'
  import { applyStudioEnvironment } from '$lib/scenes/studioEnvironment'

  let { lite = false }: { lite?: boolean } = $props()

  const pulses = $derived(lite ? LITE_PULSES : PULSES)

  const { scene, renderer } = useThrelte()

  // Studio-like PMREM environment (offline, no external HDR) for chrome/metal reflections.
  onMount(() => {
    const disposeEnv = applyStudioEnvironment(scene, renderer)
    // Dev-only telemetry handle for testing/debugging the render loop.
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__asnScene = { renderer, scene }
    return disposeEnv
  })

  // Subtle bloom on the full tier only (PRD §7.2 — no heavy post-processing on lite).
  // The composer switches Threlte to manual rendering; the task loop calls glow.render().
  const glow = $derived(!lite ? useGlow(0.45, 0.55, 0.85) : null)
  onMount(() => () => glow?.dispose())

  // Pointer parallax (±6° yaw / 4° pitch max, eased — PRD §7.2)
  let px = 0
  let py = 0
  let rig: THREE.Group | null = $state(null)
  let pulseGroups: (THREE.Group | null)[] = $state([])
  let orbGroup: THREE.Group | null = $state(null)
  let halo: THREE.Mesh | null = $state(null)

  onMount(() => {
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1
      py = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  })

  // Animation: pulses ride the strands, emissives breathe, orb bobs, parallax eases.
  // Per-frame mutation happens on THREE objects directly (the idiomatic Threlte pattern),
  // so no Svelte state updates occur inside the render loop.
  let t = 0
  const tmp = new THREE.Vector3()

  useTask((delta) => {
    t += delta
    for (let i = 0; i < pulses.length; i++) {
      const p = pulses[i]
      const u = (((t * p.speed + p.phase) % 1) + 1) % 1
      STRANDS[p.strand].curve.getPointAt(u, tmp)
      pulseGroups[i]?.position.copy(tmp)
    }
    // Emissive "data flow" breathing — staggered phase per strand.
    const breathe = lite ? 0.15 : 0.3
    for (let i = 0; i < STRANDS.length; i++) {
      const s = STRANDS[i]
      if (s.glow > 0 && strandMats[i]) strandMats[i]!.emissiveIntensity = s.glow * (1 + breathe * Math.sin(t * 1.6 + i * 1.3))
    }
    if (orbGroup) {
      orbGroup.position.y = 0.75 + Math.sin(t * 1.4) * 0.08
    }
    if (halo) {
      const m = halo.material as THREE.MeshBasicMaterial
      m.opacity = 0.12 + 0.05 * Math.sin(t * 1.4)
    }
    if (rig) {
      const ease = Math.min(1, delta * 3)
      rig.rotation.y += (px * THREE.MathUtils.degToRad(6) - rig.rotation.y) * ease
      rig.rotation.x += (-py * THREE.MathUtils.degToRad(4) - rig.rotation.x) * ease
    }
    glow?.render()
  })

  let strandMats: (THREE.MeshStandardMaterial | null)[] = $state([])
</script>

<T.PerspectiveCamera makeDefault position={[0, 1.4, 8]} fov={42} />

<!-- White glossy studio lighting rig -->
<T.AmbientLight intensity={1.0} />
<T.DirectionalLight position={[4, 7, 6]} intensity={1.4} color={'#ffffff'} />
<T.DirectionalLight position={[-6, 2, 4]} intensity={0.45} color={'#dfeaf5'} />
<T.PointLight position={[3.2, 1.4, 2.2]} intensity={12} distance={9} color={'#7dd3fc'} />
<T.PointLight position={[-4, -1, 3]} intensity={5} distance={10} color={'#ffffff'} />

<T.Group bind:ref={rig}>
  <!-- Silver floor grid + glossy white ground -->
  <T.GridHelper args={[34, 46, 0xc3cbd6, 0xe4e9f0]} position={[0, -2.1, 0]} />
  <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.11, 0]}>
    <T.PlaneGeometry args={[34, 24]} />
    <T.MeshStandardMaterial color={'#ffffff'} metalness={0.15} roughness={0.35} transparent opacity={0.85} />
  </T.Mesh>

  <!-- Fiber strands (emissive breathing animated in useTask) -->
  {#each STRANDS as s, i}
    <T.Mesh>
      <T.TubeGeometry args={[s.curve, 140, s.radius, 10, false]} />
      <T.MeshStandardMaterial
        bind:ref={strandMats[i]}
        color={s.color}
        metalness={s.metalness}
        roughness={0.3}
        emissive={s.emissive}
        emissiveIntensity={s.metalness > 0.8 ? 0 : s.glow}
        transparent
        opacity={s.opacity}
      />
    </T.Mesh>
  {/each}

  <!-- Light pulses riding the strands -->
  {#each pulses as p, i}
    <T.Group bind:ref={pulseGroups[i]} position={[-99, -99, 0]}>
      <T.Mesh>
        <T.SphereGeometry args={[p.size, 12, 12]} />
        <T.MeshBasicMaterial color={'#ffffff'} transparent opacity={0.9} />
      </T.Mesh>
      <T.Mesh>
        <T.SphereGeometry args={[p.size * 2.4, 12, 12]} />
        <T.MeshBasicMaterial color={'#7dd3fc'} transparent opacity={0.25} />
      </T.Mesh>
    </T.Group>
  {/each}

  <!-- Chrome orb + silver ring (bob animated in useTask) -->
  <T.Group bind:ref={orbGroup} position={[2.9, 0.75, 0]}>
    <T.Mesh>
      <T.SphereGeometry args={[1.05, 48, 48]} />
      <T.MeshStandardMaterial color={'#dfe7f0'} metalness={0.9} roughness={0.16} envMapIntensity={1.2} />
    </T.Mesh>
    <T.Mesh rotation={[0.5, 0, -0.35]}>
      <T.TorusGeometry args={[1.55, 0.025, 12, 90]} />
      <T.MeshStandardMaterial color={'#c3cbd6'} metalness={1} roughness={0.25} />
    </T.Mesh>
    <T.Mesh bind:ref={halo} scale={3.4}>
      <T.SphereGeometry args={[0.5, 16, 16]} />
      <T.MeshBasicMaterial color={'#bae6fd'} transparent opacity={0.12} depthWrite={false} />
    </T.Mesh>
  </T.Group>
</T.Group>
