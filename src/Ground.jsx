import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { AdditiveBlending, BufferGeometry, CanvasTexture, Float32BufferAttribute, RepeatWrapping } from "three";

const FLOOR_COLOR = [0.015, 0.015, 0.015]
export const FLOOR_Y = 0
export const PLATFORM_HEIGHT = 0.12
export const PLATFORM_RADIUS = 3.2

// Rough plaster normal + roughness maps, tiled `repeat` times across the surface.
// thanks to https://polyhaven.com/a/rough_plasterbrick_05 for the texture!
function usePlaster(repeat) {
  const [roughness, normal] = useTexture([
    import.meta.env.BASE_URL + "textures/terrain-roughness.jpeg",
    import.meta.env.BASE_URL + "textures/terrain-normal.jpeg",
  ]);
  // Clones share the loaded image, so each surface gets its own tiling for free
  return useMemo(() => [roughness, normal].map((t) => {
    const c = t.clone();
    c.wrapS = c.wrapT = RepeatWrapping;
    c.repeat.set(repeat, repeat);
    return c;
  }), [roughness, normal, repeat]);
}

// Matte plaster, shared by the studio and the platform. With `vertexColors`, the mesh's
// per-vertex colors darken it (used for the studio's light falloff).
function Plaster({ repeat, color = FLOOR_COLOR, bump = 0.15, vertexColors = false }) {
  const [roughness, normal] = usePlaster(repeat);
  return (
    <meshStandardMaterial
      color={color}
      vertexColors={vertexColors}
      roughness={0.9}
      roughnessMap={roughness}
      normalMap={normal}
      normalScale={[bump, bump]}
      envMapIntensity={0}
    />
  );
}

const LIP_THICKNESS = 0.05 // top slab that overhangs the base
const RECESS = 0.12 // how far the base is tucked in under the lip
const LED_COLOR = [0.95, 0.97, 1.0] // just under the bloom threshold: a soft line, no halo
const PLATFORM_COLOR = [0.035, 0.035, 0.035]
const PLASTER_TILE = 4 // meters per plaster tile, same as the floor (40 m / 10)

// Soft light the LED strip spills onto the floor: brightest at the base, feathering out
// with an ease-out curve so there's no visible edge
function floorGlowTexture(inner, outer) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext("2d")
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
  const start = inner / outer
  g.addColorStop(0, "rgba(255,255,255,0)")
  g.addColorStop(Math.max(start - 0.01, 0), "rgba(255,255,255,0)")
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    g.addColorStop(start + (1 - start) * t, `rgba(255,255,255,${(0.7 * Math.pow(1 - t, 2.4)).toFixed(3)})`)
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  return new CanvasTexture(canvas)
}

// Raised round platform the car sits on: a matte plaster lip over a recessed base, with an
// LED strip on the underside of the lip. It spins with the car (it lives inside the turntable).
// Top surface is at y=0 in the turntable's space; the floor is at y=-PLATFORM_HEIGHT.
export function Platform() {
  const base = PLATFORM_RADIUS - RECESS
  const glowOuter = PLATFORM_RADIUS + 0.6 // how far the glow reaches past the platform
  const glow = useMemo(() => floorGlowTexture(base, glowOuter), [base, glowOuter])
  const topRepeat = (PLATFORM_RADIUS * 2) / PLASTER_TILE

  return (
    <group>
      {/* Top surface */}
      <mesh rotation-x={-Math.PI * 0.5} receiveShadow>
        <circleGeometry args={[PLATFORM_RADIUS, 96]} />
        <Plaster repeat={topRepeat} color={PLATFORM_COLOR} bump={1.2} />
      </mesh>
      {/* Lip edge (open-ended: the top disc and the LED ring close it) */}
      <mesh position-y={-LIP_THICKNESS / 2} receiveShadow castShadow>
        <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS, LIP_THICKNESS, 96, 1, true]} />
        <Plaster repeat={1} color={PLATFORM_COLOR} />
      </mesh>
      {/* LED strip: the underside of the lip, glowing down at the floor */}
      <mesh rotation-x={Math.PI * 0.5} position-y={-LIP_THICKNESS}>
        <ringGeometry args={[base, PLATFORM_RADIUS, 128]} />
        <meshBasicMaterial color={LED_COLOR} toneMapped={false} />
      </mesh>
      {/* Recessed base under the lip */}
      <mesh position-y={-(PLATFORM_HEIGHT + LIP_THICKNESS) / 2} receiveShadow>
        <cylinderGeometry args={[base, base, PLATFORM_HEIGHT - LIP_THICKNESS, 96, 1, true]} />
        <Plaster repeat={1} color={PLATFORM_COLOR} />
      </mesh>
      {/* Its light on the floor around the base */}
      <mesh rotation-x={-Math.PI * 0.5} position-y={-PLATFORM_HEIGHT + 0.002}>
        <planeGeometry args={[glowOuter * 2, glowOuter * 2]} />
        <meshBasicMaterial map={glow} color={[0.16, 0.17, 0.18]} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

