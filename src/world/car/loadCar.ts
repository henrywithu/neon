// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Box3, Matrix4, Vector3, Mesh, BoxGeometry, MeshBasicMaterial, Quaternion, Group } from "three/webgpu";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { applyCarSurfaceRain } from "./applyCarSurfaceRain.ts";
import { B0 } from "../city/instanceStorage.ts";
import { uie } from "./carProxies.ts";
import { installBvh } from "../bvh.ts";
export const HU = "trapnest-neon:paint";
export function WU() {
  try {
    return JSON.parse(localStorage.getItem(HU) ?? "{}") ?? {};
  } catch {
    return {};
  }
}
export function $U(i) {
  var t;
  if (!((t = i == null ? undefined : i.paints) != null && t.length)) return null;
  const e = WU()[i.id];
  return i.paints.find(s => s.name === e) ?? i.paints[0];
}
export function die(i, e) {
  try {
    const t = WU();
    t[i.id] = e.name;
    localStorage.setItem(HU, JSON.stringify(t));
  } catch {}
}
export const vehicleSpawn = {
  position: [-128, -5.47, 33],
  rotationY: Math.PI / 2 + .6
};
export const Yy = -.5;
export const HN = 2.2;
export function getVehicleBounds(i, e = i) {
  i.updateWorldMatrix(true, true);
  const t = new Box3(),
    s = new Box3(),
    n = new Matrix4(),
    r = new Matrix4().copy(i.matrixWorld).invert();
  if (e.traverse(u => {
    if (!u.isMesh || !u.geometry) return;
    const d = u.geometry;
    d.boundingBox || d.computeBoundingBox();
    s.copy(d.boundingBox);
    n.multiplyMatrices(r, u.matrixWorld);
    s.applyMatrix4(n);
    t.union(s);
  }), t.isEmpty()) {
    const u = new Box3().setFromObject(i),
      d = u.getSize(new Vector3()),
      h = u.getCenter(new Vector3());
    d.x += Yy * 1.5;
    d.z += Yy * 1.5;
    const f = u.min.y;
    d.y = Math.max(d.y + .2, HN);
    h.y = f + d.y * .5;
    const p = new Mesh(new BoxGeometry(d.x, d.y, d.z), new MeshBasicMaterial());
    p.name = "quadra-collider";
    p.visible = false;
    p.position.copy(h);
    p.geometry.computeBoundsTree();
    return p;
  }
  const o = t.getSize(new Vector3()),
    a = t.getCenter(new Vector3());
  o.x += Yy * 2;
  o.z += Yy * 2;
  const l = t.min.y;
  o.y = Math.max(o.y + .2, HN);
  a.y = l + o.y * .5;
  const c = new Mesh(new BoxGeometry(o.x, o.y, o.z), new MeshBasicMaterial());
  c.name = "quadra-collider";
  c.visible = false;
  a.applyMatrix4(i.matrixWorld);
  c.position.copy(a);
  c.quaternion.copy(i.getWorldQuaternion(new Quaternion()));
  c.scale.copy(i.scale);
  c.updateMatrixWorld(true);
  c.geometry.computeBoundsTree();
  return c;
}
export async function loadVehicle(i, e, {
  holder: holder
} = {}) {
  const [{
      loadVehicleRig: s
    }, {
      applyNeonLook: n
    }] = await Promise.all([import("./loadVehicleRig.ts"), import("./applyNeonLook.ts")]),
    r = await s(i, e.config.modelPath),
    o = r.root;
  o.name = `car-model:${e.id}`;
  const a = performanceProfile.carSurfaceRain ? applyCarSurfaceRain(o) : null,
    l = e.look ? n(o, {
      root: holder ?? o,
      neon: e.look === "neon"
    }) : null,
    c = e.look === "neon" ? l : null,
    u = e.paints ? (l == null ? undefined : l.paint) ?? null : null,
    d = u && $U(e);
  d && u.set(d.hex);
  d != null && d.neon && (c == null || c.setStyle({
    name: d.name,
    ...d.neon
  }));
  o.traverse(f => f.layers.enable(B0));
  o.updateMatrixWorld(true);
  const h = uie(o, {
    anchor: r.body ?? o
  });
  return {
    def: e,
    model: o,
    rigNode: r.rigNode,
    body: r.body,
    wheels: r.wheels,
    rig: r.rig,
    surfaceRain: a,
    proxy: h,
    neon: c,
    paint: u,
    lights: (l == null ? undefined : l.lights) ?? null
  };
}
export async function loadPlayerCar(i, e) {
  const t = new Group();
  t.name = "player-car";
  t.position.set(...vehicleSpawn.position);
  t.rotation.y = vehicleSpawn.rotationY;
  t.updateMatrixWorld(true);
  const s = await loadVehicle(i, e, {
    holder: t
  });
  t.add(s.model);
  t.updateMatrixWorld(true);
  installBvh();
  const n = getVehicleBounds(t, s.model);
  function r(l, c) {
    const u = getVehicleBounds(t, c);
    l.geometry.dispose();
    l.geometry = u.geometry;
    l.userData.localOffset = u.position.clone().sub(t.position).applyQuaternion(t.quaternion.clone().invert());
  }
  n.userData.localOffset = n.position.clone().sub(t.position).applyQuaternion(t.quaternion.clone().invert());
  function o() {
    t.updateMatrixWorld(true);
    n.position.copy(n.userData.localOffset).applyQuaternion(t.quaternion).add(t.position);
    n.quaternion.copy(t.quaternion);
    n.updateMatrixWorld(true);
  }
  const a = {
    root: t,
    model: s.model,
    rigNode: s.rigNode,
    body: s.body,
    wheels: s.wheels,
    rig: s.rig
  };
  return {
    car: t,
    rig: a,
    prepared: s,
    collider: n,
    surfaceRain: s.surfaceRain,
    syncWalkCollider: o,
    fitWalkCollider: l => {
      r(n, l);
      o();
    },
    proxy: s.proxy
  };
}
