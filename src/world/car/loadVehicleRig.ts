// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createGltfLoaders } from "../loaders/createGltfLoaders.ts";
async function g(i, r) {
  const s = (await createGltfLoaders(i).loadAsync(r)).scene;
  let t = null;
  if (s.traverse(e => {
    var o;
    !t && ((o = e.userData) == null ? undefined : o.rig) === "vehicle" && (t = e);
  }), !t) throw new Error(`${r}: missing vehicle rig metadata (run tools/assets/build-car.mjs)`);
  const a = t.userData,
    c = t.getObjectByName("Body"),
    n = {};
  for (const e of a.wheels) {
    const o = t.getObjectByName(e.node);
    if (!o) throw new Error(`${r}: wheel pivot ${e.node} not found`);
    o.rotation.order = "YZX";
    o.rotation.z = e.camber ?? 0;
    n[e.id] = o;
  }
  s.traverse(e => {
    e.isMesh && (e.castShadow = true, e.receiveShadow = true);
  });
  return {
    root: s,
    rigNode: t,
    body: c,
    wheels: n,
    rig: a
  };
}
export { g as loadVehicleRig };
