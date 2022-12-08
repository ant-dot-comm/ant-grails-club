import React from 'react';
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { isMobile } from 'react-device-detect';

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

// import { Ground } from './Ground'; 
// import { Effects } from './Effects';

RectAreaLightUniformsLib.init();

function Vehicle(props) {
  const {
    children,
    // motion,
  } = props

  return (
    <>
      {isMobile ? (
        <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} maxDistance={15} minDistance={10} />
      ) : (
        <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} maxDistance={10} minDistance={2} />
      )}
      <PerspectiveCamera makeDefault fov ={50} position={[3, 2, 5]} />

      <color args={[0,0,0]} attach="background" />

      <spotLight 
        color={[1, 1, 1]}
        intensity={1}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 3]}
        castShadow
        shadow-bias={-0.001}
      />
      <rectAreaLight
        width={2}
        height={20}
        intensity={2}
        color={[1, 1, 1]}
        position={[0, 5, 0]}
        rotation={[30, 0, 0]}
      />
      <spotLight 
        color={[0.14, 0.5, 1]}
        intensity={1}
        angle={0.6}
        penumbra={[0.5]}
        position={[-5, 5, -3]}
        castShadow
        shadow-bias={-0.001}
      />

      {children}

      {/* <Ground hasMotion={motion} /> */}

      <EffectComposer>
        {/* <DepthOfField focusDistance={0.0035} focalLength={0.01} bokehScale={3} height={480} /> */}
        <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={1} // The bloom intensity.
          width={300} // render width
          height={300} // render height
          kernelSize={5} // blur kernel size
          luminanceThreshold={0.5} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.5} // smoothness of the luminance threshold. Range is [0, 1]
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={[0.0005, 0.0012]} // color offset
        />
      </EffectComposer>
    </>
  )
}

export default Vehicle;