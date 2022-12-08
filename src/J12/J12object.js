import React, { useEffect } from "react";
import { useFrame,  useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

export function J12(props) {
    const {
        vehicleData
    } = props

    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "models/J12/J12object.gltf"
    );
  
    useEffect(() => {
        gltf.scene.scale.set(.8, .8, .8); 
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.traverse((object) => {
            if (object instanceof Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.envMapIntensity = 20;
            }               
        });

        const base = gltf.materials["j12base"]
        const sole = gltf.materials["j12sole"]
        const trim1 = gltf.materials["j12trim1"]
        const trim2 = gltf.materials["j12trim2"]
        const trim3 = gltf.materials["j12trim3"]
        const trim4 = gltf.materials["j12trim4"]
        const trim5 = gltf.materials["j12trim5"]
        
        if (vehicleData.color === "j12og") {
            base.color.setHex(0x000000)
            sole.color.setHex(0x000000)
            trim1.color.setHex(0x970009)
            trim2.color.setHex(0x970009)
            trim3.color.setHex(0x970009)
            trim4.color.setHex(0x970009)
            trim5.color.setHex(0x970009)
        } else if (vehicleData.color === "j12blue") {
            base.color.setHex(0xffffff)
            sole.color.setHex(0x000000)
            trim1.color.setHex(0x284DC1)
            trim2.color.setHex(0x284DC1)
            trim3.color.setHex(0x999999)
            trim4.color.setHex(0x284DC1)
            trim5.color.setHex(0x284DC1)
        } else if (vehicleData.color === "j12blackwhite") {
            base.color.setHex(0xffffff)
            sole.color.setHex(0x000000)
            trim1.color.setHex(0x333333)
            trim2.color.setHex(0x333333)
            trim3.color.setHex(0x333333)
            trim4.color.setHex(0x333333)
            trim5.color.setHex(0x333333)
        } else if (vehicleData.color === "j12red") {
            base.color.setHex(0xffffff)
            sole.color.setHex(0x000000)
            trim1.color.setHex(0x970009)
            trim2.color.setHex(0x970009)
            trim3.color.setHex(0x970009)
            trim4.color.setHex(0x970009)
            trim5.color.setHex(0x970009)
        } else if (vehicleData.color === "j12nubuck") {
            base.color.setHex(0x333333)
            sole.color.setHex(0x333333)
            trim1.color.setHex(0x333333)
            trim2.color.setHex(0x333333)
            trim3.color.setHex(0x0081d1)
            trim4.color.setHex(0x333333)
            trim5.color.setHex(0x333333)
        }
    }, [gltf, vehicleData.color]);

    useFrame((state, delta) => {
        if (vehicleData.motion) {
            let t = state.clock.getElapsedTime();

            let Lrim1 = gltf.scene.children.find(element => { return element.name === "rim" })
            Lrim1.rotation.x = t * 2;
            let Lrim2 = gltf.scene.children.find(element => { return element.name === "rim001" })
            Lrim2.rotation.x = t * 2;
            let Lrim3 = gltf.scene.children.find(element => { return element.name === "rim002" })
            Lrim3.rotation.x = t * 2;
            let Lrim4 = gltf.scene.children.find(element => { return element.name === "rim003" })
            Lrim4.rotation.x = t * 2;

            let L11 = gltf.scene.children.find(element => { return element.name === "treadL11" })
            L11.rotation.x = t * 2;
            let L12 = gltf.scene.children.find(element => { return element.name === "treadL12" })
            L12.rotation.x = t * 2;
            let L21 = gltf.scene.children.find(element => { return element.name === "treadL21" })
            L21.rotation.x = t * 2;
            let L22 = gltf.scene.children.find(element => { return element.name === "treadL22" })
            L22.rotation.x = t * 2;

            let R11 = gltf.scene.children.find(element => { return element.name === "treadR11" })
            R11.rotation.x = t * 2;
            let R12 = gltf.scene.children.find(element => { return element.name === "treadR12" })
            R12.rotation.x = t * 2;
            let R21 = gltf.scene.children.find(element => { return element.name === "treadR21" })
            R21.rotation.x = t * 2;
            let R22 = gltf.scene.children.find(element => { return element.name === "treadR22" })
            R22.rotation.x = t * 2;
        };
    });

    return <primitive object={gltf.scene} />;
}