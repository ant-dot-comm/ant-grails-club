import React from "react";

// Classic car-studio lighting:
//  - key: one big soft light directly overhead (the "light canopy"), for the long soft
//    highlight along the roof, hood and shoulders
//  - front: a large softbox on the camera side, so whatever faces the viewer is lit
//  - rims: two gentle lights behind the car, left and right, to trace its silhouette
//    against the dark background
//  - a soft overhead spot that only adds the contact shadow under the car, and a faint fill
// Lights are fixed in the studio; the turntable spins the car under them.
// Only the shadow spot casts shadows (one shadow pass per frame while something moves).

const RIM_DISTANCE = 6
const RIM_HEIGHT = 1.8
const RIM_SPREAD = 0.95 // radians either side of straight behind the car

const FRONT_DISTANCE = 7
const FRONT_HEIGHT = 3
export const CAR_CENTER = [0, 0.8, 0]

// Softbox on the camera side, slightly above the lens
export function frontPosition(cameraAzimuth) {
  return [Math.sin(cameraAzimuth) * FRONT_DISTANCE, FRONT_HEIGHT, Math.cos(cameraAzimuth) * FRONT_DISTANCE]
}

// Positions on the far side of the car from the camera at `cameraAzimuth`
export function rimPositions(cameraAzimuth) {
  const behind = cameraAzimuth + Math.PI
  return [-RIM_SPREAD, RIM_SPREAD].map((offset) => [
    Math.sin(behind + offset) * RIM_DISTANCE,
    RIM_HEIGHT,
    Math.cos(behind + offset) * RIM_DISTANCE,
  ])
}

export function StudioLights({ cameraAzimuth }) {
  return (
    <>
      {/* Key: big overhead softbox, facing down */}
      <rectAreaLight width={5} height={8} intensity={3} color="#ffffff" position={[0, 7, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Front: big softbox from the camera side, aimed at the car */}
      <rectAreaLight
        width={6}
        height={3}
        intensity={2.2}
        color="#ffffff"
        position={frontPosition(cameraAzimuth)}
        ref={(light) => light?.lookAt(...CAR_CENTER)}
      />

      {/* Rims for the silhouette, kept gentle (physical units: decay 0 so they don't fade with distance) */}
      {rimPositions(cameraAzimuth).map((position, i) => (
        <spotLight key={i} color="#ffffff" intensity={Math.PI * 1.1} decay={0} angle={0.45} penumbra={1} position={position} />
      ))}

      {/* Soft overhead spot, mainly for the shadow under the car */}
      <spotLight
        color="#ffffff"
        intensity={Math.PI * 0.22}
        decay={0}
        angle={0.55}
        penumbra={1}
        position={[0, 9, 0.01]}
        castShadow
        shadow-bias={-0.001}
        shadow-mapSize={[1024, 1024]}
      />

      {/* Faint fill so the shadow side isn't pure black */}
      <hemisphereLight args={["#ffffff", "#202020", 0.25]} />
    </>
  );
}
