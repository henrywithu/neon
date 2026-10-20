// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { BufferGeometry, Mesh } from "three/webgpu";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
export let TN = false;
export function installBvh() {
  TN || (BufferGeometry.prototype.computeBoundsTree = computeBoundsTree, BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree, Mesh.prototype.raycast = acceleratedRaycast, TN = true);
}
export function buildObjectBvh(i) {
  installBvh();
  const e = new Set();
  i.traverse(t => {
    if (!t.isMesh || !t.geometry) return;
    const s = t.geometry;
    e.has(s) || s.boundsTree || (e.add(s), s.computeBoundsTree());
  });
}
