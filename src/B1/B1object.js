import React, { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

export function B1() {    
    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "models/BatWheels/bat1.gltf"
    );
  
    useEffect(() => {
        gltf.scene.scale.set(.5, .5, .5); 
        gltf.scene.position.set(0, .14, 0);
        gltf.scene.traverse((object) => {
            if (object instanceof Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.envMapIntensity = 20;
            }
        });
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}