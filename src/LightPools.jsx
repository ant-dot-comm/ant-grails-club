import React, { useEffect, useMemo, useState } from "react";
import { AdditiveBlending, Box3, CanvasTexture, Color, Mesh, Vector3 } from "three";

const POOL_LENGTH = 1.8
const POOL_HEIGHT = 0.005 // just above the platform
const WHEEL_NAME = /^wheel_[FMR][LR]$/

// Is this part inside one of the car's wheel_FL / wheel_FR / ... nodes?
function inWheel(object, car) {
  for (let node = object; node && node !== car; node = node.parent) {
    if (WHEEL_NAME.test(node.name)) return true
  }
  return false
}

// Soft gradient painted on a canvas: bright at one edge (the lamp) fading outward,
// or bright in the middle for lights that sit over the car (under-glow).
function gradientTexture(round) {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  const g = round
    ? ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    : ctx.createRadialGradient(64, 128, 0, 64, 128, 128)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.35, "rgba(255,255,255,0.35)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  if (!round) {
    // Fade the sides too, so the beam has no hard edges
    const sides = ctx.createLinearGradient(0, 0, 128, 0)
    sides.addColorStop(0, "rgba(255,255,255,0)")
    sides.addColorStop(0.5, "rgba(255,255,255,1)")
    sides.addColorStop(1, "rgba(255,255,255,0)")
    ctx.globalCompositeOperation = "destination-in"
    ctx.fillStyle = sides
    ctx.fillRect(0, 0, 128, 128)
  }
  return new CanvasTexture(canvas)
}

// Fake light cast on the floor by each glowing part of the car (headlights,
// taillights, under-glow). Flat additive planes, so they cost almost nothing.
export function LightPools({ carRef, version }) {
  const [pools, setPools] = useState([])
  const textures = useMemo(() => ({ beam: gradientTexture(false), round: gradientTexture(true) }), [])

  useEffect(() => {
    // Measure in the car's own space (the turntable may already be turned when a car loads)
    const car = carRef.current
    car.updateWorldMatrix(true, true)
    const toCar = car.matrixWorld.clone().invert()
    const boxInCar = (object) => {
      const box = new Box3()
      object.traverse((child) => {
        if (!child.isMesh) return
        child.geometry.computeBoundingBox()
        box.union(child.geometry.boundingBox.clone().applyMatrix4(toCar.clone().multiply(child.matrixWorld)))
      })
      return box
    }
    const carBox = boxInCar(car)
    const carCenter = carBox.getCenter(new Vector3())
    const carSize = carBox.getSize(new Vector3())
    const found = []

    car.traverse((object) => {
      const material = object instanceof Mesh && object.material
      if (!material || !material.emissive) return
      const strength = Math.max(material.emissive.r, material.emissive.g, material.emissive.b)
      if (strength < 0.05) return

      const box = boxInCar(object)
      const center = box.getCenter(new Vector3())
      const size = box.getSize(new Vector3())
      const out = new Vector3(center.x - carCenter.x, 0, center.z - carCenter.z)
      const color = new Color().copy(material.emissive).multiplyScalar(0.35)

      if (out.length() < Math.max(carSize.x, carSize.z) * 0.3) {
        // Light near the middle of the car: round pool underneath it
        const radius = Math.max(size.x, size.z) * 0.8 + 0.4
        found.push({ key: object.uuid, round: true, color, position: [center.x, POOL_HEIGHT, center.z], size: [radius * 2, radius * 2], angle: 0 })
        return
      }
      // Glowing wheels light the floor straight out to the side, along the axle (pointing
      // away from the car's center would send the four corner wheels out diagonally)
      if (inWheel(object, car)) out.set(Math.sign(out.x) || 1, 0, 0)
      out.normalize()
      const width = Math.max(size.x, size.z) + 0.6
      found.push({
        key: object.uuid,
        round: false,
        color,
        position: [center.x + out.x * POOL_LENGTH * 0.45, POOL_HEIGHT, center.z + out.z * POOL_LENGTH * 0.45],
        size: [width, POOL_LENGTH],
        angle: Math.atan2(out.x, out.z),
      })
    })
    setPools(found)
  }, [carRef, version]) // re-measure whenever a new car has loaded

  return pools.map((pool) => (
    <mesh key={pool.key} position={pool.position} rotation={[-Math.PI / 2, 0, pool.angle + Math.PI]}>
      <planeGeometry args={pool.size} />
      <meshBasicMaterial
        map={pool.round ? textures.round : textures.beam}
        color={pool.color}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  ))
}
