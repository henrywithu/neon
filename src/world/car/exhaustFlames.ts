// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Matrix3, DataTexture, RGBAFormat, RepeatWrapping, LinearFilter, LinearMipmapLinearFilter, Vector3, InstancedInterleavedBuffer, MeshBasicNodeMaterial, CustomBlending, MaxEquation, OneFactor, PlaneGeometry, Mesh, DoubleSide, MathUtils } from "three/webgpu";
import { jU, YU, $N, dd, FT, KN, lf, Xy, jN, rg, cf, xie } from "../../game/vehicles/configurations.ts";
import { uniform, instancedBufferAttribute, cameraViewMatrix, vec4, normalize, vec2, length, positionGeometry, varying, cameraWorldMatrix, cameraPosition, dot, cross, texture, time, abs, mix, float, max, smoothstep, clamp, vec3, cameraProjectionMatrix, uv } from "three/tsl";
export const DT = new Matrix3();
export const YN = (i, e, t) => {
  const s = Math.min(1, Math.max(0, (t - i) / (e - i)));
  return s * s * (3 - 2 * s);
};
export const PT = [.1, .2, .38, .56, .74, .9, 1];
export const _ie = [[0, 0, 0], [.32, .015, 0], [.85, .12, .01], [1, .36, .035], [1, .64, .15], [1, .88, .52], [1, .97, .85]];
export const wie = [[0, 0, 0], [.13, 0, .24], [.4, .03, .75], [.66, .12, 1], [.86, .4, 1], [.97, .74, 1], [1, .92, 1]];
export const Tie = [[0, 0, 0], [.015, .04, .25], [.06, .14, .7], [.15, .34, 1], [.35, .58, 1], [.75, .86, 1], [1, .97, .9]];
export let Qa = null;
export function Sie() {
  if (Qa) return Qa;
  const i = 128,
    e = new Float32Array(i * i * 4);
  let t = 1337;
  const s = () => (t = t * 1664525 + 1013904223 >>> 0, t / 4294967296),
    n = new Int32Array(i),
    r = new Int32Array(i),
    o = new Float32Array(i);
  for (let l = 0; l < 4; l++) for (const [c, u] of [[8, .5], [16, .3], [32, .2]]) {
    const d = new Float32Array(c * c);
    for (let h = 0; h < d.length; h++) d[h] = s();
    for (let h = 0; h < i; h++) {
      const f = h / i * c,
        p = Math.floor(f),
        m = f - p;
      n[h] = p;
      r[h] = (p + 1) % c;
      o[h] = m * m * (3 - 2 * m);
    }
    for (let h = 0; h < i; h++) {
      const f = n[h] * c,
        p = r[h] * c;
      for (let m = 0; m < i; m++) {
        const A = d[f + n[m]] + (d[f + r[m]] - d[f + n[m]]) * o[m],
          g = d[p + n[m]] + (d[p + r[m]] - d[p + n[m]]) * o[m];
        e[(h * i + m) * 4 + l] += (A + (g - A) * o[h]) * u;
      }
    }
  }
  const a = new Uint8Array(e.length);
  for (let l = 0; l < e.length; l++) a[l] = Math.min(255, Math.round(e[l] * 255));
  Qa = new DataTexture(a, i, i, RGBAFormat);
  Qa.wrapS = Qa.wrapT = RepeatWrapping;
  Qa.magFilter = LinearFilter;
  Qa.minFilter = LinearMipmapLinearFilter;
  Qa.generateMipmaps = true;
  Qa.needsUpdate = true;
  return Qa;
}
export function OT(i) {
  const e = Math.floor(i),
    t = i - e,
    s = n => {
      const r = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return r - Math.floor(r);
    };
  return s(e) + (s(e + 1) - s(e)) * t * t * (3 - 2 * t);
}
export function createExhaustFlames({
  scene: scene,
  car: car,
  pipes = jU,
  groundY = 0,
  layer = 0,
  lightPools = null,
  onBang = null
}) {
  const a = {
      ...YU
    },
    l = uniform(a.glow),
    c = uniform(a.blue),
    u = uniform(a.core),
    d = uniform(a.turbulence),
    h = uniform(a.stretch),
    f = uniform(0),
    p = uniform(0);
  function m() {
    f.value = Math.min(...pipes.map(ce => ce.z)) - .06;
    p.value = pipes.reduce((ce, ke) => ce + ke.y, 0) / pipes.length;
  }
  m();
  const A = uniform(new Vector3()),
    g = uniform(new Vector3(1, 0, 0)),
    b = uniform(new Vector3(0, 1, 0)),
    x = uniform(new Vector3(0, 0, 1)),
    y = new Float32Array($N * dd),
    _ = new InstancedInterleavedBuffer(y, dd),
    w = instancedBufferAttribute(_, "vec4", dd, 0),
    S = instancedBufferAttribute(_, "vec4", dd, 4),
    T = instancedBufferAttribute(_, "vec4", dd, 8),
    v = w.w,
    E = S.x,
    C = S.y,
    M = S.z,
    B = S.w,
    R = A.add(g.mul(w.x)).add(b.mul(w.y)).add(x.mul(w.z)),
    I = cameraViewMatrix.mul(vec4(R, 1)),
    k = cameraViewMatrix.mul(vec4(g.mul(T.x).add(b.mul(T.y)).add(x.mul(T.z)), 0)).xy,
    L = normalize(k.add(vec2(0, 1e-4))),
    F = vec2(L.y, L.x.negate()),
    O = length(k).mul(.25).min(1.2).mul(h).add(1),
    H = E.mul(FT),
    W = positionGeometry.xy.mul(2),
    P = F.mul(W.x.mul(H)).add(L.mul(W.y.mul(H).mul(O))),
    z = varying(R.add(cameraWorldMatrix.mul(vec4(P, 0, 0)).xyz)),
    Y = A.add(g.mul(T.w)).add(b.mul(p)).sub(cameraPosition),
    G = normalize(Y.sub(x.mul(dot(Y, x))).add(b.mul(.001))),
    X = z.sub(cameraPosition),
    ae = X.mul(dot(Y, G).div(dot(X, G)).clamp(.5, 2)).sub(Y),
    ne = dot(ae, normalize(cross(G, x))),
    se = dot(ae, x),
    re = Sie(),
    le = texture(re, vec2(ne.div(1.1), se.add(time.mul(4.5)).div(2.6))).r.add(texture(re, vec2(ne.div(.8).add(.37), se.add(time.mul(3.1)).div(1.9).add(.61))).g).sub(1).mul(1.8),
    we = abs(le).mul(1.6).sub(.45).max(-.35),
    Se = d.mul(mix(float(.25), float(1.25), v)),
    ye = length(uv().mul(2).sub(1)).mul(FT),
    U = max(ye.add(we.mul(Se)), ye.sub(FT - 1)),
    J = mix(float(1), float(.35), smoothstep(.08, 1, v)),
    Q = mix(mix(float(2), float(4), smoothstep(.02, .15, v)), float(2), smoothstep(.35, .9, v)),
    j = clamp(float(1).sub(U.max(0).pow(Q)).max(0).mul(J).mul(u.mul(.3).add(.68)).mul(float(1).sub(smoothstep(.6, 1, v))).mul(C.mul(.3).add(.7)).add(le.mul(.16)), 0, 1),
    de = c.mul(float(1).sub(smoothstep(.03, .22, f.sub(dot(z.sub(A), x)))));
  let K = vec3(0);
  for (let ce = 1; ce < PT.length; ce++) {
    const ke = mix(mix(vec3(..._ie[ce]), vec3(...wie[ce]), B), vec3(...Tie[ce]), de);
    K = mix(K, ke, smoothstep(PT[ce - 1], PT[ce], j));
  }
  const V = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: MaxEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor
  });
  V.name = "exhaust-flames";
  V.vertexNode = cameraProjectionMatrix.mul(vec4(I.xy.add(P), I.z, 1));
  V.colorNode = vec4(vec3(0), smoothstep(.1, .35, j));
  V.emissiveNode = K.mul(l).mul(M.mul(.3).add(.75));
  const te = new PlaneGeometry(1, 1),
    fe = new Mesh(te, V);
  fe.name = "exhaust-flames";
  fe.frustumCulled = false;
  fe.renderOrder = 14;
  fe.count = 1;
  fe.visible = false;
  fe.layers.set(layer);
  scene.add(fe);
  const Ce = new Float32Array(KN * lf),
    Ue = new InstancedInterleavedBuffer(Ce, lf),
    Ae = instancedBufferAttribute(Ue, "vec4", lf, 0),
    Be = instancedBufferAttribute(Ue, "vec4", lf, 4),
    He = Ae.w,
    at = length(Be.xyz).max(.001),
    Re = Be.xyz.div(at).negate(),
    Fe = normalize(cross(Re, normalize(cameraPosition.sub(Ae.xyz)))),
    Je = clamp(at.mul(.03), .04, .42).mul(He.mul(-.5).add(1)),
    je = Ae.xyz.add(Re.mul(positionGeometry.y.add(.5).mul(Je))).add(Fe.mul(positionGeometry.x.mul(.016))),
    Te = uv(),
    ue = smoothstep(.5, 0, abs(Te.x.sub(.5))).mul(smoothstep(1, .55, Te.y)),
    $ = mix(vec3(1, .72, .36), vec3(1, .34, .06), smoothstep(0, .5, He)),
    q = ue.mul(He.oneMinus()),
    oe = $.mul(4.5),
    xe = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: DoubleSide
    });
  xe.name = "exhaust-sparks";
  xe.vertexNode = cameraProjectionMatrix.mul(cameraViewMatrix).mul(vec4(je, 1));
  xe.colorNode = vec4(vec3(0), q);
  xe.emissiveNode = oe;
  const me = new PlaneGeometry(1, 1),
    ie = new Mesh(me, xe);
  ie.name = "exhaust-sparks";
  ie.frustumCulled = false;
  ie.renderOrder = 15;
  ie.count = 1;
  ie.visible = false;
  ie.layers.set(layer);
  scene.add(ie);
  const Ne = [],
    ze = [],
    tt = [],
    dt = [],
    Lt = new Vector3(),
    mt = new Vector3(),
    hs = new Vector3(0, 1, 0);
  let ge = 0,
    Le = 0,
    Oe = false,
    et = false,
    lt = 0,
    Et = null;
  function Gt(ce) {
    const ke = pipes[ce];
    car.localToWorld(Xy.set(ke.x, ke.y, ke.z - .08));
    car.getWorldQuaternion(jN);
    rg.set(0, 0, -1).applyQuaternion(jN);
  }
  function es(ce, ke) {
    if (ce.sustain) return lt * (.8 + .2 * OT(ke * 22 + ce.seed * 17));
    const Ie = Math.min(1, ke / .014),
      pt = 1 - YN(.5, 1, ke / ce.duration);
    return Ie * pt * (.88 + .12 * OT(ke * 30 + ce.seed * 17));
  }
  function Fs(ce, ke, Ie = 1) {
    const pt = Math.exp(-6 * ke),
      kt = 3 * a.rise * ke;
    ce.vx = mt.x * cf + (ce.vx - mt.x * cf) * pt + hs.x * kt;
    ce.vy = mt.y * cf + (ce.vy - mt.y * cf) * pt + hs.y * kt;
    ce.vz = mt.z * cf + (ce.vz - mt.z * cf) * pt + hs.z * kt;
    ce.x += ce.vx * ke;
    ce.y += ce.vy * ke;
    ce.z += ce.vz * ke;
    ce.age += ke * Ie / ce.life;
  }
  function In(ce, ke, Ie) {
    if (Ne.length >= $N) return;
    const pt = es(ke, Math.max(0, ke.time - Ie));
    if (pt < .03) return;
    const kt = pipes[ce],
      ht = ke.strength,
      ts = Math.sin((ge - Ie) * 19 + ce * 2.3) * .45 * a.turbulence,
      yt = ze.pop() ?? {};
    yt.x = kt.x + (Math.random() - .5) * .08;
    yt.y = kt.y + (Math.random() - .5) * .03;
    yt.z = kt.z - .06;
    yt.vx = ts + (Math.random() - .5) * .12;
    yt.vy = .2 + Math.random() * .1;
    yt.pipeX = kt.x;
    yt.vz = -(5 + 3 * ht) * a.length * (.92 + Math.random() * .16);
    yt.age = 0;
    yt.life = (.2 + Math.random() * .06) * (.8 + .4 * ht) * a.life;
    yt.size = (.09 + Math.random() * .02) * (.7 + .45 * ht) * a.size * pt;
    yt.pulse = OT((ke.time - Ie) * 45 + ke.seed * 31);
    yt.strength = ht;
    yt.violet = ke.violet;
    Fs(yt, Ie);
    Ne.push(yt);
  }
  function qe(ce, ke) {
    Gt(ce);
    const Ie = new Vector3(-rg.z, 0, rg.x);
    for (let pt = 0; pt < ke && tt.length < KN; pt++) {
      const kt = Lt.clone().multiplyScalar(.92).addScaledVector(rg, 4 + Math.random() * 8).addScaledVector(Ie, (Math.random() - .5) * 6).add(new Vector3(0, Math.random() * 3.2 - .4, 0));
      tt.push({
        pos: Xy.clone(),
        vel: kt,
        age: 0,
        life: .3 + Math.random() * .45,
        seed: Math.random()
      });
    }
  }
  function st({
    strength = 1,
    pops = false,
    force = false
  } = {}) {
    if (!a.enabled && !force) return;
    const pt = MathUtils.clamp(strength, .2, 1),
      kt = Et || Math.random() < a.violet ? 1 : 0;
    if (dt.push({
      delay: 0,
      time: 0,
      duration: (.12 + .2 * pt) * a.duration,
      strength: pt,
      acc: 0,
      sparks: true,
      main: true,
      violet: kt,
      seed: Math.random()
    }), pops) {
      let ht = .06;
      const ts = 2 + Math.floor(Math.random() * 3);
      for (let yt = 0; yt < ts; yt++) ht += .05 + Math.random() * .09, dt.push({
        delay: ht,
        time: 0,
        duration: .035 + Math.random() * .04,
        strength: pt * .6,
        acc: 0,
        sparks: Math.random() < .5,
        main: false,
        violet: kt,
        seed: Math.random()
      });
    }
  }
  function it(ce, {
    force = false
  } = {}) {
    force ? et = !!ce : Oe = !!ce;
  }
  function Mt(ce) {
    lt = (Oe && a.enabled || et) && a.nitro > 0 ? Math.min(1, lt + ce / .06) : Math.max(0, lt - ce / .15);
    lt > 0 && !Et && (Et = {
      delay: 0,
      time: 0,
      duration: 1 / 0,
      strength: 1,
      acc: 0,
      sparks: true,
      main: false,
      violet: 1,
      seed: Math.random(),
      sustain: true
    }, dt.push(Et));
    Et && (Et.strength = MathUtils.clamp(a.nitro, .2, 1), lt <= 0 && (dt.splice(dt.indexOf(Et), 1), Et = null));
  }
  function Pe() {
    const ce = tt.length;
    for (let ke = 0; ke < ce; ke++) {
      const Ie = tt[ke],
        pt = ke * lf;
      Ce[pt] = Ie.pos.x;
      Ce[pt + 1] = Ie.pos.y;
      Ce[pt + 2] = Ie.pos.z;
      Ce[pt + 3] = Ie.age;
      Ce[pt + 4] = Ie.vel.x - Lt.x;
      Ce[pt + 5] = Ie.vel.y - Lt.y;
      Ce[pt + 6] = Ie.vel.z - Lt.z;
      Ce[pt + 7] = Ie.seed;
    }
    ie.count = Math.max(1, ce);
    ie.visible = ce > 0;
    ce > 0 && (Ue.clearUpdateRanges(), Ue.addUpdateRange(0, ce * lf), Ue.needsUpdate = true);
  }
  function Pt(ce, ke = null) {
    if (ce <= 0) return;
    ge += ce;
    ke && Lt.set(ke.x, ke.y, ke.z);
    l.value = a.glow;
    c.value = a.blue;
    u.value = a.core;
    d.value = a.turbulence;
    h.value = a.stretch;
    car.updateWorldMatrix(true, false);
    const Ie = car.matrixWorld.elements;
    g.value.set(Ie[0], Ie[1], Ie[2]);
    b.value.set(Ie[4], Ie[5], Ie[6]);
    x.value.set(Ie[8], Ie[9], Ie[10]);
    A.value.set(Ie[12], Ie[13], Ie[14]);
    DT.setFromMatrix4(car.matrixWorld).transpose();
    mt.copy(Lt).negate().applyMatrix3(DT);
    hs.set(0, 1, 0).applyMatrix3(DT);
    Mt(ce);
    const pt = dt.some(yt => yt.delay <= 0) ? 1 : 1.7;
    let kt = 0;
    for (let yt = 0; yt < Ne.length; yt++) {
      const Tt = Ne[yt];
      Fs(Tt, ce, pt);
      Tt.age < 1 ? Ne[kt++] = Tt : ze.push(Tt);
    }
    Ne.length = kt;
    for (let yt = dt.length - 1; yt >= 0; yt--) {
      const Tt = dt[yt];
      if (Tt.delay > 0) {
        Tt.delay -= ce;
        continue;
      }
      if (Tt.time === 0 && (Tt.sustain || onBang == null || onBang({
        strength: Tt.strength,
        main: Tt.main
      }), Tt.sparks)) {
        const Cs = Math.round((3 + 7 * Tt.strength) * a.sparks);
        for (let vs = 0; vs < pipes.length; vs++) qe(vs, Cs);
      }
      Tt.time += ce;
      Tt.acc += ce * xie;
      const js = Math.floor(Tt.acc);
      Tt.acc -= js;
      for (let Cs = 0; Cs < js; Cs++) {
        const vs = (js - Cs - .5) / js * ce;
        for (let er = 0; er < pipes.length; er++) In(er, Tt, vs);
      }
      Le = Math.max(Le, (.9 + Tt.strength * .8) * a.flash * (Tt.sustain ? lt * .5 : 1));
      Tt.time >= Tt.duration && dt.splice(yt, 1);
    }
    const ht = Math.exp(-.7 * ce);
    for (let yt = tt.length - 1; yt >= 0; yt--) {
      const Tt = tt[yt];
      if (Tt.age += ce / Tt.life, Tt.age >= 1) {
        tt[yt] = tt[tt.length - 1];
        tt.pop();
        continue;
      }
      Tt.vel.multiplyScalar(ht);
      Tt.vel.y -= 9.8 * ce;
      Tt.pos.addScaledVector(Tt.vel, ce);
      Tt.pos.y < groundY + .02 && (Tt.pos.y = groundY + .02, Tt.vel.y < 0 && (Tt.vel.y *= -.32), Tt.vel.x *= .8, Tt.vel.z *= .8);
    }
    const ts = Ne.length;
    for (let yt = 0; yt < ts; yt++) {
      const Tt = Ne[yt],
        js = 1 - (1 - Math.min(1, Tt.age / .18)) ** 2,
        Cs = Tt.size * (.38 + .62 * js) * (1 - YN(.18, 1, Tt.age)),
        vs = yt * dd;
      y[vs] = Tt.x;
      y[vs + 1] = Tt.y;
      y[vs + 2] = Tt.z;
      y[vs + 3] = Tt.age;
      y[vs + 4] = Cs;
      y[vs + 5] = Tt.pulse;
      y[vs + 6] = Tt.strength;
      y[vs + 7] = Tt.violet;
      y[vs + 8] = Tt.vx;
      y[vs + 9] = Tt.vy;
      y[vs + 10] = Tt.vz;
      y[vs + 11] = Tt.pipeX;
    }
    if (fe.count = Math.max(1, ts), fe.visible = ts > 0, ts > 0 && (_.clearUpdateRanges(), _.addUpdateRange(0, ts * dd), _.needsUpdate = true), Pe(), Le *= Math.exp(-14 * ce), lightPools != null && lightPools.setFlash) {
      Gt(0);
      const yt = Xy.clone();
      Gt(pipes.length - 1);
      yt.add(Xy).multiplyScalar(.5).addScaledVector(rg, 1.6);
      lightPools.setFlash(yt.x, yt.z, Le > .02 ? Le : 0);
    }
  }
  return {
    burst: st,
    setNitro: it,
    update: Pt,
    setPipes(ce) {
      ce != null && ce.length && (pipes = ce.map(ke => ({
        x: ke.x,
        y: ke.y,
        z: ke.z
      })), m());
    },
    params: a,
    objects: [fe, ie],
    get active() {
      return Ne.length + tt.length + dt.length > 0;
    },
    stats: () => ({
      flames: Ne.length,
      sparks: tt.length,
      bursts: dt.length,
      nitro: lt,
      flameData: y
    }),
    dispose() {
      fe.removeFromParent();
      ie.removeFromParent();
      te.dispose();
      me.dispose();
      V.dispose();
      xe.dispose();
    }
  };
}
