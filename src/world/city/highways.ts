// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, BufferGeometry, Float32BufferAttribute, MeshStandardNodeMaterial, BoxGeometry, InstancedMesh, Matrix4, Quaternion, BufferAttribute, Group, Mesh } from "three/webgpu";
import { loadSurfaceTexture } from "../loaders/surfaceTextures.ts";
import { JU, ZU, ez } from "../weather/createCollisionRain.ts";
import { attribute, floor, step, vec2, texture, abs, fract, max, mix, vec3, select, mod, float, exp, smoothstep, time, hash, sin, normalMap, positionWorld } from "three/tsl";
import { gl } from "./instanceStorage.ts";
export const tz = 0;
export const Oc = 1;
export const jb = 2;
export const d3 = 3;
export const sz = 1.5;
export const nz = 1.05;
export const ip = 46;
export const h3 = 34;
export const gre = 3.6;
export const Are = .12;
export const Rg = [[.1, .85, 1], [1, .15, .7], [1, .55, .1], [.45, 1, .25]];
export const yre = 4;
export function bre(i) {
  const e = i / 2,
    t = e - .55,
    s = nz,
    n = -sz;
  return [[-t, 0, t, 0, tz], [t, 0, e - .35, .25, Oc], [e - .35, .25, e - .22, .88, Oc], [e - .22, .88, e - .2, s, d3], [e - .2, s, e, s, Oc], [e, s, e, -.35, Oc], [e, -.35, e - .8, n, jb], [e - .8, n, -e + .8, n, jb], [-e + .8, n, -e, -.35, jb], [-e, -.35, -e, s, Oc], [-e, s, -e + .2, s, Oc], [-e + .2, s, -e + .22, .88, d3], [-e + .22, .88, -e + .35, .25, Oc], [-e + .35, .25, -t, 0, Oc]];
}
export function xre(i, e) {
  const t = new Vector3(0, 1, 0),
    s = [];
  let n = 0;
  for (let r = 0; r < i.length; r++) {
    const [o, a, l] = i[r],
      c = new Vector3(o, e + a, l),
      u = i[Math.max(0, r - 1)],
      d = i[Math.min(i.length - 1, r + 1)],
      h = new Vector3(d[0] - u[0], d[1] - u[1], d[2] - u[2]).normalize(),
      f = new Vector3().crossVectors(h, t).normalize(),
      p = new Vector3().crossVectors(f, h).normalize();
    r > 0 && (n += c.distanceTo(s[r - 1].p));
    s.push({
      p: c,
      t: h,
      right: f,
      up: p,
      s: n,
      h: a
    });
  }
  return s;
}
export function _re(i, e) {
  const t = [],
    s = [],
    n = [],
    r = [],
    o = [],
    a = [],
    l = [],
    c = [],
    u = [],
    d = [];
  i.forEach((f, p) => {
    const m = !!f.bridge,
      A = m ? yre : p % Rg.length;
    let g = f.points;
    if (!m) {
      let M = 0,
        B = g.length - 1;
      for (; M < B && g[M][1] < .04;) M++;
      for (; B > M && g[B][1] < .04;) B--;
      M = Math.max(0, M - 1);
      B = Math.min(g.length - 1, B + 1);
      g = g.slice(M, B + 1).map(([R, I, k]) => [R, Math.max(.03, I), k]);
    }
    if (g.length < 2) return;
    const b = xre(g, e),
      x = bre(f.width).filter(M => !m || M[4] !== tz),
      y = f.width / 2 - .55,
      _ = new Vector3();
    for (const [M, B, R, I, k] of x) {
      const L = R - M,
        F = I - B,
        O = Math.hypot(L, F) || 1,
        H = -F / O,
        W = L / O,
        P = t.length / 3;
      for (const z of b) for (const [Y, G] of [[M, B], [R, I]]) {
        _.copy(z.p).addScaledVector(z.right, Y).addScaledVector(z.up, G);
        t.push(_.x, _.y, _.z);
        const X = new Vector3().addScaledVector(z.right, H).addScaledVector(z.up, W).normalize();
        s.push(X.x, X.y, X.z);
        n.push(Y, G, z.s, y);
        r.push(k + A * 8);
      }
      for (let z = 0; z < b.length - 1; z++) {
        const Y = P + z * 2,
          G = Y + 1,
          X = Y + 3,
          ae = Y + 2;
        o.push(Y, G, X, Y, X, ae);
      }
    }
    const w = u.length / 3;
    if (x.filter(M => M[4] !== jb).forEach(([M, B, R, I], k) => {
      for (const F of b) for (const [O, H] of [[M, B], [R, I]]) _.copy(F.p).addScaledVector(F.right, O).addScaledVector(F.up, H), u.push(_.x, _.y, _.z);
      const L = w + k * b.length * 2;
      for (let F = 0; F < b.length - 1; F++) {
        const O = L + F * 2;
        d.push(O, O + 1, O + 3, O, O + 3, O + 2);
      }
    }), !m) for (let M = 0; M < b.length - 1; M++) {
      const B = b[M],
        R = b[M + 1];
      if (Math.max(B.h, R.h) >= gre || Math.min(B.h, R.h) < .1) continue;
      const I = e - .5,
        k = Math.min(B.p.y, R.p.y) - Are,
        L = R.p.x - B.p.x,
        F = R.p.z - B.p.z,
        O = Math.hypot(L, F);
      O < .01 || c.push([(B.p.x + R.p.x) / 2, (I + k) / 2, (B.p.z + R.p.z) / 2, f.width / 2, (k - I) / 2, O / 2 + .15, Math.atan2(L, F)]);
    }
    const T = b[b.length - 1].s;
    let v = m ? 14 : h3 * .5,
      E = m ? 1 / 0 : ip * .25,
      C = 1;
    for (const M of b) if (M.s >= v && (v += m ? 26 : h3, (m ? M.s < T - 12 : M.h > 4) && a.push({
      x: M.p.x,
      z: M.p.z,
      top: M.p.y - sz,
      yaw: Math.atan2(M.t.x, M.t.z),
      width: f.width
    })), M.s >= E) {
      if (E += ip, M.h > 1.5) {
        const B = C * (f.width / 2 - .1);
        l.push({
          x: M.p.x + M.right.x * B,
          y: M.p.y + nz,
          z: M.p.z + M.right.z * B,
          yaw: Math.atan2(-M.right.x * C, -M.right.z * C),
          seed: p
        });
      }
      C = -C;
    }
  });
  const h = new BufferGeometry();
  h.setAttribute("position", new Float32BufferAttribute(t, 3));
  h.setAttribute("normal", new Float32BufferAttribute(s, 3));
  h.setAttribute("hwSec", new Float32BufferAttribute(n, 4));
  h.setAttribute("hwPart", new Float32BufferAttribute(r, 1));
  h.setIndex(o);
  h.computeBoundingSphere();
  h.computeBoundingBox();
  return {
    geometry: h,
    pillars: a,
    lamps: l,
    ramps: c,
    collider: {
      vertices: new Float32Array(u),
      indices: new Uint32Array(d)
    }
  };
}
export function jT(i, e) {
  return loadSurfaceTexture(i, {
    srgb: e,
    anisotropy: 8
  });
}
export function wre() {
  const i = jT(JU, true),
    e = jT(ZU, false),
    t = jT(ez, false),
    s = attribute("hwSec", "vec4"),
    n = s.x,
    r = s.y,
    o = s.z,
    a = s.w,
    l = attribute("hwPart", "float"),
    c = floor(l.div(8)),
    u = l.sub(c.mul(8)),
    d = step(u, .5),
    h = step(2.5, u),
    f = step(1.5, u).mul(step(u, 2.5)),
    p = vec2(n, o).div(26.8),
    m = texture(i, p),
    A = texture(e, p).r,
    g = abs(n),
    b = step(abs(g.sub(a.sub(.45))), .09),
    x = step(fract(o.div(12)), .3),
    y = step(abs(g.sub(a.mul(.5))), .075).mul(x),
    _ = step(abs(g.sub(.2)), .07),
    w = max(max(b, y), 0),
    S = mix(vec3(.55, .55, .52), vec3(.62, .42, .06), _),
    T = max(w, _),
    v = floor(o.sub(ip * .25).div(ip).add(.5)),
    E = o.sub(v.mul(ip).add(ip * .25)),
    M = select(mod(v, 2).lessThan(.5), float(1), float(-1)).mul(a.sub(2.2)),
    B = n.sub(M),
    R = exp(E.mul(E).add(B.mul(B)).div(-2 * 7.5 * 7.5)),
    I = select(c.greaterThan(3.5), vec3(.95, .82, .62), select(c.greaterThan(2.5), vec3(...Rg[3]), select(c.greaterThan(1.5), vec3(...Rg[2]), select(c.greaterThan(.5), vec3(...Rg[1]), vec3(...Rg[0]))))),
    k = smoothstep(.85, 1, fract(o.div(90).sub(time.mul(.35)))).mul(1.6).add(.55),
    L = vec3(.05, .05, .055).mul(hash(floor(o.div(4)).add(c.mul(31))).mul(.25).add(.85)),
    F = sin(o.mul(3.1).add(sin(o.mul(.37)).mul(4))).mul(.5).add(.5).mul(.012),
    O = vec3(.028, .028, .032).add(F),
    H = L.mul(smoothstep(-.3, .9, r).mul(.35).add(.75)),
    W = mix(m.rgb, S, T),
    P = mix(mix(H, O, f), W, d),
    z = new MeshStandardNodeMaterial();
  z.name = "highway-deck";
  z.colorNode = mix(P, vec3(.02), h);
  z.roughnessNode = mix(mix(float(.78), float(.9), f), mix(A.mul(.5), float(.55), T), d);
  z.metalnessNode = float(0);
  z.normalNode = normalMap(texture(t, p), vec2(d.mul(.6)));
  z.emissiveNode = I.mul(h.mul(k).mul(1.4)).add(vec3(1, .62, .32).mul(R.mul(d).mul(.085)));
  return {
    material: z,
    textures: [i, e, t]
  };
}
export function Tre(i, e) {
  const t = i.length,
    s = new BoxGeometry(1, 1, 1);
  s.translate(0, .5, 0);
  const n = new MeshStandardNodeMaterial();
  n.name = "highway-pillars";
  const r = sin(positionWorld.x.add(positionWorld.z).mul(2.3)).mul(.5).add(.5);
  n.colorNode = vec3(.035, .035, .04).add(r.mul(.01));
  n.roughnessNode = mix(float(.7), float(.45), step(positionWorld.y, e + 1.2));
  const o = gl(new InstancedMesh(s, n, Math.max(1, t * 2)));
  o.name = "highway-pillars";
  const a = new Matrix4(),
    l = new Quaternion(),
    c = new Vector3(0, 1, 0),
    u = e - 6;
  i.forEach((d, h) => {
    l.setFromAxisAngle(c, d.yaw);
    a.compose(new Vector3(d.x, u, d.z), l, new Vector3(2.2, d.top - u, 1.7));
    o.setMatrixAt(h, a);
    a.compose(new Vector3(d.x, d.top - 1.1, d.z), l, new Vector3(d.width - 3.2, 1.1, 2.1));
    o.setMatrixAt(t + h, a);
  });
  o.count = t * 2;
  o.instanceMatrix.needsUpdate = true;
  o.computeBoundingSphere();
  o.castShadow = true;
  o.receiveShadow = true;
  return {
    mesh: o,
    material: n,
    geometry: s
  };
}
export function Sre(i) {
  const e = [],
    t = new BoxGeometry(.18, 7.6, .18);
  t.translate(0, 3.8, 0);
  const s = new BoxGeometry(.12, .12, 2.6);
  s.translate(0, 7.55, 1.25);
  const n = new BoxGeometry(.45, .14, .9);
  n.translate(0, 7.45, 2.4);
  for (const [f, p] of [[t, 0], [s, 0], [n, 1]]) f.setAttribute("lampGlow", new Float32BufferAttribute(new Array(f.attributes.position.count).fill(p), 1)), f.deleteAttribute("uv"), e.push(f);
  const r = vre(e),
    o = attribute("lampGlow", "float"),
    a = new MeshStandardNodeMaterial();
  a.name = "highway-lamps";
  a.colorNode = mix(vec3(.03), vec3(.9, .8, .6), o);
  a.roughnessNode = float(.5);
  a.metalnessNode = mix(float(.6), float(0), o);
  a.emissiveNode = vec3(1, .72, .42).mul(o.mul(2.4));
  const l = gl(new InstancedMesh(r, a, Math.max(1, i.length)));
  l.name = "highway-lamps";
  const c = new Matrix4(),
    u = new Quaternion(),
    d = new Vector3(0, 1, 0),
    h = new Vector3(1, 1, 1);
  i.forEach((f, p) => {
    u.setFromAxisAngle(d, f.yaw);
    l.setMatrixAt(p, c.compose(new Vector3(f.x, f.y, f.z), u, h));
  });
  l.count = i.length;
  l.instanceMatrix.needsUpdate = true;
  l.computeBoundingSphere();
  l.castShadow = false;
  return {
    mesh: l,
    geometry: r,
    material: a
  };
}
export function vre(i) {
  let e = 0,
    t = 0;
  for (const u of i) e += u.attributes.position.count, t += u.index.count;
  const s = new BufferGeometry(),
    n = ["position", "normal", "lampGlow"],
    r = {
      position: 3,
      normal: 3,
      lampGlow: 1
    },
    o = Object.fromEntries(n.map(u => [u, new Float32Array(e * r[u])])),
    a = new Uint32Array(t);
  let l = 0,
    c = 0;
  for (const u of i) {
    for (const d of n) o[d].set(u.attributes[d].array, l * r[d]);
    for (let d = 0; d < u.index.count; d++) a[c + d] = u.index.array[d] + l;
    l += u.attributes.position.count;
    c += u.index.count;
  }
  for (const u of n) s.setAttribute(u, new BufferAttribute(o[u], r[u]));
  s.setIndex(new BufferAttribute(a, 1));
  s.computeBoundingSphere();
  return s;
}
export function createHighways({
  highways = [],
  bridges = [],
  groundY: groundY
}) {
  const s = new Group();
  s.name = "city:highways";
  const n = [...highways, ...bridges.map(d => ({
    width: d.width + 1.1,
    bridge: true,
    points: d.points.map(([h, f]) => [h, 0, f])
  }))];
  if (!n.length) return {
    root: s,
    deckMesh: null,
    trimesh: null,
    pillarColliders: () => [],
    rampColliders: () => [],
    dispose() {}
  };
  const r = _re(n, groundY),
    {
      material: o,
      textures: a
    } = wre(),
    l = new Mesh(r.geometry, o);
  l.name = "highway-deck";
  l.castShadow = true;
  l.receiveShadow = true;
  s.add(l);
  const c = Tre(r.pillars, groundY);
  s.add(c.mesh);
  const u = Sre(r.lamps);
  s.add(u.mesh);
  s.traverse(d => {
    d.matrixAutoUpdate = false;
    d.updateMatrix();
  });
  s.updateMatrixWorld(true);
  console.info("[highways]", {
    decks: highways.length,
    bridges: bridges.length,
    tris: r.geometry.index.count / 3,
    pillars: r.pillars.length,
    rampBoxes: r.ramps.length,
    lamps: r.lamps.length
  });
  return {
    root: s,
    deckMesh: l,
    trimesh: r.collider,
    pillarColliders() {
      const d = groundY - 6;
      return r.pillars.map(h => [h.x, (d + h.top) / 2, h.z, 1.1, (h.top - d) / 2, .85, h.yaw]);
    },
    rampColliders() {
      return r.ramps;
    },
    dispose() {
      s.removeFromParent();
      r.geometry.dispose();
      o.dispose();
      for (const d of a) d.dispose();
      c.geometry.dispose();
      c.material.dispose();
      u.geometry.dispose();
      u.material.dispose();
    }
  };
}
