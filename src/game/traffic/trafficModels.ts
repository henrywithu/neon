// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Float32BufferAttribute, BufferGeometry, BufferAttribute, Shape, Vector2, ExtrudeGeometry, CylinderGeometry, BoxGeometry, MeshStandardNodeMaterial, Matrix3, Vector3, Box3, Uint32BufferAttribute, Uint16BufferAttribute, Matrix4, Quaternion } from "three/webgpu";
import { attribute, step, float, smoothstep, positionGeometry, abs, normalGeometry, mix, vec3, select, texture, cos, sin, positionLocal, uv } from "three/tsl";
import { createGltfLoaders } from "../../world/loaders/createGltfLoaders.ts";
export const spe = "/models/game/npc_car.glb";
export const npe = 0;
export const ipe = 1;
export const rpe = 2;
export const ope = 3;
export function Mb(i, e) {
  const t = i.index ? i.toNonIndexed() : i;
  t.deleteAttribute("uv");
  t.setAttribute("carPart", new Float32BufferAttribute(new Array(t.attributes.position.count).fill(e), 1));
  return t;
}
export function ape(i) {
  const e = ["position", "normal", "carPart"],
    t = {
      position: 3,
      normal: 3,
      carPart: 1
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
  return n;
}
export function lpe({
  length = 4.5,
  width = 1.9
} = {}) {
  const t = length / 2,
    s = [[-t, .22], [t - .05, .22], [t, .32], [t - .02, .62], [t - .6, .78], [.75, .86], [.15, 1.3], [-.95, 1.33], [-1.55, .95], [-t + .08, .86], [-t, .6]],
    n = new Shape(s.map(([l, c]) => new Vector2(l, c))),
    r = new ExtrudeGeometry(n, {
      depth: width,
      bevelEnabled: true,
      bevelThickness: .06,
      bevelSize: .05,
      bevelSegments: 1,
      curveSegments: 1
    });
  r.rotateY(-Math.PI / 2);
  r.translate(width / 2, 0, 0);
  r.computeVertexNormals();
  const o = [Mb(r, npe)];
  for (const [l, c] of [[-width / 2 - .02, t - 1.05], [width / 2 + .02, t - 1.05], [-width / 2 - .02, -t + 1], [width / 2 + .02, -t + 1]]) {
    const u = new CylinderGeometry(.35, .35, .24, 12, 1);
    u.rotateZ(Math.PI / 2);
    u.translate(l, .34, c);
    o.push(Mb(u, ipe));
  }
  for (const l of [-1, 1]) {
    const c = new BoxGeometry(.42, .1, .06);
    c.translate(l * (width / 2 - .32), .6, t + .02);
    o.push(Mb(c, rpe));
  }
  const a = new BoxGeometry(width - .2, .07, .06);
  a.translate(0, .74, -t - .02);
  o.push(Mb(a, ope));
  return ape(o);
}
export function cpe() {
  const i = attribute("carPart", "float"),
    e = attribute("carColor", "vec3"),
    t = attribute("carState", "vec4"),
    s = step(.5, i).mul(step(i, 1.5)),
    n = step(1.5, i).mul(step(i, 2.5)),
    r = step(2.5, i),
    a = float(1).sub(s).sub(n).sub(r).mul(smoothstep(.9, .95, positionGeometry.y)).mul(step(abs(normalGeometry.y), .75)),
    l = new MeshStandardNodeMaterial();
  l.name = "traffic-cars";
  const c = mix(e, vec3(.01, .012, .016), a);
  l.colorNode = select(s.greaterThan(.5), vec3(.02), select(n.add(r).greaterThan(.5), vec3(.05), c));
  l.roughnessNode = mix(mix(float(.28), float(.05), a), float(.8), s);
  l.metalnessNode = mix(float(.55), float(.1), a.add(s).min(1));
  const u = t.x;
  l.emissiveNode = vec3(1, .95, .85).mul(n.mul(3)).add(vec3(1, .05, .08).mul(r.mul(float(1.1).add(u.mul(2.4)))));
  return l;
}
export const Sk = [[.02, .02, .022], [.05, .052, .06], [.12, .12, .13], [.35, .36, .38], [.14, .02, .025], [.02, .05, .09], [.08, .02, .12], [.55, .38, .02], [.55, .38, .02], [.6, .6, .62]];
export const upe = .0135;
export function dpe(i, e) {
  const t = i.geometry,
    s = t.attributes.position,
    n = t.attributes.normal,
    r = t.attributes.uv,
    o = s.count,
    a = new Float32Array(o * 3),
    l = new Float32Array(o * 3),
    c = new Float32Array(o * 2),
    u = new Matrix3().getNormalMatrix(i.matrixWorld),
    d = new Vector3(),
    h = new Box3();
  for (let A = 0; A < o; A++) d.fromBufferAttribute(s, A).applyMatrix4(i.matrixWorld), d.toArray(a, A * 3), h.expandByPoint(d), d.fromBufferAttribute(n, A).applyMatrix3(u).normalize(), d.toArray(l, A * 3), c[A * 2] = r.getX(A), c[A * 2 + 1] = r.getY(A);
  const f = h.getCenter(new Vector3()),
    p = new Float32Array(o * 4);
  for (let A = 0; A < o; A++) p[A * 4] = f.y, p[A * 4 + 1] = f.z, p[A * 4 + 2] = e ? 1 : 0;
  const m = t.index ? Array.from(t.index.array) : Array.from({
    length: o
  }, (A, g) => g);
  return {
    position: a,
    normal: l,
    uvs: c,
    wheelData: p,
    index: m,
    count: o
  };
}
export function hpe(i) {
  const e = i.map(u => dpe(u, u.name.includes("_wheel_"))),
    t = e.reduce((u, d) => u + d.count, 0),
    s = new Float32Array(t * 3),
    n = new Float32Array(t * 3),
    r = new Float32Array(t * 2),
    o = new Float32Array(t * 4),
    a = [];
  let l = 0;
  for (const u of e) {
    s.set(u.position, l * 3);
    n.set(u.normal, l * 3);
    r.set(u.uvs, l * 2);
    o.set(u.wheelData, l * 4);
    for (const d of u.index) a.push(d + l);
    l += u.count;
  }
  const c = new BufferGeometry();
  c.setAttribute("position", new BufferAttribute(s, 3));
  c.setAttribute("normal", new BufferAttribute(n, 3));
  c.setAttribute("uv", new BufferAttribute(r, 2));
  c.setAttribute("carWheel", new BufferAttribute(o, 4));
  c.setIndex(t > 65535 ? new Uint32BufferAttribute(a, 1) : new Uint16BufferAttribute(a, 1));
  c.computeBoundingSphere();
  return c;
}
export async function fpe(i, e = spe) {
  var o;
  const t = await createGltfLoaders(i).loadAsync(e);
  t.scene.updateMatrixWorld(true);
  const s = [];
  t.scene.traverse(a => {
    a.isMesh && s.push(a);
  });
  const n = (o = s[0]) == null ? undefined : o.material;
  if (!(n != null && n.map)) throw new Error(`${e}: no textured material`);
  const r = ["lod0", "lod1"].map(a => hpe(s.filter(l => l.name.startsWith(`${a}_`))));
  if (r.some(a => a.attributes.position.count === 0)) throw new Error(`${e}: missing LOD nodes`);
  for (const a of s) a.geometry.dispose();
  return {
    lods: r,
    maps: {
      color: n.map,
      orm: n.metalnessMap ?? n.roughnessMap,
      normal: n.normalMap,
      emissive: n.emissiveMap
    }
  };
}
export function ppe(i) {
  const e = attribute("carColor", "vec3"),
    t = attribute("carState", "vec4"),
    s = attribute("carWheel", "vec4"),
    n = texture(i.color, uv()),
    r = texture(i.orm, uv()),
    o = r.g,
    a = r.b,
    l = smoothstep(.08, .03, abs(o.sub(.1))).mul(smoothstep(.1, .04, abs(a.sub(.2)))),
    c = n.rgb.mul(e.div(upe)),
    u = new MeshStandardNodeMaterial();
  u.name = "npc-cars";
  u.colorNode = mix(n.rgb, c, l);
  u.roughnessNode = o;
  u.metalnessNode = a;
  u.aoNode = r.r;
  i.normal && (u.normalMap = i.normal);
  const d = texture(i.emissive, uv()).rgb,
    h = smoothstep(.1, .3, d.r.sub(d.b));
  u.emissiveNode = d.mul(float(2.2).add(h.mul(t.x).mul(4)));
  const f = t.z,
    p = t.w,
    m = positionGeometry.y.sub(s.x),
    A = positionGeometry.z.sub(s.y),
    g = cos(f),
    b = sin(f),
    x = m.mul(g).sub(A.mul(b)).sub(m).mul(s.z),
    y = m.mul(b).add(A.mul(g)).sub(A).mul(s.z);
  u.positionNode = positionLocal.add(vec3(y.mul(sin(p)), x, y.mul(cos(p))));
  return u;
}
export const mpe = new Matrix4();
export const Pl = new Vector3();
export const sv = new Quaternion();
export const gpe = new Vector3(1, 1, 1);
export const Ape = new Vector3(0, 1, 0);
export const Lf = {
  x: 0,
  z: 0,
  yaw: 0
};
export const kf = {
  x: .98,
  y: .56,
  z: 2.37
};
