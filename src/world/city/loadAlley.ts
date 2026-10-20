// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { buildObjectBvh } from "../bvh.ts";
import { createGltfLoaders } from "../loaders/createGltfLoaders.ts";
export const Tne = "/models/cyberpunk_compressed.glb";
export const Sne = "/models/colider.glb";
export const N2 = -20;
export function vne(i) {
  i.position.y = N2;
  i.traverse(e => {
    e.castShadow = true;
    e.receiveShadow = true;
  });
  buildObjectBvh(i);
  return i;
}
export function Ene(i) {
  i.name = "city-bounds-collider";
  i.position.y = N2;
  i.visible = false;
  i.traverse(e => {
    e.castShadow = false;
    e.receiveShadow = false;
    e.isMesh && (e.visible = false);
  });
  buildObjectBvh(i);
  return i;
}
export async function loadAlley(i) {
  const e = createGltfLoaders(i),
    [t, s] = await Promise.all([e.loadAsync(Tne), e.loadAsync(Sne)]),
    n = vne(t.scene),
    r = Ene(s.scene);
  return {
    city: n,
    boundsCollider: r
  };
}
