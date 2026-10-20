# Make the night worth staying in

**Product goal:** deliver a distinctive, elegant ten-minute driving experience that feels dependable on desktop and comfortable on a phone. Preserve the existing city, physics, rain, radio, and progression; improve how the player encounters them.

This plan follows the [critical review](game-review.md) and [playtest evidence](playtest-report.md). It proposes implementation work; it does not claim these changes have shipped. No CI setup is needed. Validation can run locally, with a recorded manual release pass.

**Implementation follow-through:** the code changes and local regression coverage are tracked in [the implementation record](implementation-record.md). See [release validation](release-validation.md) for completed checks and outstanding physical-device, listening, performance and formative-player gates. Implementation commits do not certify those gates.

## The experience to build toward

The player enters through rain-streaked glass, recognizes their car immediately, and receives one useful invitation: take a short job or simply drive. During a job, one objective and one navigation cue carry the route. At a stop, richer messages and garage details become available. A reward changes something the player can see or hear. Returning later feels like returning to the same night.

The experience should support both purposeful play and unhurried cruising. Do not make a tutorial mission a prerequisite for free driving. Do not add a new account requirement, activity feed, battle pass, or additional permanent panels to create a sense of depth.

## Art and interface direction

Use **rain-lit noir with precise instruments** as the governing direction. This is a proposed production vocabulary, to be judged on hardware captures at the intended resolution.

| Element | Direction | How to judge it |
| --- | --- | --- |
| Composition | Car and drivable road form the foreground; one landmark leads the eye into the next block. Let secondary architecture recede. | In an unlabelled screenshot, a new viewer can point to the car, route, and next turn immediately. |
| Palette | Ink `#080C14`, panel `#111A26`, text `#EDF3F8`, cyan `#6DE6FF`, warm objective amber `#FFD166`, danger coral `#FF657A`. Use these as starting tokens, not a guarantee of contrast. | Test final composited UI against the brightest sign and darkest street; adjust tokens and backing to meet contrast targets. |
| Color roles | Cyan means player/navigation, amber means available objective, coral means immediate danger. Reserve magenta/violet mainly for the world. | Route, hazard, and collectible remain distinguishable in grayscale through shape, icon, wording, and motion. |
| Typography | Keep Orbitron for branding, speed, and short instrument labels. Add one readable, locally hosted text face for briefs, settings, and dialogue; check its license. | Body text 16 CSS px by default, secondary copy at least 14, short touch labels at least 12. Avoid excessive tracking on sentences. Support zoom and text resizing. |
| Surfaces | A shared dark glass treatment with restrained borders; increase local opacity behind essential text. | No critical instruction depends on the changing scene underneath for contrast. Use 4.5:1 for ordinary text and 3:1 for large text and control boundaries where applicable. |
| Motion | Quiet while driving; stronger emphasis only for danger, a completed action, or a reward. Menu transitions about 160–240 ms. | The road remains the dominant moving element. Reduced-motion preferences cover scripted transitions as well as CSS. |
| World effects | Retain wet highlights, atmospheric depth, and localized bloom. Tune aberration, lens effects, exposure, and speed blur against road readability. | A/B capture one route in the canonical look on desktop and phone; no critical geometry disappears behind effects. Do not judge this using the review's 0.25-DPR diagnostic captures. |
| Identity | Author a few recognizable Trapnest motifs, landmarks, and phrases rather than placing the brand on every surface. | Players remember a location or character exchange after the session. Keep journal reading available in About. |

Make one look the authored default. Keep the other existing grades as optional moods, with stable UI colors and route readability across all of them.

### HUD hierarchy

**Desktop driving:** a compact speed/gear/nitro cluster at lower right; a restrained minimap/navigation cluster at lower left; one small current-objective line near the upper edge. Offer the garage, messages, radio, and settings through a quiet menu. A new message should initially be a small cue; expand the text when the player asks or comes to a safe stop. Preserve a single-key route to controls help.

**Phone landscape:** clear the central horizon and road corridor. Put steering in the left thumb zone and the primary accelerator/brake area in the right thumb zone. Use a compact speed/gear/nitro readout above the road, with one contextual route cue. Put camera, reset, exit, and full instructions behind accessible utilities. Keep Pause and Menu reachable without touching a driving control.

**Phone portrait:** keep menus and reading fully usable. Choose whether portrait driving is a supported mode after physical-device tests. If landscape is preferred, offer a dismissible “Rotate for a wider road view” hint; never block Settings, Help, or recovery behind an orientation demand. Do not rely on browser orientation lock.

