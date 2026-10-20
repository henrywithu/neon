# Credits and provenance

Trapnest Neon is an adaptation of [Threejs-Punk](https://www.threejspunk.com/) by [Anderson Mancini](https://andersonmancini.dev/) and Sunag. Their public [Three.js Conference repository](https://github.com/ektogamat/threejs-conference) supplies the earlier alley implementation under MIT; its notice is retained in `LICENSE.upstream`. The current live site's additional application systems were recovered from public assets, with origins documented in `research/PROVENANCE.md`.

The original public repository explicitly excludes models, textures, audio and videos from its source-code license. The extracted files retain their original bytes and source URLs in `research/asset-manifest.json`; no blanket asset license is asserted here. Original GLB metadata is preserved.

- Three.js and its addons: MIT, Three.js authors.
- three-mesh-bvh: MIT, Garrett Johnson and contributors.
- Rapier: Apache-2.0, Dimforge and contributors.
- GSAP: the GSAP Standard License, GreenSock.
- Procedural surface-rain graph: adapted in the original project from [rocksdanister/rain](https://github.com/rocksdanister/rain). Attribution remains beside the shader.
- Orbitron, Gloock and Phosphor font assets: original font files, extracted from the reference distribution / authors' repository. Phosphor: [Phosphor Icons](https://phosphoricons.com/).
- Radio recordings: Pixabay Content License. The 15 titles, artists, durations and original source pages are preserved in `public/audio/radio/playlist.json`.
- Vehicle-engine and turbo recordings: original sample-bank metadata retains source links in `public/audio/engine/` and `public/audio/turbo/`.
- Trapnest journal text and featured images: [henrywithu.com](https://henrywithu.com/), published from 1 July 2026. Each entry retains its canonical article and original featured-image URL in `src/content/journal.json`.
- Trapnest Neon OG art and icon: generated specifically for this project; the original generated images and optimized variants are in `public/brand/`.

The in-app information panel retains acknowledgment of the original visual and technical authors.
