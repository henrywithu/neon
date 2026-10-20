// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createGltfLoaders } from "../loaders/createGltfLoaders.ts";
import { uniformArray } from "three/tsl";
import { Vector4 } from "three/webgpu";
import { N2 } from "../city/loadAlley.ts";
export const DN = "/textures/screens/";
export const Cne = ["square", "portrait"];
export async function loadAdAtlas(i) {
  const [e, t] = await Promise.all([createGltfLoaders(i).ktx2Loader.loadAsync(`${DN}ads.ktx2`), fetch(`${DN}ads.json`).then(l => l.json())]);
  e.anisotropy = 8;
  const [s, n] = t.size,
    r = Cne.flatMap(l => t.posters.filter(c => c.shape === l)),
    o = uniformArray(r.map(({
      rect: [l, c, u, d]
    }) => new Vector4(l / s, c / n, u / s, d / n)), "vec4");
  function a(l) {
    const c = r.findIndex(u => u.shape === l);
    return c < 0 ? {
      first: 0,
      count: r.length
    } : {
      first: c,
      count: r.filter(u => u.shape === l).length
    };
  }
  return {
    texture: e,
    posters: r,
    rects: o,
    runFor: a,
    dispose: () => e.dispose()
  };
}
export const Bne = "/models/billboards.glb";
export async function loadBillboards(i) {
  const e = createGltfLoaders(i),
    [t, s] = await Promise.all([e.loadAsync(Bne), loadAdAtlas(i)]),
    n = t.scene;
  n.name = "Billboards";
  n.position.y = N2;
  n.userData.adAtlas = s;
  n.traverse(r => {
    r.castShadow = false;
    r.receiveShadow = false;
  });
  return n;
}
