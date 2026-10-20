# Trapnest Neon reference audit

## Scope and evidence

The target is the **current metro driving game** at `www.threejspunk.com`, not only the older alley demo linked from the public source repository. Capture date: 20 October 2026. See `PROVENANCE.md`, `asset-manifest.json`, and `source-map.json` for source URLs, exact bytes/digests, and the recovered declaration locations. Original production files live in ignored `research/original/` and never enter the application's import graph.

The browser network trace was captured at 1440 × 900. Initial boot creates the vehicle HUD before showing the intro overlay. A server-side Chromium software-GPU session loses its WebGPU device on the original site as well as producing GPU error-scope failures; its black background is **not** evidence that the original design has no city. GPU verification must distinguish scene recovery from software renderer failures.

## Architecture recovered from the live build

- Factory-based scene composition, DOM components, explicit update/render loop.
- Three.js revision 186, GSAP 3.15.0, Rapier 0.20.0 (version queried from the original Wasm distribution).
- Earlier public source: Three.js 0.185 alley scene. Current site adds city synthesis from a land-use image/map, roads/highways/canals, traffic, raycast vehicles, garage, missions, story phone, collectible sigils, radio and multiplayer ghosts.
- Shader source is **TSL**, compiled by Three.js to WGSL for WebGPU or GLSL for the fallback backend. There are no authored standalone `.wgsl` or `.glsl` files to recover. TSL source is isolated under `src/shaders/` and the corresponding material/weather modules.
- Dynamic imports load vehicle rig parsing, vehicle paint/neon treatment, and Rapier separately. These are source modules and an npm physics package in this implementation.
- Engine audio runs in separate AudioWorklet modules, not in the frame loop.

## Original asset inventory

`public/maps/metro/map.json` (987,048 bytes) supplies placement and street data. `landuse.webp` and `minimap.webp` provide land-use sampling and navigation imagery. The city kit is a 9,408,404-byte GLB with a separate 59,670-byte metadata file and three KTX2 plaster maps.

The live renderer reports 2,676 buildings, 765 towers, 7,451 signs, 48 landmarks, and 27 screens at the full profile. Its highways comprise four decks and 17 bridges, 32,706 triangles, 156 pillars, and 90 ramp boxes. These are driven by the recovered data and geometry builders, rather than substitute boxes or a background image.

Vehicles are original GLB rigs: Quadra Turbo-R, Tachyon, Tsurugi, Velora, Raijin, Vanta, Katana, and Chrysalis. Each rig contains a Body node, named wheel pivots, and `userData.rig === 'vehicle'` metadata. Wheel pivot rotation uses YZX and the authored camber. Paint, lamps, rain surfaces, tailpipes, engine samples, unlock rules, and configuration remain per-vehicle.

The billboard atlas is 4096 × 2048, with five square and six portrait advertisements. Square tiles are 1024 × 1024; portrait tiles are 512 × 1024. It is sampled through normalized rectangles, not individual substitute images. Characters NYX, RIO, HEX, POPS, LUX, and FUSE have full and thumbnail portraits. Alley assets are retained for the original `?alley` mode.

Textures include the original wet asphalt albedo/normal/roughness, smoke, water spray, custom noise and Perlin noise. The HDR environment is `sunflowers_puresky_1k.hdr`. Draco/Basis decoder support is local. `asset-manifest.json` is the definitive inventory.

## Renderer and lighting

- `WebGPURenderer`: antialias false, alpha false, high-performance preference, stencil false.
- Requests up to 64 color-attachment bytes per sample if supported.
- PCF shadow map, explicit shadow updates; ACES filmic tone mapping.
- Initial canvas opacity 0, z-index 14, 220 ms opacity transition.
- Main directional light: `#cfefff`, intensity 10, at [23,31,3]. Shadow extent 200, 4096² texture, near 1, far 550, bias -0.001, normal bias 0.009, shadow intensity 1.4. Fill light: `#ffd6c8`, intensity 1.5, at [-18,22,-12].
- Environment base intensity 0.08; rotation 70° Y and 51° Z.
- Metro follow-shadow extent 90, 4096² by default. Vehicle reflection probe 64² per face; one face updated per turn, every three frames (faster while moving).

## Weather and material systems

Rain uses a top-down orthographic height texture that stores world position. Nearest filtering prevents invented intermediate collision surfaces. The volume follows the viewer; a GPU compute graph integrates raindrop motion, samples floor height, and respawns collided drops. The rain/sky/smoke/plane transparent layers are omitted from the height pass. The dedicated rain composite path is disabled; geometry is drawn through the original scene layers.

Defaults: 2,750 drops, 512² collision texture, height update every two frames. Splashes and road ripples are independent effects. The low profile uses a 256² collision texture and disables splashes.

Wet ground uses the original tiled PBR textures, world-XZ ripples, roughness and manual planar reflection. Reflection target scale is 0.5. Bicubic reflection sampling is enabled; reflection modes are full, lights, or off. Screen-space reflections are not substituted.

Car droplets are procedural TSL graphs adapted by the original authors from rocksdanister/rain. Rain UVs use UV1 while PBR textures use UV0. Two moving layers, hash-distributed beads, satellite drops and trails produce finite-difference normal offsets. Scale 20.5, drop size 0.45, normal strength 0.25, wet roughness 0.1; glass roughness 0.05. Distance fade is 3.5–5.5 units in the live game. This differs from the earlier public alley source's 20–32 unit fade.

