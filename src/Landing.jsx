import React, { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Matrix4 } from "three";

// Each new car arrives above the platform and settles onto it. Cars on wheels drop an inch
// and bounce on their suspension; hovercraft simply float down into place.
// On cars with separate wheels (wheel_FL, wheel_FR, ... from the optimization preset) the
// wheels stay planted after touchdown and only the body sinks and rocks on its suspension;
// older models with built-in wheels bounce as one piece.
// Animates only while landing (on-demand rendering goes idle again once it's settled).

// Damped springs after touchdown: [amplitude, frequency (rad/s), damping (1/s), phase]
const PROFILES = {
  wheels: {
    drop: 0.03, // meters above the platform when it appears (about an inch)
    fallTime: 0.16, // gravity, slowed a touch so it reads
    fall: (p) => 1 - p * p, // speeds up as it falls
    settleTime: 1.6,
    bounce: [0.012, 15, 4.5, 0], // body up/down on the suspension, meters
    pitch: [0.018, 11, 3.5, 0.5], // nose up/down, radians (~1°)
    roll: [0.01, 9, 3.2, 1.2], // side to side, radians
  },
  hover: {
    drop: 0.25,
    fallTime: 1.4,
    fall: (p) => Math.pow(1 - p, 3), // thrusters slow it to a stop right at hover height
    settleTime: 0, // no bob or sway afterwards
  },
}

const spring = ([amplitude, frequency, damping, phase], s) =>
  amplitude * Math.exp(-damping * s) * Math.sin(frequency * s + phase)

const WHEEL_NAME = /^wheel_[FMR][LR]$/

// Remember where each wheel sits relative to the turntable while the car is at rest
function plantWheels(group) {
  group.updateMatrixWorld(true)
  const toTurntable = group.parent.matrixWorld.clone().invert()
  const wheels = []
  group.traverse((object) => {
    if (!WHEEL_NAME.test(object.name)) return
    wheels.push({
      object,
      planted: toTurntable.clone().multiply(object.matrixWorld),
      rest: [object.position.clone(), object.quaternion.clone(), object.scale.clone()],
    })
  })
  return wheels
}

// Counter the body's motion on each wheel so the wheels stay where they touched down
const local = new Matrix4()
function holdWheels(group, wheels) {
  group.updateMatrixWorld(true)
  wheels.forEach(({ object, planted }) => {
    local.copy(object.parent.matrixWorld).invert().multiply(group.parent.matrixWorld).multiply(planted)
    local.decompose(object.position, object.quaternion, object.scale)
  })
}

function releaseWheels(wheels) {
  wheels.forEach(({ object, rest: [position, quaternion, scale] }) => {
    object.position.copy(position)
    object.quaternion.copy(quaternion)
    object.scale.copy(scale)
  })
}

export function Landing({ carKey, landed, hover = false, children }) {
  const ref = useRef()
  const start = useRef(null)
  const wheels = useRef(null)
  const invalidate = useThree((state) => state.invalidate)
  const profile = hover ? PROFILES.hover : PROFILES.wheels

  // A new car is on its way: lift the slot so it appears in the air once it has loaded
  useLayoutEffect(() => {
    start.current = null
    wheels.current = null
    ref.current.position.y = profile.drop
    ref.current.rotation.set(0, 0, 0)
  }, [carKey, profile])

  // The car has loaded: bring it down
  useLayoutEffect(() => {
    if (!landed) return
    start.current = performance.now()
    invalidate()
  }, [landed, invalidate])

  useFrame(() => {
    if (start.current === null) return
    const group = ref.current
    const t = (performance.now() - start.current) / 1000

    if (t < profile.fallTime) {
      group.position.y = profile.drop * profile.fall(t / profile.fallTime)
    } else if (t < profile.fallTime + profile.settleTime) {
      if (!wheels.current) {
        // Touchdown: plant the wheels where they landed
        group.position.y = 0
        group.rotation.set(0, 0, 0)
        wheels.current = plantWheels(group)
      }
      const s = t - profile.fallTime
      group.position.y = -spring(profile.bounce, s) // dips first, then rebounds
      group.rotation.x = spring(profile.pitch, s)
      group.rotation.z = spring(profile.roll, s)
      holdWheels(group, wheels.current)
    } else {
      group.position.y = 0
      group.rotation.set(0, 0, 0)
      if (wheels.current) releaseWheels(wheels.current)
      wheels.current = null
      start.current = null
    }
    invalidate()
  })

  return <group ref={ref} position-y={PROFILES.wheels.drop}>{children}</group>
}
