// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Quaternion, Matrix4, Vector3, RenderTarget, HalfFloatType, LinearFilter, OrthographicCamera, Scene, Vector2, PlaneGeometry, InstancedBufferAttribute, MeshBasicNodeMaterial, DoubleSide, InstancedMesh, Color } from "three/webgpu";
import { uniform, attribute, exp, length, smoothstep, float, vec4, max, uv } from "three/tsl";
import { $a, To, ir } from "./curbs.ts";
import { gl } from "./instanceStorage.ts";
export const pf = new Quaternion();
export const Nre = new Matrix4();
export const A3 = new Vector3();
export const Lre = new Vector3(0, 1, 0);
export function createLightPools({
  renderer: renderer,
  lamps = [],
  glows = [],
  extent = 380,
  size = 1024,
  height = 60
}) {
  const o = new RenderTarget(size, size, {
    type: HalfFloatType,
    depthBuffer: false
  });
  o.texture.name = "LightPools";
  o.texture.minFilter = LinearFilter;
  o.texture.magFilter = LinearFilter;
  o.texture.generateMipmaps = false;
  const a = extent / 2,
    l = new OrthographicCamera(-a, a, a, -a, .1, height * 2),
    c = new Scene(),
    u = uniform(new Vector2()),
    d = uniform(1),
    h = new PlaneGeometry(1, 1);
  h.rotateX(-Math.PI / 2);
  const f = new Float32Array($a * 3),
    p = new Float32Array($a);
  h.setAttribute("poolColor", new InstancedBufferAttribute(f, 3));
  h.setAttribute("poolShape", new InstancedBufferAttribute(p, 1));
  const m = attribute("poolColor", "vec3"),
    A = attribute("poolShape", "float"),
    g = uv().mul(2).sub(1),
    b = exp(length(g).mul(length(g)).mul(-3.2)).mul(smoothstep(1, .75, length(g))),
    x = uv().y,
    y = x.mul(.8).add(.2),
    _ = g.x.div(y),
    w = exp(_.mul(_).mul(-2.5)).mul(smoothstep(0, .08, x)).mul(smoothstep(1, .35, x)).mul(float(1).sub(x.mul(.55))),
    S = b.mul(float(1).sub(A)).add(w.mul(A)),
    T = new MeshBasicNodeMaterial();
  T.name = "light-pools";
  T.transparent = true;
  T.blending = DoubleSide;
  T.depthTest = false;
  T.depthWrite = false;
  T.colorNode = vec4(m.mul(max(S, 0)), 1);
  const v = gl(new InstancedMesh(h, T, $a));
  v.frustumCulled = false;
  v.count = 0;
  c.add(v);
  const E = [1, .55, .22],
    C = [.62, .78, 1],
    M = 1.1,
    B = 11,
    R = 8,
    I = lamps.length / 4,
    k = I + glows.length,
    L = new Float32Array(k * R);
  for (let j = 0; j < I; j++) {
    const de = lamps[j * 4 + 2],
      K = lamps[j * 4 + 3] ? C : E;
    L.set([lamps[j * 4] + Math.sin(de) * 2.4, lamps[j * 4 + 1] + Math.cos(de) * 2.4, 0, B * 2, B * 2, K[0] * M, K[1] * M, K[2] * M], j * R);
  }
  glows.forEach((j, de) => {
    const K = j.intensity ?? 1;
    L.set([j.x, j.z, j.yaw ?? 0, j.sx, j.sz, j.rgb[0] * K, j.rgb[1] * K, j.rgb[2] * K], (I + de) * R);
  });
  const F = 64,
    O = new Map();
  for (let j = 0; j < k; j++) {
    const de = `${Math.floor(L[j * R] / F)},${Math.floor(L[j * R + 1] / F)}`;
    O.has(de) || O.set(de, []);
    O.get(de).push(j);
  }
  const H = [0, 0, 0];
  let W = null,
    P = true,
    z = 0,
    Y = null;
  const G = [1, .46, .14];
  let X = 0,
    ae = 0,
    ne = 0,
    se = [],
    re = [],
    le = [],
    we = [];
  const Se = new Vector2(1 / 0, 1 / 0);
  function ye(j, de) {
    if (j < 0 || j >= I) return;
    const K = lamps[j * 4 + 3] ? C : E,
      V = de ? M : 0;
    L.set([K[0] * V, K[1] * V, K[2] * V], j * R + 5);
  }
  function U(j, de, K, V, te, fe, Ce, Ue, Ae) {
    pf.setFromAxisAngle(Lre, V);
    To.set(de, 0, K);
    A3.set(te, 1, fe);
    v.setMatrixAt(j, Nre.compose(To, pf, A3));
    f[j * 3] = Ce[0] * Ue;
    f[j * 3 + 1] = Ce[1] * Ue;
    f[j * 3 + 2] = Ce[2] * Ue;
    p[j] = Ae;
  }
  function J(j, {
    groundY = -5.4
  } = {}) {
    var Te, ue, $;
    j.getWorldDirection(ir);
    ir.y = 0;
    ir.lengthSq() < 1e-6 && ir.set(0, 0, -1);
    ir.normalize();
    const K = extent / size * 4,
      V = Math.round((j.position.x + ir.x * a * .45) / K) * K,
      te = Math.round((j.position.z + ir.z * a * .45) / K) * K;
    Se.set(V, te);
    u.value.set(V, te);
    let fe = 0;
    const Ce = Math.floor((V - a) / F),
      Ue = Math.floor((V + a) / F),
      Ae = Math.floor((te - a) / F),
      Be = Math.floor((te + a) / F);
    for (let q = Ae; q <= Be && fe < $a - 4; q++) for (let oe = Ce; oe <= Ue && fe < $a - 4; oe++) {
      const xe = O.get(`${oe},${q}`);
      if (xe) for (const me of xe) {
        if (fe >= $a - 4) break;
        const ie = me * R;
        H[0] = L[ie + 5];
        H[1] = L[ie + 6];
        H[2] = L[ie + 7];
        U(fe++, L[ie], L[ie + 1], L[ie + 2], L[ie + 3], L[ie + 4], H, 1, 0);
      }
    }
    if (W && Y && (W.getWorldPosition(To), To.y < groundY + 1.2)) {
      W.getWorldQuaternion(pf);
      ir.set(0, 0, 1).applyQuaternion(pf);
      const q = Y;
      U(fe++, To.x, To.z, Math.atan2(ir.x, ir.z), q.width, q.length, q.rgb, q.intensity, 0);
    }
    if (W && P && (W.getWorldPosition(To), To.y < groundY + 1.2)) {
      W.getWorldQuaternion(pf);
      ir.set(0, 0, 1).applyQuaternion(pf);
      const q = Math.atan2(ir.x, ir.z),
        oe = 34 + 22 * z,
        xe = To.x + ir.x * (1.8 + oe / 2),
        me = To.z + ir.z * (1.8 + oe / 2);
      U(fe++, xe, me, q + Math.PI, 13 + 5 * z, oe, [1, .94, .84], 2.2 + 2.6 * z, 1);
      U(fe++, To.x, To.z, 0, 8, 8, [.9, .85, .8], .25 + .55 * z, 0);
    }
    ne > .02 && fe < $a && U(fe++, X, ae, 0, 9, 9, G, ne, 0);
    for (const q of le.length ? [...re, ...le] : re) {
      if (fe >= $a) break;
      Math.abs(q.x - V) > a + q.size || Math.abs(q.z - te) > a + q.size || U(fe++, q.x, q.z, 0, q.size, q.size, q.rgb, q.intensity, 0);
    }
    for (const q of we) {
      if (fe >= $a) break;
      Math.abs(q.x - V) > a + q.size || Math.abs(q.z - te) > a + q.size || U(fe++, q.x, q.z, 0, q.size, q.size, q.rgb, q.intensity, 0);
    }
    for (const q of se) {
      if (fe >= $a) break;
      const oe = 22,
        xe = q.x + Math.sin(q.yaw) * (2.3 + oe / 2),
        me = q.z + Math.cos(q.yaw) * (2.3 + oe / 2);
      Math.abs(xe - V) > a + oe || Math.abs(me - te) > a + oe || U(fe++, xe, me, q.yaw + Math.PI, 9, oe, [1, .93, .8], 1.3, 1);
    }
    v.count = fe;
    v.instanceMatrix.needsUpdate = true;
    v.instanceMatrix.clearUpdateRanges();
    v.instanceMatrix.addUpdateRange(0, fe * 16);
    const He = h.attributes.poolColor;
    He.clearUpdateRanges();
    He.addUpdateRange(0, fe * 3);
    He.needsUpdate = true;
    const at = h.attributes.poolShape;
    at.clearUpdateRanges();
    at.addUpdateRange(0, fe);
    at.needsUpdate = true;
    l.position.set(V, height, te);
    l.lookAt(V, 0, te);
    l.updateMatrixWorld(true);
    const Re = renderer.getRenderTarget(),
      Fe = ((Te = renderer.getMRT) == null ? undefined : Te.call(renderer)) ?? null,
      Je = renderer.getClearColor(new Color()),
      je = renderer.getClearAlpha();
    (ue = renderer.setMRT) == null || ue.call(renderer, null);
    renderer.setRenderTarget(o);
    renderer.setClearColor(0, 1);
    renderer.clear();
    renderer.render(c, l);
    renderer.setRenderTarget(Re);
    ($ = renderer.setMRT) == null || $.call(renderer, Fe);
    renderer.setClearColor(Je, je);
  }
  function Q(j) {
    return j.sub(u).div(extent).add(.5);
  }
  return {
    setLampLit: ye,
    target: o,
    texture: o.texture,
    center: u,
    intensity: d,
    extent: extent,
    uvNode: Q,
    update: J,
    setCar(j) {
      W = j;
    },
    setHeadlights(j) {
      P = !!j;
    },
    setHighBeam(j) {
      z = j;
    },
    setUnderglow(j) {
      Y = j ?? null;
    },
    setBeams(j) {
      se = j ?? [];
    },
    setMarkers(j) {
      re = j ?? [];
    },
    setStage(j) {
      le = j ?? [];
    },
    setGhostPools(j) {
      we = j ?? [];
    },
    setFlash(j, de, K) {
      X = j;
      ae = de;
      ne = K;
    },
    get lampCount() {
      return I;
    },
    dispose() {
      o.dispose();
      h.dispose();
      T.dispose();
    }
  };
}
