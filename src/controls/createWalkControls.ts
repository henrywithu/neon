// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Euler, Vector2, Vector3, Raycaster, MathUtils } from "three/webgpu";
import { isTouchDevice } from "../platform/deviceLayout.ts";
export const Nhe = {
  moveSpeed: 3,
  sprintMultiplier: 1.8,
  mouseSensitivity: .002,
  eyeHeight: 1.55,
  crouchMultiplier: .55,
  acceleration: 10,
  deceleration: 14,
  sprintRampUp: 1.6,
  sprintRampDown: 2.2,
  walkFovBoost: 3,
  sprintFovBoost: 8,
  walkFovBlendSpeed: 2,
  sprintFovBlendSpeed: 2.5,
  playerRadius: .55,
  maxStepUp: .4,
  maxStepDown: 1.75,
  groundProbeHeight: 200,
  groundProbeDistance: 400,
  wallProbeDistance: .08
};
export const Bf = .01;
export const Lhe = .5;
export const db = .12;
export const qL = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right"
};
export function khe(i) {
  if (!(i instanceof HTMLElement)) return false;
  const e = i.tagName;
  return e === "INPUT" || e === "TEXTAREA" || e === "SELECT" || i.isContentEditable;
}
export function OS(i, e) {
  return 1 - Math.exp(-i * e);
}
export function createWalkControls({
  camera: camera,
  domElement: domElement,
  model: model,
  colliders = null,
  ground: ground,
  baseFov = 85,
  settings = {},
  onLookChange: onLookChange
} = {}) {
  const l = {
      ...Nhe,
      ...settings
    },
    c = (colliders == null ? undefined : colliders.length) > 0 ? colliders : model ? [model] : [],
    u = [];
  model && u.push(model);
  ground && u.push(ground);
  const d = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  };
  let h = l.eyeHeight,
    f = false;
  const p = new Euler(0, 0, 0, "YXZ"),
    m = new Vector2(),
    A = new Vector3(),
    g = new Vector3(),
    b = new Vector3(),
    x = new Vector3(),
    y = new Vector3(),
    _ = new Vector3(),
    w = new Vector3(),
    S = new Vector3(),
    T = new Vector3(),
    v = new Vector3(),
    E = new Raycaster(),
    C = [0, -.85, .85];
  let M = false,
    B = false,
    R = false,
    I = false,
    k = baseFov,
    L = l.moveSpeed;
  const F = new Vector2(),
    O = new Map(),
    H = new Set();
  function W() {
    if (!M) return false;
    if (isTouchDevice()) {
      const q = F.lengthSq() > db * db;
      return I || q || R;
    }
    return B;
  }
  function P() {
    for (const q of H) q({
      active: M,
      pointerLocked: B,
      moving: R,
      hasTouchLooked: I
    });
  }
  function z() {
    p.setFromQuaternion(camera.quaternion, "YXZ");
  }
  function Y() {
    camera.quaternion.setFromEuler(p);
  }
  function G() {
    camera.fov = k;
    camera.updateProjectionMatrix();
  }
  function X(q) {
    k = q;
    M || G();
  }
  function ae(q) {
    if (!W()) return;
    const xe = b.length() > Lhe,
      me = l.moveSpeed,
      ie = l.moveSpeed * l.sprintMultiplier,
      Ne = Math.max(ie - me, 1e-6),
      ze = MathUtils.clamp((L - me) / Ne, 0, 1);
    let tt = k,
      dt = l.walkFovBlendSpeed;
    xe && (tt = k + MathUtils.lerp(l.walkFovBoost, l.sprintFovBoost, ze), dt = MathUtils.lerp(l.walkFovBlendSpeed, l.sprintFovBlendSpeed, ze));
    const Lt = OS(q, dt),
      mt = camera.fov + (tt - camera.fov) * Lt;
    Math.abs(mt - camera.fov) > .001 && (camera.fov = mt, camera.updateProjectionMatrix());
  }
  function ne(q, oe, xe) {
    return u.length === 0 ? [] : (_.set(q, xe + l.groundProbeHeight, oe), w.set(0, -1, 0), E.set(_, w), E.far = l.groundProbeDistance, E.firstHitOnly = false, E.intersectObjects(u, true));
  }
  function se(q, oe, {
    allowLongDrop = false
  } = {}) {
    if (q.length === 0) return oe;
    const me = l.maxStepUp,
      ie = allowLongDrop ? l.groundProbeDistance : l.maxStepDown;
    let Ne = null,
      ze = 1 / 0;
    for (const tt of q) {
      const dt = tt.point.y;
      if (dt > oe + me || dt < oe - ie) continue;
      const Lt = Math.abs(dt - oe);
      Lt < ze && (ze = Lt, Ne = dt);
    }
    if (Ne !== null) return Ne;
    if (allowLongDrop) {
      let tt = null;
      for (const dt of q) {
        const Lt = dt.point.y;
        Lt > oe + me || (tt === null || Lt > tt) && (tt = Lt);
      }
      if (tt !== null) return tt;
    }
    return oe;
  }
  function re(q, oe, xe, {
    allowLongDrop = false
  } = {}) {
    const ie = xe - l.eyeHeight,
      Ne = ne(q, oe, xe);
    return se(Ne, ie, {
      allowLongDrop: allowLongDrop
    });
  }
  function le({
    allowLongDrop = false
  } = {}) {
    const oe = re(camera.position.x, camera.position.z, camera.position.y, {
      allowLongDrop: allowLongDrop
    });
    camera.position.y = oe + l.eyeHeight;
  }
  function we(q, oe, xe) {
    const me = l.playerRadius,
      ie = xe + me,
      Ne = ie + l.wallProbeDistance,
      ze = q.y - l.eyeHeight * .35;
    S.set(-oe.z, 0, oe.x);
    S.lengthSq() < 1e-8 ? S.set(1, 0, 0) : S.normalize();
    E.firstHitOnly = true;
    for (let tt = 0; tt < C.length; tt++) {
      _.copy(q);
      _.y = ze;
      _.addScaledVector(S, C[tt] * me);
      E.set(_, oe);
      E.far = Ne;
      const dt = E.intersectObjects(c, true);
      if (dt.length > 0 && dt[0].distance < ie) return true;
    }
    return false;
  }
  function Se(q, oe) {
    if (c.length === 0) return true;
    w.subVectors(oe, q);
    const xe = w.length();
    if (xe < 1e-5) return true;
    if (w.multiplyScalar(1 / xe), we(q, w, xe)) return false;
    const me = q.y - l.eyeHeight;
    return !(re(oe.x, oe.z, q.y) > me + l.maxStepUp);
  }
  function ye(q) {
    if (!(b.lengthSq() <= Bf * Bf)) {
      if (T.copy(camera.position), T.addScaledVector(b, q), Se(camera.position, T)) {
        camera.position.x = T.x;
        camera.position.z = T.z;
        return;
      }
      v.copy(camera.position);
      Math.abs(b.x) > Bf && (T.copy(camera.position), T.x += b.x * q, Se(camera.position, T) ? (camera.position.x = T.x, v.x = camera.position.x) : b.x = 0);
      Math.abs(b.z) > Bf && (T.copy(v), T.z += b.z * q, Se(v, T) ? camera.position.z = T.z : b.z = 0);
    }
  }
  function U(q) {
    return q.key === "Shift" || q.code === "ShiftLeft" || q.code === "ShiftRight";
  }
  function J(q) {
    typeof q.shiftKey == "boolean" && (d.sprint = q.shiftKey);
  }
  function Q() {
    const q = f ? h * l.crouchMultiplier : h,
      oe = q - l.eyeHeight;
    l.eyeHeight = q;
    M && Math.abs(oe) > 1e-6 && (camera.position.y += oe);
  }
  function j(q) {
    const oe = !!q;
    f !== oe && (f = oe, Q());
  }
  function de(q) {
    if (!M || khe(q.target)) return;
    if (J(q), U(q)) {
      d.sprint = true;
      return;
    }
    if (q.code === "KeyC" && !q.repeat) {
      j(!f);
      q.preventDefault();
      return;
    }
    const oe = qL[q.code];
    oe && (d[oe] = true, q.preventDefault());
  }
  function K(q) {
    if (J(q), U(q)) {
      d.sprint = false;
      return;
    }
    const oe = qL[q.code];
    oe && (d[oe] = false);
  }
  function V(q, oe) {
    M && (p.y -= q * l.mouseSensitivity, p.x -= oe * l.mouseSensitivity, p.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, p.x)), Y(), onLookChange == null || onLookChange());
  }
  function te(q) {
    !M || !B || isTouchDevice() || (J(q), V(q.movementX, q.movementY));
  }
  function fe(q) {
    const oe = q.target;
    return oe instanceof Element ? !!oe.closest("[data-ui-block-look]") : false;
  }
  function Ce(q) {
    var oe;
    !M || !isTouchDevice() || q.pointerType === "mouse" || q.target !== domElement || fe(q) || (O.set(q.pointerId, {
      x: q.clientX,
      y: q.clientY
    }), (oe = domElement.setPointerCapture) == null || oe.call(domElement, q.pointerId));
  }
  function Ue(q) {
    if (!M || !isTouchDevice()) return;
    const oe = O.get(q.pointerId);
    if (!oe) return;
    const xe = q.clientX - oe.x,
      me = q.clientY - oe.y;
    oe.x = q.clientX;
    oe.y = q.clientY;
    !(Math.abs(xe) < .001 && Math.abs(me) < .001) && (V(xe, me), I || (I = true, P()));
  }
  function Ae(q) {
    var oe, xe;
    O.delete(q.pointerId);
    (oe = domElement.hasPointerCapture) != null && oe.call(domElement, q.pointerId) && ((xe = domElement.releasePointerCapture) == null || xe.call(domElement, q.pointerId));
  }
  function Be(q, oe) {
    F.set(q, oe);
  }
  function He() {
    if (m.set(0, 0), F.lengthSq() > db * db) {
      m.copy(F);
      m.lengthSq() > 1 && m.normalize();
      return;
    }
    d.forward && (m.y -= 1);
    d.backward && (m.y += 1);
    d.left && (m.x -= 1);
    d.right && (m.x += 1);
    m.lengthSq() > 0 && m.normalize();
  }
  function at() {
    B = document.pointerLockElement === domElement;
    P();
  }
  function Re(q) {
    var oe;
    !M || B || q.button !== 0 || isTouchDevice() || q.target === domElement && ((oe = domElement.requestPointerLock) == null || oe.call(domElement));
  }
  function Fe() {
    window.addEventListener("keydown", de);
    window.addEventListener("keyup", K);
    window.addEventListener("mousemove", te);
    document.addEventListener("pointerlockchange", at);
    domElement.addEventListener("click", Re);
    domElement.addEventListener("pointerdown", Ce);
    domElement.addEventListener("pointermove", Ue);
    domElement.addEventListener("pointerup", Ae);
    domElement.addEventListener("pointercancel", Ae);
  }
  function Je() {
    window.removeEventListener("keydown", de);
    window.removeEventListener("keyup", K);
    window.removeEventListener("mousemove", te);
    document.removeEventListener("pointerlockchange", at);
    domElement.removeEventListener("click", Re);
    domElement.removeEventListener("pointerdown", Ce);
    domElement.removeEventListener("pointermove", Ue);
    domElement.removeEventListener("pointerup", Ae);
    domElement.removeEventListener("pointercancel", Ae);
  }
  Fe();
  function je(q) {
    var oe;
    if (M !== q) {
      if (M = q, M) z(), b.set(0, 0, 0), L = l.moveSpeed, camera.fov = k, camera.updateProjectionMatrix(), le({
        allowLongDrop: true
      });else {
        document.pointerLockElement === domElement && ((oe = document.exitPointerLock) == null || oe.call(document));
        for (const xe of Object.keys(d)) d[xe] = false;
        f = false;
        l.eyeHeight = h;
        F.set(0, 0);
        O.clear();
        I = false;
        b.set(0, 0, 0);
        L = l.moveSpeed;
        R = false;
        G();
      }
      P();
    }
  }
  function Te(q) {
    if (!M || q <= 0) return R = false, false;
    if (!W()) return F.set(0, 0), b.set(0, 0, 0), L = l.moveSpeed, G(), R && (R = false, P()), false;
    He();
    const oe = m.lengthSq() > 0;
    oe && (m.normalize(), camera.getWorldDirection(x), x.y = 0, x.lengthSq() < 1e-6 ? x.set(0, 0, -1) : x.normalize(), y.crossVectors(x, camera.up).normalize(), A.set(0, 0, 0), A.addScaledVector(x, -m.y), A.addScaledVector(y, m.x), A.lengthSq() > 0 && A.normalize());
    const xe = oe && d.sprint ? l.moveSpeed * l.sprintMultiplier : l.moveSpeed,
      me = xe > L ? l.sprintRampUp : l.sprintRampDown;
    L += (xe - L) * OS(q, me);
    oe ? g.copy(A).multiplyScalar(L) : g.set(0, 0, 0);
    const ie = g.lengthSq() > 0 ? l.acceleration : l.deceleration,
      Ne = OS(q, ie);
    b.lerp(g, Ne);
    ye(q);
    le();
    ae(q);
    const ze = b.lengthSq() > Bf * Bf;
    ze !== R && (R = ze, P());
    return ze;
  }
  function ue() {
    je(false);
    Je();
    H.clear();
  }
  function $(q) {
    h = q;
    Q();
  }
  return {
    settings: l,
    setEyeHeight: $,
    setCrouched: j,
    isCrouched: () => f,
    setBaseFov: X,
    setActive: je,
    isActive: () => M,
    isPointerLocked: () => B,
    hasTouchLooked: () => I,
    isMoving: () => R,
    getHorizontalSpeed: () => b.length(),
    setMoveAxes: Be,
    applyLookDelta: V,
    update: Te,
    syncEulerFromCamera: z,
    snapCameraToGround: () => le({
      allowLongDrop: true
    }),
    subscribe: q => (H.add(q), q({
      active: M,
      pointerLocked: B,
      moving: R,
      hasTouchLooked: I
    }), () => H.delete(q)),
    dispose: ue
  };
}
export const Dhe = 12;
export function Phe(i) {
  if (!(i instanceof HTMLElement)) return false;
  const e = i.tagName;
  return e === "INPUT" || e === "TEXTAREA" || e === "SELECT" || i.isContentEditable;
}
