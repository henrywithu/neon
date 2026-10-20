// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, TextureLoader, Group, SRGBColorSpace, NodeMaterial, PlaneGeometry, Mesh, Sphere, MeshBasicNodeMaterial, MathUtils, Vector2, Matrix4, Plane, Vector4 } from "three/webgpu";
import { x1, Xie, o3, Jie, Zie, ere, Yie, tre, rre, nre, ire, lre, ure, cre, sre, jie, are, ore, l3, df, a3, dre } from "../../shaders/rainRipples.ts";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { uniform, instancedArray, uint, Fn, instanceIndex, hash, fract, texture, float, time, floor, vec3, length, normalize, cross, cameraPosition, clamp, color, positionGeometry, vec2, mix, billboarding, If, uv } from "three/tsl";
export const hre = 140 / 3.6;
export const ag = new Vector3();
export function c3(i) {
  i.layers.disable(0);
  i.layers.enable(x1);
}
export function fre(i) {
  return new Promise((e, t) => {
    new TextureLoader().load(i, e, undefined, t);
  });
}
export async function createCollisionRain({
  scene: scene,
  renderer: renderer,
  collisionHeight: collisionHeight,
  camera = null,
  count = performanceProfile.collisionRainCount ?? 2750,
  rainArea = Xie
} = {}) {
  const o = Math.min(Math.max(500, count), o3),
    a = rainArea.width / 2,
    l = rainArea.height / 2,
    c = {
      enabled: true,
      count: o,
      opacity: Jie,
      intensity: Zie,
      splashOpacity: ere,
      splashSpeed: Yie,
      fallSpeed: tre,
      splashSize: rre,
      splashStartScale: nre,
      splashEndScale: ire,
      rainAreaWidth: rainArea.width,
      rainAreaHeight: rainArea.height,
      cameraForwardOffset: 15,
      maxStretch: lre,
      speedFade: ure,
      leanGain: cre
    },
    u = new Group();
  u.name = "CollisionRain";
  scene.add(u);
  const d = uniform(new Vector3()),
    h = uniform(new Vector3()),
    f = uniform(c.opacity),
    p = uniform(c.intensity),
    m = uniform(c.splashOpacity),
    A = uniform(c.splashSpeed),
    g = uniform(c.fallSpeed),
    b = uniform(sre),
    x = uniform(c.splashSize),
    y = uniform(c.splashStartScale),
    _ = uniform(c.splashEndScale),
    w = uniform(c.rainAreaWidth),
    S = uniform(c.rainAreaHeight),
    T = uniform(a),
    v = uniform(l),
    E = uniform(c.cameraForwardOffset),
    C = uniform(new Vector3()),
    M = uniform(c.maxStretch),
    B = uniform(c.leanGain),
    R = uniform(1),
    I = instancedArray(o, "vec3"),
    k = instancedArray(o, "vec3"),
    L = instancedArray(o, "vec3"),
    F = instancedArray(o, "uint"),
    O = () => uint(Math.random() * 16777215),
    H = Fn(() => {
      const Pe = I.element(instanceIndex),
        Pt = k.element(instanceIndex),
        ce = hash(instanceIndex),
        ke = hash(instanceIndex.add(O())),
        Ie = hash(instanceIndex.add(O())),
        pt = d.add(h.mul(E));
      Pe.x = ce.mul(w).sub(T).add(pt.x);
      Pe.z = Ie.mul(S).sub(v).add(pt.z);
      Pe.y = ke.mul(25);
      Pt.y = ce.mul(b).sub(b.mul(.5)).sub(g);
    })().compute(o),
    P = Fn(() => {
      const Pe = I.element(instanceIndex),
        Pt = k.element(instanceIndex);
      Pe.addAssign(Pt);
      const ce = d.add(h.mul(E)),
        ke = Pe.x.sub(ce.x),
        Ie = Pe.z.sub(ce.z),
        pt = fract(ke.add(T).div(w)).mul(w).sub(T);
      Pe.x = ce.x.add(pt);
      const kt = fract(Ie.add(v).div(S)).mul(S).sub(v);
      Pe.z = ce.z.add(kt);
      const ht = collisionHeight.getUV(Pe),
        Tt = texture(collisionHeight.renderTarget.texture, ht).y.add(float(.05));
      If(Pe.y.lessThan(Tt), () => {
        const js = float(instanceIndex).add(time.mul(1e3));
        Pe.y = hash(js.add(77.7)).mul(15).add(20);
        Pe.x = hash(js.add(11.1)).mul(w).sub(T).add(ce.x);
        Pe.z = hash(js.add(44.4)).mul(S).sub(v).add(ce.z);
        Pt.y = hash(js.add(99.9)).mul(b).sub(b.mul(.5)).sub(g);
      });
    })().compute(o),
    Y = Fn(() => {
      const Pe = L.element(instanceIndex),
        Pt = F.element(instanceIndex),
        ce = d.add(h.mul(E)),
        ke = hash(instanceIndex).mul(6.28),
        Ie = floor(time.mul(A).add(ke)).toUint();
      If(Ie.notEqual(Pt), () => {
        Pt.assign(Ie);
        const js = instanceIndex.add(Ie.mul(uint(196613))),
          Cs = hash(js),
          vs = hash(js.add(uint(77777))),
          er = Cs.mul(w).sub(T),
          zt = vs.mul(S).sub(v);
        Pe.x = ce.x.add(er);
        Pe.z = ce.z.add(zt);
        const Vt = collisionHeight.getUV(Pe),
          Ds = texture(collisionHeight.renderTarget.texture, Vt).y;
        Pe.y = Ds.add(.06);
      });
      const pt = Pe.x.sub(ce.x),
        kt = Pe.z.sub(ce.z),
        ht = fract(pt.add(T).div(w)).mul(w).sub(T),
        ts = ce.x.add(ht),
        yt = fract(kt.add(v).div(S)).mul(S).sub(v),
        Tt = ce.z.add(yt);
      If(ts.notEqual(Pe.x).or(Tt.notEqual(Pe.z)), () => {
        Pe.x = ts;
        Pe.z = Tt;
        const js = collisionHeight.getUV(Pe),
          Cs = texture(collisionHeight.renderTarget.texture, js).y;
        Pe.y = Cs.add(.06);
      });
    })().compute(o);
  function G(Pe) {
    d.value.copy(Pe.position);
    Pe.getWorldDirection(ag);
    ag.y = 0;
    ag.lengthSq() > 0 && ag.normalize();
    h.value.copy(ag);
    d.needsUpdate = true;
    h.needsUpdate = true;
  }
  camera && (G(camera), camera.layers.enable(x1));
  renderer.compute(H);
  renderer.compute(P);
  const X = await fre(jie);
  X.colorSpace = SRGBColorSpace;
  const ae = uv(),
    ne = ae.x.sub(.5).abs().mul(2).oneMinus().pow(2),
    se = ae.y.smoothstep(0, .08).mul(ae.y.oneMinus().smoothstep(0, .15)),
    re = ne.mul(se),
    le = I.toAttribute(),
    we = g.mul(are),
    Se = C.mul(B),
    ye = vec3(Se.x.negate(), we.negate(), Se.z.negate()),
    U = length(ye).max(.001),
    J = ye.div(U).negate(),
    Q = normalize(cross(J, normalize(cameraPosition.sub(le)))),
    j = clamp(U.div(we.max(.001)), 1, M),
    de = new NodeMaterial();
  de.colorNode = color(14480639);
  de.opacityNode = re.mul(f).mul(p).mul(R);
  de.positionNode = le.add(J.mul(positionGeometry.y.mul(j))).add(Q.mul(positionGeometry.x));
  de.depthWrite = false;
  de.depthTest = true;
  de.transparent = true;
  de.toneMapped = false;
  const K = new PlaneGeometry(ore, l3);
  K.translate(0, l3 * .75, 0);
  const V = new Mesh(K, de);
  V.count = o;
  V.frustumCulled = false;
  K.boundingSphere = new Sphere(new Vector3(), 1e5);
  V.renderOrder = 12;
  c3(V);
  u.add(V);
  const te = hash(instanceIndex).mul(6.28),
    fe = fract(time.mul(A).add(te)),
    Ce = fe.mul(float(df)),
    Ue = floor(Ce).toFloat(),
    Ae = Ue.add(1).min(float(df - 1)),
    Be = fract(Ce),
    He = uv(),
    at = vec2(He.x.div(float(df)).add(Ue.div(float(df))), He.y),
    Re = vec2(He.x.div(float(df)).add(Ae.div(float(df))), He.y),
    Fe = texture(X, at),
    Je = texture(X, Re),
    je = mix(Fe, Je, Be),
    ue = hash(instanceIndex.add(uint(12345))).mul(.7).add(.3).mul(mix(y, _, fe)).mul(x),
    $ = fe.oneMinus().smoothstep(0, .5),
    q = new MeshBasicNodeMaterial();
  q.colorNode = color(14480639);
  q.opacityNode = je.r.mul(m).mul($);
  q.positionNode = positionGeometry.mul(ue);
  q.vertexNode = billboarding({
    position: L.toAttribute(),
    horizontal: true,
    vertical: true
  });
  q.depthWrite = false;
  q.depthTest = true;
  q.transparent = true;
  q.toneMapped = false;
  const oe = new PlaneGeometry(a3, a3),
    xe = new Mesh(oe, q);
  xe.count = o;
  xe.frustumCulled = false;
  oe.boundingSphere = new Sphere(new Vector3(), 1e5);
  xe.renderOrder = 11;
  c3(xe);
  u.add(xe);
  u.frustumCulled = false;
  const me = performanceProfile.rainSplashes !== false;
  function ie() {
    u.visible = c.enabled;
    V.visible = c.enabled;
    xe.visible = c.enabled && me;
  }
  const Ne = new Vector3(),
    ze = new Vector3();
  let tt = false;
  function dt(Pe, Pt) {
    const ce = C.value;
    tt && Pe > 0 && (ze.subVectors(Pt.position, Ne).divideScalar(Pe), ze.lengthSq() > 8100 && ze.set(0, 0, 0), ce.lerp(ze, 1 - Math.exp(-8 * Pe)));
    Ne.copy(Pt.position);
    tt = true;
    const ke = Math.hypot(ce.x, ce.z),
      Ie = MathUtils.smoothstep(ke, dre, hre);
    R.value = 1 - c.speedFade * Ie;
  }
  function Lt(Pe, Pt) {
    if (!c.enabled) {
      u.visible = false;
      tt = false;
      return;
    }
    ie();
    G(Pt);
    dt(Pe, Pt);
    renderer.compute(P);
    me && renderer.compute(Y);
  }
  function mt(Pe) {
    c.enabled = !!Pe;
    ie();
  }
  function hs(Pe) {
    const Pt = Math.max(500, Math.min(o3, Math.round(Pe)));
    c.count = Pt;
    V.count = Pt;
    xe.count = Pt;
  }
  function ge(Pe) {
    c.opacity = Pe;
    f.value = Pe;
    f.needsUpdate = true;
  }
  function Le(Pe) {
    c.intensity = Pe;
    p.value = Pe;
    p.needsUpdate = true;
  }
  function Oe(Pe) {
    c.splashOpacity = Pe;
    m.value = Pe;
    m.needsUpdate = true;
  }
  function et(Pe) {
    c.splashSpeed = Pe;
    A.value = Pe;
    A.needsUpdate = true;
  }
  function lt(Pe) {
    c.fallSpeed = Pe;
    g.value = Pe;
    g.needsUpdate = true;
  }
  function Et(Pe) {
    c.splashSize = Pe;
    x.value = Pe;
    x.needsUpdate = true;
  }
  function Gt(Pe) {
    c.splashStartScale = Pe;
    y.value = Pe;
    y.needsUpdate = true;
  }
  function es(Pe) {
    c.splashEndScale = Pe;
    _.value = Pe;
    _.needsUpdate = true;
  }
  function Fs(Pe) {
    c.rainAreaWidth = Pe;
    w.value = Pe;
    w.needsUpdate = true;
    T.value = Pe / 2;
    T.needsUpdate = true;
  }
  function In(Pe) {
    c.rainAreaHeight = Pe;
    S.value = Pe;
    S.needsUpdate = true;
    v.value = Pe / 2;
    v.needsUpdate = true;
  }
  function qe(Pe) {
    c.maxStretch = Pe;
    M.value = Pe;
  }
  function st(Pe) {
    c.speedFade = Pe;
  }
  function it(Pe) {
    c.leanGain = Pe;
    B.value = Pe;
  }
  function Mt() {
    scene.remove(u);
    K.dispose();
    de.dispose();
    oe.dispose();
    q.dispose();
    X.dispose();
  }
  ie();
  return {
    group: u,
    rainParticles: V,
    splashParticles: xe,
    layer: x1,
    useDedicatedPass: false,
    params: c,
    update: Lt,
    setEnabled: mt,
    setDropCount: hs,
    setOpacity: ge,
    setIntensity: Le,
    setSplashOpacity: Oe,
    setSplashSpeed: et,
    setFallSpeed: lt,
    setSplashSize: Et,
    setSplashStartScale: Gt,
    setSplashEndScale: es,
    setRainAreaWidth: Fs,
    setRainAreaHeight: In,
    setMaxStretch: qe,
    setSpeedFade: st,
    setLeanGain: it,
    dispose: Mt
  };
}
export const JU = "/textures/wet-puddles-albedo.jpg";
export const ZU = "/textures/wet-puddles-roughness.jpg";
export const ez = "/textures/wet-puddles-normal.jpg";
export const HT = new Vector2();
export const lg = new Vector3();
export const WT = new Vector3();
export const $T = new Vector3();
export const u3 = new Vector3();
export const KT = new Vector3();
export const hf = new Vector3();
export const cg = new Matrix4();
export const ff = new Plane();
export const Wa = new Vector4();
export const ug = new Vector4();
