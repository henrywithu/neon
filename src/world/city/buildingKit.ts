// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, BufferGeometry, Matrix3, BufferAttribute, RepeatWrapping, SRGBColorSpace, NoColorSpace } from "three/webgpu";
import { createGltfLoaders } from "../loaders/createGltfLoaders.ts";
import { mix, vec3, smoothstep } from "three/tsl";
export const og = "/models/game/city/";
export const ZN = new Vector3();
export function Fie(i, e) {
  const t = new BufferGeometry(),
    s = i.attributes.position.count,
    n = new Matrix3().getNormalMatrix(e),
    r = (l, c) => {
      const u = new Float32Array(s * c);
      for (let d = 0; d < s; d++) for (let h = 0; h < c; h++) u[d * c + h] = l.getComponent(d, h);
      return u;
    },
    o = r(i.attributes.position, 3);
  for (let l = 0; l < s; l++) ZN.fromArray(o, l * 3).applyMatrix4(e).toArray(o, l * 3);
  const a = r(i.attributes.normal, 3);
  for (let l = 0; l < s; l++) ZN.fromArray(a, l * 3).applyMatrix3(n).normalize().toArray(a, l * 3);
  t.setAttribute("position", new BufferAttribute(o, 3));
  t.setAttribute("normal", new BufferAttribute(a, 3));
  t.setAttribute("uv", new BufferAttribute(r(i.attributes.uv, 2), 2));
  t.setAttribute("matid", new BufferAttribute(r(i.attributes._matid, 1), 1));
  t.setIndex(i.index.clone());
  t.computeBoundingBox();
  t.computeBoundingSphere();
  return t;
}
export function GT(i, e, t) {
  return new Promise((s, n) => {
    createGltfLoaders(i).ktx2Loader.load(e, o => {
      o.wrapS = RepeatWrapping;
      o.wrapT = RepeatWrapping;
      o.colorSpace = t ? SRGBColorSpace : NoColorSpace;
      o.anisotropy = 4;
      s(o);
    }, undefined, n);
  });
}
export async function loadBuildingKit(i) {
  const [e, t] = await Promise.all([createGltfLoaders(i).loadAsync(`${og}kit.glb`), fetch(`${og}kit.json`).then(l => l.json())]),
    [s, n, r] = await Promise.all([GT(i, `${og}plaster_color.ktx2`, true), GT(i, `${og}plaster_normal.ktx2`, false), GT(i, `${og}plaster_orm.ktx2`, false)]);
  e.scene.updateMatrixWorld(true);
  const o = new Map();
  e.scene.traverse(l => {
    if (!l.isMesh) return;
    let c = l;
    for (; c.parent && c.parent !== e.scene && !o.has(c.name);) c = c.parent;
    const u = l.name || c.name,
      d = l.matrixWorld.clone();
    o.set(u, Fie(l.geometry, d));
    l.geometry.dispose();
  });
  const a = l => l.lods.map(c => o.get(c.node));
  return {
    meta: t,
    palette: t.palette,
    buildings: t.buildings.map(l => ({
      ...l,
      geometries: a(l)
    })),
    towers: t.towers.map(l => ({
      ...l,
      geometries: a(l)
    })),
    props: (t.props ?? []).map(l => ({
      ...l,
      geometries: a(l)
    })),
    signs: (t.signs ?? []).map(l => ({
      ...l,
      geometries: a(l)
    })),
    textures: {
      plasterColor: s,
      plasterNormal: n,
      plasterOrm: r
    }
  };
}
export const e3 = i => mix(mix(vec3(1, .12, .7), vec3(.08, .8, 1), smoothstep(0, .34, i)), mix(vec3(1, .55, .1), vec3(.45, 1, .2), smoothstep(.66, 1, i)), smoothstep(.3, .7, i));
