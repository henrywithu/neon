# Local validation and release gates

20 October 2026 · Implementation after pulling `origin/main` at `7c73526`. Milestones A (`4a9ba2b`) and B (`482d82c`) were committed and pushed before the final validation milestone. No deployment or hosted CI was added.

## Executed checks

| Check | Result | Scope |
| --- | --- | --- |
| `npm run build` | Pass (fresh production smoke build) | Strict new frontend code, recovered-module compilation, strict Worker checks and Vite production bundle. Existing large Three.js/Rapier chunk advisories remain. |
| `npm run check:assets` | Pass | 308 original asset SHA-256 digests and 58 journal entries. Added Inter files have their own OFL license. |
| `npm test` | Pass: 15 UI/mission tests + 1 production runtime smoke | UI/mission/input/persistence tests and full diagnostic runtime smoke. |
| `npm run check:rooms` | Pass | Local Worker on 127.0.0.1:8787. Empty lobby, presence, identity, sanitized names, countdown, heartbeat, quick chat, map ping, car changes, replacement/reconnection, leave/rejoin, capacity and protocol version. All clients close after the run. |
| Theme-token contrast | Pass | Ordinary text 12.92:1, secondary 8.52:1, cyan 9.92:1, amber 10.02:1, coral 5.09:1, control boundary 3.28:1 against the lightest panel composited over white. This checks tokens, not every extracted reference selector. |

Run `npm run dev:rooms` before room checks. Tests only target local clients; no public-room test chat was sent. Browser checks use Chromium with real UI factories and the real mission state machine; the mission harness supplies deterministic positions/telemetry and does not assess physical handling. The full-runtime test uses a freshly built static production preview. After driving/Pause checks it stops the software render loop during garage DOM/failed-transfer assertions, isolating those checks from SwiftShader stalls. Hardware garage stall measurement remains open.

## Saved evidence

- `evidence/hud-{width}x{height}.png`: six planned viewport sizes, UI over a neutral diagnostic backing. These show layout, not the city look.
- `evidence/hud-coverage.json`: union of backed HUD/control rectangles, counting overlaps once. Instrument circles/gradients are conservatively treated as their full bounding rectangles. Both desktop samples are below the 20% steady-state target. Phone corridor/hand occlusion still needs physical observations.
- `evidence/rotation-after.json`: landscape → portrait → landscape → portrait layout/visual viewport, canvas and target measurements. Compare the original failure in `evidence/rotation/observations.json`. Physical browser toolbar and keyboard tests remain open.
- `evidence/implemented-recovery.png`: readable failure surface with Retry and lower-cost restart.
- `evidence/diagnostic-city.png`: full runtime at diagnostic `backend=webgl&quality=low&dpr=0.25&noaudio&nointro`. It must not be used as premium-quality or production-backend sign-off.
- `evidence/theme-contrast.json`: reproducible color calculations and limits.

## Open gates before a production release

| Gate | Required evidence / decision |
| --- | --- |
| R01/R02/R03 on devices | Production WebGPU boot/retry/device interruption; physical Android Chrome and iPhone Safari rotation, browser chrome, keyboard, safe areas, pause/resume and focus. Emulation does not establish a device-wide fix. |
| R04 performance | Named integrated/desktop GPUs, midrange Android and supported iPhone, shaped cold/warm network traces, fixed route p95, first-use garage/rain/radio stalls, five-minute cold session and fifteen-minute phone soak. Use `performance-record.md`; no FPS/startup/thermal target is certified here. |
| R05 formative study | Five first-time players per platform. Record unaided move/stop/first-job completion/next-option discovery, confusion and restarts; aim for four of five within five minutes after loading. |
| R06 final look | Normal-DPR hardware captures in every planned driving/mission/message/online state, brightest/darkest street contrast, all six grades, browser zoom and enlarged text. Review the car/road/turn hierarchy at normal speed. |
| R07 hand comfort | Physical two-thumb tests for digital vs optional analog, target presets, sustained drift/nitro/reverse/recovery/entry, edge gestures and interruption. Decide whether portrait driving and a left-handed preset should be supported from those results. |
| R08 mix and comfort | Headphones and phone speakers: rain, radio, engine, traction, impact, spoken/subtitled dialogue, mute return and interruptions. Listen for clipping/duplicates; inspect normal and reduced camera/effect settings. District ambience is an opt-in prototype until this pass. |
| R09 recall | Returning players recognize Glass Turn/the lit reward, Pops and the next goal. Verify selected car and progress on real-browser return visits. |

Known P2 follow-up decisions: tune the optional steering mode and garage first-use warmup only from device measurements; author/record new brief voice lines if text-first guidance is insufficient; decide whether the district preview improves recognition. No unmeasured quality reduction or phone adaptation was enabled to manufacture a benchmark pass.

The garage action container no longer intercepts picker clicks, and car selector targets are 44px. A slow-start idle timer is started only once the UI is ready; the loading reveal also has a wall-clock completion guard.

The four reproduced review concerns have code fixes and local regressions. The release decision remains gated on the hardware/manual evidence above. No claim of a production-ready support matrix is made by these local tests.
