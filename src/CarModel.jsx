import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

import { applyCarPaint, applyColorway, applyGlass, TINTED_GLASS } from "./colorways";
import { useWheelSpin } from "./useWheelSpin";

// A car exported with the optimization preset: models/<car>/<car>.glb with standard
// material names (paint_*, rim, tire, light_*, glass). Casts and receives shadows, gets the
// satin paint finish and the car's glass tint, applies the chosen colorway and spins its
// wheels while `motion` is on.
const NO_COLORWAYS = {}

export function CarModel({ car, colorways = NO_COLORWAYS, color, motion = false, glass = TINTED_GLASS }) {
  const gltf = useGLTF(`${import.meta.env.BASE_URL}models/${car}/${car}.glb`);

  useWheelSpin(gltf.scene, motion);

  useEffect(() => {
    gltf.scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    applyCarPaint(gltf.materials);
    applyGlass(gltf.materials, glass); // before the first colorway, so it becomes the default
  }, [gltf, glass]);

  useEffect(() => {
    if (colorways[color]) applyColorway(gltf.materials, colorways[color]);
  }, [gltf, colorways, color]);

  return <primitive object={gltf.scene} />;
}
