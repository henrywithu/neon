// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, Quaternion } from "three/webgpu";
export function createVehicleRigSync({
  vehicle: vehicle,
  physics: physics,
  rig: rig
}) {
  const {
    root: s,
    wheels: n
  } = rig;
  s.matrixAutoUpdate = true;
  const r = vehicle.wheels.length,
    o = () => ({
      position: new Vector3(),
      quaternion: new Quaternion(),
      suspension: new Float32Array(r),
      spin: new Float64Array(r),
      steer: new Float32Array(r)
    });
  let a = o(),
    l = o(),
    c = false;
  function u(p) {
    const m = vehicle.body.translation(),
      A = vehicle.body.rotation();
    p.position.set(m.x, m.y, m.z);
    p.quaternion.set(A.x, A.y, A.z, A.w);
    vehicle.wheels.forEach((g, b) => {
      p.suspension[b] = g.suspensionLength;
      p.spin[b] = g.spin;
      p.steer[b] = g.steer;
    });
  }
  const d = {
    preStep() {},
    postStep() {
      const p = a;
      a = l;
      l = p;
      u(l);
      c || (u(a), c = true);
    }
  };
  physics.addStepListener(d);
  function h() {
    u(a);
    u(l);
    c = true;
  }
  function f(p) {
    c || h();
    s.position.lerpVectors(a.position, l.position, p);
    s.quaternion.slerpQuaternions(a.quaternion, l.quaternion, p);
    vehicle.wheels.forEach((m, A) => {
      const g = n[m.id];
      if (!g) return;
      const b = a.suspension[A] + (l.suspension[A] - a.suspension[A]) * p;
      g.position.set(m.hub[0], m.hardpoint[1] - b, m.hub[2]);
      g.rotation.x = a.spin[A] + (l.spin[A] - a.spin[A]) * p;
      g.rotation.y = a.steer[A] + (l.steer[A] - a.steer[A]) * p;
    });
  }
  return {
    root: s,
    update: f,
    resetInterpolation: h,
    dispose() {
      physics.removeStepListener(d);
    }
  };
}
export const ja = {
  throttle: ["KeyW", "ArrowUp"],
  brake: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  handbrake: ["Space"],
  lookBack: ["KeyB"],
  nitro: ["ShiftLeft", "ShiftRight"],
  horn: ["KeyK"]
};
export const YL = {
  KeyE: "shiftUp",
  KeyQ: "shiftDown",
  KeyG: "toggleGearbox",
  KeyR: "reset",
  KeyC: "camera",
  KeyF: "exitVehicle",
  KeyL: "lights",
  KeyT: "toggleAssists",
  KeyV: "watchFriend"
};
export const zi = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13
};