The persistent desktop HUD should aim to cover less than 20% of the view in steady driving. Measure the union of visible opaque/backed regions, not the sum of overlapping bounding boxes. On phones, define the usable road corridor around actual thumb occlusion before choosing a numerical coverage target. Transient and pause screens have separate budgets.

## Ordered work packages

Sizes are planning estimates for one engineer with design support: **S** roughly 1–2 focused days, **M** 3–5, **L** 6–10. They exclude asset commissioning and physical-device availability. Recovered engine modules may require additional investigation. Owners below are roles, not assigned people.

### R01 — Make startup and interruption recoverable

**P1 · M · Owner: runtime engineer + UI designer · Addresses F01 · First dependency for release**

- Replace “LINK FAILED” with a designed failure surface: what happened, Retry, and a lower-cost restart when supported. Keep technical details in an expandable diagnostic section.
- Distinguish unsupported graphics capability, failed asset transfer, shader initialization failure, and device loss. A WebGL switch is already available for diagnostics; do not advertise it as a reliable fallback until the full production scene has been validated on that backend.
- Show player-facing loading stages such as “Preparing the city” and “Almost ready.” If progress is not measurable, use an indeterminate stage; do not imply a precise time remaining.
- Handle GPU-device/context loss visibly. Keep save data intact, clear held input, and offer a safe reload rather than leaving a frozen canvas.
- Audit tab blur, document visibility, orientation change, and interrupted touch. The keyboard blur handler currently clears keys; touch holds need an explicit lifecycle policy too. Define how solo simulation pauses and how an online player returns safely.

**Acceptance:** block a required model request, lose the renderer, background the tab with accelerator held, and return from a phone interruption. Each scenario leaves the player a usable screen and zero unintended held controls. Retry succeeds after the fault is removed. Existing progress survives. Verify both normal startup and the supported recovery route.

**Likely files:** `src/main.ts`, `src/ui/loader/createLoaderOverlay.ts`, `src/bootstrap/createRenderer.ts`, `src/runtime/createRenderLoop.ts`, `src/controls/createDriveInput.ts`, `src/ui/drive/touchControls.ts`.

### R02 — Fix phone rotation and viewport sizing

**P1 · M · Owner: frontend + rendering engineer · Addresses F10 · Before mobile visual sign-off**

- Investigate the reproduced 844×390 → 390×844 transition: the captured portrait page retains an 844-pixel content width and scales its controls down. Distinguish CSS layout viewport, visual viewport, canvas display size, and render-buffer size.
- Constrain the canvas and root surfaces to the available CSS viewport. Resize the render buffer from a stable viewport measurement; avoid allowing the previous canvas width to feed back into the next layout measurement.
- Recalculate camera aspect, HUD anchors, safe-area offsets, and active touch zones together. Clear held input before replacing the layout. Do not infer that a correct orientation media query guarantees a correctly sized canvas.
- Compare fresh portrait, fresh landscape, portrait → landscape → portrait, browser toolbar changes, and keyboard opening/closing. Retest in physical Chrome and Safari before claiming a device-wide fix.

**Acceptance:** after every transition, the page fits the usable viewport without automatic shrinking, horizontal overflow, clipped primary actions, or stale pointer positions. At 390×844, the measured utilities and pedals remain their intended CSS sizes on screen. Camera framing, menus, and Help remain usable. Store before/after viewport and target-size observations.

**Likely files:** `src/bootstrap/createRenderer.ts`, `src/app/bootstrap.ts` resize handling, `src/bootstrap/createCamera.ts`, `src/platform/deviceLayout.ts`, root/canvas CSS and touch-layout styles.

### R03 — Unify modal and input boundaries

**P1 · M · Owner: UI/runtime engineer · Addresses F02, F03 · Depends on R01 pause policy and R02 viewport behavior**

- Extract shared initial focus, Tab containment, focus restoration, background inertness, Escape dismissal, and pointer-lock release/reacquisition behavior. Use About's existing focus behavior as a starting point and audit its visible focusable selection.
- Route each blocking panel through the same state boundary. Ensure an action key used in a menu cannot shift a gear, accelerate, or change a camera underneath it.
- Add Help and Pause to the touch menu. Explain touch controls without keyboard-only keycaps. Keep advanced keyboard/gamepad information available when those inputs are actually used.
- Select recommended instructions from input capability and active device, not viewport width alone. Check phone landscape and large touch tablets explicitly.

