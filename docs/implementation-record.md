# Improvement plan implementation record

Baseline: pulled `origin/main` at `7c73526` before implementation. Milestone commits are pushed directly to `main` as requested. No hosted CI or engine/physics migration is included.

## A — Dependable entry

- R01: distinct capability, required-asset, shader and device-loss recovery; Retry and lower-cost WebGPU restart; expandable diagnostics; indeterminate human-readable loading stages. Reload preserves saves. WebGL remains a diagnostic URL only.
- R02: renderer and camera share the layout viewport measurement; canvas CSS is constrained independently of buffer dimensions. Resize, visual viewport and orientation events coalesce and clear input before layout changes.
- R03: shared visible-focus filtering, Tab containment, restoration, background inertness and top-only Escape. Blocking panels clear input, pause local driving/job timers, release pointer lock and require a deliberate canvas click to reacquire it. The room transport continues while the local car is paused. Touch Menu includes Help/map and has an independent Pause action. Touch guidance uses device capability.
- R04: optional car preload removed from entry; opt-in session recorder and [hardware record procedure](performance-record.md). Hardware baselines remain pending.

Automated browser coverage uses actual UI factories and input adapters, plus an injected required-model failure. The harness is local development code and is excluded from the production build. Screenshots document layout/recovery only, not hardware scene quality.

Build and original asset checks pass. Detailed final command results and release gates will be recorded after milestones B/C.
