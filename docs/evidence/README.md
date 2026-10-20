# Review evidence

Captured on 20 October 2026 from the production build of source revision `768f657`. Read the [playtest method and limitations](../playtest-report.md) before using these images to judge scene quality or performance.

Images are unedited browser captures. The game scene used a software-rendered WebGL diagnostic profile at 0.25 DPR; DOM UI remained at its CSS sizing until the reproduced phone viewport-scaling failure. Some captures include intro/reveal transitions or transient tips.

| Evidence | Purpose |
| --- | --- |
| [observations.json](observations.json) | Main desktop and touch-landscape input, geometry, focus, menu, instruction, and radio observations; includes later portrait resize. |
| [rotation/observations.json](rotation/observations.json) | Independent fresh-portrait start and portrait → landscape → portrait measurements. |
| [failure.json](failure.json) | Isolated blocked required-model request and resulting loader state. |
| [deployment-fingerprints.json](deployment-fingerprints.json) | Matching local/deployed bundle digests. |
| [desktop-intro.png](desktop-intro.png), [phone-intro.png](phone-intro.png) | Title treatment and entry composition. |
| [desktop-story.png](desktop-story.png), [phone-story.png](phone-story.png) | Opening story, goal density, and transition state. |
| [desktop-drive.png](desktop-drive.png), [phone-drive.png](phone-drive.png) | Initial gameplay composition with scene and HUD. |
| [desktop-moving.png](desktop-moving.png) | Input/telemetry HUD after explicit simulation ticks; scene blank in this diagnostic capture. Do not use to claim a normal-play rendering bug. |
| [desktop-map.png](desktop-map.png), [desktop-help.png](desktop-help.png) | Map and comprehensive keyboard help. |
| [desktop-settings.png](desktop-settings.png), [desktop-about.png](desktop-about.png), [desktop-radio.png](desktop-radio.png) | Desktop DOM reading surfaces after accelerated simulation; background scene limitation applies. |
| [phone-menu.png](phone-menu.png), [phone-settings.png](phone-settings.png), [phone-about.png](phone-about.png), [phone-radio.png](phone-radio.png) | Landscape touch menus and reading surfaces. About's recommended instructions are below the initially visible area; their text is recorded in JSON. |
| [phone-portrait-drive.png](phone-portrait-drive.png), [phone-portrait-settings.png](phone-portrait-settings.png), [phone-portrait-about.png](phone-portrait-about.png) | First landscape → portrait reproduction, including underscaled controls and Settings. |
| [rotation/portrait-intro.png](rotation/portrait-intro.png), [rotation/portrait-story.png](rotation/portrait-story.png), [rotation/portrait-drive.png](rotation/portrait-drive.png) | Independent fresh portrait baseline. |
| [rotation/to-landscape.png](rotation/to-landscape.png), [rotation/back-to-portrait.png](rotation/back-to-portrait.png) | Same portrait session rotated out and back; paired with viewport measurements. |
| [phone-load-failure.png](phone-load-failure.png) | Injected network failure surface; not an observed live outage. |

To repeat the functional checks, build and preview locally, use the diagnostic URL in the report, and follow the finding-specific steps. For simulation inspection only, stop `window.__neon.renderLoop` and advance `window.__neon.drive.tick(1/60)` at a time. Use a continuous normal-quality hardware session for art, driving feel, audio, and performance sign-off.
