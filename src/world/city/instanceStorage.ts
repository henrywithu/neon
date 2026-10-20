// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { StorageInstancedBufferAttribute } from "three/webgpu";
export let qU = false;
export function aie(i) {
  var e;
  qU = ((e = i == null ? undefined : i.backend) == null ? undefined : e.isWebGPUBackend) === true;
}
export function gl(i) {
  const e = i.instanceMatrix;
  !qU || e.isStorageInstancedBufferAttribute || (i.instanceMatrix = new StorageInstancedBufferAttribute(e.array, 16));
  return i;
}
export const rA = 6;
export const Mu = 7;
export const dl = 8;
export const B0 = 9;
export const QN = 10;
export const A1 = 11;
