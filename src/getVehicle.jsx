import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from "@react-three/fiber"
import { CameraControls, CameraControlsImpl } from "@react-three/drei"
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { MathUtils, Vector3 } from "three";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

import { Studio, Platform, PLATFORM_HEIGHT } from './Ground';
import { Turntable } from './Turntable';
import { LightPools } from './LightPools';
import { Landing } from './Landing';
import { StudioReflections } from './StudioEnvironment';
import { StudioLights } from './StudioLights';

RectAreaLightUniformsLib.init();

// Fixed camera in front of the car, the same for every car; the turntable spins the car
// instead of orbiting the camera
const CAMERA_POSITION = [3, 2, 5]
const CAMERA_AZIMUTH = Math.atan2(CAMERA_POSITION[0], CAMERA_POSITION[2])
const CAMERA_FOV = 50
const CAMERA_TARGET = new Vector3(0, 0.85, 0) // middle of a car standing on the platform
// Viewing direction from the car toward the camera
const CAMERA_DIRECTION = new Vector3(...CAMERA_POSITION).sub(CAMERA_TARGET).normalize()
// Camera distance from the target on a landscape screen (meters)
const ZOOM_START = 6.5
const ZOOM_IN = 4.5 // closest
const ZOOM_OUT = 11
const { ACTION } = CameraControlsImpl
const STUDIO_BACKGROUND = "#0a0a0a"

function Vehicle(props) {
  const {
    children,
    motion,
    color,
    carKey,
    hover,
  } = props

  // The canvas only renders on demand, so redraw after a model recolors its materials.
  // Child effects run first, so the new colors are already applied here.
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    invalidate()
  }, [color, invalidate])

  const carRef = useRef()
  const controls = useRef()
  // Bumped each time a car finishes loading; the re-render re-fits the floor glow and
  // re-applies the reflections to the new car
  const [carVersion, setCarVersion] = useState(0)
  const onCarReady = useCallback(() => setCarVersion((v) => v + 1), [])
  const size = useThree(state => state.size)

  // Same camera spot and zoom range for every car. Portrait screens (phones) are narrower than
  // tall, so the camera steps back just enough to show the same width of the scene.
  useEffect(() => {
    const halfFov = MathUtils.degToRad(CAMERA_FOV / 2)
    const aspect = size.width / size.height
    const scale = aspect < 1 ? Math.tan(halfFov) / Math.tan(Math.atan(Math.tan(halfFov) * aspect)) : 1

    const c = controls.current
    c.minDistance = ZOOM_IN * scale
    c.maxDistance = ZOOM_OUT * scale
    const position = CAMERA_TARGET.clone().addScaledVector(CAMERA_DIRECTION, ZOOM_START * scale)
    c.setLookAt(position.x, position.y, position.z, CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z, false)
  }, [size.width, size.height])

  return (
    <>
      {/* Camera only tilts up/down and zooms; sideways drags spin the turntable.
          Spring damping (smoothTime) eases every tilt and zoom instead of jumping. */}
      <CameraControls
        ref={controls}
        minAzimuthAngle={CAMERA_AZIMUTH}
        maxAzimuthAngle={CAMERA_AZIMUTH}
        minPolarAngle={1.12} // only a small, slow tilt: the view stays at car height
        maxPolarAngle={1.34} // stays above the platform lip
        smoothTime={0.45}
        draggingSmoothTime={0.25}
        azimuthRotateSpeed={0}
        polarRotateSpeed={0.25}
        dollySpeed={0.35}
        mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.DOLLY, right: ACTION.NONE, wheel: ACTION.DOLLY }}
        touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
      />

      {/* Neutral dark-gray studio: far floor and wall fade into this instead of pure black */}
      <color args={[STUDIO_BACKGROUND]} attach="background" />
      <fog attach="fog" args={[STUDIO_BACKGROUND, 16, 50]} />

      <StudioLights cameraAzimuth={CAMERA_AZIMUTH} />

      <group position-y={PLATFORM_HEIGHT}>
        <Turntable>
          {/* Each car drops onto the platform and settles once it has loaded */}
          <Landing carKey={carKey} landed={carVersion} hover={hover}>
            <group ref={carRef}>
              {/* The studio stays up while the next car loads; keyed so each car remounts cleanly */}
              <Suspense key={carKey} fallback={null}>
                {children}
                <CarReady onReady={onCarReady} />
              </Suspense>
            </group>
          </Landing>
          <LightPools carRef={carRef} version={carVersion} />
          <Platform />
        </Turntable>
      </group>

      {/* After the car, so it can finish the car's materials once the model has set them up */}
      <StudioReflections carRef={carRef} cameraAzimuth={CAMERA_AZIMUTH} />

      <Studio facing={CAMERA_AZIMUTH} />

      <EffectComposer>
        {/* <DepthOfField focusDistance={0.0035} focalLength={0.01} bokehScale={3} height={480} /> */}
        <Bloom
          mipmapBlur // cheaper than the old kernel blur
          blendFunction={BlendFunction.ADD}
          intensity={1} // The bloom intensity.
          radius={0.4} // spread of the glow, 0-1
          levels={5} // mip levels, fewer = tighter glow
          luminanceThreshold={1} // scene is HDR until tone mapping, so only emissive lights (> 1) glow
          luminanceSmoothing={0.3} // smoothness of the luminance threshold. Range is [0, 1]
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={[0.0005, 0.0012]} // color offset
        />
        <Vignette offset={0.35} darkness={0.55} /> {/* darker corners, like a studio photo */}
        {/* EffectComposer turns off the renderer's tone mapping, so apply it as the last effect */}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  )
}

// Renders after the car inside the same Suspense, so its effect fires once the car is loaded
// and its own setup effects have run
function CarReady({ onReady }) {
  useEffect(() => { onReady() }, [onReady])
  return null
}

// The one studio canvas every car is shown in. Renders on demand while the car is still
// (orbit controls and recolors trigger frames) and every frame while it's in motion.
export default function VehicleCanvas(props) {
  const {
    children,
    motion = false,
    color,
    carKey,
    hover = false, // hovercraft float in instead of dropping onto wheels
  } = props

  return (
    // Camera set here (not a <PerspectiveCamera makeDefault>) so CameraControls binds to it from the start
    <Canvas shadows dpr={[1, 1.5]} frameloop={motion ? "always" : "demand"} camera={{ fov: CAMERA_FOV, position: CAMERA_POSITION }}>
      <Suspense fallback={null}>
        <Vehicle motion={motion} color={color} carKey={carKey} hover={hover}>
          {children}
        </Vehicle>
      </Suspense>
    </Canvas>
  )
}
