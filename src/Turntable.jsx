import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const DRAG_SPEED = 0.008 // radians per pixel dragged
const FOLLOW_DRAG = 12 // how tightly the platform follows a drag (higher = tighter)
const FOLLOW_COAST = 4 // softer catch-up after letting go, for a gentle ease-out
const THROW = 0.35 // seconds of drag speed carried on after letting go
const MAX_SPEED = 8 // radians per second, caps a hard flick
const SETTLED = 0.0005 // radians; closer than this and rendering stops
const SWIPE_SPEED = 0.004 // radians per pixel of two-finger (trackpad) sideways scroll
const SWIPE_FOLLOW_MS = 150 // follow tightly for this long after the last swipe event
const GESTURE_GAP_MS = 250 // wheel events closer together than this belong to the same gesture

// Spins its children when the canvas is dragged sideways, or swiped sideways with two fingers
// on a trackpad (up/down two-finger scroll is left to the camera for zoom). Each gesture is
// locked to either spinning or zooming, never both. Dragging moves a target angle
// and the platform chases it with exponential damping, so starts and stops are always
// smooth. Letting go throws the target a little further for a natural coast.
// Never spins on its own, so the on-demand canvas stays idle between drags.
export function Turntable({ children }) {
  const ref = useRef()
  const spin = useRef({ dragging: false, lastX: 0, lastTime: 0, lastSwipe: 0, lastWheel: -Infinity, wheelAxis: null, speed: 0, target: 0, pointers: new Set() })
  const { gl, invalidate } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const s = spin.current
    const down = (e) => {
      s.pointers.add(e.pointerId)
      s.dragging = s.pointers.size === 1 // two fingers are a pinch zoom, not a spin
      s.lastX = e.clientX
      s.lastTime = e.timeStamp
      s.speed = 0
    }
    const zooming = (time) => s.wheelAxis === "zoom" && time - s.lastWheel < GESTURE_GAP_MS
    const move = (e) => {
      if (!s.dragging || !s.pointers.has(e.pointerId)) return
      if (zooming(e.timeStamp)) { s.lastX = e.clientX; return } // no spinning mid-zoom
      const turn = (e.clientX - s.lastX) * DRAG_SPEED
      const seconds = Math.max((e.timeStamp - s.lastTime) / 1000, 1 / 120)
      s.lastX = e.clientX
      s.lastTime = e.timeStamp
      s.speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, turn / seconds))
      s.target += turn
      invalidate()
    }
    const up = (e) => {
      if (!s.pointers.delete(e.pointerId)) return
      if (s.dragging && e.timeStamp - s.lastTime < 80) s.target += s.speed * THROW // held still before letting go: no coast
      s.dragging = false
      invalidate()
    }
    // Runs in the capture phase, before CameraControls sees the event, so it can claim it
    const swipe = (e) => {
      if (e.timeStamp - s.lastWheel > GESTURE_GAP_MS) {
        // New gesture: decide once whether it spins or zooms, and stick with it (momentum included)
        const sideways = !e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)
        s.wheelAxis = s.dragging || sideways ? "spin" : "zoom"
      }
      s.lastWheel = e.timeStamp
      if (s.wheelAxis === "zoom") return // CameraControls zooms; it ignores the sideways part
      e.preventDefault() // also stops the browser's swipe-to-go-back
      e.stopImmediatePropagation() // no zooming mid-spin
      s.target += e.deltaX * SWIPE_SPEED // the trackpad supplies its own momentum
      s.lastSwipe = e.timeStamp
      invalidate()
    }
    el.addEventListener("pointerdown", down)
    el.addEventListener("wheel", swipe, { passive: false, capture: true })
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("wheel", swipe, { capture: true })
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [gl, invalidate])

  useFrame((_, delta) => {
    const s = spin.current
    const rotation = ref.current.rotation
    const gap = s.target - rotation.y
    if (Math.abs(gap) < SETTLED) return
    // Frame-rate independent damping: covers the same share of the gap per second at any fps
    const following = s.dragging || performance.now() - s.lastSwipe < SWIPE_FOLLOW_MS
    rotation.y += gap * (1 - Math.exp(-(following ? FOLLOW_DRAG : FOLLOW_COAST) * delta))
    invalidate()
  })

  return <group ref={ref}>{children}</group>
}
