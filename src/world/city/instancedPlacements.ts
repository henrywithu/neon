// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, Matrix4, Group, InstancedBufferAttribute, InstancedMesh, Box3, BoxGeometry, MeshStandardNodeMaterial, Quaternion } from "three/webgpu";
import { Ha, s3, t3, VT, QT } from "../../shaders/buildingMaterial.ts";
import { gl } from "./instanceStorage.ts";
import { attribute, positionGeometry, abs, normalGeometry, select, mix, vec3, smoothstep, vec2, floor, fract, step, hash, float, sin, time, max } from "three/tsl";
export const n3 = new Vector3();
export const Jy = new Vector3();
export const hd = new Matrix4();
export const Oie = new Vector3(0, 1, 0);
export const qT = new Vector3();
export const Uie = .75;
export const zie = 200;
export function k2(i) {
  let e = Math.imul(i ^ 2654435769, 2246822507);
  e ^= e >>> 13;
  e = Math.imul(e, 3266489909);
  e ^= e >>> 16;
  return (e >>> 0) / 4294967296;
}
export function createInstancedPlacements({
  name: name,
  assets: assets,
  placements: placements,
  material: material,
  groundY: groundY,
  lodDistances = [80, 260],
  maxDistance = 1500,
  cellSize = 160,
  seedOffset = 0,
  stride = 5,
  seedOf = f => k2(f + seedOffset),
  mirrorImpostor = null,
  occlusion = null
}) {
  const f = new Group();
  f.name = name;
  const p = placements.length / stride,
    m = stride === 6 ? 2 : -1,
    A = stride === 6 ? 3 : 2,
    g = A + 1,
    b = A + 2,
    x = U => m < 0 ? 0 : placements[U * stride + m],
    y = new Uint16Array(p),
    _ = new Float32Array(p * 16),
    w = new Float32Array(p * 3),
    S = new Float32Array(p),
    T = new Float32Array(p),
    v = occlusion ? new Float32Array(p * 6) : null,
    E = occlusion ? assets.map(U => {
      const J = U.geometries[0];
      J.boundingBox || J.computeBoundingBox();
      return J.boundingBox;
    }) : null,
    C = U => {
      Ha.copy(E[y[U]]).applyMatrix4(hd.fromArray(_, U * 16));
      v.set([Ha.min.x, Ha.min.y, Ha.min.z, Ha.max.x, Ha.max.y, Ha.max.z], U * 6);
    },
    M = new Uint32Array(assets.length);
  for (let U = 0; U < p; U++) {
    const J = placements[U * stride],
      Q = placements[U * stride + 1],
      j = groundY + x(U),
      de = placements[U * stride + A],
      K = placements[U * stride + g],
      V = placements[U * stride + b],
      te = assets[J];
    y[U] = J;
    M[J] += 1;
    s3.setFromAxisAngle(Oie, K);
    n3.set(Q, j, de);
    Jy.setScalar(V);
    hd.compose(n3, s3, Jy);
    hd.toArray(_, U * 16);
    const fe = te.height * V;
    w[U * 3] = Q;
    w[U * 3 + 1] = j + fe * .5;
    w[U * 3 + 2] = de;
    S[U] = .5 * Math.hypot(te.width * V, te.depth * V, fe);
    T[U] = seedOf(U);
    v && C(U);
  }
  const B = assets.map((U, J) => U.geometries.map((Q, j) => {
      const de = Math.max(1, M[J]),
        K = Q.clone();
      K.setAttribute("seed", new InstancedBufferAttribute(new Float32Array(de), 1));
      const V = gl(new InstancedMesh(K, material, de));
      V.name = `${name}:${J}:lod${j}`;
      V.frustumCulled = false;
      V.count = 0;
      V.castShadow = false;
      V.receiveShadow = true;
      V.matrixAutoUpdate = false;
      f.add(V);
      return V;
    })),
    R = assets.map(U => {
      const J = U.geometries.map(de => (de.index ? de.index.count : de.attributes.position.count) / 3),
        Q = [0, 1, 2].map(de => Math.min(de, J.length - 1)),
        j = (de, K) => J[K] < J[de] * Uie && J[de] - J[K] >= zie;
      J.length > 1 && !j(0, 1) && (Q[1] = 0);
      J.length > 2 && !j(Q[1], 2) && (Q[2] = Q[1]);
      return Q;
    });
  B.forEach((U, J) => U.forEach((Q, j) => {
    Q.visible = M[J] > 0 && R[J].includes(j);
  }));
  let I = 1 / 0,
    k = 1 / 0,
    L = -1 / 0,
    F = -1 / 0;
  for (let U = 0; U < p; U++) I = Math.min(I, w[U * 3]), L = Math.max(L, w[U * 3]), k = Math.min(k, w[U * 3 + 2]), F = Math.max(F, w[U * 3 + 2]);
  const O = Math.max(1, Math.ceil((L - I + 1) / cellSize)),
    H = Math.max(1, Math.ceil((F - k + 1) / cellSize)),
    W = Array.from({
      length: O * H
    }, () => ({
      items: [],
      box: new Box3(new Vector3(1 / 0, 1 / 0, 1 / 0), new Vector3(-1 / 0, -1 / 0, -1 / 0))
    }));
  for (let U = 0; U < p; U++) {
    const J = Math.min(O - 1, Math.floor((w[U * 3] - I) / cellSize)),
      Q = Math.min(H - 1, Math.floor((w[U * 3 + 2] - k) / cellSize)),
      j = W[Q * O + J];
    j.items.push(U);
    const de = S[U];
    Ha.min.set(w[U * 3] - de, Math.min(groundY, w[U * 3 + 1] - de), w[U * 3 + 2] - de);
    Ha.max.set(w[U * 3] + de, w[U * 3 + 1] + de, w[U * 3 + 2] + de);
    j.box.union(Ha);
  }
  const P = W.filter(U => U.items.length),
    z = B.map(U => U.map(() => 0)),
    Y = {
      visible: 0,
      occluded: 0,
      lod: [0, 0, 0],
      cells: 0,
      rebuilds: 0
    };
  let G = true,
    X = -1 / 0;
  const ae = new Vector3(1 / 0, 0, 0),
    ne = new Vector3(),
    se = lodDistances[0] * lodDistances[0],
    re = lodDistances[1] * lodDistances[1];
  function le(U) {
    U.updateMatrixWorld();
    t3.multiplyMatrices(U.projectionMatrix, U.matrixWorldInverse);
    VT.setFromProjectionMatrix(t3, U.coordinateSystem);
    const J = U.position;
    for (const de of z) de.fill(0);
    let Q = 0;
    Y.visible = 0;
    Y.occluded = 0;
    Y.lod[0] = Y.lod[1] = Y.lod[2] = 0;
    Y.cells = 0;
    const j = maxDistance * maxDistance;
    for (const de of P) {
      const K = Math.max(de.box.min.x - J.x, 0, J.x - de.box.max.x),
        V = Math.max(de.box.min.z - J.z, 0, J.z - de.box.max.z);
      if (!(K * K + V * V > j) && VT.intersectsBox(de.box)) {
        Y.cells += 1;
        for (const te of de.items) {
          const fe = w[te * 3],
            Ce = w[te * 3 + 1],
            Ue = w[te * 3 + 2],
            Ae = fe - J.x,
            Be = Ue - J.z,
            He = Ae * Ae + Be * Be;
          if (He > j || (QT.center.set(fe, Ce, Ue), QT.radius = S[te], !VT.intersectsSphere(QT))) continue;
          if (v && occlusion.occludedAabb(v, te)) {
            Y.occluded += 1;
            continue;
          }
          const at = y[te],
            Re = R[at][He < se ? 0 : He < re ? 1 : 2],
            Fe = B[at][Re],
            Je = z[at][Re]++;
          if (Fe.instanceMatrix.array.set(_.subarray(te * 16, te * 16 + 16), Je * 16), Fe.geometry.attributes.seed.array[Je] = T[te], Y.lod[Re] += 1, Y.visible += 1, mirrorImpostor && Re > 0) {
            const je = Q++;
            hd.fromArray(_, te * 16).multiply(mirrorImpostor.boxMatrices[at]);
            hd.toArray(mirrorImpostor.mesh.instanceMatrix.array, je * 16);
            mirrorImpostor.assetOf[je] = at;
            mirrorImpostor.seeds[je] = T[te];
          }
        }
      }
    }
    for (let de = 0; de < B.length; de++) for (let K = 0; K < B[de].length; K++) {
      const V = B[de][K],
        te = z[de][K];
      if (V.count = te, V.visible = te > 0, te > 0) {
        V.instanceMatrix.clearUpdateRanges();
        V.instanceMatrix.addUpdateRange(0, te * 16);
        V.instanceMatrix.needsUpdate = true;
        const fe = V.geometry.attributes.seed;
        fe.clearUpdateRanges();
        fe.addUpdateRange(0, te);
        fe.needsUpdate = true;
      }
    }
    mirrorImpostor == null || mirrorImpostor.commit(Q);
    Y.rebuilds += 1;
  }
  function we(U, {
    force = false,
    now = performance.now()
  } = {}) {
    U.getWorldDirection(qT);
    const j = ae.distanceToSquared(U.position) > 36,
      de = ne.dot(qT) < .9975;
    return !force && !G && !j && !de && now - X < 400 ? false : (le(U), ae.copy(U.position), ne.copy(qT), X = now, G = false, true);
  }
  function Se(U, J, Q, j = 1) {
    Jy.setScalar(j);
    hd.compose(J, Q, Jy);
    hd.toArray(_, U * 16);
    v && C(U);
    w[U * 3] = J.x;
    w[U * 3 + 1] = J.y + assets[y[U]].height * j / 2;
    w[U * 3 + 2] = J.z;
    G = true;
  }
  function ye(U, J) {
    T[U] = J;
    G = true;
  }
  return {
    root: f,
    meshes: B,
    stats: Y,
    count: p,
    update: we,
    setInstanceTransform: Se,
    setSeed: ye,
    assetOf: y,
    invalidate: () => {
      G = true;
    },
    colliders() {
      var J;
      const U = [];
      for (let Q = 0; Q < p; Q++) {
        const j = assets[y[Q]],
          de = placements[Q * stride + b],
          K = placements[Q * stride + 1],
          V = groundY + x(Q),
          te = placements[Q * stride + A],
          fe = placements[Q * stride + g];
        if ((J = j.hull) != null && J.length) {
          const Ue = Math.cos(fe),
            Ae = Math.sin(fe);
          for (const [Be, He, at, Re, Fe, Je] of j.hull) {
            const je = (Be + Re) / 2 * de,
              Te = (at + Je) / 2 * de;
            U.push([K + Ue * je + Ae * Te, V + (He + Fe) / 2 * de, te - Ae * je + Ue * Te, (Re - Be) / 2 * de, (Fe - He) / 2 * de, (Je - at) / 2 * de, fe]);
          }
          continue;
        }
        const Ce = j.height * de;
        U.push([K, V + Ce / 2, te, j.width * de / 2, Ce / 2, j.depth * de / 2, fe]);
      }
      return U;
    },
    dispose() {
      for (const U of B) for (const J of U) J.geometry.dispose();
      f.removeFromParent();
    }
  };
}
export function createBlockProxies({
  blocks: blocks,
  groundY: groundY,
  name = "city:blocks"
}) {
  const s = new BoxGeometry(1, 1, 1);
  s.translate(0, .5, 0);
  const n = blocks.length,
    r = new Float32Array(n * 3),
    o = new Float32Array(n * 4);
  blocks.forEach((le, we) => {
    r.set([le.width, le.height, le.depth], we * 3);
    const Se = (le.seed * 2654435761 >>> 0) / 4294967296;
    o.set([Se, le.neon ? 1 : 0, le.seed % 97 / 97, (le.seed >> 4) % 13 / 13], we * 4);
  });
  s.setAttribute("blockSize", new InstancedBufferAttribute(r, 3));
  s.setAttribute("blockParams", new InstancedBufferAttribute(o, 4));
  const a = attribute("blockSize", "vec3"),
    l = attribute("blockParams", "vec4"),
    c = l.x,
    u = positionGeometry.mul(a),
    d = abs(normalGeometry.z).greaterThan(abs(normalGeometry.x)),
    h = select(d, u.x, u.z).add(c.mul(37)),
    f = u.y,
    p = normalGeometry.y.greaterThan(.5),
    m = le => mix(mix(vec3(1, .15, .75), vec3(.1, .85, 1), smoothstep(0, .5, le)), vec3(1, .55, .12), smoothstep(.5, 1, le)),
    A = vec2(3.4, 3.6),
    g = vec2(h, f).div(A),
    b = floor(g),
    x = fract(g),
    y = step(.18, x.x).mul(step(x.x, .82)).mul(step(.26, x.y)).mul(step(x.y, .8)),
    _ = hash(b.x.mul(17.13).add(b.y.mul(113.7)).add(c.mul(931.7))),
    w = mix(float(.25), float(.62), fract(c.mul(3.7))),
    S = step(float(1).sub(w), _),
    T = vec3(1, .72, .42),
    v = vec3(.55, .75, 1),
    E = mix(T, v, step(.7, fract(c.mul(5.3).add(_.mul(.3))))),
    C = sin(time.mul(_.mul(2).add(.3)).add(_.mul(40))).mul(.1).add(.9),
    M = step(4.2, f),
    B = E.mul(S.mul(y).mul(M).mul(C).mul(.09)),
    R = step(.6, f).mul(step(f, 3.6)),
    I = floor(h.div(6)),
    k = step(.4, hash(I.add(c.mul(71)))),
    L = m(fract(c.add(I.mul(.37)))).mul(R.mul(k).mul(.18)),
    F = a.x.mul(.5).sub(abs(u.x)),
    O = a.z.mul(.5).sub(abs(u.z)),
    H = select(d, F, O),
    W = step(H, .3).mul(l.y).mul(step(3, f)),
    P = m(l.z).mul(W.mul(1.4)),
    z = step(.92, fract(f.div(3.6))).mul(.04),
    Y = vec3(.04, .042, .05).add(z).mul(float(.8).add(hash(b.y.add(c)).mul(.4))),
    G = max(y.mul(M), R),
    X = new MeshStandardNodeMaterial();
  X.name = name;
  X.colorNode = select(p, vec3(.025), Y);
  X.emissiveNode = select(p, vec3(0), B.add(L).add(P));
  X.roughnessNode = mix(float(.88), float(.14), G);
  X.metalnessNode = mix(float(.05), float(.55), G);
  const ae = gl(new InstancedMesh(s, X, n));
  ae.name = name;
  const ne = new Matrix4(),
    se = new Quaternion(),
    re = new Vector3(0, 1, 0);
  blocks.forEach((le, we) => {
    se.setFromAxisAngle(re, le.yaw ?? 0);
    ne.compose(new Vector3(le.x, groundY, le.z), se, new Vector3(le.width, le.height, le.depth));
    ae.setMatrixAt(we, ne);
  });
  ae.instanceMatrix.needsUpdate = true;
  ae.computeBoundingSphere();
  ae.castShadow = false;
  ae.receiveShadow = true;
  return {
    mesh: ae,
    material: X,
    colliders: () => blocks.map(le => [le.x, groundY + le.height / 2, le.z, le.width / 2, le.height / 2, le.depth / 2, le.yaw ?? 0]),
    dispose() {
      s.dispose();
      X.dispose();
    }
  };
}
