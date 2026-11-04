import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";

const WHEEL_NAME = /^wheel_[FMR][LR]$/

// Spins the wheels of a car built with the optimization preset while `motion` is on.
// Each wheel_FL / wheel_FR / ... node holds a library wheel whose rolling part ends in
// "_spin" (wheel_spin, wheel_speed_spin, wheel_whitewall_spin; the loader adds _1, _2 to
// repeats, so match by name). Right-side wheels are turned 180° to face out, so they spin
// the other way round their own axis.
export function useWheelSpin(scene, motion, speed = 2) {
  const spinners = useMemo(() => {
    const found = []
    scene.traverse((wheel) => {
      if (!WHEEL_NAME.test(wheel.name)) return
      let node
      wheel.traverse((child) => {
        if (!node && /_spin(_\d+)?$/.test(child.name)) node = child
      })
      if (node) found.push({ node, direction: wheel.name.endsWith("R") ? -1 : 1 })
    })
    return found
  }, [scene])

  useFrame((state) => {
    if (!motion) return
    const angle = state.clock.getElapsedTime() * speed
    spinners.forEach(({ node, direction }) => { node.rotation.x = angle * direction })
  })
}
