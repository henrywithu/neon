# Improvement plan implementation record

Baseline: pulled `origin/main` at `7c73526` before implementation. Milestone commits are pushed directly to `main` as requested. No hosted CI or engine/physics migration is included.

## A — Dependable entry

- R01: distinct capability, required-asset, shader and device-loss recovery; Retry and lower-cost WebGPU restart; expandable diagnostics; indeterminate human-readable loading stages. Reload preserves saves. WebGL remains a diagnostic URL only.
- R02: renderer and camera share the layout viewport measurement; canvas CSS is constrained independently of buffer dimensions. Resize, visual viewport and orientation events coalesce and clear input before layout changes.
- R03: shared visible-focus filtering, Tab containment, restoration, background inertness and top-only Escape. Blocking panels clear input, pause local driving/job timers, release pointer lock and require a deliberate canvas click to reacquire it. The room transport continues while the local car is paused. Touch Menu includes Help/map and has an independent Pause action. Touch guidance uses device capability.
- R04: optional car preload removed from entry; opt-in session recorder and [hardware record procedure](performance-record.md). Hardware baselines remain pending.

Automated browser coverage uses actual UI factories and input adapters, plus an injected required-model failure. The harness is local development code and is excluded from the production build. Screenshots document layout/recovery only, not hardware scene quality.

Build and original asset checks pass. Detailed final command results and release gates will be recorded after milestones B/C.

## B — The first drive

- R05: shorter Nyx invitation with guided/free-drive choices and visible skip. Guided First Fare teaches movement, braking and turning in sequence, with two required stops, route replanning and a four-minute allowance. Returning saves skip mandatory exposition; the optional job stays in Menu. Existing tutorial flags remain compatible.
- R06: one owned theme layer, licensed locally hosted Inter for reading, stable semantic colors and backed essential text. The phone has a separate speed/gear/nitro readout. Route ribbons/maps use cyan, objectives amber, and warnings coral with wording/icons. Arrival/checkpoint beacons carry distinct flag icons. The first-drive command strip is one Help cue. Messages defer full previews until stopped; touch Messages works.
- R07: button steering remains the untested-on-hardware default. An anchored analog pad is optional, with dead zone/curve and the existing speed-sensitive input smoothing. Standard/Large target presets, 44px utilities and ≥56px pedals; utilities collapse, recovery requires a hold, and portrait advice is dismissible. Pause/rotation/cancellation/disconnection clear holds; gamepad input requires neutral after interruption. Start pauses; modal gamepad focus/activation uses D-pad/stick/A/B.
- R08: four saved mix channels, speech ducking, persistent explicit mute, gated ambience streaming, and background/return handling. Independent camera shake/speed zoom, blur and strong-screen-effect controls; reduced motion covers intro GSAP, loader reveal, typewriter and garage transitions. The vehicle physics is unchanged. Existing recordings remain in use; listening/handling sign-off is pending.

Local browser tests exercise the real First Fare mission state machine, ordered cues, stopping rules, reward persistence, free driving, saved/denied-storage preferences, and all six planned viewport sizes. A complete city boot and injected context loss also pass in the **diagnostic WebGL/software renderer**, captured in `evidence/diagnostic-city.png`. Its low DPR and timing are not production-backend or visual-quality evidence.
