import React, { useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";

export function J11(props) {
    const {
        vehicleData
    } = props

    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "models/J11/J11object.gltf"
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

        const frontCylinder = gltf.scene.children.find(element => { return element.name === "FrontCylinder" })
        frontCylinder.castShadow = false;
        frontCylinder.receiveShadow = false;
        const backCylinder = gltf.scene.children.find(element => { return element.name === "BackCylinder" })
        backCylinder.castShadow = false;
        backCylinder.receiveShadow = false;

        const base = gltf.materials["j11base"]
        const trim1 = gltf.materials["j11trim1"]
        const trim2 = gltf.materials["j11trim2"]
        const rim = gltf.materials["j11rim"]
        
        if (vehicleData.color === "j11og") {
            base.color.setHex(0x000000)
            trim1.color.setHex(0xffffff)
            trim2.color.setHex(0x970009)
            rim.color.setHex(0x970009)
        } else if (vehicleData.color === "j11gray") {
            base.color.setHex(0x666666)
            trim1.color.setHex(0xffffff)
            trim2.color.setHex(0x666666)
            rim.color.setHex(0x666666)
        } else if (vehicleData.color === "j11redwhite") {
            base.color.setHex(0x970009)
            trim1.color.setHex(0xffffff)
            trim2.color.setHex(0x666666)
            rim.color.setHex(0x666666)
        } else if (vehicleData.color === "j11spacejam") {
            base.color.setHex(0x000000)
            trim1.color.setHex(0xffffff)
            trim2.color.setHex(0x7fabc6)
            rim.color.setHex(0x000000)
        } else if (vehicleData.color === "j11gamma") {
            base.color.setHex(0x000000)
            trim1.color.setHex(0x000000)
            trim2.color.setHex(0x1c3c4c)
            rim.color.setHex(0x1c3c4c)
        } else if (vehicleData.color === "j11carolina") {
            base.color.setHex(0x0081d1)
            trim1.color.setHex(0xffffff)
            trim2.color.setHex(0x666666)
            rim.color.setHex(0x0081d1)
        } else {
            rim.color.setHex(0x970009)
        }
    }, [gltf, vehicleData.color]);

    useFrame((state, delta) => {
        if (vehicleData.motion) {
            let t = state.clock.getElapsedTime();

            let L1 = gltf.scene.children.find(element => { return element.name === "rim001" })
            L1.rotation.x = t * 2;
            let L2 = gltf.scene.children.find(element => { return element.name === "rim002" })
            L2.rotation.x = t * 2;
            let L3 = gltf.scene.children.find(element => { return element.name === "rim003" })
            L3.rotation.x = t * 2;
            let L4 = gltf.scene.children.find(element => { return element.name === "rim004" })
            L4.rotation.x = t * 2;
        };
    });

    return <primitive object={gltf.scene} />;
}