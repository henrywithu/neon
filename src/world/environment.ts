// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { EquirectangularReflectionMapping, PMREMGenerator } from "three/webgpu";
export const Zre = "/hdri/sunflowers_puresky_1k.hdr";
export async function loadEnvironment(i = Zre) {
  const t = await new HDRLoader().loadAsync(i);
  t.mapping = EquirectangularReflectionMapping;
  return t;
}
export function applyEnvironment(i, e, t, {
  intensity = 1
} = {}) {
  const n = new PMREMGenerator(e),
    r = n.fromEquirectangular(t).texture;
  n.dispose();
  i.environment = r;
  i.environmentIntensity = intensity;
  return {
    envMap: r,
    hdrTexture: t
  };
}
