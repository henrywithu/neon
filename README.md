# Trapnest Neon

A modular reconstruction of the current Threejs-Punk driving experience, customized for Trapnest. Intended origin: **https://neon.henrywithu.com**. No deployment is performed by development or build commands.

## Develop

Node.js 22.12+ (Node 24 recommended):

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. Localhost is a secure context for WebGPU. A remote phone needs HTTPS; plain LAN HTTP does not expose WebGPU. Use a recent WebGPU-capable Chrome, Edge or Safari and a hardware GPU. The scene is a full 3D game with substantial shader compilation at startup.

For online rooms, start a second terminal:

```sh
npm run dev:rooms
```

Vite proxies `/lobby` and `/room/*` to the local Worker on port 8787. Driving, missions, radio and the journal run independently of multiplayer. Production uses the same-origin Worker; no original Threejs-Punk server is contacted.

## Commands

```sh
npm run check          # TypeScript frontend checks
npm run check:worker   # Strict Worker checks
npm run check:assets   # Verify extracted SHA-256 digests and journal images
npm run build          # Both TypeScript checks + Vite production build
npm run preview        # Static production preview on port 4173
npm run content:sync   # Refresh every Trapnest post published since July 1, 2026
npm run types:worker   # Regenerate Worker binding/runtime types
node scripts/verify-rooms.mjs  # Integration checks against the local Worker
npm run deploy:dry-run # Validate Cloudflare packaging without publishing
```

## Architecture

`src/main.ts` mounts the application. `src/app/bootstrap.ts` composes independent factories, with an explicit render loop and no framework-owned animation state.

| Directory | Responsibility |
| --- | --- |
| `src/bootstrap/`, `src/runtime/` | Renderer, camera orchestration, warmup, update loop |
| `src/world/` | Original city/map/vehicle assets, instancing, lights, weather, environment |
| `src/shaders/`, `src/post/` | Isolated TSL shader graphs and compositing |
| `src/game/` | Rapier vehicle dynamics, traffic, navigation, missions, garage, progression |
| `src/controls/` | Keyboard, mouse, pointer lock and drive input |
| `src/ui/` | DOM components for intro, HUDs, panels, touch controls and Trapnest journal |
| `src/audio/` | Original recordings, spatial audio, voice, radio, separate AudioWorklets |
| `src/platform/` | Desktop/mobile/Safari budgets and preferences |
| `src/multiplayer/` | Original client protocol, interpolation, ghosts, room UI, races |
| `src/shared/`, `worker/` | Typed protocol validation and hibernatable Cloudflare room service |
| `src/content/`, `public/content/` | Source-backed Trapnest article snapshot and featured images |
| `research/` | Detailed audit, asset digests, recovered-symbol source mapping |

Third-party engine code comes from npm, not copied production bundles. The live application was split into more than 150 source modules, including separately recovered vehicle and paint modules. Recovered numerical implementations retain `@ts-nocheck` while preserving their original behavior; new UI, protocol, and Worker components are strictly checked. This is deliberate migration debt, not a claim that lost original types were recovered.

The original shaders are TSL, not handwritten WGSL/GLSL. Vite owns module resolution, code splitting, shader-source edits and HMR. Styles hot-update; changes reaching the application root reload the native GPU/audio state. `?debug` exposes the composed runtime as `window.__neon` for inspection.

The extracted stylesheet cascade is preserved in sequence. Trapnest-specific additions are isolated in `src/styles/trapnest.css`. No analytics or cookie consent code is included.

## Reference behavior

The default mode is the metro driving game, with eight original vehicle rigs, physics, traffic, missions, 54 collectible sigils, garage, weather, sound and 15-track radio. Keyboard and touch controls are available through the game's help panel. Settings preserve all six original visual grades.

Reference query switches remain available: `?alley`, `?quality=low|medium|ultra`, `?dpr=1`, `?lite=1`, `?nointro`, `?noaudio`, `?nomissions`, `?nomultiplayer`, `?reflect=full|lights|off`, and shader diagnostics. Normal visitors use the original defaults; performance profiles have not been replaced by simplified geometry.

## Cloudflare Workers

`wrangler.jsonc` serves `dist/` as static assets and routes `/lobby` and `/room/*` to the Worker. A separate SQLite-backed Durable Object coordinates each of five public rooms, with four seats per room. The service implements the recovered version-2 client protocol, sender identity, room capacity, heartbeat handling, pose relays, quick chat, map pings, car/name changes and shared race starts. Connections use WebSocket hibernation and serialized attachments.

To publish when ready:

```sh
npm run deploy
```

Wrangler needs your Cloudflare account authorization and access to the `henrywithu.com` zone. The configuration declares the `neon.henrywithu.com` custom domain and the initial Durable Object migration. No API secrets are required by the application itself. Do not remove an applied Durable Object migration when updating the app.

## Evidence and credits

Read `research/REVERSE_ENGINEERING.md` for the detailed rendering, assets, choreography, controls, audio and simulation audit. `research/source-map.json` ties recovered symbols to offsets in the archived reference JavaScript. Raw production files are ignored in `research/original/` and are never served.

See `THIRD_PARTY.md` and `LICENSE.upstream` for original authorship and asset provenance. Hardware-GPU visual verification remains distinct from software-only cloud-browser checks; see the validation record for the checks actually performed.