**Acceptance:** open Settings, About, story, controls, radio, map, garage, messages, and room UI using every supported input. Keyboard focus stays in blocking surfaces, returns to the opener, and remains visible. Escape closes the top surface only. A touch user can pause, find help, resume, and reach the map without a keyboard. Nonblocking online UI must have an explicit alternative policy.

**Likely files:** `src/ui/core/state.ts`, `src/app/createAppShell.ts`, panel factories in `src/ui/`, `src/platform/deviceLayout.ts`, `src/controls/`.

### R04 — Establish real-device performance and loading baselines

**P1 measurement / P2 optimization · M for baseline, tuning separately scoped · Owner: rendering engineer · Addresses F07**

- Record the same route and a five-minute cold-start session on an integrated-GPU laptop, a mainstream desktop GPU, a midrange Android phone, and a supported iPhone/Safari combination. Include a fifteen-minute phone soak.
- Measure compressed first-play transfer, network waterfall, time to first usable drive, long tasks, frame-time distributions, memory where available, and first-use stalls in garage, mission, rain, and radio states.
- Separate necessary initial assets from optional work. The repository's roughly 129.6 MB of public files is an inventory size, not a measured first-load transfer. Radio tracks and later vehicle rigs should not all become startup dependencies.
- Inspect shader warmup and on-demand asset loading before changing scene fidelity. Preserve the car, road, nearby landmarks, and UI resolution when reducing cost.
- Validate the existing mobile budget and its fixed resolution against thermal behavior. Add adaptation with hysteresis only if device evidence supports it; avoid quality oscillation and sudden visual changes mid-corner.
- Name player-facing modes by outcome, such as Balanced and Performance, while retaining diagnostic quality controls internally. Persist the user's preference.

**Proposed release targets, not current measurements:**

| Condition | Target | Measurement rule |
| --- | --- | --- |
| Desktop driving | 60 FPS goal; p95 frame time ≤20 ms | Hardware browser, fixed route, 1080p output, declared preset, 120-second trace after warmup. |
| Phone driving | Stable 30 FPS baseline; p95 ≤33.3 ms | Named real device, browser, rendering resolution, and 15-minute session; no sustained thermal collapse. |
| Cold first usable drive | ≤15 s desktop; ≤20 s target phone | Empty cache, 25 Mbps down / 80 ms RTT, named device; measure until input moves the vehicle after an immediately skipped introduction. |
| Warm repeat visit | ≤5 s to usable drive | Same route and device, normal browser cache; report separately from cold start. |
| Input | No sticky control; no avoidable main-thread stall over 100 ms during the measured drive | Correlate touch/key events with simulation/frame traces; exclude initial compilation from steady-state statistics. |

**Acceptance:** save a local performance record with hardware, preset, network conditions, sampling method, and before/after traces. If a target is missed, record the cause and either tune it or narrow the supported configuration. Do not infer any target from cloud software-renderer timing.

**Likely files:** `src/platform/performanceProfile.ts`, `src/platform/adaptiveDpr.ts`, `src/runtime/warmup.ts`, `src/world/`, `src/post/`, `src/game/vehicles/createFleet.ts`, `src/audio/`.

### R05 — Author the first five minutes

**P2 · L · Owner: game designer + gameplay engineer + writer · Addresses F04, F08 · Depends on R01/R02/R03**

- Offer “Take a short job” and “Just drive” after a shorter Nyx welcome. Retain a skip route and avoid replaying mandatory exposition for returning players.
- Reuse a suitable early job, such as First Fare, as the teaching route. Teach move → brake → turn → stop; show one instruction at a time. Offer drift and nitro later in a safe, wide section.
- Set one nearby destination automatically for the guided option. Give the next turn through both road-space cues and a compact HUD instruction; recover cleanly after a missed turn.
- Give the route one signature view and a distinctive contact exchange. After completion, show one clear reward and a choice of what to do next. Avoid immediately expanding every progression category.
- Preserve the current contextual tutorial's completion tracking; reconcile new steps with existing saves.

**Acceptance:** in a formative test with five first-time players per platform, aim for at least four to move, stop at the destination, finish the first job, and identify their next option without facilitator help within five minutes after loading. Record confusion and deaths/restarts. This small test is a design gate, not a statistical retention claim.

