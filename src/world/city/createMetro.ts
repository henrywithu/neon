// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { k2, createInstancedPlacements, createBlockProxies } from "./instancedPlacements.ts";
import { e0, createOcclusion, T3, Wre, $re } from "./occlusion.ts";
import { loadBuildingKit } from "./buildingKit.ts";
import { TextureLoader, NoColorSpace, LinearFilter, Group, Vector3, Matrix4, Quaternion, BoxGeometry, Mesh, MeshBasicMaterial } from "three/webgpu";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { loadAdAtlas } from "../billboards/loadBillboards.ts";
import { createBuildingMaterial } from "../../shaders/buildingMaterial.ts";
import { createSignLighting } from "./signLighting.ts";
import { dl, Mu, B0, A1 } from "./instanceStorage.ts";
import { createCityScreens } from "./screens.ts";
import { createCityProps } from "./props.ts";
import { createWires } from "./wires.ts";
import { createWater } from "../ground/water.ts";
import { createHighways } from "./highways.ts";
import { createCanals } from "./canals.ts";
import { createCurbs } from "./curbs.ts";
import { createStreetLamps } from "./lamps.ts";
import { createLightPools } from "./lightPools.ts";
import { cie } from "../car/carProxies.ts";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildObjectBvh } from "../bvh.ts";
export function Kre(i, e = 64) {
  const t = [],
    s = new Map(),
    n = (o, a) => o * 100003 + a;
  for (const o of i) for (let a = 0; a < o.points.length - 1; a++) {
    const [l, c] = o.points[a],
      [u, d] = o.points[a + 1],
      h = t.length;
    t.push({
      x0: l,
      z0: c,
      x1: u,
      z1: d,
      width: o.width
    });
    const f = Math.floor(Math.min(l, u) / e),
      p = Math.floor(Math.max(l, u) / e),
      m = Math.floor(Math.min(c, d) / e),
      A = Math.floor(Math.max(c, d) / e);
    for (let g = m; g <= A; g++) for (let b = f; b <= p; b++) {
      const x = n(b, g);
      s.has(x) || s.set(x, []);
      s.get(x).push(h);
    }
  }
  function r(o, a, l = null, c = 12) {
    const u = Math.floor(o / e),
      d = Math.floor(a / e);
    let h = null,
      f = 1 / 0;
    for (let p = 0; p <= c; p++) {
      for (let m = -p; m <= p; m++) for (let A = -p; A <= p; A++) {
        if (Math.max(Math.abs(A), Math.abs(m)) !== p) continue;
        const g = s.get(n(u + A, d + m));
        if (g) for (const b of g) {
          const x = t[b],
            y = x.x1 - x.x0,
            _ = x.z1 - x.z0,
            w = y * y + _ * _ || 1,
            S = Math.max(0, Math.min(1, ((o - x.x0) * y + (a - x.z0) * _) / w)),
            T = x.x0 + y * S,
            v = x.z0 + _ * S,
            E = Math.hypot(T - o, v - a);
          E < f && (f = E, h = {
            x: T,
            z: v,
            yaw: Math.atan2(y, _),
            width: x.width,
            distance: E
          });
        }
      }
      if (h && f < p * e) break;
    }
    if (h && l !== null) {
      const p = Math.atan2(Math.sin(l - h.yaw), Math.cos(l - h.yaw));
      Math.abs(p) > Math.PI / 2 && (h.yaw += Math.PI);
    }
    return h;
  }
  return {
    nearestPose: r,
    segmentCount: t.length
  };
}
export function jre(i, e = [], t = 0) {
  const s = [],
    n = r => r - Math.floor(r);
  for (let r = 0; r * 6 < e.length; r++) {
    const o = i[e[r * 6]],
      a = e[r * 6 + 2];
    if (!(o != null && o.glow) || a > 15) continue;
    const l = k2(r + t);
    if (n(l * 13.7) < .06) continue;
    const c = n(l * 5.9) * .6 + .55,
      u = e[r * 6 + 1],
      d = e[r * 6 + 3],
      h = e[r * 6 + 4],
      f = e[r * 6 + 5],
      p = o.depth * f * .5 + 2.2 + a * .25,
      m = Math.max(o.width, o.height * .6) * f;
    s.push({
      x: u + Math.sin(h) * p,
      z: d + Math.cos(h) * p,
      yaw: h,
      sx: m + 6 + a * .4,
      sz: 8 + a * .8,
      rgb: o.glow,
      intensity: .9 * c * Math.max(.12, 1 - (a - 2.4) / 13) * Math.min(1.4, .6 + m * .12)
    });
  }
  return s;
}
export async function createMetro({
  scene: scene,
  renderer: renderer
}) {
  var ae, ne, se, re, le, we;
  const t = fetch(`${e0}map.json`).then(Se => Se.json()),
    [s, n, r, o] = await Promise.all([t, loadBuildingKit(renderer), t.then(Se => new TextureLoader().loadAsync(`${e0}${Se.texture.url}`)), performanceProfile.billboardsEnabled ? loadAdAtlas(renderer) : null]);
  r.colorSpace = NoColorSpace;
  r.flipY = false;
  r.generateMipmaps = false;
  r.minFilter = LinearFilter;
  r.magFilter = LinearFilter;
  r.needsUpdate = true;
  const a = new Group();
  a.name = "metro-city";
  const l = s.groundY,
    {
      material: c,
      uniforms: u,
      paletteTex: d,
      paletteCount: h,
      signLight: f
    } = createBuildingMaterial({
      palette: n.palette,
      textures: n.textures
    }),
    p = performanceProfile.cityLodScale,
    m = performanceProfile.cityOcclusion ? createOcclusion({
      width: performanceProfile.cityOcclusionResolution[0],
      height: performanceProfile.cityOcclusionResolution[1]
    }) : null,
    A = createInstancedPlacements({
      name: "city:buildings",
      assets: n.buildings,
      placements: s.buildings,
      material: c,
      groundY: l,
      lodDistances: [60 * p, 180 * p],
      maxDistance: performanceProfile.cityDrawDistance,
      occlusion: m
    }),
    g = createInstancedPlacements({
      name: "city:towers",
      assets: n.towers,
      placements: s.towers,
      material: c,
      groundY: l,
      lodDistances: [180 * p, 520 * p],
      maxDistance: performanceProfile.cityDrawDistance * 1.85,
      cellSize: 240,
      seedOffset: 1e5,
      occlusion: m
    });
  a.add(A.root, g.root);
  const b = 3e5,
    x = performanceProfile.signImpostors && performanceProfile.groundReflection && (ae = renderer == null ? undefined : renderer.backend) != null && ae.isWebGPUBackend && n.signs.length && (ne = s.signs) != null && ne.length ? createSignLighting({
      renderer: renderer,
      assets: n.signs,
      paletteTex: d,
      paletteCount: h,
      signLight: f,
      neonToSignGlow: u.neonGlow.mul(.88).div(u.signGlow),
      capacity: s.signs.length / 6,
      tileSize: performanceProfile.signImpostorTile
    }) : null,
    y = n.signs.length && (se = s.signs) != null && se.length ? createInstancedPlacements({
      name: "city:signs",
      assets: n.signs,
      placements: s.signs,
      stride: 6,
      material: c,
      groundY: l,
      lodDistances: [35 * p, 110 * p],
      maxDistance: Math.min(performanceProfile.cityDrawDistance, 360),
      cellSize: 120,
      seedOffset: b,
      mirrorImpostor: x,
      occlusion: m
    }) : null;
  if (y) {
    if (y.root.traverse(Se => Se.layers.set(dl)), x) {
      for (const Se of y.meshes) Se.forEach((ye, U) => U > 0 && ye.layers.set(Mu));
      x.mesh.layers.set(B0);
      y.root.add(x.mesh);
    }
    a.add(y.root);
  }
  const _ = (((re = s.landmarks) == null ? undefined : re.assets) ?? []).map(Se => n.towers.find(ye => ye.name === Se)),
    w = _.length && _.every(Boolean) && s.landmarks.placements.length ? createInstancedPlacements({
      name: "city:landmarks",
      assets: _,
      placements: s.landmarks.placements,
      stride: 6,
      material: c,
      groundY: l,
      lodDistances: [90 * p, 260 * p],
      maxDistance: performanceProfile.cityDrawDistance,
      cellSize: 240,
      seedOffset: 4e5,
      occlusion: m
    }) : null;
  w && (w.root.traverse(Se => Se.layers.set(dl)), a.add(w.root));
  const S = o ? createCityScreens({
    screens: s.screens ?? [],
    groundY: l,
    atlas: o,
    layer: dl
  }) : null;
  S ? a.add(S.root) : o == null || o.dispose();
  const T = [];
  for (let Se = 0; Se < s.fillers.length; Se += 7) T.push({
    x: s.fillers[Se],
    z: s.fillers[Se + 1],
    yaw: s.fillers[Se + 2],
    width: s.fillers[Se + 3],
    depth: s.fillers[Se + 4],
    height: s.fillers[Se + 5],
    seed: s.fillers[Se + 6],
    neon: s.fillers[Se + 6] % 5 === 0
  });
  const v = createBlockProxies({
    blocks: T,
    groundY: l
  });
  a.add(v.mesh);
  const E = n.props.length && (le = s.props) != null && le.length ? createCityProps({
    assets: n.props,
    placements: s.props,
    material: c,
    groundY: l,
    drawDistance: 240 * p,
    occlusion: m
  }) : null;
  E && a.add(E.root);
  const C = createWires({
    wires: s.wires ?? [],
    groundY: l
  });
  a.add(C.root);
  const M = createWater({
    scene: scene,
    y: s.waterY
  });
  scene.add(a);
  const B = createHighways({
    highways: s.highways,
    bridges: s.bridges,
    groundY: l
  });
  scene.add(B.root);
  const R = createCanals({
    lines: s.seawalls,
    groundY: l,
    waterY: s.waterY
  });
  a.add(R.mesh);
  const I = createCurbs({
    runs: s.guardrails ?? [],
    seawalls: s.seawalls ?? [],
    groundY: l
  });
  a.add(I.mesh);
  const k = createStreetLamps({
    lamps: s.lamps ?? [],
    groundY: l,
    drawDistance: performanceProfile.cityDrawDistance * .8,
    occlusion: m
  });
  a.add(k.root);
  const L = createLightPools({
    renderer: renderer,
    lamps: s.lamps ?? [],
    glows: jre(n.signs, s.signs, b)
  });
  for (const Se of [A, g]) for (const ye of Se.meshes) ye.forEach((U, J) => J < 2 && U.layers.enable(A1));
  for (const Se of [v.mesh, k.root, B.root]) Se.traverse(ye => ye.layers.enable(A1));
  const F = cie([...A.colliders(), ...g.colliders(), ...((w == null ? undefined : w.colliders()) ?? []), ...v.colliders(), ...((E == null ? undefined : E.staticColliders()) ?? [])]);
  scene.add(F.mesh);
  m == null || m.setOccluders([...A.colliders(), ...g.colliders(), ...((w == null ? undefined : w.colliders()) ?? []), ...v.colliders()]);
  const O = s.texture,
    H = O.bounds.maxX - O.bounds.minX,
    W = Kre(s.roads),
    P = {
      pos: new Vector3(1 / 0, 0, 0),
      dir: new Vector3(),
      time: -1 / 0
    },
    z = new Vector3();
  function Y(Se, ye) {
    Se.getWorldDirection(z);
    const U = P.pos.distanceToSquared(Se.position) > T3 * T3 || P.dir.dot(z) < Wre || ye - P.time > $re;
    U && (P.pos.copy(Se.position), P.dir.copy(z), P.time = ye);
    return U;
  }
  function G(Se) {
    const ye = m ? Y(Se, performance.now()) : false;
    ye && m.render(Se);
    const U = {
      force: ye
    };
    A.update(Se, U);
    g.update(Se, U);
    y == null || y.update(Se, U);
    w == null || w.update(Se, U);
    E == null || E.update(Se, U);
    C.update(Se);
    M.update(Se);
    k.update(Se, U);
    L.update(Se, {
      groundY: l
    });
  }
  function X() {
    return [...A.colliders(), ...g.colliders(), ...((w == null ? undefined : w.colliders()) ?? []), ...v.colliders(), ...((E == null ? undefined : E.staticColliders()) ?? [])];
  }
  console.info("[metro]", {
    buildings: A.count,
    towers: g.count,
    signs: (y == null ? undefined : y.count) ?? 0,
    landmarks: (w == null ? undefined : w.count) ?? 0,
    screens: (S == null ? undefined : S.count) ?? 0,
    blocks: T.length,
    roads: s.roads.length,
    highways: ((we = s.highways) == null ? undefined : we.length) ?? 0
  });
  return {
    kind: "metro",
    root: a,
    map: s,
    buildings: A,
    towers: g,
    signs: y,
    signImpostors: x,
    occlusion: m,
    landmarks: w,
    screens: S,
    blocks: v,
    water: M,
    proxies: F,
    highways: B,
    guardrails: I,
    props: E,
    lamps: k,
    lightPools: L,
    material: c,
    uniforms: u,
    spawn: s.spawn,
    bounds: s.bounds,
    landuse: {
      texture: r,
      url: `${e0}${O.url}`,
      bounds: O.bounds,
      span: H,
      size: O.size,
      roadRange: O.roadRange,
      landRange: O.landRange
    },
    update: G,
    collectColliders: X,
    nearestRoadPose: W.nearestPose,
    dispose() {
      A.dispose();
      g.dispose();
      y == null || y.dispose();
      x == null || x.dispose();
      w == null || w.dispose();
      S == null || S.dispose();
      v.dispose();
      M.dispose();
      F.dispose();
      B.dispose();
      R.dispose();
      I.dispose();
      L.dispose();
      k.dispose();
      E == null || E.dispose();
      C.dispose();
      a.removeFromParent();
    }
  };
}
export function Xre(i) {
  const e = [],
    t = new Matrix4(),
    s = new Quaternion(),
    n = new Vector3(0, 1, 0);
  for (const [a, l, c, u, d, h, f = 0] of i) {
    const p = new BoxGeometry(u * 2, d * 2, h * 2);
    p.deleteAttribute("uv");
    s.setFromAxisAngle(n, f);
    t.compose(new Vector3(a, l, c), s, new Vector3(1, 1, 1));
    p.applyMatrix4(t);
    e.push(p);
  }
  const r = mergeGeometries(e, false);
  for (const a of e) a.dispose();
  const o = new Mesh(r, new MeshBasicMaterial());
  o.name = "city-collision-proxy";
  o.visible = false;
  o.matrixAutoUpdate = false;
  o.updateMatrixWorld(true);
  buildObjectBvh(o);
  return o;
}