// The studio is one continuous surface: a big floor that sweeps up into the back wall
// (an "infinity cove"), so there's no seam or edge anywhere to catch the light.
// Local -Z points away from the camera; the group is rotated to face the camera.
const COVE = {
  front: 25, // floor reaches this far toward (and behind) the camera
  start: 12, // the curve starts this far behind the car
  radius: 5, // curve radius where floor turns into wall
  height: 22,
  width: 80,
}
// How much of the room light the floor keeps away from the car, and how fast it falls off
const FAR_SHADE = 0.22
const LIT_RADIUS = PLATFORM_RADIUS + 0.6 // fully lit out to just past the platform glow
const FALLOFF_RADIUS = 11 // reaches FAR_SHADE here

// Brightness at a point on the studio surface: full around the car, easing down to FAR_SHADE
// on the floor, then a little darker up the wall
function studioShade(x, d, h) {
  const r = Math.hypot(x, d)
  const t = Math.min(Math.max((r - LIT_RADIUS) / (FALLOFF_RADIUS - LIT_RADIUS), 0), 1)
  const floor = 1 - (1 - FAR_SHADE) * (1 - Math.pow(1 - t, 2)) // smooth ease-out
  return floor * (1 - 0.4 * Math.min(h / COVE.height, 1))
}

function coveGeometry() {
  const { front, start, radius, height, width } = COVE
  // Cross-section [distance away from the camera, height], dense enough for a smooth falloff
  const profile = []
  for (let d = -front; d < start; d += 0.5) profile.push([d, 0])
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 0.5
    profile.push([start + Math.sin(a) * radius, radius - Math.cos(a) * radius])
  }
  for (let h = radius + 1; h <= height; h += 1) profile.push([start + radius, h])

  const columns = Math.round(width) + 1
  const positions = []
  const uvs = []
  const colors = []
  let along = 0 // distance along the surface, so the plaster tiles evenly over floor and wall
  profile.forEach(([d, h], i) => {
    if (i > 0) along += Math.hypot(d - profile[i - 1][0], h - profile[i - 1][1])
    for (let c = 0; c < columns; c++) {
      const x = -width / 2 + (c / (columns - 1)) * width
      positions.push(x, h, -d)
      uvs.push(x / PLASTER_TILE, along / PLASTER_TILE)
      const shade = studioShade(x, d, h)
      colors.push(shade, shade, shade)
    }
  })
  const index = []
  for (let i = 0; i < profile.length - 1; i++) {
    for (let c = 0; c < columns - 1; c++) {
      const a = i * columns + c
      const b = a + columns
      index.push(a, a + 1, b, a + 1, b + 1, b) // counter-clockwise from above, so the surface faces up/in
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2))
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
  geometry.setIndex(index)
  geometry.computeVertexNormals()
  return geometry
}

// One static mesh, one draw call
export function Studio({ facing }) {
  const geometry = useMemo(coveGeometry, [])
  return (
    <group rotation-y={facing} position-y={FLOOR_Y}>
      <mesh geometry={geometry} receiveShadow>
        <Plaster repeat={1} vertexColors />
      </mesh>
    </group>
  )
}
