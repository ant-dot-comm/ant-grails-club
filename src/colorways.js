// Shared colorway helper for cars exported with the standard material names
// (paint_base, paint_accent_1, rim, rim_logo, tire, ...; see IMPROVEMENTS.md).
//
// A colorway is { materialName: 0xRRGGBB }. Materials it leaves out go back to the color
// the model was exported with, so a colorway only lists what it changes. That makes rims
// optional per colorway: leave `rim` / `rim_logo` out and the wheels keep the Tire.blend color.

// Car paint with a satin finish: a rough metallic base coat under a light, slightly soft
// clear coat. Reads as painted metal, not glossy plastic. (Reflection strength is set for
// every car in StudioReflections.)
// Applies to paint_* materials except the underbody.
export function applyCarPaint(materials) {
  Object.entries(materials).forEach(([name, material]) => {
    if (!name.startsWith("paint_") || name === "paint_under" || !("clearcoat" in material)) return
    material.metalness = 0.35
    material.roughness = 0.62
    material.clearcoat = 0.35
    material.clearcoatRoughness = 0.3
  })
}

export function applyColorway(materials, colorway = {}) {
  Object.entries(materials).forEach(([name, material]) => {
    if (!material.color) return
    if (!material.userData.defaultColor) material.userData.defaultColor = material.color.clone()
    if (name in colorway) material.color.setHex(colorway[name])
    else material.color.copy(material.userData.defaultColor)
  })
}

// Window glass, the same material on every car; each car picks how dark it is.
// DARK_GLASS hides an empty cabin; TINTED_GLASS shows the interior through a 70% tint.
// Change the tint per car with { ...DARK_GLASS, color: 0x101820 }, or per colorway by
// listing `glass` in it like any other material.
export const DARK_GLASS = { color: 0x07080a, opacity: 0.95 }
export const TINTED_GLASS = { color: 0x14171b, opacity: 0.7 }

export function applyGlass(materials, { color, opacity } = TINTED_GLASS) {
  const glass = materials.glass
  if (!glass) return
  glass.color.setHex(color)
  glass.opacity = opacity
  glass.transparent = true
  glass.depthWrite = false
  glass.metalness = 0
  glass.roughness = 0.05
  if ("transmission" in glass) glass.transmission = 0
  if ("clearcoat" in glass) {
    glass.clearcoat = 1 // a sharp reflection layer on top of the tint
    glass.clearcoatRoughness = 0.03
  }
  glass.needsUpdate = true
}
