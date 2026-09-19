<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core'
  import * as THREE from 'three'
  import { onMount } from 'svelte'
  import {
    GLOBE_ARCS,
    GLOBE_CITIES,
    GLOBE_RADIUS,
    globeArc,
    latLonToVec3
  } from '$lib/scenes/heroGlobe'
  import { useGlow } from '$lib/scenes/glow'
  import { applyStudioEnvironment } from '$lib/scenes/studioEnvironment'

  let { lite = false }: { lite?: boolean } = $props()

  const { scene, renderer } = useThrelte()

  onMount(() => {
    const disposeEnv = applyStudioEnvironment(scene, renderer)
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__asnScene = { renderer, scene }
    return disposeEnv
  })

  // Subtle bloom on the full tier only (PRD §7.2).
  const glow = $derived(!lite ? useGlow(0.4, 0.6, 0.85) : null)
  onMount(() => () => glow?.dispose())

  // Pointer parallax (±6° yaw / 4° pitch max, eased — PRD §7.2). Lite tier: gentle auto-drift.
  let px = 0
  let py = 0
  let rig: THREE.Group | null = $state(null)
  let globeGroup: THREE.Group | null = $state(null)
  let nodeMats: (THREE.MeshStandardMaterial | null)[] = $state([])
  let packetGroups: (THREE.Group | null)[] = $state([])

  const arcs = GLOBE_ARCS.map(([a, b]) => globeArc(latLonToVec3(GLOBE_CITIES[a].lat, GLOBE_CITIES[a].lon), latLonToVec3(GLOBE_CITIES[b].lat, GLOBE_CITIES[b].lon)))

  interface Packet {
    arc: number
    speed: number
    offset: number
    size: number
  }
  const allPackets: Packet[] = [
    { arc: 0, speed: 0.11, offset: 0.0, size: 0.06 },
    { arc: 1, speed: 0.15, offset: 0.4, size: 0.055 },
    { arc: 2, speed: 0.08, offset: 0.75, size: 0.05 },
    { arc: 3, speed: 0.18, offset: 0.2, size: 0.045 },
    { arc: 4, speed: 0.13, offset: 0.6, size: 0.045 },
    { arc: 5, speed: 0.16, offset: 0.1, size: 0.05 },
    { arc: 6, speed: 0.09, offset: 0.5, size: 0.045 },
    { arc: 7, speed: 0.14, offset: 0.85, size: 0.04 }
  ]
  const packets = $derived(lite ? allPackets.slice(0, 4) : allPackets)

  onMount(() => {
    if (lite) return
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1
      py = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  })

  let t = 0
  const tmp = new THREE.Vector3()

  useTask((delta) => {
    t += delta
    if (globeGroup) {
      // Constant slow spin (wired-globe look) + lite-tier drift when there is no pointer.
      globeGroup.rotation.y += delta * 0.12
    }
    if (rig) {
      const ease = Math.min(1, delta * 3)
      const driftY = lite ? Math.sin(t * 0.3) * THREE.MathUtils.degToRad(4) : px * THREE.MathUtils.degToRad(6)
      const driftX = lite ? Math.sin(t * 0.22) * THREE.MathUtils.degToRad(2) : -py * THREE.MathUtils.degToRad(4)
      rig.rotation.y += (driftY - rig.rotation.y) * ease
      rig.rotation.x += (driftX - rig.rotation.x) * ease
    }
    // Node breathing — staggered per node.
    for (let i = 0; i < nodeMats.length; i++) {
      const m = nodeMats[i]
      if (m) m.emissiveIntensity = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.5 + i * 0.9))
    }
    // Packets ride the arcs.
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i]
      const u = (((t * p.speed + p.offset) % 1) + 1) % 1
      arcs[p.arc].getPoint(u, tmp)
      packetGroups[i]?.position.copy(tmp)
    }
    glow?.render()
  })
</script>

<T.PerspectiveCamera makeDefault position={[0, 0.4, 6.4]} fov={40} />

<!-- White glossy studio lighting rig -->
<T.AmbientLight intensity={1.0} />
<T.DirectionalLight position={[4, 6, 5]} intensity={1.2} color={'#ffffff'} />
<T.DirectionalLight position={[-5, -1, 4]} intensity={0.4} color={'#e8f2fb'} />
<T.PointLight position={[0, 2, 4]} intensity={8} distance={12} color={'#7dd3fc'} />
<T.PointLight position={[0, -3, -4]} intensity={6} distance={10} color={'#38bdf8'} />

<T.Group bind:ref={rig} position={[0, 0.2, 0]}>
  <!-- Soft blue ground glow (no grid on concept B — pure network-in-space look) -->
  <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]}>
    <T.CircleGeometry args={[3.4, 48]} />
    <T.MeshBasicMaterial color={'#7dd3fc'} transparent opacity={0.07} depthWrite={false} />
  </T.Mesh>

  <T.Group bind:ref={globeGroup}>
    <!-- Chrome core -->
    <T.Mesh>
      <T.SphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
      <T.MeshStandardMaterial color={'#eef2f7'} metalness={0.92} roughness={0.18} envMapIntensity={1.25} />
    </T.Mesh>

    <!-- Silver wire shell (lat + lon rings) -->
    <T.Mesh>
      <T.IcosahedronGeometry args={[GLOBE_RADIUS + 0.02, 3]} />
      <T.MeshStandardMaterial color={'#c3cbd6'} metalness={1} roughness={0.3} wireframe transparent opacity={0.35} />
    </T.Mesh>

    <!-- City nodes: white-hot core + soft blue halo -->
    {#each GLOBE_CITIES as c, i}
      {@const p = latLonToVec3(c.lat, c.lon)}
      <T.Group position={[p.x, p.y, p.z]}>
        <T.Mesh>
          <T.SphereGeometry args={[c.major ? 0.05 : 0.035, 12, 12]} />
          <T.MeshBasicMaterial color={'#ffffff'} />
        </T.Mesh>
        <T.Mesh>
          <T.SphereGeometry args={[c.major ? 0.14 : 0.1, 12, 12]} />
          <T.MeshStandardMaterial
            bind:ref={nodeMats[i]}
            color={'#7dd3fc'}
            emissive={'#38bdf8'}
            emissiveIntensity={0.3}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </T.Mesh>
      </T.Group>
    {/each}

    <!-- Connection arcs -->
    {#each arcs as arc}
      <T.Mesh>
        <T.TubeGeometry args={[arc, 48, 0.009, 8, false]} />
        <T.MeshBasicMaterial color={'#38bdf8'} transparent opacity={0.55} />
      </T.Mesh>
    {/each}

    <!-- Packets riding the arcs -->
    {#each packets as p, i}
      <T.Group bind:ref={packetGroups[i]} position={[99, 99, 99]}>
        <T.Mesh>
          <T.SphereGeometry args={[p.size, 10, 10]} />
          <T.MeshBasicMaterial color={'#ffffff'} />
        </T.Mesh>
        <T.Mesh>
          <T.SphereGeometry args={[p.size * 2.2, 10, 10]} />
          <T.MeshBasicMaterial color={'#7dd3fc'} transparent opacity={0.3} depthWrite={false} />
        </T.Mesh>
      </T.Group>
    {/each}
  </T.Group>
</T.Group>
