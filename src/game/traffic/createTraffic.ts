// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Gfe } from "./laneGraph.ts";
import { $fe, tpe, tc } from "./trafficSimulation.ts";
import { Lf, ppe, cpe, lpe, kf, Pl, Sk, sv, Ape, mpe, gpe } from "./trafficModels.ts";
import { InstancedBufferAttribute, InstancedMesh } from "three/webgpu";
import { gl } from "../../world/city/instanceStorage.ts";
export const ype = 25;
export const bpe = .36;
export const vk = 65;
export const xpe = Math.PI * 2;
export const Ek = 4;
export const _pe = 12;
export const Mk = 20;
export const wpe = 4;
export function createTraffic({
  scene: scene,
  physics: physics,
  map: map,
  groundY: groundY,
  maxCars = 28,
  lightPools = null,
  playerHandles = null,
  model = null
}) {
  const l = Gfe(map.roads, map.nodes, {
      highways: map.highways ?? []
    }),
    {
      RAPIER: c,
      world: u
    } = physics;
  let d = 1234567;
  const h = () => (d = d * 1664525 + 1013904223 >>> 0, d / 4294967296),
    f = $fe(l, h),
    p = tpe(f),
    m = {
      x: 0,
      z: 0,
      yaw: 0,
      v: 0,
      seen: false,
      isPlayer: true
    },
    A = new Map(),
    g = [];
  let b = 0;
  const x = 64,
    y = new Map();
  for (const W of l.lanes) if (W.routable) for (let P = 6; P < W.length - 6; P += 24) {
    tc(W, P, Lf);
    const z = `${Math.floor(Lf.x / x)},${Math.floor(Lf.z / x)}`;
    y.has(z) || y.set(z, []);
    y.get(z).push([W.id, P]);
  }
  const _ = model ? ppe(model.maps) : cpe(),
    w = (model ? model.lods : [lpe()]).map((W, P) => {
      const z = new Float32Array(maxCars * 3),
        Y = new Float32Array(maxCars * 4);
      W.setAttribute("carColor", new InstancedBufferAttribute(z, 3));
      W.setAttribute("carState", new InstancedBufferAttribute(Y, 4));
      const G = gl(new InstancedMesh(W, _, maxCars));
      G.name = `city:traffic-lod${P}`;
      G.frustumCulled = false;
      G.count = 0;
      G.castShadow = P === 0;
      G.receiveShadow = true;
      scene.add(G);
      return {
        mesh: G,
        geometry: W,
        colors: z,
        states: Y,
        count: 0
      };
    }),
    S = [],
    T = new Map();
  let v = 0,
    E = 0,
    C = 0,
    M = 1;
  const B = () => Math.round(maxCars * M);
  function R(W, P, z) {
    var X;
    const Y = u.createRigidBody(c.RigidBodyDesc.kinematicPositionBased().setTranslation(W, groundY + kf.y + .18, P).setRotation({
        x: 0,
        y: Math.sin(z / 2),
        z: 0,
        w: Math.cos(z / 2)
      })),
      G = u.createCollider(c.ColliderDesc.cuboid(kf.x, kf.y, kf.z).setFriction(.5).setRestitution(.1).setMass(1300), Y);
    (X = physics.setSurface) == null || X.call(physics, G, "concrete");
    return {
      body: Y,
      collider: G
    };
  }
  function I(W) {
    const P = W.position;
    W.getWorldDirection(Pl);
    const z = Pl.x,
      Y = Pl.z;
    for (let G = 0; G < 24; G++) {
      const X = h() * Math.PI * 2,
        ae = 110 + h() * 120,
        ne = P.x + Math.sin(X) * ae,
        se = P.z + Math.cos(X) * ae;
      if ((Math.sin(X) * z + Math.cos(X) * Y) / (Math.hypot(z, Y) || 1) > .55 && (G < 16 || M < 1)) continue;
      const le = y.get(`${Math.floor(ne / x)},${Math.floor(se / x)}`);
      if (!(le != null && le.length)) continue;
      const [we, Se] = le[Math.floor(h() * le.length)],
        ye = l.lanes[we];
      if (tc(ye, Se, Lf), S.some(de => (de.x - Lf.x) ** 2 + (de.z - Lf.z) ** 2 < Mk * Mk)) continue;
      const U = Sk[Math.floor(h() * Sk.length)],
        J = {
          id: C++,
          factor: .82 + h() * .3,
          aLat: 2.3 + h() * 1.1,
          look: .85 + h() * .35,
          steerRate: .75 + h() * .45,
          bias: (h() - .5) * .5,
          planPhase: Math.floor(h() * Ek),
          desired: 0,
          v: 0,
          stopped: 0,
          braking: 0,
          color: U,
          spin: 0,
          wrecked: false,
          life: ype
        };
      f.place(J, ye, Se);
      J.desired = f.desiredSpeed(J);
      J.v = Math.min(ye.speed * .7, J.desired);
      const {
        body: Q,
        collider: j
      } = R(J.x, J.z, J.yaw);
      J.body = Q;
      J.collider = j;
      T.set(j.handle, J);
      S.push(J);
      return true;
    }
    return false;
  }
  function k(W) {
    T.delete(W.collider.handle);
    u.removeRigidBody(W.body);
    S.splice(S.indexOf(W), 1);
  }
  function L(W) {
    W.wrecked || (W.wrecked = true, W.braking = 1, W.body.setBodyType(c.RigidBodyType.Dynamic, true), W.body.setLinearDamping(.2), W.body.setAngularDamping(.3), W.body.setLinvel({
      x: Math.sin(W.yaw) * W.v,
      y: 0,
      z: Math.cos(W.yaw) * W.v
    }, true));
  }
  physics.onContactForce(W => {
    var X;
    const P = T.get(W.collider1()),
      z = T.get(W.collider2()),
      Y = P ?? z;
    if (!Y || Y.wrecked) return;
    const G = P ? W.collider2() : W.collider1();
    playerHandles && !playerHandles.has(G) && !((X = T.get(G)) != null && X.wrecked) || W.totalForceMagnitude() > 42e3 && L(Y);
  });
  function F(W, P, z) {
    p.step(W, S, z, P, E, Ek);
    W.body.setNextKinematicTranslation({
      x: W.x,
      y: groundY + kf.y + .18,
      z: W.z
    });
    W.body.setNextKinematicRotation({
      x: 0,
      y: Math.sin(W.yaw / 2),
      z: 0,
      w: Math.cos(W.yaw / 2)
    });
  }
  const O = [];
  function H(W, P, z, Y = null) {
    var se;
    if (W = Math.min(W, .05), E += 1, z) {
      const re = Math.hypot(z.x - m.x, z.z - m.z);
      m.v = m.seen ? re / Math.max(W, .001) : 0;
      m.x = z.x;
      m.z = z.z;
      m.seen = true;
      const le = Y;
      le && (m.yaw = Math.atan2(2 * (le.w * le.y + le.x * le.z), 1 - 2 * (le.y * le.y + le.x * le.x)));
    }
    g.length = 0;
    z && g.push(m);
    for (const re of A.values()) g.push(re);
    v -= W;
    S.length < B() && v <= 0 && (I(P), v = .08);
    const G = P.position;
    P.getWorldDirection(Pl);
    const X = Pl.x,
      ae = Pl.z;
    let ne = false;
    for (let re = S.length - 1; re >= 0; re--) {
      const le = S[re],
        we = (le.x - G.x) ** 2 + (le.z - G.z) ** 2 > 290 * 290;
      if (le.wrecked) {
        const j = le.body.translation(),
          de = le.body.rotation();
        le.x = j.x;
        le.z = j.z;
        le.y = j.y;
        le.q = de;
        le.life -= W;
        (le.life <= 0 || we || j.y < groundY - 12) && k(le);
        continue;
      }
      const Se = le.x - G.x,
        ye = le.z - G.z,
        U = Se * Se + ye * ye,
        J = U > 4900 || U > 625 && Se * X + ye * ae < 0,
        Q = J && S.length > B() && !ne;
      if (we || le.stopped > _pe && J || Q) {
        ne || (ne = Q);
        k(le);
        continue;
      }
      F(le, W, g);
    }
    O.length = 0;
    for (const re of w) re.count = 0;
    for (const re of S) {
      const le = (re.x - G.x) ** 2 + (re.z - G.z) ** 2;
      re.wrecked ? (Pl.set(re.x, re.y - kf.y - .18, re.z), sv.set(re.q.x, re.q.y, re.q.z, re.q.w)) : (Pl.set(re.x, groundY, re.z), sv.setFromAxisAngle(Ape, re.yaw), re.spin = (re.spin + re.v * W / bpe) % xpe, le < 25600 && O.push({
        x: re.x,
        z: re.z,
        yaw: re.yaw
      }));
      const we = w[w.length > 1 && le > vk * vk ? 1 : 0],
        Se = we.count++;
      we.mesh.setMatrixAt(Se, mpe.compose(Pl, sv, gpe));
      we.colors.set(re.color, Se * 3);
      we.states[Se * 4] = re.braking;
      we.states[Se * 4 + 1] = re.wrecked ? 1 : 0;
      we.states[Se * 4 + 2] = re.wrecked ? 0 : re.spin;
      we.states[Se * 4 + 3] = re.yaw;
    }
    for (const re of w) re.mesh.count = re.count, re.mesh.instanceMatrix.needsUpdate = true, re.geometry.attributes.carColor.needsUpdate = true, re.geometry.attributes.carState.needsUpdate = true;
    (se = lightPools == null ? undefined : lightPools.setBeams) == null || se.call(lightPools, O);
  }
  return {
    meshes: w.map(W => W.mesh),
    graph: l,
    update: H,
    setDensity(W) {
      M = Math.max(0, Math.min(1, W));
    },
    clearAround(W, P, z) {
      for (const Y of [...S]) (Y.x - W) ** 2 + (Y.z - P) ** 2 < z * z && k(Y);
    },
    get carGeometry() {
      return w[0].geometry;
    },
    setRemoteCars(W) {
      b += 1;
      const P = Math.min((W == null ? undefined : W.length) ?? 0, wpe);
      for (let z = 0; z < P; z++) {
        const Y = W[z];
        let G = A.get(Y.id);
        G || (G = {
          id: -1,
          isPlayer: true,
          x: 0,
          z: 0,
          yaw: 0,
          v: 0,
          stamp: 0
        }, A.set(Y.id, G));
        G.stamp = b;
        G.x = Y.x;
        G.z = Y.z;
        G.yaw = Y.yaw;
        G.v = Math.abs(Y.speed);
      }
      if (A.size > P) for (const [z, Y] of A) Y.stamp !== b && A.delete(z);
    },
    get count() {
      return S.length;
    },
    cars: S,
    dispose() {
      for (const W of [...S]) k(W);
      for (const W of w) W.mesh.removeFromParent(), W.geometry.dispose();
      _.dispose();
    }
  };
}
export const _r = -5.4;
export const Spe = "/models/game/alley_colliders.json";
