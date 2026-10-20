// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Float32BufferAttribute, CylinderGeometry, BoxGeometry, BufferGeometry, BufferAttribute, MeshStandardNodeMaterial } from "three/webgpu";
import { attribute, step, mix, vec3, float } from "three/tsl";
import { createInstancedPlacements } from "./instancedPlacements.ts";
export const Fre = {
  mass: 180,
  half: [.14, .14],
  breakSpeed: 20 / 3.6,
  vanishAfter: 20
};
export function y3({
  headOnly = false
} = {}) {
  const e = [],
    t = (n, r) => {
      n.deleteAttribute("uv");
      const o = n.attributes.position.count;
      n.setAttribute("lampGlow", new Float32BufferAttribute(new Array(o).fill(r), 1));
      e.push(n.index ? n.toNonIndexed() : n);
    };
  if (!headOnly) {
    const n = new CylinderGeometry(.07, .11, 7.4, 6, 1);
    n.translate(0, 3.7, 0);
    t(n, 0);
    const r = new BoxGeometry(.08, .08, 2.5);
    r.translate(0, 7.3, 1.2);
    t(r, 0);
    const o = new BoxGeometry(.42, .14, .95);
    o.translate(0, 7.28, 2.35);
    t(o, 0);
  }
  const s = new BoxGeometry(.34, .04, .8);
  s.translate(0, 7.19, 2.35);
  t(s, 1);
  return Dre(e);
}
export function Dre(i) {
  const e = ["position", "normal", "lampGlow"],
    t = {
      position: 3,
      normal: 3,
      lampGlow: 1
    };
  let s = 0;
  for (const r of i) s += r.attributes.position.count;
  const n = new BufferGeometry();
  for (const r of e) {
    const o = new Float32Array(s * t[r]);
    let a = 0;
    for (const l of i) o.set(l.attributes[r].array, a), a += l.attributes[r].array.length;
    n.setAttribute(r, new BufferAttribute(o, t[r]));
  }
  n.computeBoundingSphere();
  n.computeBoundingBox();
  return n;
}
export function createStreetLamps({
  lamps = [],
  groundY: groundY,
  drawDistance = 900,
  occlusion = null
}) {
  const n = attribute("lampGlow", "float"),
    r = attribute("seed", "float"),
    o = step(1.5, r),
    a = r.sub(o.mul(2)),
    l = new MeshStandardNodeMaterial();
  l.name = "street-lamps";
  const c = mix(vec3(1, .62, .3), vec3(.72, .85, 1), a);
  l.colorNode = mix(vec3(.025, .025, .028), mix(c, vec3(.06), o), n);
  l.roughnessNode = mix(float(.45), float(.3), n);
  l.metalnessNode = mix(float(.7), float(0), n);
  l.emissiveNode = c.mul(n.mul(o.oneMinus()).mul(3.2));
  const u = y3(),
    d = [{
      width: 1,
      depth: 3,
      height: 7.5,
      geometries: [u, u, y3({
        headOnly: true
      })]
    }],
    h = [],
    f = [];
  for (let m = 0; m < lamps.length; m += 4) h.push(0, lamps[m], lamps[m + 1], lamps[m + 2], 1), f.push(lamps[m + 3] ? 1 : 0);
  const p = createInstancedPlacements({
    name: "city:lamps",
    assets: d,
    placements: h,
    material: l,
    groundY: groundY,
    lodDistances: [120, 260],
    maxDistance: drawDistance,
    cellSize: 128,
    seedOf: m => f[m],
    occlusion: occlusion
  });
  for (const m of p.meshes) for (const A of m) A.receiveShadow = false;
  return {
    root: p.root,
    layer: p,
    assets: d,
    placements: h,
    count: f.length,
    physicsOf: () => Fre,
    setLit(m, A) {
      p.setSeed(m, f[m] + (A ? 0 : 2));
    },
    update: (m, A) => p.update(m, A),
    dispose() {
      p.dispose();
      l.dispose();
      for (const m of new Set(d[0].geometries)) m.dispose();
    }
  };
}
export const Ore = {
  trash_cart: {
    mass: 45
  },
  trash_cart_big: {
    mass: 110
  },
  dumpster: {
    mass: 380
  },
  barrel: {
    mass: 70
  },
  bag: {
    mass: 9
  },
  crate: {
    mass: 25
  },
  crate_big: {
    mass: 80
  },
  stop_sign: {
    mass: 28
  },
  truck: {
    static: true
  }
};
