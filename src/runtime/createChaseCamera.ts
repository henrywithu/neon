// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { getExperiencePreferences, reducedMotion } from "../platform/experiencePreferences.ts";
import { MathUtils, Vector3, Quaternion } from "three/webgpu";
import { Vc } from "../controls/createDriveInput.ts";
export function Ad(i, e) {
  if (i.fixed) {
    const t = i.id === "hood" ? e.hood : null;
    return {
      distance: (t == null ? undefined : t.distance) ?? i.distance,
      height: (t == null ? undefined : t.height) ?? i.height,
      lookHeight: (t == null ? undefined : t.lookHeight) ?? i.lookHeight
    };
  }
  return {
    distance: i.distance + e.lift * 1.4,
    height: i.height + e.lift * .9,
    lookHeight: i.lookHeight + e.lift * .5
  };
}
export function rr(i, e, t, s) {
  return MathUtils.lerp(i, e, 1 - Math.exp(-t * s));
}
export function XL(i) {
  for (; i > Math.PI;) i -= Math.PI * 2;
  for (; i < -Math.PI;) i += Math.PI * 2;
  return i;
}
export function createChaseCamera({
  camera: camera,
  domElement: domElement,
  target: target,
  getTelemetry: getTelemetry,
  physics = null,
  excludeBody = null,
  baseFov = 62,
  initialMode = "chase"
}) {
  let l = Math.max(0, Vc.findIndex(we => we.id === initialMode)),
    c = 0,
    u = 0,
    d = 0,
    h = -1 / 0,
    f = 0,
    p = 0,
    m = {
      lift: 0,
      hood: null
    },
    A = Ad(Vc[l], m).distance,
    g = Ad(Vc[l], m).height,
    b = baseFov,
    x = 0,
    y = false;
  const _ = new Vector3(),
    w = new Quaternion(),
    S = new Quaternion(),
    T = new Vector3(),
    v = new Vector3(),
    E = new Vector3(),
    C = new Vector3(),
    M = new Vector3(),
    B = new Vector3(),
    R = new Vector3(),
    I = new Vector3(),
    k = new Vector3(),
    L = new Vector3(),
    F = new Vector3(0, 1, 0);
  let O = false,
    H = 0,
    W = 0;
  function P(we) {
    we.button !== 0 && we.pointerType === "mouse" || (O = true, H = we.clientX, W = we.clientY);
  }
  function z(we) {
    if (!O) return;
    const Se = we.clientX - H,
      ye = we.clientY - W;
    H = we.clientX;
    W = we.clientY;
    u -= Se * .006;
    d = MathUtils.clamp(d + ye * .004, -.35, .9);
    h = f;
  }
  function Y() {
    O = false;
  }
  domElement.addEventListener("pointerdown", P);
  window.addEventListener("pointermove", z);
  window.addEventListener("pointerup", Y);
  const G = physics ? new physics.RAPIER.Ray({
    x: 0,
    y: 0,
    z: 0
  }, {
    x: 0,
    y: 0,
    z: 1
  }) : null;
  function X() {
    l = (l + 1) % Vc.length;
    const we = Vc[l];
    ({
      distance: A,
      height: g
    } = Ad(we, m));
    return we.id;
  }
  function ae(we) {
    p = Math.min(1.5, p + we);
  }
  function ne() {
    y = false;
  }
  function se(we, Se) {
    if (!physics || !G) return 1;
    L.subVectors(Se, we);
    const ye = L.length();
    if (ye < .01) return 1;
    L.divideScalar(ye);
    G.origin.x = we.x;
    G.origin.y = we.y;
    G.origin.z = we.z;
    G.dir.x = L.x;
    G.dir.y = L.y;
    G.dir.z = L.z;
    const U = physics.world.castRay(G, ye + .35, true, physics.RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC, undefined, undefined, excludeBody);
    return U ? Math.max(.12, (U.timeOfImpact - .35) / ye) : 1;
  }
  function re(we, Se = {}) {
    f += we;
    const ye = Vc[l],
      U = (getTelemetry == null ? undefined : getTelemetry()) ?? {},
      J = Math.abs(U.speed ?? 0),
      Q = MathUtils.clamp(J / 55, 0, 1),
      j = MathUtils.smoothstep(J, 20, 70);
    x = rr(x, U.nitro ?? 0, (U.nitro ?? 0) > x ? 6 : 2.5, we);
    target.updateMatrixWorld();
    target.getWorldPosition(_);
    target.getWorldQuaternion(w);
    T.set(0, 0, 1).applyQuaternion(w);
    const de = Math.atan2(T.x, T.z);
    y || (c = de, S.copy(w), E.copy(_), R.set(0, 0, 0), B.copy(_), I.subVectors(camera.position, _), k.set(0, 0, 0), u = 0, d = 0, y = true);
    v.subVectors(_, E).divideScalar(Math.max(we, 1e-4));
    E.copy(_);
    const K = Math.hypot(v.x, v.z);
    if ((Math.abs(Se.lookX ?? 0) > 0 || Math.abs(Se.lookY ?? 0) > 0) && (u -= (Se.lookX ?? 0) * 2.6 * we, d = MathUtils.clamp(d + (Se.lookY ?? 0) * 1.6 * we, -.35, .9), h = f), f - h > 1.4 && !O && (u = rr(u, 0, 3, we), d = rr(d, 0, 3, we)), ye.fixed) {
      S.slerp(w, 1 - Math.exp(-(26 - 12 * j) * we));
      const fe = Ad(ye, m);
      L.set(0, fe.height, -fe.distance).applyQuaternion(S).add(_);
      camera.position.copy(L);
      M.set(0, fe.lookHeight, 40).applyQuaternion(S).add(_);
      camera.up.copy(F);
      camera.lookAt(M);
      camera.rotateY(u);
      camera.rotateX(-d * .5);
    } else {
      let fe = de;
      if (K > 3) {
        let Te = U.slipAngleBody ?? XL(Math.atan2(v.x, v.z) - de);
        Math.abs(Te) > Math.PI * .6 && (Te = 0);
        fe = de + MathUtils.clamp(Te, -.9, .9) * .55 * (1 - .7 * j);
      }
      const Ce = Se.lookBack ? Math.PI : 0;
      fe += Ce;
      const Ue = Se.lookBack ? 30 : 4.5 + 2.5 * MathUtils.smoothstep(J, 5, 30) - 3.8 * j;
      c += XL(fe - c) * (1 - Math.exp(-Ue * we));
      const Ae = Ad(ye, m),
        Be = Ae.distance + Q * (getExperiencePreferences().cameraMotion && !reducedMotion() ? ye.breathe ?? .6 : 0),
        He = Ae.height + Q * .15;
      A = rr(A, Be, 3, we);
      g = rr(g, He, 3, we);
      const at = c + u,
        Re = d * A * .8;
      if (C.set(_.x - Math.sin(at) * A, _.y + g + Re, _.z - Math.cos(at) * A), ye.lag) {
        const Te = U.longitudinalG ?? 0,
          ue = MathUtils.clamp(-Te * .55, -.6, .8);
        L.set(-Math.sin(at), 0, -Math.cos(at)).multiplyScalar(ue);
        R.x = rr(R.x, L.x, 3.5, we);
        R.z = rr(R.z, L.z, 3.5, we);
        C.add(R);
      }
      const Je = L.copy(_).addScaledVector(F, 1.3).clone(),
        je = se(Je, C);
      je < 1 && C.lerpVectors(Je, C, je);
      I.x = rr(I.x, C.x - _.x, 18, we);
      I.z = rr(I.z, C.z - _.z, 18, we);
      camera.position.x = _.x + I.x;
      camera.position.z = _.z + I.z;
      camera.position.y = rr(camera.position.y, C.y, 10 - 5 * j, we);
      M.set(_.x + Math.sin(c) * (2.2 + Q * 3), _.y + Ad(ye, m).lookHeight, _.z + Math.cos(c) * (2.2 + Q * 3));
      k.x = rr(k.x, M.x - _.x, 14, we);
      k.z = rr(k.z, M.z - _.z, 14, we);
      B.x = _.x + k.x;
      B.z = _.z + k.z;
      Math.abs(B.y - M.y) > 10 && (B.y = M.y);
      B.y = rr(B.y, M.y, 8 - 4 * j, we);
      camera.up.copy(F);
      camera.lookAt(B);
    }
    p = rr(p, 0, 5, we);
    const comfort = !getExperiencePreferences().cameraMotion || reducedMotion();
    const V = comfort ? 0 : p * .06 + x * .0035;
    V > 1e-4 && (camera.rotateX((Math.sin(f * 37.1) + Math.sin(f * 23.7)) * V * .5), camera.rotateY((Math.sin(f * 31.3) + Math.sin(f * 17.9)) * V * .35), camera.rotateZ(Math.sin(f * 29.3) * V * .4));
    const te = comfort ? baseFov : baseFov + ye.fovBoost * Q * Q + x * 9;
    b = rr(b, te, 2.5, we);
    Math.abs(camera.fov - b) > .01 && (camera.fov = b, camera.updateProjectionMatrix());
  }
  function le(we) {
    baseFov = we;
  }
  return {
    update: re,
    cycleMode: X,
    addShake: ae,
    snap: ne,
    setBaseFov: le,
    setExcludeBody(we) {
      excludeBody = we;
    },
    setCarFrame({
      lift = 0,
      hood = null
    } = {}) {
      m = {
        lift: lift,
        hood: hood
      };
      ({
        distance: A,
        height: g
      } = Ad(Vc[l], m));
    },
    getMode: () => Vc[l].id,
    dispose() {
      domElement.removeEventListener("pointerdown", P);
      window.removeEventListener("pointermove", z);
      window.removeEventListener("pointerup", Y);
    }
  };
}
