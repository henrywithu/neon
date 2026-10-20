# Reference provenance

Reference inspected: https://www.threejspunk.com/, 20 October 2026.

The live HTML points to `index-H-uJ8qQR.js` and `index-JNxiaN8f.css`. These are retained only in the ignored `research/original/` directory as extraction evidence. No production bundle is served or imported by this application.

The authors' public repository is https://github.com/ektogamat/threejs-conference, commit `8cc20593b2270e2ce832e7b7b44356705daddec4`. Its source documents the earlier alley scene. The current live metro driving game contains additional systems, which required application-level recovery from the publicly served JavaScript. Third-party library implementations are excluded from the recovered application and replaced by package imports.

Versions established from the live artifacts: Three.js revision 186, GSAP 3.15.0, Rapier 0.20.0. The project pins Three.js 0.186.1 and Rapier 0.20.0. GLSL/WGSL strings are not the source format: the reference authors shader graphs in Three Shading Language (TSL). These graphs remain independent source modules.

`asset-manifest.json` records original asset URLs, byte lengths, and SHA-256 digests. Content is fetched from Trapnest's public Ghost Content API with `published_at >= 2026-07-01`; its public content key is not an administrative credential. Generated Trapnest Neon artwork is separate from the reference scene assets.

Original authors: Anderson Mancini and Sunag. Preserve the original project's MIT notice in `LICENSE.upstream` and asset credits in `THIRD_PARTY.md`. The MIT source license does not automatically cover models, textures, recordings, or videos.
