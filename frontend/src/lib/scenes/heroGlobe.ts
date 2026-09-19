import * as THREE from 'three'

/** Globe chrome-core radius (wire shell and nodes sit just above it). */
export const GLOBE_RADIUS = 1.5

export interface GlobeCity {
  name: string
  lat: number
  lon: number
  /** Hub cities get a larger node. */
  major?: boolean
}

/** ASN.NET covered/roadmap cities rendered as glowing nodes (PRD §7.2 scene concept B). */
export const GLOBE_CITIES: GlobeCity[] = [
  { name: 'Jakarta', lat: -6.2, lon: 106.82, major: true },
  { name: 'Bogor', lat: -6.6, lon: 106.85 },
  { name: 'Bandung', lat: -6.92, lon: 107.61, major: true },
  { name: 'Semarang', lat: -7.0, lon: 110.45 },
  { name: 'Yogyakarta', lat: -7.8, lon: 110.36 },
  { name: 'Surabaya', lat: -7.26, lon: 112.75, major: true },
  { name: 'Denpasar', lat: -8.65, lon: 115.2 },
  { name: 'Medan', lat: 3.58, lon: 98.67, major: true },
  { name: 'Palembang', lat: -2.98, lon: 104.75 },
  { name: 'Makassar', lat: -5.15, lon: 119.43 },
  { name: 'Balikpapan', lat: -1.24, lon: 116.85 },
  { name: 'Jayapura', lat: -2.53, lon: 140.72 }
]

/** Connection arcs as index pairs into GLOBE_CITIES. */
export const GLOBE_ARCS: [number, number][] = [
  [0, 7], // Jakarta → Medan
  [0, 5], // Jakarta → Surabaya
  [0, 11], // Jakarta → Jayapura
  [1, 2], // Bogor → Bandung
  [2, 3], // Bandung → Semarang
  [5, 6], // Surabaya → Denpasar
  [0, 10], // Jakarta → Balikpapan
  [7, 8] // Medan → Palembang
]

/** Converts lat/lon (degrees) to a point on a sphere of radius `r`. */
export function latLonToVec3(lat: number, lon: number, r = GLOBE_RADIUS + 0.02): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

/** Builds a lifted bezier arc between two points on the globe — the classic network-globe look. */
export function globeArc(a: THREE.Vector3, b: THREE.Vector3, radius = GLOBE_RADIUS): THREE.QuadraticBezierCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const lift = radius * (1 + a.distanceTo(b) * 0.45)
  return new THREE.QuadraticBezierCurve3(a, mid.normalize().multiplyScalar(lift), b)
}
