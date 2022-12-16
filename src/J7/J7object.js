import React, { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

export function J7(props) {
    const {
        color
    } = props

    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "/models/J7/J7object.gltf"
    );
  
    useEffect(() => {
        gltf.scene.scale.set(1, 1, 1); 
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.traverse((object) => {
            if (object instanceof Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.envMapIntensity = 20;
            }
        });

        const base1 = gltf.materials["j7 base color 1"]
        const base2 = gltf.materials["j7 base color 2"]
        const base3 = gltf.materials["j7 base color 3"]
        const accent1 = gltf.materials["j7 accent 1"]
        const accent2 = gltf.materials["j7 accent 2"]
        const under = gltf.materials["j7 under color"]

        if (color.color === "j7og") {
            base1.color.setHex(0x999999)
            base2.color.setHex(0x666666)
            base3.color.setHex(0x666666)
            accent1.color.setHex(0xB9256B)
            accent2.color.setHex(0x680BE7)
            under.color.setHex(0x111111)
        } else if (color.color === "j7french") {
            base1.color.setHex(0xdddddd)
            base2.color.setHex(0xdddddd)
            base3.color.setHex(0xdddddd)
            accent1.color.setHex(0x2D82BD)
            accent2.color.setHex(0x175179)
            under.color.setHex(0xdddddd)
        } else if (color.color === "j7white") {
            base1.color.setHex(0x999999)
            base2.color.setHex(0x666666)
            base3.color.setHex(0x999999)
            accent1.color.setHex(0x999999)
            accent2.color.setHex(0x666666)
            under.color.setHex(0x333333)
        } else if (color.color === "j7tan") {
            base1.color.setHex(0xa57530)
            base2.color.setHex(0xa57530)
            base3.color.setHex(0x333333)
            accent1.color.setHex(0x4c2d63)
            accent2.color.setHex(0xa57530)
            under.color.setHex(0x333333)
        }
  }, [gltf, color.color]);

  return <primitive object={gltf.scene} />;
}