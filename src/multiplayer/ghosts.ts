// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { lge, ZE } from "./ghostGeometry.ts";
import { Color, BufferGeometry, BufferAttribute, Vector4, MeshBasicNodeMaterial, AdditiveBlending, DoubleSide, Mesh, MathUtils } from "three/webgpu";
import { uniform, attribute, select, float, positionGeometry, mix, vec3, cos, sin, time, fract, max, clamp, smoothstep, length, vec2, abs, dot, normalView, positionViewDirection, pow, positionView, vec4 } from "three/tsl";
import { dl } from "../world/city/instanceStorage.ts";
import { getVehicleDefinition } from "../game/vehicles/catalog.ts";
export function cge({
  budgetMs = 3
} = {}) {
  const e = [],
    t = new Map();
  let s = null;
  return {
    request(n, r) {
      if (t.has(n)) return t.get(n);
      const o = new Promise((a, l) => e.push({
        id: n,
        job: lge(r),
        resolve: a,
        reject: l
      }));
      t.set(n, o);
      return o;
    },
    has: n => t.has(n),
    step() {
      const n = performance.now();
      for (; performance.now() - n < budgetMs;) {
        if (s ?? (s = e.shift() ?? null), !s) return false;
        try {
          const r = s.job.next();
          r.done && (s.resolve(r.value), s = null);
        } catch (r) {
          s.reject(r);
          t.delete(s.id);
          s = null;
        }
      }
      return true;
    },
    get busy() {
      return s !== null || e.length > 0;
    }
  };
}
export const Rb = 4;
export const uge = new Color(.04, .7, 1);
export const Md = {
  opacity: 1,
  gain: 1,
  rim: 1,
  lines: 1,
  wave: 1,
  fill: 1
};
export const Kk = Object.keys(Md);
export const jk = Math.PI * 2;
export const dge = 700;
export const hge = 2e3;
export const fge = 4e3;
export const pge = .35;
export const mge = 600;
export const gge = [.04, .55, 1];
export const Of = (i, e, t, s) => i + (e - i) * (1 - Math.exp(-t * s));
export function Age(i) {
  let e = 2166136261;
  for (let t = 0; t < i.length; t++) e = Math.imul(e ^ i.charCodeAt(t), 16777619);
  return (e >>> 0) % 10007 / 10007;
}
export function yge(i) {
  const e = i.attributes.position,
    t = i.attributes.normal,
    s = e.count,
    n = new BufferGeometry(),
    r = new Float32Array(s * 3),
    o = new Float32Array(s * 3);
  for (let c = 0; c < s; c++) r[c * 3] = e.getX(c), r[c * 3 + 1] = e.getY(c), r[c * 3 + 2] = e.getZ(c), o[c * 3] = t ? t.getX(c) : 0, o[c * 3 + 1] = t ? t.getY(c) : 1, o[c * 3 + 2] = t ? t.getZ(c) : 0;
  const a = i.index ? i.index.count : s,
    l = new Uint32Array(a);
  for (let c = 0; c < a; c++) l[c] = i.index ? i.index.getX(c) : c;
  n.setAttribute("position", new BufferAttribute(r, 3));
  n.setAttribute("normal", new BufferAttribute(o, 3));
  n.setAttribute("ghostHub", new BufferAttribute(new Float32Array(s * 3), 3));
  n.setAttribute("ghostInfo", new BufferAttribute(new Float32Array(s * 4), 4));
  n.setIndex(new BufferAttribute(l, 1));
  n.computeBoundingSphere();
  n.userData.ghost = {
    id: "npc",
    box: ZE(r),
    radiusFront: .36,
    radiusRear: .36,
    wheelbase: 2.5,
    triangles: a / 3
  };
  return n;
}
export function createGhostCars({
  scene: scene,
  geometry: geometry,
  fleet = null
}) {
  const s = yge(geometry),
    n = cge(),
    r = new Map(),
    o = new Set(),
    a = new Set(),
    l = {
      color: uniform(uge),
      opacity: uniform(Md.opacity),
      gain: uniform(Md.gain),
      rim: uniform(Md.rim),
      lines: uniform(Md.lines),
      wave: uniform(Md.wave),
      fill: uniform(Md.fill)
    },
    c = st => uniform(new Vector4()).onObjectUpdate(({
      object: object
    }) => object.userData[st]),
    u = c("ghostA"),
    d = c("ghostB"),
    h = c("ghostC"),
    f = c("ghostD"),
    p = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      side: AdditiveBlending,
      blending: DoubleSide
    });
  p.name = "ghost-car";
  const m = attribute("ghostInfo", "vec4"),
    A = attribute("ghostHub", "vec3"),
    g = m.x,
    b = g.lessThan(.5),
    x = g.greaterThan(4.5),
    y = g.lessThan(1.5).or(x),
    _ = select(b, float(1), float(0)),
    w = g.greaterThan(.5).and(g.lessThan(1.5)),
    S = g.greaterThan(1.5).and(g.lessThan(2.5)),
    T = g.greaterThan(2.5).and(g.lessThan(3.5)),
    v = g.greaterThan(3.5).and(g.lessThan(4.5)),
    E = d.x,
    C = d.y,
    M = u.z,
    B = u.y,
    R = u.w,
    I = h.y,
    k = positionGeometry,
    L = k.sub(A),
    F = mix(d.w, d.z, m.y),
    O = vec3(L.x, L.y.mul(cos(F)).sub(L.z.mul(sin(F))), L.y.mul(sin(F)).add(L.z.mul(cos(F)))),
    H = h.x.mul(m.y),
    W = A.add(vec3(O.x.mul(cos(H)).add(O.z.mul(sin(H))), O.y, O.z.mul(cos(H)).sub(O.x.mul(sin(H))))),
    P = float(.84).add(sin(time.mul(47).add(m.z.mul(5.3)).add(m.y.mul(7))).mul(.16)),
    z = E.mul(P),
    Y = A.add(L.mul(vec3(z.mul(.9), z.mul(.9), z))),
    G = A.add(L.mul(M)),
    X = fract(time.mul(.85).add(m.y)),
    ne = A.add(vec3(h.z, 0, h.w).mul(X.mul(-.9))).add(vec3(m.z.mul(.14).mul(X), float(.06).add(X.mul(.75)), 0)).add(L.mul(C.mul(float(.3).add(X.mul(1.25)))));
  p.positionNode = select(w, W, select(S, Y, select(T, ne, select(v, G, k))));
  const se = f.x,
    re = f.y,
    le = max(f.z, .5),
    we = positionGeometry.y,
    Se = clamp(we.div(le), 0, 1),
    ye = re.sub(se).mul(.5),
    U = re.add(se).mul(.5),
    J = fract(we.div(.38).sub(time.mul(.9)).add(I)),
    Q = smoothstep(0, .08, J).mul(smoothstep(.34, .1, J)),
    j = length(vec2(positionGeometry.x.div(ye.mul(.4)), positionGeometry.z.sub(U).div(ye))),
    de = fract(time.mul(.55).add(I)),
    K = smoothstep(.07, 0, abs(j.sub(de))).mul(float(1).sub(de)),
    V = abs(dot(normalView, positionViewDirection)),
    te = pow(float(1).sub(V), 2.4),
    fe = pow(float(1).sub(Se), 3),
    Ce = u.x,
    Ue = smoothstep(.7, 2.6, length(positionView)),
    Ae = sin(time.mul(43).add(I.mul(9))).mul(.035).add(.965),
    Be = R.mul(float(.5).add(sin(time.mul(34)).mul(.5))),
    He = l.fill.mul(.1).add(te.mul(l.rim).mul(.7)).add(Q.mul(l.lines).mul(.32)).add(K.mul(l.wave).mul(.55)).add(fe.mul(.2)).add(Be.mul(te.mul(.5).add(.12))),
    at = te.mul(l.rim).mul(.7).add(Q.mul(l.lines).mul(.35)).add(K.mul(l.wave).mul(.6)).add(fe.mul(.5)).add(.45).mul(l.gain).mul(float(1).add(Be.mul(1.1))),
    Re = f.w.mod(2).greaterThan(.5),
    Fe = f.w.greaterThan(1.5),
    Je = smoothstep(.26, .4, Se).mul(float(1).sub(smoothstep(.7, .88, Se))),
    je = select(x.and(m.y.lessThan(.5)), float(1), float(0)),
    Te = select(x.and(m.y.greaterThan(.5)), float(1), float(0)),
    ue = float(1).sub(smoothstep(se.add(.1), se.add(.5), positionGeometry.z)).mul(Je).mul(_).mul(select(Re, float(0), float(1))),
    $ = smoothstep(re.sub(.5), re.sub(.1), positionGeometry.z).mul(Je).mul(_).mul(select(Fe, float(0), float(1))),
    q = je.mul(float(.25).add(B.mul(2.2))).add(ue.mul(B).mul(.5)),
    oe = Te.mul(float(.25).add(M.mul(2.4))).add($.mul(M).mul(.5)),
    xe = clamp(q.add(oe), 0, 1),
    me = l.color.mul(at).mul(float(1).sub(xe.mul(.85))).add(vec3(1, .035, .05).mul(q.mul(2.4))).add(vec3(.8, .95, 1).mul(oe.mul(3))),
    ie = He.mul(Ae).add(q.mul(.55)).add(oe.mul(.55)),
    Ne = m.y,
    ze = float(.4).add(V.mul(.6)),
    tt = mix(vec3(1.5, 1.3, 1.7), vec3(.62, .22, 1), smoothstep(0, .55, Ne)),
    dt = pow(float(1).sub(Ne), 1.4).mul(clamp(E.mul(4), 0, 1)).mul(.95).mul(ze),
    Lt = fract(time.mul(.85).add(m.y)),
    mt = pow(float(1).sub(Lt), 1.3).mul(clamp(C.mul(3), 0, 1)).mul(.3).mul(float(.45).add(te.mul(.9))),
    hs = mix(float(.42), float(.1), Ne).mul(M).mul(pow(V, 1.2)),
    ge = select(y, me, select(S, tt, select(T, vec3(.62, .92, 1), vec3(.78, .94, 1)))),
    Le = select(y, ie, select(S, dt, select(T, mt, hs)));
  p.colorNode = vec4(ge, Le.mul(Ce).mul(Ue).mul(l.opacity));
  const Oe = [];
  for (let st = 0; st < Rb; st++) {
    const it = new Mesh(s, p);
    it.name = `multiplayer:ghost:${st}`;
    it.frustumCulled = false;
    it.visible = false;
    it.castShadow = false;
    it.receiveShadow = false;
    it.renderOrder = 9;
    it.layers.set(dl);
    it.userData.ghostA = new Vector4();
    it.userData.ghostB = new Vector4();
    it.userData.ghostC = new Vector4();
    it.userData.ghostD = new Vector4();
    scene.add(it);
    Oe.push(it);
  }
  const et = Array.from({
      length: Rb
    }, () => ({
      x: 0,
      z: 0,
      size: 8,
      rgb: gge,
      intensity: .7
    })),
    lt = [],
    Et = new Map(),
    Gt = new Map();
  let es = 0;
  function Fs(st) {
    if (!st || !fleet) return s;
    const it = getVehicleDefinition(st).id,
      Mt = r.get(it);
    return Mt || (!a.has(it) && !o.has(it) && (a.add(it), fleet.load(it).then(Pe => n.request(it, Pe)).then(Pe => r.set(it, Pe)).catch(Pe => {
      o.add(it);
      console.warn(`[multiplayer] could not bake ${it} for its hologram:`, Pe);
    })), s);
  }
  function In(st) {
    let it = Gt.get(st.id);
    it || (it = {
      brake: 0,
      lights: 0,
      horn: 0,
      nitro: 0,
      drift: 0,
      steer: 0,
      yaw: st.yaw,
      at: es,
      seed: Age(st.id)
    }, Gt.set(st.id, it));
    return it;
  }
  function qe(st, it = performance.now()) {
    var Pt, ce;
    const Mt = Math.min(.1, Math.max(0, (it - es) / 1e3));
    es = it;
    const Pe = Math.min(st.length, Rb);
    lt.length = Pe;
    for (let ke = 0; ke < Pe; ke++) {
      const Ie = st[ke],
        pt = Oe[ke],
        kt = Ie.age < mge && !Ie.onFoot,
        ht = In(Ie);
      Et.has(Ie.id) || Et.set(Ie.id, it);
      const ts = MathUtils.smoothstep(it - Et.get(Ie.id), 0, dge),
        yt = 1 - (1 - pge) * MathUtils.smoothstep(Ie.age, hge, fge),
        Tt = ts * yt,
        js = Fs(Ie.car);
      pt.geometry !== js && (pt.geometry = js);
      const Cs = js.userData.ghost;
      if (pt.position.set(Ie.x, Ie.y, Ie.z), pt.quaternion.set(Ie.qx, Ie.qy, Ie.qz, Ie.qw), ht.brake = Of(ht.brake, kt && Ie.braking ? 1 : 0, 22, Mt), ht.lights = Of(ht.lights, kt && Ie.lights ? 1 : 0, 20, Mt), ht.horn = Of(ht.horn, kt && Ie.horn ? 1 : 0, 26, Mt), ht.nitro = Of(ht.nitro, kt && Ie.nitro ? 1 : 0, Ie.nitro ? 16 : 9, Mt), ht.drift = Of(ht.drift, kt && Ie.drift ? 1 : 0, Ie.drift ? 7 : 3.5, Mt), Mt > 0) {
        let $n = Ie.yaw - ht.yaw;
        $n = Math.atan2(Math.sin($n), Math.cos($n));
        const bo = $n / Mt,
          fr = Math.abs(Ie.speed) > 1.5 ? Ie.speed : Math.sign(Ie.speed || 1) * 1.5,
          Gr = MathUtils.clamp(Math.atan(Cs.wheelbase * bo / fr), -.55, .55);
        ht.steer = Of(ht.steer, kt ? Gr : 0, 14, Mt);
      }
      ht.yaw = Ie.yaw;
      const vs = 1 - 2 * (Ie.qy * Ie.qy + Ie.qz * Ie.qz),
        er = 2 * (Ie.qx * Ie.qy + Ie.qw * Ie.qz),
        zt = 2 * (Ie.qx * Ie.qz - Ie.qw * Ie.qy),
        Vt = Ie.vx * vs + Ie.vy * er + Ie.vz * zt;
      pt.userData.ghostA.set(Tt, ht.brake, ht.lights, ht.horn);
      pt.userData.ghostB.set(ht.nitro, ht.drift, Ie.roll / Cs.radiusFront % jk, Ie.roll / Cs.radiusRear % jk);
      pt.userData.ghostC.set(ht.steer, ht.seed, Vt, Ie.speed);
      pt.userData.ghostD.set(Cs.box.minZ, Cs.box.maxZ, Cs.box.maxY, ((Pt = Cs.lamps) != null && Pt.tail ? 1 : 0) + ((ce = Cs.lamps) != null && ce.head ? 2 : 0));
      pt.visible = true;
      const Ds = et[ke];
      Ds.x = Ie.x;
      Ds.z = Ie.z;
      Ds.size = 8 + ht.lights * 7;
      Ds.intensity = .7 * Tt * (1 + ht.lights * .9);
      lt[ke] = Ds;
    }
    for (let ke = Pe; ke < Rb; ke++) Oe[ke].visible = false;
    if (Et.size > Pe) {
      const ke = new Set();
      for (let Ie = 0; Ie < Pe; Ie++) ke.add(st[Ie].id);
      for (const Ie of Et.keys()) ke.has(Ie) || Et.delete(Ie);
      for (const Ie of Gt.keys()) ke.has(Ie) || Gt.delete(Ie);
    }
  }
  return {
    meshes: Oe,
    glows: lt,
    setCars: qe,
    step: () => n.step(),
    tune(st = {}) {
      for (const it of Kk) it in st && (l[it].value = st[it]);
      st.color && l.color.value.setRGB(...st.color);
      return Object.fromEntries(Kk.map(it => [it, l[it].value]));
    },
    stats: () => ({
      baked: Object.fromEntries([...r].map(([st, it]) => [st, it.userData.ghost.triangles])),
      pending: [...a].filter(st => !r.has(st) && !o.has(st)),
      failed: [...o],
      busy: n.busy
    }),
    warmup() {
      const st = Oe.map(Mt => Mt.visible),
        it = Oe[0];
      it.userData.ghostA.set(1, 0, 0, 0);
      it.userData.ghostD.set(s.userData.ghost.box.minZ, s.userData.ghost.box.maxZ, s.userData.ghost.box.maxY, 0);
      it.visible = true;
      return () => Oe.forEach((Mt, Pe) => Mt.visible = st[Pe]);
    },
    dispose() {
      for (const st of Oe) st.removeFromParent();
      for (const st of r.values()) st.dispose();
      s.dispose();
      p.dispose();
    }
  };
}
export const xge = 7.2;
export const _ge = 2.6;
export const wge = 1;
export const Tge = 120;
export const Yk = 60;
export const Uf = (i, e, t, s) => i + (e - i) * (1 - Math.exp(-t * s));
export const Sge = i => Math.atan2(Math.sin(i), Math.cos(i));