Clouds, airborne vehicles, exhaust smoke, tire spray, skid marks, exhaust backfires, neon light pools and road furniture retain their original update functions and TSL math.

## Post-processing

The live graph includes scene color/depth/emissive inputs, GTAO, mip bloom, lens rain, grade/fog, edge chromatic aberration, SMAA/FXAA, FSR1/Catmull sharpening, radial/lens speed blur, and intro rain glass. Default AO samples 16, radius 2, resolution scale 0.5. Bloom scale 0.7, render scale 0.85, FSR sharpness 0.2, lens-rain scale 0.5, speed-blur samples 8. Metro bloom threshold and smooth width are both 0.4. Look presets remain Neutral, Neon Noir, Magenta Rain, Teal Dusk, Silent Hill, and Sin City.

## Intro, loader and transitions

The loader is a centered progress ring: view box 168, radius 66, progress text and a pulsing uppercase status line. Reveal begins with the stack fading for 0.12 s; the circular aperture begins after 0.04 s, expands from radius 84 over 0.85 s using `power3.inOut`, and covers the viewport diagonal.

Intro layout: centered stack, spaced kicker, two-line geometric Orbitron title, fine rule, two-line tagline, pill ENTER button, small credit. Letter reveal begins with opacity 0, Y 28, blur 8px. Kicker: 0.7 s `power2.out`; letters: 0.9 s `power3.out`, 0.035 s stagger; rule: 0.75 s `power2.inOut`; tagline: 0.75 s; button: 0.65 s; credit: 0.6 s, with original timeline overlaps retained. ENTER enables only after its animation completes. The intro fades out over 0.6 s; glass fades over 1.2 s; the transition waits a further 1,000 ms before settling. The original story/voice introduction participates in this sequence.

Camera default desktop FOV 65°, mobile 100°, walk eye height 1.55. Walk acceleration 6, deceleration 10, walk FOV boost 3°, sprint boost 8°. Drive base FOV 62°. Initial camera and car poses, chase smoothing, orbit, hood and other camera modes retain original coefficients. Mouse movement/pointer-lock and touch-look are original control paths, not a decorative cursor replacement.

## Controls and interface

| Input | Reference action |
| --- | --- |
| W/S or arrows | Accelerate / brake / reverse |
| A/D or arrows | Steer |
| Space | Handbrake / drift |
| Shift | Nitro; sprint on foot |
| Q/E | Gear changes |
| C | Camera |
| R | Reset vehicle |
| F | Exit / enter car |
| Tab | Full city map |
| M | Radio / sound |
| J | Achievements |
| I | Messages |
| H | All controls |
| N | Continue tutorial/story |
| V | Next spectator target when online |
| Escape | Close the active panel / map |

Desktop header, speedometer/RPM gauge, driver aids, drift scoring, minimap, map routing, launch HUD, messages, garage, achievement panel, radio, and settings use original markup/classes and the extracted stylesheet cascade. UI visibility follows inactivity and pointer-lock state. Mobile uses the original compact menu, thumb controls, joystick and landscape layout; Apple mobile and older-iPhone profiles have separate GPU budgets. Fullscreen and installed-PWA detection are preserved. No consent or analytics UI is carried over.

## Driving, traffic and progression

Physics runs at 120 Hz with at most eight catch-up steps per frame, gravity -9.81, four solver iterations. Vehicle mass, inertia, center of mass, collider boxes, suspension, tire lateral/longitudinal curves, engine torque curve, gearing, clutch, differential and assists are preserved from the original configuration objects. The default Quadra mass is 1,480 kg. Wheel poses interpolate between physics steps.

Traffic follows the original lane graph with 28 cars at the default desktop profile. Dynamic roadside props, ground-height sampling, tire contacts, drift chains, nitro, launch control, GPS routing, mission gates and time limits remain linked to actual simulation state. Progress and user preferences use independent `trapnest-neon` browser-storage keys.

## Audio

Original assets: rain, nighttime ambience, thunder, six wet footsteps, airborne engine, V8 and V12 sample tables/WAVs, tire squeal, nitro and turbo-release sample banks, UI hover/click/open/close/confirm/typing/drift celebration, six voiced story contacts, and the 15-track NEON·FM 88.7 playlist. Radio credits and Pixabay source links stay in `public/audio/radio/playlist.json`.

Engine playback uses the original sampler AudioWorklet, with the synth worklet as fallback. Spatial audio uses a shared AudioListener and positional panners; engine RPM/load, gears, wet footsteps, vehicle motion and room-scale acoustics update audio parameters. Audio resumes following user interaction and preserves original volume/ducking behavior. Horn and garage sounds are procedural WebAudio systems from the live source.

## Multiplayer

Original protocol version 2, maximum four drivers per room. Public room IDs: KEPLER, COPERNICUS, TURING, LOVELACE, TESLA. Peers are non-colliding holographic replicas of the real vehicle rigs. Pose frames include position, quaternion, velocity, and brake/reverse/nitro/on-foot/drift/horn/light bit flags. Rooms relay presence, car/name changes, fixed quick-chat phrases, map pings, collectibles, and race messages. Original infrastructure must not be used for this fork; deployment wiring belongs to Trapnest's own Worker.

## Customization boundary

Trapnest Neon changes application identity, metadata, icon/OG artwork, intro title/credit, informational copy and the journal. It does not replace scene geometry, weather/audio samples, shader graphs, vehicle physics or transition timing. Journal entries are sourced from **all** Trapnest posts published since 1 July 2026 and use their featured images. Live content synchronization may add posts while this build is in progress.
