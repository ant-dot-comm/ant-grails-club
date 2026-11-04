import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

import { CAR_CENTER, frontPosition, rimPositions } from "./StudioLights";

const REFLECTION_STRENGTH = 0.6

// Studio reflections for the car only: the same softboxes as StudioLights (overhead canopy,
// front softbox, two rim strips), so the paint mirrors the lights.
// frames={1} renders the reflection map once at load, so it costs nothing per frame.
// The softboxes stay fixed while the turntable spins, so highlights glide across the paint.
//
// drei puts the map on scene.environment, which would light every surface (three ignores
// per-material envMapIntensity for scene.environment). So we move it onto the car's own
// materials and clear scene.environment: the studio itself stays dark and fades to black.
//
// The same pass gives every car the same finish: reflections at REFLECTION_STRENGTH (older
// models boost theirs to 20) and a soft, satin clear coat instead of a glossy one.
// It runs after the model's own effects (it renders after the car), and again whenever the
// car re-renders, since some models reset these values when their colorway changes.
export function StudioReflections({ carRef, cameraAzimuth }) {
  const { scene, invalidate } = useThree()
  const map = useRef(null)

  useEffect(() => {
    if (scene.environment) {
      map.current = scene.environment
      scene.environment = null
    }
    if (!map.current) return
    carRef.current.traverse((object) => {
      const materials = object.isMesh ? [].concat(object.material) : []
      materials.forEach((material) => {
        if (!("envMap" in material)) return
        if (material.envMap !== map.current) {
          material.envMap = map.current
          material.needsUpdate = true
        }
        material.envMapIntensity = REFLECTION_STRENGTH
        if (material.clearcoat > 0) {
          material.clearcoat = Math.min(material.clearcoat, 0.35)
          material.clearcoatRoughness = Math.max(material.clearcoatRoughness, 0.3)
        }
      })
    })
    invalidate()
  })

  return (
    <Environment frames={1} resolution={256} background={false}>
      <color attach="background" args={["#050505"]} />
      {/* Overhead canopy */}
      <Lightformer form="rect" intensity={2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[5, 8, 1]} />
      {/* Rim strips behind the car, tall and narrow, facing it */}
      {rimPositions(cameraAzimuth).map((position, i) => (
        <Lightformer key={i} form="rect" intensity={0.9} position={position} scale={[1, 3, 1]} target={CAR_CENTER} />
      ))}
      {/* Front softbox on the camera side */}
      <Lightformer form="rect" intensity={1.2} position={frontPosition(cameraAzimuth)} scale={[6, 3, 1]} target={CAR_CENTER} />
    </Environment>
  );
}
