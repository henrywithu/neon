# Validation record — 20 October 2026

The implementation was built and exercised locally. Nothing was deployed. The checks below distinguish recovered data and behavior from visual verification on a physical GPU.

## Reference comparison

The current live reference and Trapnest Neon were opened at 1440 × 900 in the same Chromium 151 software-Vulkan environment. Both used the low profile and a 0.25 pixel ratio. A diagnostic WebGL backend was used because the cloud WebGPU device fails on the live reference too. For inspection only, the reference response was intercepted to select that backend and expose its runtime. This modified response is not part of the project.

| Runtime measurement | Live reference | Trapnest Neon |
| --- | ---: | ---: |
| Mesh objects | 481 | 481 |
| Instanced mesh objects | 255 | 255 |
| Instances | 20,604 | 20,604 |
| Position-buffer vertices | 1,501,029 | 1,501,029 |
| Initial car X | -81.07400512695312 | -81.07400512695312 |
| Initial car Y | -5.4029340744018555 | -5.4029340744018555 |
| Initial car Z | -517.9952392578125 | -517.9952392578125 |
| Uncaught page errors | 0 | 0 |

These counts describe the inspected low-profile scene, not every possible quality configuration. Heading differed by approximately 1.2 × 10⁻⁹ radians. Raw measurements: [scene-comparison.json](validation/scene-comparison.json). Screenshots: [reference](screenshots/comparison-reference.png), [Trapnest Neon](screenshots/comparison-neon.png). Scene layout, car, reflections, post-processing and HUD match closely in these captures. Rain and time-dependent effects are not synchronized; this is not a claim of identical image pixels.

## Interaction checks

Playwright exercised the production build using real keyboard/pointer events and the composed runtime exposed by `?debug`. Software rendering is slow, so the render loop was stopped after initialization; physics steps were then advanced explicitly. This checks input and simulation without claiming a hardware frame rate.

- The full ENTER → NYX story → LET’S RIDE sequence completed and activated driving.
- Holding W for 180 simulation ticks at 1/60 s reached approximately 91.36 km/h and moved the actual Rapier vehicle approximately 38 m.
- Tab opened the city map; Escape closed it. Settings and the information panel opened successfully.
- Independent desktop 1440 × 900 and touch-phone 844 × 390 starts completed with no uncaught page errors or failed HTTP responses.
- The information panel also fit a 390 × 844 portrait viewport without horizontal overflow.
- Journal pagination displayed 9 then 18 entries. Selecting July 2026 showed its 3 entries and hid the load-more control. All 58 source-backed entries and their featured images are included in the snapshot.
- An actual pointer press on the phone gas button produced touch-device throttle 1 and accelerated to 29.78 km/h over 60 ticks.
- With audio enabled, WebAudio resumed to `running`, the original `engine-sampler` AudioWorklet instantiated, all 15 radio rows appeared, and the first original MP3 played beyond 2 seconds. Pause worked. No page errors or failed asset responses were observed. This verifies playback state and loading, not subjective speaker fidelity.

Raw browser results are in [validation/](validation/). Additional captures show [the map](screenshots/neon-map.png), [touch controls](screenshots/neon-touch-controls.png), [radio](screenshots/neon-radio-phone.png), and [portrait information panel](screenshots/neon-about-mobile.png).

## Build, assets and Workers

| Check | Result |
| --- | --- |
| Frontend TypeScript + Worker TypeScript + Vite production build | Passed |
| SHA-256 verification of 308 extracted original asset records | Passed |
| 58 journal records and referenced local featured images | Passed |
| Local Worker lobby, presence, server-assigned pose identity, no sender echo | Passed |
| Name sanitization, shared race echo, four-seat capacity, protocol-version rejection | Passed |
| Wrangler deployment dry run | Passed; 437 static files, ROOMS/ASSETS bindings packaged |

Room checks are reproducible with `npm run dev:rooms` and `node scripts/verify-rooms.mjs`. Run `npm run check:assets`, `npm run build`, and `npm run deploy:dry-run` for the other checks. Vite reports large engine chunks: the original scene and Wasm physics remain substantial, with the engine, motion and physics packages split separately.

## Fidelity boundaries

1. The normal backend remains the reference WebGPU path. Ultra-quality hardware-WebGPU rendering, performance and physical iOS/Safari behavior were not verified in this GPU-limited cloud environment. `?backend=webgl` is an explicit diagnostic switch; it skips the WGSL-only shader canonicalizer when using GLSL.
2. The original private multiplayer server source is unavailable. The Worker implements the recovered client protocol; its five-second shared race countdown, twenty-minute inactivity release and frame validation are reconstructed server choices. It does not contact the original game's multiplayer service.
3. Recovered numerical/engine modules retain `@ts-nocheck`. New UI state, journal, camera orchestration, protocol and Worker code are strictly typed. Build success does not imply recovered static types for every engine function.
4. The retained original recordings, models, maps and shader graphs preserve much more than an approximate visual recreation. Their provenance is recorded separately; the upstream repository's MIT license does not automatically license every linked asset. See [THIRD_PARTY.md](../THIRD_PARTY.md).

Brand metadata, generated identity artwork, informational text and journal content intentionally differ. The original 3D scene, motion coefficients, transitions, weather and audio assets were retained.
