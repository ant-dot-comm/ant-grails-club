import React, { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

export function J9(props) {
    const {
        vehicleData
    } = props

    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "models/J9/J9object.gltf"
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

        const base = gltf.materials["j9 base"]
        const wheelWell = gltf.materials["j9 base wheel well"]
        const sole = gltf.materials["j9 base sole"]
        const humps = gltf.materials["j9 trim humps"]
        const trimMid = gltf.materials["j9 trim mid"]
        const top = gltf.materials["j9 trim top"]
        const sideTop1 = gltf.materials["j9 trim top front"]
        const sideTop2 = gltf.materials["j9 trim top back"]
        
        if (vehicleData.color === "j9og") {
            base.color.setHex(0xffffff)
            trimMid.color.setHex(0x111111)
            humps.color.setHex(0x111111)
            top.color.setHex(0x111111)
            sideTop1.color.setHex(0x111111)
            sideTop2.color.setHex(0x111111)
            sole.color.setHex(0xffffff)
            wheelWell.color.setHex(0xffffff)
        } else if (vehicleData.color === "j9flint") {
            base.color.setHex(0x686868)
            trimMid.color.setHex(0x686868)
            humps.color.setHex(0x686868)
            top.color.setHex(0x868686)
            sideTop1.color.setHex(0x868686)
            sideTop2.color.setHex(0x868686)
            sole.color.setHex(0xffffff)
            wheelWell.color.setHex(0xffffff)
        } else if (vehicleData.color === "j9olive") {
            base.color.setHex(0x222222)
            trimMid.color.setHex(0x222222)
            humps.color.setHex(0x222222)
            top.color.setHex(0x5D5D00)
            sideTop1.color.setHex(0x5D5D00)
            sideTop2.color.setHex(0x5D5D00)
            sole.color.setHex(0x222222)
            wheelWell.color.setHex(0x222222)
        } else if (vehicleData.color === "j9dreamIt") {
            base.color.setHex(0x222222)
            trimMid.color.setHex(0x222222)
            humps.color.setHex(0x222222)
            top.color.setHex(0x63477A)
            sideTop1.color.setHex(0x249A8A)
            sideTop2.color.setHex(0xE7AF1D)
            sole.color.setHex(0xffffff)
            wheelWell.color.setHex(0xffffff)
        } else if (vehicleData.color === "j9doIt") {
            base.color.setHex(0x222222)
            trimMid.color.setHex(0x222222)
            humps.color.setHex(0x222222)
            top.color.setHex(0x970009)
            sideTop1.color.setHex(0x249A8A)
            sideTop2.color.setHex(0x63477A)
            sole.color.setHex(0xffffff)
            wheelWell.color.setHex(0xffffff)
        } else if (vehicleData.color === "j9grayblack") {
            base.color.setHex(0xffffff)
            trimMid.color.setHex(0x222222)
            humps.color.setHex(0x222222)
            top.color.setHex(0x999999)
            sideTop1.color.setHex(0x999999)
            sideTop2.color.setHex(0x999999)
            sole.color.setHex(0xffffff)
            wheelWell.color.setHex(0xffffff)
        } else if (vehicleData.color === "j9blackgrey") {
            base.color.setHex(0x333333)
            trimMid.color.setHex(0x222222)
            humps.color.setHex(0x222222)
            top.color.setHex(0x999999)
            sideTop1.color.setHex(0x999999)
            sideTop2.color.setHex(0x999999)
            sole.color.setHex(0x333333)
            wheelWell.color.setHex(0x333333)
        } else if (vehicleData.color === "j9carolina") {
            base.color.setHex(0xe3e3e3)
            trimMid.color.setHex(0x0081d1)
            humps.color.setHex(0x0081d1)
            top.color.setHex(0xe3e3e3)
            sideTop1.color.setHex(0xe3e3e3)
            sideTop2.color.setHex(0xe3e3e3)
            sole.color.setHex(0xe3e3e3)
            wheelWell.color.setHex(0xe3e3e3)
        }
    }, [gltf, vehicleData.color]);

    return <primitive object={gltf.scene} />;
}