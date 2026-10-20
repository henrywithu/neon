// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createGltfLoaders } from "../../world/loaders/createGltfLoaders.ts";
import { Aue, gue, dL, BS, yue, mg, _ue, uL, bue, cL, xue } from "./placements.ts";
import { sigilDefinitions } from "../story/definitions.ts";
import { uniform, Fn, positionLocal, Discard, abs, dot, normalView, positionViewDirection, pow, float, smoothstep, sin, time, vec4, mix, vec3, cameraViewMatrix, modelWorldMatrix, cameraProjectionMatrix, positionGeometry, length, instancedBufferAttribute, clamp, cos, normalize, If, uv } from "three/tsl";
import { Color, MeshBasicNodeMaterial, AdditiveBlending, DoubleSide, PlaneGeometry, Sphere, Vector3, Group, Mesh, InstancedBufferAttribute } from "three/webgpu";
async function createSigils({
  renderer: renderer,
  scene: scene,
  camera: camera,
  map: map,
  boxes: boxes,
  groundY: groundY,
  groundAt = null,
  progress: progress,
  layer = 0,
  viewLayer = layer,
  particles = 700,
  sfx = null,
  onCollect = null,
  isOnFoot = () => true,
  carPickup = () => null
}) {
  const m = await createGltfLoaders(renderer).loadAsync(Aue),
    A = new Map();
  m.scene.traverse($ => {
    $.isMesh && A.set($.name, $.geometry);
  });
  const g = performance.now(),
    b = gue({
      anchors: sigilDefinitions.map($ => $.anchor),
      boxes: boxes,
      roads: map.roads,
      groundY: groundY,
      groundAt: groundAt
    }),
    x = performance.now() - g,
    y = uniform(new Color()).onObjectUpdate(({
      object: object
    }) => object.userData.sigilColor),
    _ = uniform(0).onObjectUpdate(({
      object: object
    }) => object.userData.dissolve),
    w = uniform(1).onObjectUpdate(({
      object: object
    }) => object.userData.glow),
    S = new MeshBasicNodeMaterial({
      side: AdditiveBlending
    });
  S.name = "neon-sigil";
  S.colorNode = Fn(() => {
    const $ = dL(positionLocal);
    If($.lessThan(_), () => {
      Discard();
    });
    const q = abs(dot(normalView, positionViewDirection)),
      oe = pow(float(1).sub(q), 1.6),
      xe = smoothstep(.08, 0, abs(positionLocal.y.sub(sin(time.mul(1.3)).mul(.55)))),
      me = y.mul(float(.42).add(oe.mul(3.2)).add(xe.mul(.7))).mul(w),
      ie = smoothstep(.1, 0, $.sub(_)).mul(_.greaterThan(.001).select(1, 0));
    return vec4(mix(me, vec3(1).add(y.mul(2)), ie.mul(.9)), 1);
  })();
  const T = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: DoubleSide
  });
  T.name = "neon-sigil-halo";
  const v = cameraViewMatrix.mul(modelWorldMatrix.mul(vec4(0, 0, 0, 1)));
  T.vertexNode = cameraProjectionMatrix.mul(vec4(v.xy.add(positionGeometry.xy.mul(BS * 2.4)), v.z, 1));
  const E = length(uv().mul(2).sub(1)),
    C = pow(smoothstep(1, 0, E), 2.4).mul(float(1).sub(_.min(1)));
  T.colorNode = vec4(y.mul(.55), C);
  const M = new PlaneGeometry(1, 1);
  M.boundingSphere = new Sphere(new Vector3(), 2.2);
  const B = new Group();
  B.name = "neon-sigils";
  scene.add(B);
  const R = sigilDefinitions.map(($, q) => {
      const oe = b[q],
        xe = A.get($.id),
        me = new Color($.color),
        ie = {
          def: $,
          index: q,
          x: oe.x,
          z: oe.z,
          y: groundY + yue,
          placement: oe,
          color: me,
          collected: progress.isSigilCollected($.id),
          mesh: null,
          phase: q * 1.7,
          dissolve: -1
        };
      if (!xe || ie.collected) return ie;
      const Ne = new Mesh(xe, S);
      Ne.name = `sigil:${$.id}`;
      Ne.scale.setScalar(BS);
      Ne.position.set(ie.x, ie.y, ie.z);
      Ne.rotation.y = ie.phase;
      Ne.userData.sigilColor = me;
      Ne.userData.dissolve = 0;
      Ne.userData.glow = 1;
      Ne.layers.set(layer);
      Ne.visible = false;
      const ze = new Mesh(M, T);
      ze.name = `sigil-halo:${$.id}`;
      ze.renderOrder = 8;
      ze.userData = Ne.userData;
      ze.layers.set(viewLayer);
      Ne.add(ze);
      B.add(Ne);
      ie.mesh = Ne;
      return ie;
    }),
    I = new InstancedBufferAttribute(new Float32Array(particles * 3), 3),
    k = new InstancedBufferAttribute(new Float32Array(particles * 4), 4),
    L = k.array;
  for (let $ = 0; $ < L.length; $++) L[$] = Math.random();
  const F = instancedBufferAttribute(I, "vec3"),
    O = instancedBufferAttribute(k, "vec4"),
    H = uniform(new Vector3()),
    W = uniform(0),
    P = uniform(0),
    z = uniform(new Color()),
    Y = uniform(BS),
    G = dL(F).mul(mg),
    X = P.sub(G),
    ae = O.x.mul(.8).add(.65),
    ne = clamp(X.div(ae), 0, 1),
    se = X.greaterThan(0).and(X.lessThan(ae)).select(1, 0),
    re = F.mul(Y),
    le = cos(W),
    we = sin(W),
    Se = vec3(re.x.mul(le).add(re.z.mul(we)), re.y, re.z.mul(le).sub(re.x.mul(we))).add(H),
    ye = normalize(vec3(Se.x.sub(H.x), O.y.mul(.6).add(.45), Se.z.sub(H.z)).add(O.yzw.sub(.5).mul(.9))),
    U = X.max(0),
    J = ye.mul(O.y.mul(1.1).add(.35).mul(U)).add(vec3(0, U.mul(U).mul(.8), 0)),
    Q = U.mul(O.z.mul(3).add(1.5)),
    j = Se.x.add(J.x).sub(H.x),
    de = Se.z.add(J.z).sub(H.z),
    K = vec3(j.mul(cos(Q)).sub(de.mul(sin(Q))).add(H.x), Se.y.add(J.y), j.mul(sin(Q)).add(de.mul(cos(Q))).add(H.z)),
    V = float(.03).mul(O.w.add(.5)).mul(float(1).sub(ne.mul(.8))).mul(se),
    te = cameraViewMatrix.mul(vec4(K, 1)),
    fe = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: DoubleSide
    });
  fe.name = "sigil-burst";
  fe.vertexNode = cameraProjectionMatrix.mul(vec4(te.xy.add(positionGeometry.xy.mul(V)), te.z, 1));
  const Ce = length(uv().mul(2).sub(1)),
    Ue = smoothstep(1, 0, Ce).pow(1.5),
    Ae = smoothstep(.4, 0, Ce).mul(float(1).sub(ne));
  fe.colorNode = vec4(mix(vec3(z).mul(2.4), vec3(1.5), Ae.mul(.55)), Ue.mul(pow(float(1).sub(ne), 1.2)));
  const Be = new Mesh(new PlaneGeometry(1, 1), fe);
  Be.name = "sigil-burst";
  Be.frustumCulled = false;
  Be.count = particles;
  Be.visible = false;
  Be.renderOrder = 9;
  Be.layers.set(viewLayer);
  scene.add(Be);
  let He = null;
  function at($) {
    I.array.set(_ue($.mesh.geometry, particles));
    I.needsUpdate = true;
    H.value.set($.x, $.mesh.position.y, $.z);
    W.value = $.mesh.rotation.y;
    z.value.copy($.color);
    P.value = 0;
    Be.visible = true;
    He = $;
  }
  const Re = [];
  function Fe($) {
    const q = camera.position,
      oe = isOnFoot(),
      xe = oe ? null : carPickup();
    for (const me of R) {
      const ie = me.mesh;
      if (!ie) continue;
      const Ne = Math.hypot(q.x - me.x, q.z - me.z);
      if (ie.visible = Ne < uL, !!ie.visible) {
        if (me.phase += $, me.dissolve >= 0) {
          me.dissolve += $;
          const ze = me.dissolve / mg;
          ie.rotation.y += $ * (2.2 + ze * 9);
          ie.position.y = me.y + .1 * Math.sin(me.phase * 1.8) + ze * .25;
          ie.userData.dissolve = Math.min(1.05, ze * 1.05);
          ie.userData.glow = 1 + ze * .5;
          ze >= 1.05 && (ie.removeFromParent(), me.mesh = null);
          continue;
        }
        ie.rotation.y += $ * 1.25;
        ie.position.y = me.y + .1 * Math.sin(me.phase * 1.8);
        !me.collected && (oe ? Ne < bue && Math.abs(q.y - ie.position.y) < 1.3 : xe && Je(xe, me)) && je(me);
      }
    }
    Be.visible && (P.value += $, P.value > mg + cL && (Be.visible = false, He = null));
  }
  function Je($, q) {
    if (Math.abs(q.y - $.y) > 3) return false;
    const oe = q.x - $.x,
      xe = q.z - $.z,
      me = Math.sin($.heading),
      ie = Math.cos($.heading),
      Ne = Math.abs(oe * ie - xe * me) - $.halfWidth,
      ze = Math.abs(oe * me + xe * ie - $.offsetZ) - $.halfLength;
    return Math.hypot(Math.max(Ne, 0), Math.max(ze, 0)) < xue;
  }
  function je($) {
    var oe;
    $.collected = true;
    $.dissolve = 0;
    const q = progress.collectSigil($.def.id);
    at($);
    (oe = sfx == null ? undefined : sfx.collect) == null || oe.call(sfx);
    onCollect == null || onCollect($, q);
  }
  function Te() {
    Re.length = 0;
    const $ = camera.position;
    for (const q of R) {
      if (!q.mesh || Math.hypot($.x - q.x, $.z - q.z) > uL) continue;
      const oe = q.dissolve >= 0 ? Math.max(0, 1 - q.dissolve / mg) : 1,
        xe = q.dissolve >= 0 ? Math.max(0, 1 - q.dissolve / .5) * 2.2 : 0;
      Re.push({
        x: q.x,
        z: q.z,
        size: 9 + xe * 5,
        rgb: [q.color.r, q.color.g, q.color.b],
        intensity: 1.1 * oe + xe
      });
    }
    if (He && !He.mesh) {
      const q = Math.max(0, 1 - P.value / (mg + cL)),
        oe = He.color;
      Re.push({
        x: He.x,
        z: He.z,
        size: 9,
        rgb: [oe.r, oe.g, oe.b],
        intensity: .8 * q
      });
    }
    return Re;
  }
  function ue($ = 1 / 0, q = camera.position) {
    let oe = null;
    for (const xe of R) {
      if (xe.collected) continue;
      const me = Math.hypot(q.x - xe.x, q.z - xe.z);
      me < $ && (!oe || me < oe.distance) && (oe = {
        item: xe,
        distance: me
      });
    }
    return oe;
  }
  console.info("[sigils]", {
    placed: b.filter($ => !$.fallback).length,
    fallback: b.filter($ => $.fallback).map(($, q) => sigilDefinitions[q].id),
    placeMs: Math.round(x)
  });
  return {
    items: R,
    root: B,
    burst: Be,
    update: Fe,
    lightPools: Te,
    nearest: ue,
    mapMarkers: () => R.map($ => ({
      kind: "sigil",
      id: $.def.id,
      name: $.def.name,
      color: $.def.color,
      x: $.x,
      z: $.z,
      done: $.collected
    })),
    locate: $ => R.find(q => q.def.id === $) ?? null,
    warmup() {
      var xe;
      const $ = (xe = R.find(me => me.mesh)) == null ? undefined : xe.mesh,
        q = [$, $ == null ? undefined : $.children[0], Be].filter(Boolean),
        oe = q.map(me => [me, me.visible, me.frustumCulled]);
      for (const me of q) me.visible = true, me.frustumCulled = false;
      return () => {
        for (const [me, ie, Ne] of oe) me.visible = ie, me.frustumCulled = Ne;
      };
    },
    dispose() {
      B.removeFromParent();
      Be.removeFromParent();
      S.dispose();
      T.dispose();
      M.dispose();
      fe.dispose();
      Be.geometry.dispose();
      for (const $ of A.values()) $.dispose();
    }
  };
}
export { createSigils };
