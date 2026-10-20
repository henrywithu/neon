// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from "three/webgpu";
import { zU } from "./createGltfLoaders.ts";
export const i3 = new Map();
export function loadSurfaceTexture(i, {
  srgb = false,
  anisotropy = 1
} = {}) {
  const s = performanceProfile.shareSurfaceTextures;
  let n = s ? i3.get(i) : null;
  n || (n = new TextureLoader().load(i, r => zU(r, performanceProfile.surfaceTextureMax)), n.wrapS = RepeatWrapping, n.wrapT = RepeatWrapping, srgb && (n.colorSpace = SRGBColorSpace), s && i3.set(i, n));
  n.anisotropy = s ? Math.max(n.anisotropy, anisotropy) : anisotropy;
  return n;
}
