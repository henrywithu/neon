// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { MeshStandardNodeMaterial, Color, Matrix4, MeshBasicNodeMaterial, AdditiveBlending } from "three/webgpu";
import { uniform, step, cameraPosition, modelWorldMatrix, vec4, positionGeometry, normalGeometry, vec3, positionWorld, smoothstep, abs, float, output, faceDirection } from "three/tsl";
const t = [{
    name: "MOLTEN ORANGE",
    hex: "#ff6a12",
    rgb: [1, .36, .04]
  }, {
    name: "ELECTRIC CYAN",
    hex: "#12e6ff",
    rgb: [.02, .82, 1]
  }, {
    name: "HOT MAGENTA",
    hex: "#ff1aa8",
    rgb: [1, .06, .58]
  }, {
    name: "ACID GOLD",
    hex: "#ffcc14",
    rgb: [1, .72, .04]
  }, {
    name: "ULTRAVIOLET",
    hex: "#8a3cff",
    rgb: [.48, .14, 1]
  }, {
    name: "TOXIC LIME",
    hex: "#8cff1a",
    rgb: [.42, 1, .06]
  }, {
    name: "PLASMA RED",
    hex: "#ff1f3a",
    rgb: [1, .05, .14]
  }, {
    name: "ICE BLUE",
    hex: "#4d8cff",
    rgb: [.2, .46, 1]
  }],
  te = new Set(["paint", "trim", "chrome", "rim", "tire"]);
function oe(o) {
  var r;
  return ((r = /^[a-z0-9]+(?:-[a-z0-9]+)?_(paint|glass|trim|chrome|neon|headlight|taillight|tire|rim)$/.exec((o == null ? undefined : o.name) ?? "")) == null ? undefined : r[1]) ?? null;
}
function re(o) {
  if (o.isNodeMaterial) return o;
  const r = new MeshStandardNodeMaterial();
  for (const c of ["name", "color", "roughness", "metalness", "map", "normalMap", "side", "envMapIntensity"]) {
    const n = o[c];
    n !== undefined && (n != null && n.isColor || n != null && n.isVector2 ? r[c].copy(n) : r[c] = n);
  }
  return r;
}
function le(o, {
  root = o,
  glow = 2.2,
  groundY = -5.4,
  neon = true
} = {}) {
  const N = uniform(new Color(...t[0].rgb)),
    L = uniform(glow),
    m = uniform(0),
    C = uniform(0),
    I = uniform(new Matrix4()),
    u = new MeshBasicNodeMaterial({
      side: AdditiveBlending
    });
  u.name = "car_neon";
  u.colorNode = N.mul(L);
  u.emissiveNode = N;
  const V = step(cameraPosition.y, uniform(groundY)),
    X = modelWorldMatrix.mul(vec4(positionGeometry, 1)).xyz.distance(cameraPosition).mul(.0028).min(.07).mul(V);
  u.positionNode = positionGeometry.add(normalGeometry.mul(X.div(modelWorldMatrix.element(0).xyz.length())));
  const f = new MeshBasicNodeMaterial({
    side: AdditiveBlending
  });
  f.name = "car_headlight";
  const T = vec3(.78, .9, 1).mul(7);
  f.colorNode = T;
  f.emissiveNode = T;
  const Y = I.mul(vec4(positionWorld, 1)).xyz,
    $ = smoothstep(.62, .48, abs(Y.x)),
    G = vec3(1, .03, .06).mul(float(1.6).add(m.mul(3.4))).add(vec3(1, .96, .9).mul(C.mul($).mul(4))),
    h = new MeshBasicNodeMaterial({
      side: AdditiveBlending
    });
  h.name = "car_taillight";
  h.colorNode = G;
  h.emissiveNode = G;
  const g = uniform(new Color(1, 1, 1));
  let v = false;
  const O = new Map([["neon", u], ["headlight", f], ["taillight", h]]),
    b = new Map();
  o.traverse(e => {
    if (!e.isMesh) return;
    const z = (Array.isArray(e.material) ? e.material : [e.material]).map(a => {
      if (!a) return a;
      const M = oe(a);
      if (O.has(M)) return O.get(M);
      if (!te.has(M)) return a;
      if (!b.has(a)) {
        const i = re(a);
        i.side = AdditiveBlending;
        i.outputNode = vec4(output.rgb.mul(faceDirection.max(0)), output.a);
        M === "paint" && (v || g.value.copy(i.color), v = true, i.colorNode = vec4(g, 1));
        i.needsUpdate = true;
        b.set(a, i);
      }
      return b.get(a);
    });
    e.material = Array.isArray(e.material) ? z : z[0];
  });
  const S = {
      update({
        braking = 0,
        reversing = false
      } = {}) {
        root.updateMatrixWorld();
        I.value.copy(root.matrixWorld).invert();
        m.value += (Math.min(1, braking) - m.value) * .5;
        C.value = reversing ? 1 : 0;
      },
      setBrake(e) {
        m.value = e;
      }
    },
    D = v ? {
      color: g.value,
      set(e) {
        g.value.set(e);
      }
    } : null;
  if (!neon) return {
    lights: S,
    paint: D
  };
  let l = 0,
    d = null;
  const p = {
    rgb: [...t[0].rgb],
    intensity: 2.6,
    width: 3.4,
    length: 5.8
  };
  function R(e) {
    N.value.setRGB(...e);
    p.rgb[0] = e[0];
    p.rgb[1] = e[1];
    p.rgb[2] = e[2];
  }
  function w(e) {
    d = null;
    l = (e % t.length + t.length) % t.length;
    R(t[l].rgb);
    return t[l];
  }
  w(Math.floor(Math.random() * t.length));
  return {
    palette: t,
    get index() {
      return l;
    },
    get current() {
      return d ?? t[l];
    },
    setIndex: w,
    setStyle(e) {
      d = e;
      R(e.rgb);
      return e;
    },
    get styled() {
      return d !== null;
    },
    next() {
      if (d) return null;
      const e = 1 + Math.floor(Math.random() * (t.length - 1));
      return w(l + e);
    },
    underglow: p,
    glow: L,
    lights: S,
    paint: D
  };
}
export { t as NEON_PALETTE, le as applyNeonLook, oe as materialRole };
