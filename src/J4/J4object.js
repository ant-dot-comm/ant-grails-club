import React, { useEffect } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

export function J4(props) {
    const {
        vehicleData
    } = props

    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "/models/J4/J4object.gltf"
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

        const backCylinder = gltf.scene.children.find(element => { return element.name === "back_Cylinder" })
        backCylinder.castShadow = false;
        backCylinder.receiveShadow = false;
        backCylinder.material.opacity = 0

        const base = gltf.materials["j4 base"]
        const accent1 = gltf.materials["j4 accent 1"]
        const accent2 = gltf.materials["j4 accent 2"]
        const accent3 = gltf.materials["j4 accent 3"]
        const trimTop = gltf.materials["j4 trim top"]
        const trimTopLeft = gltf.materials["j4 trim top left"]
        const trimMid = gltf.materials["j4 trim mid"]
        const trimSole = gltf.materials["j4 trim sole"]
        const rim = gltf.materials["j7 rims"]
        const rimLogo = gltf.materials["j7 rims logo"]

        if (vehicleData.color === "j4og") {
            base.color.setHex(0x56A7E7)
            accent1.color.setHex(0x333333)
            accent2.color.setHex(0xDC0500)
            accent3.color.setHex(0x333333)
            trimTop.color.setHex(0x56A7E7)
            trimTopLeft.color.setHex(0xffffff)
            trimMid.color.setHex(0xffffff)
            trimSole.color.setHex(0x333333)
            rim.color.setHex(0xdddddd)
            rimLogo.color.setHex(0x56A7E7)
        } else if (vehicleData.color === "j4black") {
            base.color.setHex(0x333333)
            accent1.color.setHex(0x666666)
            accent2.color.setHex(0x666666)
            accent3.color.setHex(0x333333)
            trimTop.color.setHex(0x333333)
            trimTopLeft.color.setHex(0x333333)
            trimMid.color.setHex(0xffffff)
            trimSole.color.setHex(0x666666)
            rim.color.setHex(0xDC0500)
            rimLogo.color.setHex(0x333333)
        } else if (vehicleData.color === "j4white") {
            base.color.setHex(0xdddddd)
            accent1.color.setHex(0x333333)
            accent2.color.setHex(0xffffff)
            accent3.color.setHex(0xdddddd)
            trimTop.color.setHex(0xdddddd)
            trimTopLeft.color.setHex(0xdddddd)
            trimMid.color.setHex(0xffffff)
            trimSole.color.setHex(0x333333)
            rim.color.setHex(0xdddddd)
            rimLogo.color.setHex(0xdddddd)
        } else if (vehicleData.color === "j4red") {
            base.color.setHex(0xDC0500)
            accent1.color.setHex(0x666666)
            accent2.color.setHex(0x666666)
            accent3.color.setHex(0x333333)
            trimTop.color.setHex(0x333333)
            trimTopLeft.color.setHex(0x333333)
            trimMid.color.setHex(0xdddddd)
            trimSole.color.setHex(0xdddddd)
            rim.color.setHex(0xdddddd)
            rimLogo.color.setHex(0xDC0500)
        }
    }, [gltf, vehicleData.color]);

    useFrame((state, delta) => {
        if (vehicleData.motion) {
            let t = state.clock.getElapsedTime();

            let L1 = gltf.scene.children.find(element => { return element.name === "rim" })
            L1.rotation.x = t * 2;
            let L2 = gltf.scene.children.find(element => { return element.name === "rim001" })
            L2.rotation.x = t * 2;
            let L3 = gltf.scene.children.find(element => { return element.name === "rim002" })
            L3.rotation.x = t * 2;
            let L4 = gltf.scene.children.find(element => { return element.name === "rim003" })
            L4.rotation.x = t * 2;
        };
    });

    return <primitive object={gltf.scene} />;
}