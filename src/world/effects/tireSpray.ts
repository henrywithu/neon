// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, Quaternion, SRGBColorSpace, InstancedInterleavedBuffer, Color, MeshBasicNodeMaterial, PlaneGeometry, Mesh } from "three/webgpu";
import { rz } from "./smoke.ts";
import { iz } from "../weather/createCollisionHeight.ts";
import { instancedDynamicBufferAttribute, uniform, cos, sin, positionGeometry, vec2, cameraViewMatrix, vec4, texture, smoothstep, cameraProjectionMatrix, mix, vec3, uv } from "three/tsl";
export const uk = 256;
export const If = 8;
export const wfe = 120;
export const xb = new Vector3();
export const dk = new Vector3();
export const $S = new Vector3();
export const hk = new Vector3();
export const KS = new Quaternion();
export async function createTireSpray({
  scene: scene,
  car: car,
  rearWheels: rearWheels,
  layer = 0
}) {
  const n = await rz(iz);
  n.colorSpace = SRGBColorSpace;
  const r = new Float32Array(uk * If),
    o = new InstancedInterleavedBuffer(r, If),
    a = instancedDynamicBufferAttribute(o, "vec4", If, 0),
    l = instancedDynamicBufferAttribute(o, "vec4", If, 4),
    c = a.w,
    u = l.x,
    d = l.y,
    h = l.z,
    f = l.w,
    p = uniform(.08),
    m = uniform(new Color(.46, .5, .58)),
    A = uniform(new Color(.85, .1, .06)),
    g = d.mul(6.283).add(c.mul(d.sub(.5).mul(2.4))),
    b = cos(g),
    x = sin(g),
    y = positionGeometry.xy,
    _ = vec2(y.x.mul(b).sub(y.y.mul(x)), y.x.mul(x).add(y.y.mul(b))).mul(u),
    w = cameraViewMatrix.mul(vec4(a.xyz, 1)),
    S = texture(n, uv()),
    T = S.a.mul(S.r.max(S.g).max(S.b)),
    v = smoothstep(0, .12, c).mul(c.oneMinus().pow(1.6)),
    E = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false
    });
  E.name = "tire-spray";
  E.vertexNode = cameraProjectionMatrix.mul(vec4(w.xy.add(_), w.z, 1));
  E.colorNode = vec4(mix(vec3(m), vec3(A), h), T.mul(v).mul(f).mul(p));
  E.toneMapped = true;
  const C = new PlaneGeometry(1, 1),
    M = new Mesh(C, E);
  M.name = "tire-spray";
  M.frustumCulled = false;
  M.renderOrder = 5;
  M.count = 1;
  M.visible = false;
  M.layers.set(layer);
  scene.add(M);
  const B = [],
    R = new Vector3(),
    I = rearWheels.map(() => 0);
  let k = 0;
  function L(F, O) {
    if (B.length >= uk) return;
    car.getWorldQuaternion(KS);
    dk.set(0, 0, -1).applyQuaternion(KS);
    $S.set(1, 0, 0).applyQuaternion(KS);
    car.localToWorld(xb.set(F.hub[0], F.hub[1] - F.radius * .7, F.hub[2] - F.radius * .9));
    const H = F.contact ? F.contactPoint.y : xb.y - F.radius * .3;
    xb.addScaledVector($S, (Math.random() - .5) * .24);
    const W = R.clone().multiplyScalar(.55 + Math.random() * .2).addScaledVector(dk, 1 + Math.random() * 2.5).addScaledVector($S, (Math.random() - .5) * 1.6).add(new Vector3(0, (.6 + Math.random() * 1.8) * (.5 + O * .5), 0));
    B.push({
      pos: xb.clone(),
      vel: W,
      age: 0,
      life: .55 + Math.random() * .45,
      size0: .14 + Math.random() * .1,
      size1: (.6 + Math.random() * .6) * (.6 + O * .4),
      seed: Math.random(),
      alpha: .6 + Math.random() * .4,
      floor: H
    });
  }
  return {
    mesh: M,
    setRearWheels(F) {
      rearWheels = F;
      I.length = 0;
      for (let O = 0; O < F.length; O++) I.push(0);
    },
    update({
      speed = 0,
      grounded = true,
      wetness = 1,
      velocity = null
    } = {}, P = 1 / 60) {
      if (P <= 0) return;
      velocity && R.set(velocity.x, velocity.y, velocity.z);
      const z = grounded ? Math.min(1, Math.max(0, (Math.abs(speed) - 5) / 22)) * wetness : 0;
      k += (z - k) * Math.min(1, P * 5);
      k > .02 && rearWheels.forEach((X, ae) => {
        if (X.contact) for (I[ae] += P * wfe * k; I[ae] >= 1;) I[ae] -= 1, L(X, k);
      });
      car.localToWorld(hk.set(0, .6, -2.6));
      const Y = Math.exp(-2.8 * P);
      for (let X = B.length - 1; X >= 0; X--) {
        const ae = B[X];
        if (ae.age += P / ae.life, ae.age >= 1) {
          B[X] = B[B.length - 1];
          B.pop();
          continue;
        }
        ae.vel.multiplyScalar(Y);
        ae.vel.y -= 1.2 * P;
        ae.pos.addScaledVector(ae.vel, P);
      }
      const G = B.length;
      for (let X = 0; X < G; X++) {
        const ae = B[X],
          ne = X * If,
          se = 1 - (1 - ae.age) * (1 - ae.age),
          re = ae.size0 + (ae.size1 - ae.size0) * se,
          le = Math.max(ae.pos.y, ae.floor + re * .42);
        r[ne] = ae.pos.x;
        r[ne + 1] = le;
        r[ne + 2] = ae.pos.z;
        r[ne + 3] = ae.age;
        r[ne + 4] = re;
        r[ne + 5] = ae.seed;
        r[ne + 6] = Math.max(0, 1 - ae.pos.distanceTo(hk) / 3.2) * .3;
        r[ne + 7] = ae.alpha;
      }
      M.count = Math.max(1, G);
      M.visible = G > 0;
      G > 0 && (o.clearUpdateRanges(), o.addUpdateRange(0, G * If), o.needsUpdate = true);
    },
    stats: () => ({
      puffs: B.length,
      level: k
    }),
    uniforms: {
      opacity: p,
      mist: m,
      tail: A
    },
    dispose() {
      M.removeFromParent();
      C.dispose();
      E.dispose();
      n.dispose();
    }
  };
}