**Likely files:** `src/intro/createIntroFlow.ts`, `src/game/story/`, `src/game/missions/`, `src/ui/drive/tutorial.ts`, `src/ui/walk/prompts.ts`, `src/ui/story/`.

### R06 — Make the HUD quiet and readable

**P2 · L · Owner: UI designer + frontend engineer · Addresses F05 · Depends on R03 and the objective hierarchy from R05**

- Implement the typography, surface, spacing, focus, and semantic-color tokens above in one owned theme layer. Migrate touched selectors deliberately; preserve the extracted reference cascade until each replacement is verified.
- Replace the first-drive command strip with a single contextual cue and a small Help affordance. Do not remove access to advanced controls.
- Reduce full message interruptions during active driving. Prioritize immediate hazard, turn, objective, reward, and ambient content in that order; queue lower-priority notices.
- Build the phone speed/gear/nitro cluster independently of the desktop RPM dial. Keep driving-aid detail in an optional advanced surface.
- Make route, start, finish, hazard, and sigil markers distinguishable by shape and text. Keep the center and lower-middle road view clear.

**Acceptance:** verify stopped, accelerating, turning, drifting, mission-active, incoming-message, and online states at 1440×900, 1280×720, 844×390, 740×360, 390×844, and 360×800. No critical overlap or clipped action. Essential text passes contrast checks on bright and dark scene captures. Phone labels remain readable without zoom; browser zoom and enlarged text keep menus operable. Review at normal pixel ratio on hardware.

**Likely files:** `src/styles/trapnest.css`, a new owned token stylesheet, `src/ui/drive/speedometer.ts`, `src/ui/map/`, `src/ui/missions/`, `src/ui/story/`, `src/ui/chrome/`.

### R07 — Tune the phone around actual hands

**P2 · L · Owner: controls/gameplay engineer + interaction designer · Addresses F02, F06 · Depends on R03/R04**

- Compare the current digital steering with an optional anchored analog drag pad. Tune dead zone, response curve, return speed, and speed-sensitive steering; retain a button option if players prefer it.
- Make utilities at least 44×44 CSS px; target at least 56 px for primary driving controls with separation and safe-area padding. Offer thumb-zone placement/scale presets and a left-handed option if tests justify it.
- Keep accelerator and brake unmistakable by position, icon, label, and pressed state. Test whether drift/nitro placement permits the intended combinations without repeated third-finger reaches.
- Make reset intentional and recoverable; keep it fast enough to rescue a stuck car. Confirm exit-vehicle feedback at speed. Do not add repetitive confirmation dialogs to ordinary driving actions.
- Clear every held input on cancellation, lost capture, pause, rotation, backgrounding, and disconnect. Respect browser navigation gestures and test multi-touch near the screen edge.

**Acceptance:** on physical Android and iPhone hardware, complete acceleration, braking, tight turns, a sustained drift, nitro use, reverse, reset, exit/re-entry, and a five-minute job using two thumbs. Repeat after rotation and an interruption. Record accidental presses and comfort reports; choose a control default from those observations, not from emulation alone.

**Likely files:** `src/ui/drive/touchControls.ts`, `src/controls/createDriveInput.ts`, `src/controls/createWalkControls.ts`, `src/ui/walk/virtualJoystick.ts`, `src/game/drive/createDriveMode.ts`, touch styles.

### R08 — Polish sound, camera, and motion comfort together

**P2 · M · Owner: audio designer + camera/gameplay engineer · Addresses immersion and F05/F07**

- Listen to the current recordings before replacing assets. Balance engine, tires, impacts, rain, radio, and voices so acceleration and traction remain audible.
- Duck music gently during important speech; keep subtitles readable and skippable. Offer independent music, vehicle/effects, ambience, and voice controls with immediate feedback and saved values.
- Compare chase-camera lag and framing across slow turns, fast corners, collisions, reset, and vehicle entry. Make shake, speed blur, and strong screen effects independently reducible.
- Respect reduced motion in GSAP intro sequences and typewriter transitions as well as the CSS surfaces that already support it. Never change vehicle physics merely to reduce camera motion.

**Acceptance:** a headphone and phone-speaker listening pass covers rain, radio, full acceleration, a collision, voice dialogue, mute/unmute, and background/return. No audible clipping or duplicate playback. Voice is intelligible; the road remains stable and readable with comfort settings enabled. Evaluate mix subjectively and record settings; playback state alone is insufficient.

