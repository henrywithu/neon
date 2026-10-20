// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { BufferGeometry, BufferAttribute, Sphere, Vector3, Color, MeshBasicNodeMaterial, AdditiveBlending, Mesh, PlaneGeometry } from "three/webgpu";
import { uniform, abs, fract, smoothstep, float, mix, vec3, vec4, mrt, select, uv } from "three/tsl";
export const Lg = 2;
export const kG = 420;
export const xd = Math.ceil(kG / Lg) + 2;
export function createGpsRibbon({
  scene: scene,
  groundY: groundY,
  layer = null,
  width = 2.4,
  color = "#6de6ff"
}) {
  const r = new Float32Array(xd * 2 * 3),
    o = new Float32Array(xd * 2 * 2),
    a = new Uint16Array((xd - 1) * 6);
  for (let X = 0; X < xd - 1; X++) {
    const ae = X * 2;
    a.set([ae, ae + 1, ae + 2, ae + 1, ae + 3, ae + 2], X * 6);
  }
  const l = new BufferGeometry();
  l.setAttribute("position", new BufferAttribute(r, 3));
  l.setAttribute("uv", new BufferAttribute(o, 2));
  l.setIndex(new BufferAttribute(a, 1));
  l.setDrawRange(0, 0);
  l.boundingSphere = new Sphere(new Vector3(), 1e6);
  const c = uniform(0),
    u = uniform(1),
    d = uniform(0),
    h = uniform(new Color(color)),
    f = uv().x,
    p = abs(uv().y.sub(.5)).mul(2),
    m = fract(f.sub(d).add(p.mul(1.3)).div(4.5).sub(c.mul(.8))),
    A = smoothstep(0, .06, m).mul(smoothstep(.34, .26, m)),
    g = smoothstep(1, .72, p),
    b = smoothstep(2, 7, f).mul(smoothstep(u, u.sub(60), f)),
    x = float(.45).add(A.mul(.85)).mul(g).mul(b),
    y = mix(h, vec3(1, .85, .95), A.mul(.35)),
    _ = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      side: AdditiveBlending
    });
  _.colorNode = vec4(y.mul(1.6), x);
  _.mrtNode = mrt({
    emissive: vec4(y.mul(A.mul(.8).add(.15).mul(g).mul(b)), x)
  });
  _.polygonOffset = true;
  _.polygonOffsetFactor = -2;
  _.polygonOffsetUnits = -2;
  const w = new Mesh(l, _);
  w.name = "GpsRibbon";
  w.frustumCulled = false;
  w.renderOrder = 5;
  w.visible = false;
  layer !== null && w.layers.set(layer);
  scene.add(w);
  const S = uniform(1),
    T = uv().x,
    v = uv().y,
    E = select(S.greaterThan(0), T.oneMinus(), T),
    C = fract(E.mul(3).add(c.mul(1.4))),
    M = abs(v.sub(.5)).mul(1.1),
    B = fract(C.sub(M)),
    R = smoothstep(.1, .18, B).mul(smoothstep(.52, .44, B)).mul(smoothstep(.5, .42, abs(v.sub(.5)))),
    I = smoothstep(.5, .47, abs(T.sub(.5))).mul(smoothstep(.5, .44, abs(v.sub(.5)))),
    k = mix(h, vec3(1, .9, .97), R.mul(.5)),
    L = R.mul(.95).add(I.mul(.18)),
    F = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      side: AdditiveBlending
    });
  F.colorNode = vec4(k.mul(1.8), L);
  F.mrtNode = mrt({
    emissive: vec4(k.mul(R.mul(.9)), L)
  });
  const O = new Mesh(new PlaneGeometry(7.5, 2.6), F);
  O.name = "GpsTurnBoard";
  O.visible = false;
  O.renderOrder = 6;
  layer !== null && O.layers.set(layer);
  scene.add(O);
  const H = groundY + .05;
  let W = "";
  function P(X, ae, ne) {
    let se = {
      i: 0,
      t: 0,
      d: 1 / 0
    };
    const re = Math.min(X.length - 1, 40);
    for (let le = X.length > 2 ? 1 : 0; le < re; le++) {
      const [we, Se] = X[le],
        [ye, U] = X[le + 1],
        J = ye - we,
        Q = U - Se,
        j = J * J + Q * Q || 1,
        de = Math.max(0, Math.min(1, ((ae - we) * J + (ne - Se) * Q) / j)),
        K = Math.hypot(we + J * de - ae, Se + Q * de - ne);
      K < se.d && (se = {
        i: le,
        t: de,
        d: K
      });
    }
    return se;
  }
  function z(X, ae, ne) {
    if (c.value += X, !(ae != null && ae.points) || ae.points.length < 2) return w.visible = false, O.visible = false, W = "", null;
    const se = ae.points,
      {
        i: re,
        t: le
      } = P(se, ne.x, ne.z);
    let we = 0;
    for (let Ce = re; Ce < se.length - 1; Ce++) {
      const Ue = Math.hypot(se[Ce + 1][0] - se[Ce][0], se[Ce + 1][1] - se[Ce][1]);
      we += Ce === re ? Ue * (1 - le) : Ue;
    }
    let Se = 0;
    const ye = `${se.length}:${se.at(-1)[0]}:${re}:${le * 20 | 0}:${Math.round(ne.x)}:${Math.round(ne.z)}:${Math.round((ne.heading ?? 0) * 20)}`,
      U = [];
    let J = re,
      [Q, j] = se[J];
    const [de, K] = se[J + 1];
    Q += (de - Q) * le;
    j += (K - j) * le;
    let V = 0;
    U.push([Q, j, 0]);
    let te = 0;
    for (; J < se.length - 1 && V < kG && U.length < xd;) {
      const [Ce, Ue] = se[J + 1],
        Ae = Math.hypot(Ce - Q, Ue - j);
      if (Ae < 1e-6) {
        J++;
        continue;
      }
      let Be = Lg - te;
      for (; Be <= Ae && U.length < xd;) {
        const He = Be / Ae;
        V += Lg;
        U.push([Q + (Ce - Q) * He, j + (Ue - j) * He, V]);
        Be += Lg;
      }
      te = Ae - (Be - Lg);
      Q = Ce;
      j = Ue;
      J++;
    }
    const fe = se.at(-1);
    if (U.length < xd && J >= se.length - 1) {
      const Ce = U.at(-1),
        Ue = Math.hypot(fe[0] - Ce[0], fe[1] - Ce[1]);
      Ue > .2 && U.push([fe[0], fe[1], Ce[2] + Ue]);
    }
    if (Number.isFinite(ne.heading)) {
      const Ce = Math.sin(ne.heading),
        Ue = Math.cos(ne.heading);
      let Ae = 0;
      for (; Ae < U.length - 2 && U[Ae][2] < 30 && (U[Ae][0] - ne.x) * Ce + (U[Ae][1] - ne.z) * Ue < 2.5;) Ae++;
      if (Ae > 0) {
        Se = U[Ae][2];
        U.splice(0, Ae);
        for (const Be of U) Be[2] -= Se;
      }
    }
    if (U.length < 2) return w.visible = false, U;
    if (ye !== W) {
      W = ye;
      const Ce = width / 2;
      for (let Ue = 0; Ue < U.length; Ue++) {
        const Ae = U[Ue],
          Be = U[Math.max(0, Ue - 1)],
          He = U[Math.min(U.length - 1, Ue + 1)];
        let at = He[0] - Be[0],
          Re = He[1] - Be[1];
        const Fe = Math.hypot(at, Re) || 1;
        at /= Fe;
        Re /= Fe;
        const Je = -Re * Ce,
          je = at * Ce;
        r.set([Ae[0] + Je, H, Ae[1] + je, Ae[0] - Je, H, Ae[1] - je], Ue * 6);
        o.set([Ae[2], 0, Ae[2], 1], Ue * 4);
      }
      l.attributes.position.needsUpdate = true;
      l.attributes.uv.needsUpdate = true;
      l.setDrawRange(0, (U.length - 1) * 6);
      u.value = U.at(-1)[2];
      d.value = we - Se;
    }
    w.visible = true;
    return U;
  }
  let Y = null;
  function G(X) {
    if (!X) {
      O.visible = false;
      Y = null;
      return;
    }
    if (Y && Y.side === X.side && Math.hypot(X.x - Y.x, X.z - Y.z) < 8) {
      O.visible = true;
      return;
    }
    Y = {
      x: X.x,
      z: X.z,
      side: X.side
    };
    O.position.set(X.x + X.dirX * 10, groundY + 3.4, X.z + X.dirZ * 10);
    O.lookAt(X.x - X.dirX * 40, groundY + 2.6, X.z - X.dirZ * 40);
    S.value = X.side > 0 ? -1 : 1;
    O.visible = true;
  }
  return {
    mesh: w,
    update: z,
    setTurn: G,
    hide() {
      w.visible = false;
      O.visible = false;
      Y = null;
      W = "";
    },
    dispose() {
      scene.remove(w, O);
      l.dispose();
      _.dispose();
      O.geometry.dispose();
      F.dispose();
    }
  };
}
export const Mfe = 35 * Math.PI / 180;
export const KE = i => Math.atan2(Math.sin(i), Math.cos(i));
export const jE = (i, e, t, s) => Math.atan2(t - i, s - e);
export const jS = i => i >= 1e3 ? `${(i / 1e3).toFixed(1)} KM` : `${Math.max(10, Math.round(i / 10) * 10)} M`;
export function FG(i) {
  const t = s => KE(jE(i[s][0], i[s][1], i[s + 5][0], i[s + 5][1]) - jE(i[s - 5][0], i[s - 5][1], i[s][0], i[s][1]));
  for (let s = 7; s < i.length - 5; s++) {
    const n = t(s);
    if (Math.abs(n) <= Mfe) continue;
    let r = s,
      o = n;
    for (let a = s + 1; a < Math.min(i.length - 5, s + 5); a++) {
      const l = t(a);
      Math.abs(l) > Math.abs(o) && (r = a, o = l);
    }
    return {
      index: r,
      s: i[r][2],
      turn: Math.sign(o),
      angle: Math.abs(o)
    };
  }
  return null;
}
