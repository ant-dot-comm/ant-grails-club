# Improvements

A running record of what changed, what it bought us, and what's next.
Newest entries at the top. Measurements are from the J4 page unless noted.

---

## Model optimization preset

Run this on each car, in order. Blender files live in Google Drive (`The Grails Collection/blender files/New Hotness 2026/`); only exported `.glb` files come into this repo.

1. **Copy.** Save the car as `<Car>.blend` in `New Hotness 2026`; never edit the original.
2. **Bake to clean meshes.** In a new `<Car> Showroom` collection: modifiers applied (subdivision at the source's **render** level, not capped; viewport levels can be higher and blow the budget), scale applied, front facing -Y, tires touching z=0, everything under one `<Car>` empty. The original collection stays hidden as the source. Capping at level 1 (the first pass on every car) made surfaces jagged and let inner layers poke through outer shells.
3. **Wheels.** Pick the type (Truck for off-road, Speed for race/sports, Whitewall for luxury) and link it from `Tire.blend` as collection instances named `wheel_FL`, `wheel_FR`, `wheel_ML`… Scale = car tire diameter ÷ library tire diameter; right-side wheels rotated 180°.
4. **Cut heavy meshes.** Only dense meshes *without* subdivision (raw sculpt/CAD-style geometry): planar decimate 1°, then collapse to ~20k (seats) or ~4k (hidden mechanical parts like J7's suspension). Never decimate smoothed body surfaces.
5. **Materials.** Clean copies with standard names. Every recolorable zone starts with `paint_` (`paint_base`, `paint_base_2`, `paint_accent_1`… `paint_accent_4`, `paint_under`, `paint_trim_top`, `paint_trim_sole`, `paint_tire_well`, …); fixed parts are `trim`, `glass`, `light_head`, `light_tail`, `interior`, `interior_accent`. Glass is alpha 0.35 (no transmission); clearcoat only on paint; procedural nodes removed. Lights built from a pure Emission shader are rebuilt as Principled with the same emission color/strength so the glow exports.
6. **Join by material** → `body_<material>` (one mesh per material).
7. **Bake ambient occlusion (AO)** so crevices, the underside and wheel wells sit in shadow (real-time fill and reflections can't cast shadows):
   - Add a second UV map named `AO` to every body mesh except glass (keep `UVMap` as the render map), select them all and Smart UV Project + Pack Islands together, so they share one atlas.
   - In each body material add an Image Texture (`<Car>_ao`, 2048, Non-Color) fed by a UV Map node set to `AO`; make it the active node.
   - Exclude the source car, the game copy and any scene props; add a temporary floor plane at z=0 (the underside darkens against it); keep the linked wheels (they shade the wheel wells). World AO distance 0.8 m, Cycles 128 samples, margin 16. Bake AO, delete the floor, restore the collections.
   - Save to `textures/<Car>_ao.png` and connect it: Separate Color (R) → `glTF Material Output` group → `Occlusion`. The export then carries `occlusionTexture` on UV channel 1, which three.js applies to fill light and reflections automatically.
   - J7: 25 s bake. J4: 36 s. **J7 still to do:** its game copy was built before the AO step and has no `AO` UV map; rebuild it from the showroom (step 8) so it inherits the AO.
8. **Game version** (after the AO bake, so the decimated copies keep the `AO` UV map and share the AO texture). `<Car> Game` collection: body meshes over 2k triangles decimated to 40%, `… Wheel Game` instances, and a `collider` box (above the axles).
9. **Code.** Register the car in `CARS` in `Showroom.jsx`. Colorways as data on the standard names (`applyColorway`), `applyCarPaint` on load, and `useWheelSpin(gltf.scene, motion)` for the wheels.
10. **Export** `<Car>.glb` and `<Car>_game.glb` to `models-src/<Car>/`, add them to `scripts/optimize-models.mjs`, run `npm run models` (textures are capped at 1024 px and converted to WebP), and update the car's colorway code to the standard material names.

Targets: showroom 60–200k triangles (≤ 300k), about 1–3 MB after compression / ≤ 20 meshes; game 10–40k.

`scripts/blender/showroom_rebuild.py` automates steps 2 and 4–8 plus the export for a car that already has its Showroom/Game collections.

---

## Log

### 2026-11-04 — Shared glass and smoother J9 fenders

- **Glass:** one `applyGlass` in `src/colorways.js`, set per car in each car file (`const GLASS = …`). `DARK_GLASS` (near-black, 95% opaque) hides the empty cabin on J4, J11, J12 and B1; `TINTED_GLASS` (dark smoke, 70% opaque) shows the interior on J7, J9, AM95, Presto and Shox. Change a car's tint with `{ ...DARK_GLASS, color: 0x101820 }`, or per colorway by listing `glass`. A sharp clear-coat layer keeps the reflections crisp at any tint.
- **J4, J7 and J9 now use `CarModel`** like the other cars (J7 also takes `vehicleData` now).
- **J9 fenders:** the white fender skirts (`body_paint_tire_well`, 88–120 quads each) had faceted outlines. Two more Catmull-Clark levels on your hand-edited shape (832 → 13.3 K triangles) round them out without changing the bigger wheel wells. AO rebaked, game copy rebuilt at the same size. J9.glb 806 → 909 KB.
- J9 re-exported after more hand tweaks to the showroom model: AO rebaked, game copy rebuilt (24.4 K), J9.glb 927 KB / J9_game.glb 538 KB.
- **Tire.blend update** (rim and rim_logo metallic lowered to 0.6 so their colors read; bigger whitewall hubcap closes the gap to the wheel): J4, J7, J9, J11 and J12 re-exported with `export(car)`, no rebake. B1 has its own wheels and the hovercraft have none, so they're unchanged.
- `scripts/blender/showroom_rebuild.py` now has `finish(car)` (AO, game rebuild and export only) and `export(car)` (export only) for hand-edited showroom models like J9.

### 2026-11-03 — Showroom models at full detail

The first pass cut too much (smoothing capped at level 1, heavy parts decimated hard): surfaces looked jagged and inner layers poked through. Showroom bodies rebuilt from source at the designer's render smoothing level; game models kept at the same triangle counts.

| Car | Showroom before → now | Showroom .glb before → now | Game .glb |
| --- | --- | --- | --- |
| J7 | 57 K → 175 K | 1.25 → 2.82 MB | 850 KB |
| J4 | 47.5 K → 188 K | 0.84 → 2.07 MB | 623 KB |
| Shox | 39 K → 143 K | 0.61 → 1.43 MB | 411 KB |
| AM95 | 19.6 K → 67 K | 0.51 → 1.10 MB | 404 KB |
| Presto | 16.5 K → 62 K | 0.41 → 0.82 MB | 302 KB |

- Only raw dense parts are cut now: J7 suspension 101 K → 4 K each (hidden in the wheel wells), J7 seats 99 K → 20 K, AM95 seats 49.5 K → 20 K.
- J11, J12 and B1 were already at their full render level; unchanged.
- J9 not rebuilt: its showroom has hand edits (bigger wheel wells, hood-ornament ring, level-2 rear parts) that a rebuild from source would erase.
- Compression precision raised (positions 14 → 16 bits, normals 10 → 12) so closely layered parts don't cross; file sizes barely changed (both already stored in 16-bit values).
- Materials, wheels, colliders and colorways untouched; AO rebaked for the new geometry.

### 2026-11-03 — J11, J12, B1, AM95, Presto, Shox optimized with the preset (all cars done)

Run back to back from bat1.blend / the old .blend files; each has a new `<Car>.blend` in New Hotness 2026 with `<Car> Showroom` and `<Car> Game` collections.

| Car | Before | Showroom | Game | Wheels | .glb (showroom / game) |
| --- | --- | --- | --- | --- | --- |
| J11 | 370 K | 43.2 K | 18.7 K | Speed Wheel (rear wider) | 621 / 446 KB |
| J12 | 1.13 M | 70.7 K | 29.8 K | Truck Wheel | 867 / 655 KB |
| B1 | 268 K | 74.5 K | 35.5 K | own split wheels (`wheel_XX_bat_spin`) | 868 / 497 KB |
| AM95 | 203 K | 19.6 K | 10.3 K | hovercraft | 509 / 389 KB |
| Presto | 251 K | 16.5 K | 7.2 K | hovercraft | 408 / 300 KB |
| Shox | 218 K | 39.3 K | 16.1 K | hovercraft | 611 / 419 KB |

- All have baked AO, standard material names and no per-car scale/position patches in code.
- New `src/CarModel.jsx` holds the shared load / shadows / paint / colorway / wheel-spin code; the six car files are now just their colorway data.
- J11 and J12 colorways converted from if/else chains to data. B1 now has the motion toggle (its wheels spin).
- `npm run models` builds every car's showroom and game file from `models-src/<Car>/<Car>.glb`.
- B1 has repeated material names (`light_head` ×3, `paint_base` ×2); fine now, rename before giving it colorways.
- Old `.gltf` exports in `models-src/` are no longer used and can be deleted.

### 2026-11-03 — J9 optimized with the preset (third car)

| | Before | After |
| --- | --- | --- |
| Triangles (showroom) | 299k | 51k body + 4 Whitewall Wheels (~56k drawn) |
| Meshes | 46 | 13 body + 4 linked wheels |
| Download | 2.0 MB | 808 KB (with AO) |
| Game version | – | 24.4k body triangles, 542 KB, AO included, box collider |

- The two seats were 99k of the 131k body triangles; decimated to 6k each. Grille frame 11.5k → 5k.
- Uses the Whitewall Wheel (it was modeled from J9's original wheel). 8 paint zones mapped to `paint_*` names; all 8 colorways carried over as data.
- Wheel spin moved into a shared `useWheelSpin` hook (J4 and J9); J9 had the motion toggle but never spun its wheels before.
- Fine-tuning pass (after your showroom edits): roof/trunk panel and rear bumper regenerated at level 2 (jagged at level 1), and a ring frame added around the hood ornament. Then a second round of your edits; final body 51.2k triangles, AO re-baked and the game copy rebuilt from the final showroom. **J9 done.**

### 2026-11-03 — One persistent showroom; cars swap in place

- Every car used to be its own page with its own canvas, so switching cars rebuilt the whole studio and could change the framing (J4's page also wrapped its canvas differently). Now every car URL goes to one route (`/:car` → `Showroom.jsx`), so the studio, camera, zoom and turntable angle stay put and only the model swaps. The studio stays visible while the next car loads.
- After each car loads, the floor light pools re-measure it (in the car's own space, so it works even if the turntable is turned) and the reflection/finish pass re-runs.
- The nine per-car page files are gone; cars are registered in `CARS` in `Showroom.jsx`.
- **Landing** (`Landing.jsx`): each car appears an inch above the platform once loaded, drops (0.16 s), then settles over 1.6 s with damped springs: suspension bounce (8 mm), pitch (~1°) and roll (~0.6°). Renders only during the landing, then idles. On preset cars (separate `wheel_*` nodes) the wheels stay planted after touchdown and only the body sinks and rocks; older models bounce as one piece until they're optimized. Hovercraft (Shox, Presto, AM95; `hover: true` in `CARS`) use a floatier profile: they appear 25 cm up and ease down over 1.4 s, slowing to a stop right at hover height, with no bob or sway afterwards.

### 2026-11-03 — J4 optimized with the preset (second car)

| | Before | After |
| --- | --- | --- |
| Triangles (showroom) | 838k | 47.5k body + 4 Speed Wheels (~68k drawn) |
| Meshes | 69 | 14 body + 4 linked wheels |
| Download | 4.5 MB | 843 KB (with AO) |
| Game version | – | 22.4k body triangles, 608 KB, AO included, box collider |

- Level-1 smoothing alone took the body from 838k to 47.5k (one mesh was 335k), so the decimate step wasn't needed; level 1 still looks smooth on J4's curves.
- Uses the Speed Wheel. 14 paint zones mapped to the extended `paint_*` names; colorways keep their original colors including rims.

### 2026-11-03 — Baked ambient occlusion (J7) and texture compression

- J7 now has a baked AO map (preset step 7), so the underside, wheel wells, grille and panel gaps sit in shadow instead of picking up fill light and reflections.
- `npm run models` now resizes textures to at most 1024 px and converts them to WebP before meshopt. J7 with AO: 1.25 MB (was 1.48 MB without AO; 4.34 MB with AO as a 2048 PNG).

### 2026-11-03 — One studio for every car

- **Reflections on every car, studio stays dark:** drei's `Environment` sets `scene.environment`, which lit the whole studio (three ignores per-material `envMapIntensity` for it); that's why J7's wall glowed while other cars faded to black. `StudioReflections` now moves the map onto the car's materials only and clears `scene.environment`.
- **Same finish on every car:** the same pass sets reflections to 0.6 (overriding older models' 20) and softens any clear coat to satin (≤ 0.35, roughness ≥ 0.3). J7's `applyCarPaint` still sets its paint base coat.
- **Same camera for every car:** fixed target (0, 0.85, 0) and distances (start 6.5 m, zoom 4.5–11 m), replacing the per-car fit; portrait screens step back just enough to show the same width.
- The `studioReflections` opt-in is gone; every car gets it.

### 2026-11-03 — Classic car-studio lighting (all cars)

- `StudioLights.jsx`: big overhead softbox (5×8 m `rectAreaLight`) as the key, a 6×3 m softbox on the camera side so whatever faces the viewer is lit, two gentle rim spots behind the car left and right for the silhouette, one soft overhead spot for the contact shadow (the only shadow caster), and a faint hemisphere fill. Replaces the old side spotlight, blue spotlight and angled strip.
- J7's reflection map (`StudioEnvironment.jsx`) mirrors the same layout, so the paint highlights match the lights.
- Platform darkened to a neutral gray so it doesn't glow under the key.

### 2026-11-03 — Realistic car paint (J7)

- **Studio reflections** (`StudioEnvironment.jsx`): five softbox `Lightformer`s baked into a reflection map once at load (`frames={1}`), so there's no per-frame cost. They stay fixed while the turntable spins, so highlights slide across the paint. Opt-in per car with `<VehicleCanvas studioReflections>`; old models over-brighten because they set `envMapIntensity = 20`.
- **Paint finish** (`applyCarPaint` in `colorways.js`): satin, not glossy: metallic base coat (metalness 0.35, roughness 0.62) under a light, soft clear coat (0.35, roughness 0.3) with reflections at 60%. Applies to `paint_*` except `paint_under`.
- **Studio backdrop:** one continuous surface (`Studio` in `Ground.jsx`): a large floor that sweeps up into the back wall (infinity cove: curve starts 12 m back, 5 m radius), so there's no seam or edge to catch light. Matte plaster tiles evenly over floor and wall. Light falloff is baked into vertex colors: fully lit around the platform, easing to `FAR_SHADE` (22%) by 11 m, a little darker up the wall. One mesh, one draw call. Background and fog are a neutral dark gray (`STUDIO_BACKGROUND`), and a vignette darkens the corners like a studio photo.
- Add to the preset: when a car is optimized, call `applyCarPaint` on its paint materials.

### 2026-11-03 — Wheel colors ready for colorways

- Tire.blend: new default tire (0.004) and rim (0.027) colors. Game tires rebaked so their texture is groove shading only and the rubber color is a separate factor, which makes tires recolorable too.
- `src/colorways.js`: `applyColorway(materials, colorway)` sets listed materials and resets the rest to the model's exported colors. J7 colorways are now data; add `rim`, `rim_logo` or `tire` to a colorway when the colors are picked.

### 2026-11-03 — Studio showroom (all cars)

- **Turntable:** dragging sideways spins the car, with a short glide; it never spins on its own, so the GPU idles at 0 draw calls.
- **Controls:** drag sideways or swipe sideways with two fingers on a trackpad to spin; scroll, two-finger up/down or pinch to zoom; drag up/down for a small, slow tilt (polar 1.12–1.34). Sideways swipes are blocked from triggering the browser's back gesture. Each wheel gesture (momentum included) is locked to spin or zoom, and dragging blocks zoom.
- **Curved studio wall** behind the car, plus fog fading it into the dark.
- **Floor:** textured (rough plaster normal and roughness maps), still reflective.
- **Raised platform:** one level, with a satin lip overhanging a recessed base. An LED strip on the underside of the lip spills a soft, feathered glow onto the floor (reaching 0.6 m past the platform) (unlit, additive, so nearly free). Matte plaster texture shared with the floor; no reflective surfaces left, which drops a full scene render per frame. The camera stops just above the lip.
- **Camera framing:** aims at the center of each car and sizes the zoom range to the car and screen shape (zoomed all the way in, the car still fills most of the frame). The camera is set on `<Canvas camera>` so `CameraControls` always binds to it.
- **Smooth motion:** drag and zoom move a target that the camera and turntable chase with spring damping (`CameraControls` smoothTime, exponential damping on the spin), so nothing jumps.
- **Light pools:** every glowing material gets a soft additive glow on the floor that turns with the car (`LightPools.jsx`, found automatically, no per-car setup).

### 2026-11-03 — J7 optimized with the preset (first car)

| | Before | After |
| --- | --- | --- |
| Triangles drawn (showroom) | 863k | 85k |
| Meshes | 81 | 12 body + 6 linked wheels |
| Download | 48.9 MB raw / 4.7 MB compressed | 1.48 MB |
| Game version | – | 37k triangles, 1.38 MB, box collider |

The six suspension arms were 608k triangles on their own; the seats were 99k.

### 2026-11-03 — Scene and loading performance

| What | Before | After |
| --- | --- | --- |
| Model download, J4 | 21.8 MB | 4.5 MB |
| Model download, J7 | 48.9 MB | 4.7 MB |
| All published models | 139 MB used (+87 MB unused old exports) | 22.8 MB |
| JS on first visit (home page) | 1.64 MB | 255 KB (three.js loads only on a car page) |
| GPU work while the car sits still | full redraw every frame | 0 draw calls |
| Canvas resolution on retina screens | 2× | capped at 1.5× |
| Reflective floor render target | 1024 | 512 |

- **Model compression.** Source exports moved to `models-src/`; `npm run models` writes meshopt-compressed `.glb` files to `public/models/`. Node and material names are untouched, so the colorway and wheel code still works. Re-run it after every Blender export.
- **On-demand rendering.** `VehicleCanvas` (src/getVehicle.jsx) renders only when the camera moves or a colorway changes, and switches to every frame while motion is on.
- **Code splitting.** Car pages are `React.lazy` routes.
- **Postprocessing upgrade fixes.** `@react-three/postprocessing` v3 turns off renderer tone mapping and defaults Bloom to a wide mipmap blur, which washed the scene in haze. Added an ACES `ToneMapping` effect and tuned Bloom (`luminanceThreshold 1`, `radius 0.4`, `levels 5`) so only emissive lights glow.
- **Shared canvas.** All nine car pages now use one `VehicleCanvas` and read the vehicle context directly (no mirrored state).

### 2026-11-03 — Vite, library upgrades, bug fixes

- CRA → Vite 8. React 19, three r187, R3F 9, drei 10, postprocessing 6.39, React Router 8.
- Spotlights converted to three's physical light units (`decay 0`, intensity × π).
- Loader moved outside the canvas (drei `<Html>` as a Suspense fallback crashed on React 19).
- Fixed: colorway desync between cars, motion toggle desync, crash on unknown routes, stuck loader message, `noscroll` leak, arrows on cars without colorways, missing `gh-pages` dependency.

---

## Backlog

### Scene / code

- [ ] Replace the window's `transmission` material with plain transparent glass. Transmission renders the whole scene an extra time every frame.
- [ ] Look up wheel/tread nodes once instead of `children.find` every frame (J4, J9, J11, J12).
- [ ] Move colorways into data (material name → hex) instead of per-model if/else chains.
- [ ] Bake shadows for the static showroom (or update shadow maps only on change). Two shadow-casting spotlights currently re-render the car twice per frame.
- [ ] Consider `<PerformanceMonitor>` to drop DPR/reflection quality on slow devices.

### Models (Blender)

Current state of the published models:

| Car | Triangles | Meshes | Materials | Notes |
| --- | --- | --- | --- | --- |
| J12 | 1.13 M | 54 | 14 | heaviest |
| J7 | 863 K | 81 | 14 | six tires at ~200 K verts each (modeled tread) |
| J4 | 838 K | 69 | 19 | one mesh is 170 K verts |
| J11 | 370 K | 43 | 10 | |
| J9 | 299 K | 46 | 16 | |
| BatWheels | 268 K | 22 | 5 | |
| Presto | 251 K | 29 | 8 | |
| Shox | 218 K | 39 | 6 | |
| AM95 | 203 K | 26 | 8 | |

None of the models use textures; all detail is geometry. Every mesh costs a draw call in each of ~5 passes (2 shadow maps, reflection, transmission, main), so J4 makes about 460 draw calls per frame.

- [ ] **Triangle budget.** Aim for 80–150 K triangles for showroom cars and 20–50 K for game cars.
- [ ] **Bake detail into textures.** Tire tread, panel lines, vents and badges → normal maps baked from the current high-poly meshes onto low-poly versions.
- [ ] **Join meshes by material.** One mesh per material keeps colorways working and cuts 40–80 meshes down to 6–15.
- [ ] **Wheel hierarchy.** Group each wheel under an empty (`wheel_FL`, `wheel_FR`, `wheel_RL`, `wheel_RR`) with its origin at the axle center. Spin that one node; keep brake calipers outside it so they don't rotate. Required for physics.
- [ ] **Delete helper geometry.** `back_Cylinder` / `FrontCylinder` (hidden in code with opacity 0), `Plane bg`, `example.*`.
- [ ] **Naming.** Replace `Plane.004`-style names with part names; use the same material names on every car (`paint_base`, `paint_accent_1`, `trim`, `rim`, `glass`, `light`) so one colorway system covers all cars.
- [ ] **Scale and orientation.** Real-world meters, origin at ground center, same forward axis on every car. Today scale and height are patched in code per car.
- [ ] **Clearcoat only on paint.** It's on 15/19 materials on J4, and each one adds a second specular layer.
- [ ] **Remove old exports.** `J4object.gltf`, `J4object2.gltf`, `J4object3.gltf` and `J12object.gltf` add 87 MB to the repo.

### Game (Hot Wheels-style track)

- [ ] Physics: Rapier (`@react-three/rapier`) raycast vehicle. The chassis is one rigid body with a simple box/convex-hull collider. Wheels are raycasts, and the wheel nodes are only visual, positioned from the physics each frame.
- [ ] Track: extrude a cross-section along a spline. The same curve gives the visual mesh, the trimesh collider, the camera path and AI lines. Loops need a "stick to track" force along the track normal.
- [ ] Texture budget per game car: one 1024² tire set shared by all four wheels; one 1024–2048² body set; KTX2 (Basis) compression; colorways as tint over grayscale/mask maps.
