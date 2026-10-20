// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, Group, PlaneGeometry, InstancedBufferAttribute, MeshStandardNodeMaterial, InstancedMesh, BoxGeometry } from "three/webgpu";
import { uniform, attribute, vec2, float, smoothstep, length, vec3, uv } from "three/tsl";
import { sampleBillboardAtlas } from "../billboards/billboardMaterials.ts";
import { gl } from "./instanceStorage.ts";
import { ZT, eS, x3, _3 } from "./wires.ts";
import { k2 } from "./instancedPlacements.ts";
export const Gre = new Vector3(0, 1, 0);
export function createCityScreens({
  screens = [],
  groundY: groundY,
  atlas: atlas,
  layer = null
}) {
  const n = screens.length / 7;
  if (!n || !atlas) return null;
  const r = new Group();
  r.name = "city:ad-screens";
  const o = [atlas.runFor("square"), atlas.runFor("portrait")],
    a = uniform(1.1),
    l = new PlaneGeometry(1, 1),
    c = new Float32Array(n * 3);
  l.setAttribute("ad", new InstancedBufferAttribute(c, 3));
  const u = uv(),
    d = attribute("ad", "vec3"),
    h = sampleBillboardAtlas({
      atlas: atlas.texture,
      rects: atlas.rects,
      first: d.x,
      count: d.y,
      phase: d.z,
      st: vec2(u.x, float(1).sub(u.y))
    }),
    f = smoothstep(1, .82, length(u.sub(.5).mul(2)).mul(.78)),
    p = new MeshStandardNodeMaterial({
      roughness: .35,
      metalness: 0
    });
  p.name = "city-ad-screen";
  p.colorNode = vec3(.01);
  p.emissiveNode = h.mul(f.mul(.7).add(.3)).mul(a);
  const m = gl(new InstancedMesh(l, p, n));
  m.name = "city:ad-screens";
  const A = new BoxGeometry(1, 1, .23);
  A.translate(0, 0, -.135);
  const g = new MeshStandardNodeMaterial({
      color: 460554,
      roughness: .5,
      metalness: .6
    }),
    b = gl(new InstancedMesh(A, g, n));
  b.name = "city:ad-screen-frames";
  for (let _ = 0; _ < n; _++) {
    const w = _ * 7,
      S = o[screens[w]],
      T = screens[w + 5],
      v = screens[w + 6];
    ZT.setFromAxisAngle(Gre, screens[w + 4]);
    eS.set(screens[w + 1], groundY + screens[w + 2] + v / 2, screens[w + 3]);
    m.setMatrixAt(_, x3.compose(eS, ZT, _3.set(T, v, 1)));
    b.setMatrixAt(_, x3.compose(eS, ZT, _3.set(T + .35, v + .35, 1)));
    c[_ * 3] = S.first;
    c[_ * 3 + 1] = S.count;
    c[_ * 3 + 2] = k2(_ + 5e5);
  }
  for (const _ of [m, b]) _.instanceMatrix.needsUpdate = true, _.computeBoundingSphere(), layer !== null && _.layers.set(layer), r.add(_);
  let x = false;
  function y() {
    x || (x = true, r.visible = false);
  }
  return {
    root: r,
    count: n,
    uniforms: {
      gain: a
    },
    disable: y,
    dispose() {
      for (const _ of [l, p, A, g]) _.dispose();
      atlas.dispose();
      r.removeFromParent();
    }
  };
}