### R09 — Give progression a local memory

**P2/P3 · M, plus authored content · Owner: narrative/game designer + environment/audio artist · Addresses F08/F09**

- Make the polished route distinctly Trapnest through one landmark, one voice, and one recurring visual motif. Keep original attribution and verify rights before commissioning replacement assets.
- Link the first reward to something visible: a garage reveal, livery detail, or contact acknowledgment using existing progression hooks. Show what changed and why.
- Prototype a modest district audio identity and one environmental acknowledgment of a completed job. Avoid a large content expansion until the first slice is successful.
- Explain local save behavior and provide a clear reset description. Consider save export/import only if returning-player research shows demand; accounts and cloud saves are outside the first milestone.

**Acceptance:** returning players recognize their unlocked reward and the next reachable goal. In a short recall interview they can name a place, character, or moment specific to this game. Save/reload preserves the relevant progress and selected car.

### R10 — Verify the complete night, including online edges

**P1 release gate · M · Owner: QA + engineering · Depends on R01–R08 and any shipped R09 content**

- Run the manual matrix below and the existing local build, asset, and room checks. Keep the results and selected screenshots in `docs/`; no hosted CI is required.
- Exercise empty, full, reconnecting, and disconnected rooms with controlled test clients. Verify four-seat capacity, shared countdown, leaving/rejoining, quick chat, and map navigation to another driver. Do not send test chat into public rooms with unsuspecting players.
- Check slow/failed assets, cached and uncached load, denied audio autoplay, muted return visits, local-storage failure, and graphics interruption.
- Review the final look and mix on real hardware. Cloud screenshots remain useful for layout regression and diagnostics, not premium-quality sign-off.

**Acceptance:** no unresolved P1 issue on the declared support matrix; all supported inputs can start, pause, recover, complete one job, receive a reward, and return with progress intact. File reproducible P2 issues explicitly before deciding whether to ship them.

## Milestones and dependencies

| Milestone | Work | Exit decision |
| --- | --- | --- |
| A — Dependable entry | R01, R02, R03, R04 baseline | A new player can start, rotate the phone, find help, pause, and recover. Supported device/preset combinations have measured baselines. |
| B — Premium ten-minute slice | R05, R06, R07, R08; tune measured R04 bottlenecks | Both platforms complete the same authored slice; real-device controls, visual composition, comfort, and mix meet acceptance criteria. |
| C — Distinctive and release-ready | Selected R09 work, R10 | The slice has its own identity, saves reliably, and passes the declared device and online matrix. |

Treat these as gated work, not calendar promises. R04 measurement can run alongside design exploration; final visual tuning must use its results. Avoid a wholesale physics rewrite, engine migration, new city, or new progression economy during this pass.

## Local release checklist

Run `npm run build` and `npm run check:assets`. When room behavior changes, run the existing local room service and `node scripts/verify-rooms.mjs`. Use a static production preview for solo UI checks and the local Worker for room tests. Record command results manually; no CI work is included.

| Surface | Desktop keyboard/pointer | Physical Android touch | Physical iPhone/Safari touch |
| --- | --- | --- | --- |
| Entry / return visit | Cold and warm startup, skip, retry, saved preferences | Slow network, rotation, interruption | HTTPS, supported graphics backend, safe areas, interruption |
| Driving | Accelerate, brake/reverse, steer, drift, nitro, camera, reset | Same verbs with two thumbs; cancellation and no accidental utility press | Same, including screen-edge and multi-touch behavior |
| Reading / menus | Visible focus, Tab loop, Escape, input isolation, 200% zoom | Help, Pause, map, messages, settings, journal scrolling | Same in browser and installed mode if supported |
| Mission loop | Start, miss a turn, fail/retry, finish, receive reward | Same short route, readable cues, comfortable controls | Same short route and state transitions |
| Audio / comfort | Autoplay gate, headphones, separate volumes, reduced motion | Phone speaker, mute, background/return | Speaker/headphones, audio resume, comfort options |
| Progress / online | Reload, storage error, controlled two-client race, disconnect | Reload and reconnect without stuck input | Reload and reconnect without stuck input |
| Sustained quality | Route frame-time trace at declared preset | 15-minute trace and comfort pass | 15-minute trace and comfort pass |

The final decision should be made from a normal-speed play session and clean screenshots at the intended quality, with diagnostics hidden. The game should look like an invitation to drive, and every necessary action should remain easy to perform once the invitation is accepted.
