// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { RGBAFormat, RGBFormat, RGFormat, RedFormat, DataTexture, LinearFilter } from "three/webgpu";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { performanceProfile } from "../../platform/performanceProfile.ts";
export function zU(i, e) {
  const t = i == null ? undefined : i.image;
  if (!(e > 0) || !t || i.isCompressedTexture || i.isDataTexture || i.isCanvasTexture) return;
  const s = t.naturalWidth ?? t.width,
    n = t.naturalHeight ?? t.height;
  if (!s || !n || Math.max(s, n) <= e) return;
  const r = e / Math.max(s, n),
    o = document.createElement("canvas");
  o.width = Math.max(1, Math.round(s * r));
  o.height = Math.max(1, Math.round(n * r));
  const a = o.getContext("2d");
  a.imageSmoothingQuality = "high";
  a.drawImage(t, 0, 0, o.width, o.height);
  i.image = o;
  i.needsUpdate = true;
}
export function _ne(i, e) {
  if (!(e > 0)) return;
  const t = new Set();
  i.traverse(s => {
    for (const n of [s.material].flat()) if (n) for (const r of Object.values(n)) r != null && r.isTexture && !t.has(r) && (t.add(r), zU(r, e));
  });
}
export const wne = new Set([RGBAFormat, RGBFormat, RGFormat, RedFormat]);
export let IT;
export let jy;
export let Pc;
export function mE() {
  if (mE.applied) return;
  const i = KTX2Loader.prototype._createTextureFrom;
  KTX2Loader.prototype._createTextureFrom = function (e, t) {
    const s = i.call(this, e, t);
    if (!s.isCompressedTexture || !wne.has(s.format)) return s;
    const n = s.mipmaps[0],
      r = new DataTexture(n.data, n.width, n.height, s.format, s.type);
    r.minFilter = LinearFilter;
    r.magFilter = LinearFilter;
    r.colorSpace = s.colorSpace;
    r.premultiplyAlpha = s.premultiplyAlpha;
    r.wrapS = s.wrapS;
    r.wrapT = s.wrapT;
    r.needsUpdate = true;
    return r;
  };
  mE.applied = true;
}
export function createGltfLoaders(i) {
  mE();
  return Pc || (IT = new DRACOLoader(), IT.setDecoderPath("/libs/draco/"), jy = new KTX2Loader(), jy.setTranscoderPath("/libs/basis/"), jy.detectSupport(i), Pc = new GLTFLoader(), Pc.setDRACOLoader(IT), Pc.setKTX2Loader(jy), Pc.setMeshoptDecoder(MeshoptDecoder), Pc.register(() => ({
    name: "punk_texture_budget",
    afterRoot(e) {
      _ne(e.scene, performanceProfile.modelTextureMax);
    }
  })), Pc);
}
