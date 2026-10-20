// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isGameInputBlocked } from "../../ui/core/inputBoundary.ts";
import { _r, Spe, createTraffic } from "../traffic/createTraffic.ts";
import { Vector3, Quaternion, MathUtils } from "three/webgpu";
import { createPhysicsWorld } from "../physics/createPhysicsWorld.ts";
import { fk, Bfe } from "../physics/dynamicProps.ts";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { createVehicle } from "../physics/createVehicle.ts";
import { createVehicleRigSync } from "../vehicles/syncRig.ts";
import { createDriveInput } from "../../controls/createDriveInput.ts";
import { createTouchControls } from "../../ui/drive/touchControls.ts";
import { createChaseCamera } from "../../runtime/createChaseCamera.ts";
import { createSpeedometer } from "../../ui/drive/speedometer.ts";
import { createDriftScoring } from "./driftScoring.ts";
import { createDriftHud } from "../../ui/drive/driftHud.ts";
import { createLaunchHud } from "../../ui/drive/launchHud.ts";
import { createMinimap } from "../../ui/map/minimap.ts";
import { e0 } from "../../world/city/occlusion.ts";
import { createRoadGraph } from "../navigation/roadGraph.ts";
import { createGpsRibbon, FG } from "../navigation/gpsRibbon.ts";
import { Mu, dl } from "../../world/city/instanceStorage.ts";
import { createGpsHud } from "../../ui/map/gpsHud.ts";
import { createCityMap } from "../../ui/map/cityMap.ts";
import { LG } from "../../world/car/lighting.ts";
import { createSkidMarks } from "../../world/effects/skidMarks.ts";
import { createTireSpray } from "../../world/effects/tireSpray.ts";
import { _1 } from "../../world/effects/smoke.ts";
import { createExhaustFlames } from "../../world/car/exhaustFlames.ts";
import { Sfe, vfe } from "./speedEffects.ts";
import { fpe } from "../traffic/trafficModels.ts";
export const vpe = .45;
export const Epe = {
  position: [-128, _r + .08, 33],
  yaw: Math.PI / 2 + .6
};
export const ca = new Vector3();
export function Mpe(i, e, t) {
  if (!e) return 0;
  e.updateMatrixWorld(true);
  let s = 0;
  e.traverse(n => {
    var c, u;
    if (!n.isMesh || !((u = (c = n.geometry) == null ? undefined : c.attributes) != null && u.position)) return;
    const r = n.geometry,
      o = r.attributes.position,
      a = new Float32Array(o.count * 3);
    for (let d = 0; d < o.count; d++) ca.fromBufferAttribute(o, d).applyMatrix4(n.matrixWorld), a[d * 3] = ca.x, a[d * 3 + 1] = ca.y, a[d * 3 + 2] = ca.z;
    let l;
    if (r.index) l = new Uint32Array(r.index.array);else {
      l = new Uint32Array(o.count);
      for (let d = 0; d < o.count; d++) l[d] = d;
    }
    i.addStaticTrimesh({
      vertices: a,
      indices: l,
      surface: t,
      friction: .3
    });
    s += 1;
  });
  return s;
}
export async function Cpe(i) {
  var l;
  const e = await fetch(i).then(c => c.blob()),
    t = await createImageBitmap(e, {
      premultiplyAlpha: "none",
      colorSpaceConversion: "none"
    }),
    {
      width: s,
      height: n
    } = t,
    o = new OffscreenCanvas(s, n).getContext("2d", {
      willReadFrequently: true
    });
  o.drawImage(t, 0, 0);
  const {
    data: a
  } = o.getImageData(0, 0, s, n);
  (l = t.close) == null || l.call(t);
  return {
    data: a,
    width: s,
    height: n
  };
}
export async function Bpe(i, e, t = 1024) {
  const {
      url: s,
      bounds: n,
      span: r
    } = e.landuse,
    o = await Cpe(s),
    a = t,
    {
      data: l,
      width: c,
      height: u
    } = o,
    d = (g, b, x) => {
      const y = Math.min(c - 1, Math.max(0, g * c - .5)),
        _ = Math.min(u - 1, Math.max(0, b * u - .5)),
        w = Math.floor(y),
        S = Math.floor(_),
        T = Math.min(c - 1, w + 1),
        v = Math.min(u - 1, S + 1),
        E = y - w,
        C = _ - S,
        M = (I, k) => l[(k * c + I) * 4 + x],
        B = M(w, S) * (1 - E) + M(T, S) * E,
        R = M(w, v) * (1 - E) + M(T, v) * E;
      return B * (1 - C) + R * C;
    },
    h = new Float32Array((a + 1) * (a + 1));
  for (let g = 0; g <= a; g++) {
    const b = g / a;
    for (let x = 0; x <= a; x++) {
      const y = x / a,
        _ = d(y, b, 0) >= 131,
        w = d(y, b, 1) >= 127.5;
      h[x * (a + 1) + g] = w || _ ? 0 : -9;
    }
  }
  const f = (n.minX + n.maxX) / 2,
    p = (n.minZ + n.maxZ) / 2,
    m = i.world.createRigidBody(i.RAPIER.RigidBodyDesc.fixed().setTranslation(f, _r, p)),
    A = i.world.createCollider(i.RAPIER.ColliderDesc.heightfield(a, a, h, {
      x: r,
      y: 1,
      z: r
    }).setFriction(1), m);
  i.setSurface(A, "asphalt");
  return A;
}
export function Rpe(i, e, t = 6) {
  const r = e.minX - t,
    o = e.maxX + t,
    a = e.minZ - t,
    l = e.maxZ + t,
    c = (r + o) / 2,
    u = (a + l) / 2,
    d = (o - r) / 2 + 2,
    h = (l - a) / 2 + 2,
    f = _r + 6;
  i.addStaticBox({
    center: [c, f, a - 2],
    half: [d, 6, 2]
  });
  i.addStaticBox({
    center: [c, f, l + 2],
    half: [d, 6, 2]
  });
  i.addStaticBox({
    center: [r - 2, f, u],
    half: [2, 6, h]
  });
  i.addStaticBox({
    center: [o + 2, f, u],
    half: [2, 6, h]
  });
}
export async function createDriveMode({
  camera: camera,
  renderer: renderer,
  world: world,
  baseFov = 62,
  onExitVehicle = null,
  canOpenMap = () => true,
  canOpenMapWithEscape = () => true,
  onMapToggle = null,
  onTeleport = null,
  lensRain = null,
  speedBlur = null,
  spawnBack = 0
}) {
  var Fs, In, qe, st, it, Mt, Pe, Pt;
  const h = world.carRig;
  if (!h) throw new Error("createDriveMode: world.carRig missing (FEATURES.car + drivable car)");
  const f = await createPhysicsWorld({
      hz: 120
    }),
    p = ((Fs = world.cityApi) == null ? undefined : Fs.kind) === "metro" ? world.cityApi : null;
  if (p ? await Bpe(f, p) : f.addGroundPlane({
    y: _r,
    size: 8e3,
    surface: "asphalt"
  }), world.cityApi) {
    for (const [ke, Ie, pt, kt, ht, ts, yt] of world.cityApi.collectColliders()) f.addStaticBox({
      center: [ke, Ie, pt],
      half: [kt, ht, ts],
      rotation: yt ? {
        x: 0,
        y: Math.sin(yt / 2),
        z: 0,
        w: Math.cos(yt / 2)
      } : null,
      surface: "concrete",
      friction: .35
    });
    Rpe(f, world.cityApi.bounds);
    const ce = world.cityApi.highways;
    if ((In = world.cityApi.guardrails) != null && In.trimesh && f.addStaticTrimesh({
      ...world.cityApi.guardrails.trimesh,
      surface: "concrete",
      friction: .3
    }), ce != null && ce.trimesh) {
      f.addStaticTrimesh({
        ...ce.trimesh,
        surface: "asphalt",
        friction: 1
      });
      for (const [ke, Ie, pt, kt, ht, ts, yt] of [...ce.pillarColliders(), ...(((qe = ce.rampColliders) == null ? undefined : qe.call(ce)) ?? [])]) f.addStaticBox({
        center: [ke, Ie, pt],
        half: [kt, ht, ts],
        rotation: {
          x: 0,
          y: Math.sin(yt / 2),
          z: 0,
          w: Math.cos(yt / 2)
        },
        surface: "concrete",
        friction: .35
      });
    }
  } else try {
    const ce = await fetch(Spe).then(ke => ke.json());
    for (const [ke, Ie, pt, kt, ht, ts] of ce.boxes) f.addStaticBox({
      center: [ke, Ie, pt],
      half: [kt, ht, ts],
      surface: "concrete",
      friction: .35
    });
  } catch (ce) {
    console.warn("[drive] alley colliders unavailable:", ce);
  }
  Mpe(f, world.boundsCollider, "concrete");
  const m = (ce, ke, Ie, pt) => {
      const kt = pt >= 11 ? pt / 4 : 0;
      return [ce - Math.cos(Ie) * kt, ke + Math.sin(Ie) * kt];
    },
    A = p != null && p.props ? fk({
      physics: f,
      props: p.props,
      groundY: _r
    }) : null,
    g = p == null ? undefined : p.lamps,
    b = g && {
      ...g.physicsOf(0),
      onKnock: ce => {
        var ke, Ie;
        g.setLit(ce, false);
        (Ie = (ke = p.lightPools) == null ? undefined : ke.setLampLit) == null || Ie.call(ke, ce, false);
      }
    },
    x = p && performanceProfile.acoustics ? Bfe({
      physics: f,
      getBody: () => T.body
    }) : null,
    y = g != null && g.count ? fk({
      physics: f,
      props: {
        ...g,
        physicsOf: () => b
      },
      groundY: _r,
      radius: 50
    }) : null,
    _ = p != null && p.spawn ? (() => {
      var ts;
      let [ce, ke] = p.spawn.position,
        {
          yaw: Ie
        } = p.spawn,
        pt = ((ts = p.map.roads[p.spawn.road]) == null ? undefined : ts.width) ?? 12;
      if (spawnBack > 0) {
        const yt = p.nearestRoadPose(ce - Math.sin(Ie) * spawnBack, ke - Math.cos(Ie) * spawnBack, Ie);
        yt && yt.distance < 3 && ({
          x: ce,
          z: ke,
          yaw: Ie,
          width: pt
        } = yt);
      }
      const [kt, ht] = m(ce, ke, Ie, pt);
      return {
        position: [kt, _r + .08, ht],
        yaw: Ie
      };
    })() : Epe,
    w = ((st = p == null ? undefined : p.water) == null ? undefined : st.y) ?? -1 / 0;
  let S = world.carModel,
    T = createVehicle({
      RAPIER: f.RAPIER,
      physics: f,
      config: structuredClone(S.def.config),
      rig: S.rig,
      spawn: _
    }),
    v = createVehicleRigSync({
      vehicle: T,
      physics: f,
      rig: {
        root: h.root,
        wheels: S.wheels
      }
    });
  T.setInput({
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: 1
  });
  for (let ce = 0; ce < 90; ce++) f.stepOnce();
  v.resetInterpolation();
  v.update(1);
  const E = createDriveInput(),
    C = createTouchControls({
      input: E
    }),
    M = createChaseCamera({
      camera: camera,
      domElement: renderer.domElement,
      target: h.root,
      getTelemetry: () => T.telemetry,
      physics: f,
      excludeBody: T.body,
      baseFov: baseFov,
      initialMode: performanceProfile.driveCameraMode
    });
  M.setCarFrame(S.def.camera);
  const B = ce => Math.max(8e3, Math.ceil(ce.config.engine.limiterRpm / 1e3) * 1e3),
    R = createSpeedometer({
      maxRpm: B(S.def),
      redlineRpm: S.def.config.engine.redlineRpm
    }),
    I = createDriftScoring(),
    k = createDriftHud(),
    L = (it = T.config.arcade) != null && it.launch ? createLaunchHud(T.config.arcade.launch) : null,
    F = p != null && p.map.minimap ? createMinimap({
      url: `${e0}${p.map.minimap.url}`,
      bounds: p.map.minimap.bounds,
      size: C ? 84 : undefined,
      onClick: () => ye == null ? undefined : ye.open()
    }) : null,
    O = new Quaternion(),
    H = new Vector3(),
    W = new Vector3();
  function P() {
    return je ? (h.root.getWorldPosition(ca), h.root.getWorldQuaternion(O), H.set(0, 0, 1).applyQuaternion(O), {
      x: ca.x,
      y: ca.y,
      z: ca.z,
      heading: Math.atan2(H.x, H.z)
    }) : (camera.getWorldDirection(W), {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      heading: Math.atan2(W.x, W.z)
    });
  }
  const z = p ? createRoadGraph(p.map) : null,
    Y = {
      waypoint: null,
      route: null,
      timer: 0,
      owner: null,
      noRoute: false,
      track: null
    },
    G = (ce, ke) => z.route(ce, ke, {
      heading: je ? ce.heading : undefined
    });
  function X(ce, {
    owner = null,
    route = true,
    track = null
  } = {}) {
    if (Y.route = null, Y.timer = 0, Y.owner = ce ? owner : null, Y.noRoute = !route, Y.track = ce ? track : null, !ce || !z) {
      Y.waypoint = null;
      return;
    }
    const kt = route ? z.snap(ce.x, ce.z) : null;
    Y.waypoint = kt ? {
      x: kt.x,
      z: kt.z
    } : {
      x: ce.x,
      z: ce.z
    };
    route && (Y.route = G(P(), Y.waypoint));
  }
  const ae = p ? createGpsRibbon({
      scene: h.root.parent,
      groundY: _r,
      layer: Mu
    }) : null,
    ne = p ? createGpsHud() : null;
  let se = false;
  const re = () => false;
  function le(ce) {
    return false;
  }
  let we = null;
  const Se = (p == null ? undefined : p.map.roads.filter(ce => ce.type === "runway")) ?? [],
    ye = p != null && p.map.minimap ? createCityMap({
      url: `${e0}${p.map.minimap.url}`,
      bounds: p.map.minimap.bounds,
      viewBounds: p.map.bounds,
      highways: p.map.highways ?? [],
      labels: [p.map.downtown && {
        text: "DOWNTOWN",
        x: p.map.downtown[0],
        z: p.map.downtown[1]
      }, Se.length && {
        text: "AIRPORT",
        x: Se.reduce((ce, ke) => ce + ke.points[0][0], 0) / Se.length,
        z: Se.reduce((ce, ke) => ce + ke.points[0][1], 0) / Se.length
      }].filter(Boolean),
      canOpen: canOpenMap,
      canOpenWithEscape: canOpenMapWithEscape,
      canTeleport: re,
      canPing: () => !!we,
      onPing: ce => we == null ? undefined : we(ce),
      onTeleport: null,
      getPlayer: P,
      getRoute: () => Y,
      onWaypoint: (ce, ke) => X(ce, ke != null && ke.track ? {
        track: ke.track
      } : {}),
      onToggle: ce => {
        Le();
        onMapToggle == null || onMapToggle(ce);
      }
    }) : null,
    U = {
      impact: new Set(),
      tick: new Set(),
      drift: new Set(),
      action: new Set()
    };
  let J = null;
  const Q = ce => ce.lights ?? (ce.lights = LG({
    root: h.root,
    materialsRoot: ce.model
  }));
  Q(S);
  (Pt = (Mt = p == null ? undefined : p.lightPools) == null ? undefined : Mt.setUnderglow) == null || Pt.call(Mt, ((Pe = S.neon) == null ? undefined : Pe.underglow) ?? null);
  const j = h.root.parent ? createSkidMarks({
      scene: h.root.parent,
      layer: p ? Mu : null
    }) : null,
    de = h.root.parent ? await createTireSpray({
      scene: h.root.parent,
      car: h.root,
      rearWheels: T.wheels.filter(ce => !ce.front),
      layer: _1
    }).catch(ce => (console.warn("[drive] tire spray unavailable:", ce), null)) : null,
    K = performanceProfile.exhaustFlames !== false && h.root.parent ? createExhaustFlames({
      scene: h.root.parent,
      car: h.root,
      groundY: _r,
      layer: p ? dl : _1,
      lightPools: (p == null ? undefined : p.lightPools) ?? null,
      onBang: ce => {
        var ke;
        return (ke = J == null ? undefined : J.backfire) == null ? undefined : ke.call(J, ce);
      }
    }) : null,
    V = {
      gear: 0,
      peakRpm: 0,
      throttle: 0,
      cooldown: 0,
      launches: 0
    };
  let te = 1;
  const fe = Sfe({
      lensRain: lensRain
    }),
    Ce = vfe({
      speedBlur: speedBlur,
      camera: camera
    }),
    Ue = new Set(T.chassisColliders.map(ce => ce.handle)),
    Ae = p && performanceProfile.trafficCars > 0 ? await fpe(renderer).catch(ce => (console.warn("[drive] NPC car model unavailable, using the procedural car:", ce), null)) : null,
    Be = p && performanceProfile.trafficCars > 0 ? createTraffic({
      scene: h.root.parent,
      physics: f,
      map: p.map,
      groundY: _r,
      maxCars: performanceProfile.trafficCars,
      lightPools: p.lightPools,
      playerHandles: Ue,
      model: Ae
    }) : null;
  let He = 0;
  f.onContactForce(ce => {
    if (!Ue.has(ce.collider1()) && !Ue.has(ce.collider2())) return;
    const ke = ce.totalForceMagnitude(),
      Ie = performance.now();
    if (ke > 2e4 && Ie - He > 120) {
      He = Ie;
      M.addShake(Math.min(1.2, ke / 25e4));
      J == null || J.impact(ke);
      for (const ht of U.impact) ht(ke);
      const pt = Ue.has(ce.collider1()) ? ce.collider2() : ce.collider1(),
        kt = (A == null ? undefined : A.owns(pt)) || (y == null ? undefined : y.owns(pt));
      ke > 45e3 && !kt && I.crash();
    }
  });
  const at = new Vector3();
  let Re = 0,
    Fe = 0,
    Je = null,
    je = false,
    Te = true,
    ue = null;
  const $ = {
      horn: false,
      lights: false,
      flash: 0
    },
    q = .78,
    oe = ce => ce < .2 || ce > .34 && ce < .54;
  let xe = null;
  function me() {
    $.flash <= 0 && R.flash("HEADLIGHTS", 700);
    $.flash = q;
  }
  function ie(ce, ke) {
    var Ie, pt;
    $.horn = ke;
    xe == null || xe.set("me", ke);
    $.flash > 0 && ($.flash = Math.max(0, $.flash - ce));
    $.lights = $.flash > 0 && oe(q - $.flash);
    (pt = (Ie = p == null ? undefined : p.lightPools) == null ? undefined : Ie.setHighBeam) == null || pt.call(Ie, $.lights ? 1 : 0);
  }
  let Ne = null;
  function ze(ce) {
    const ke = Ne;
    Ne = ce ?? null;
    ke && !Ne && (M.snap(), ue = {
      from: camera.position.clone(),
      fromQuat: camera.quaternion.clone(),
      chasePos: camera.position.clone(),
      chaseQuat: camera.quaternion.clone(),
      t: 0,
      duration: .9
    });
  }
  let tt = false;
  function dt() {
    const ce = E.consumeActions();
    if (ce) for (const ke of ce) switch (ke) {
      case "shiftUp":
      case "shiftDown":
        {
          const Ie = T.drivetrain.state.automatic;
          if (Ie && T.telemetry.launch !== "off") break;
          ke === "shiftUp" ? T.shiftUp() : T.shiftDown();
          Ie && R.flash("MANUAL · G FOR AUTO", 2200);
          break;
        }
      case "toggleGearbox":
        {
          const Ie = !T.drivetrain.state.automatic;
          T.setAutomatic(Ie);
          R.flash(Ie ? "AUTOMATIC" : "MANUAL · Q / E");
          break;
        }
      case "pause":
        window.dispatchEvent(new Event("neon:pause"));
        break;
      case "reset":
        T.recover(), v.resetInterpolation(), M.snap(), R.flash("RECOVERED");
        break;
      case "camera":
        R.flash(M.cycleMode().toUpperCase());
        break;
      case "toggleAssists":
        Te = !Te, T.config.assists.tcs = Te, T.config.assists.abs = Te, T.config.assists.countersteer = Te ? S.def.config.assists.countersteer : 0, T.config.assists.esc = Te ? S.def.config.assists.esc : 0, R.flash(Te ? "ASSISTS ON" : "ASSISTS OFF · GOOD LUCK");
        break;
      case "exitVehicle":
        Math.abs(T.telemetry.speed) < 6 ? onExitVehicle == null || onExitVehicle() : R.flash("SLOW DOWN TO EXIT");
        break;
      case "lights":
        me();
        break;
      default:
        for (const Ie of U.action) Ie(ke);
        break;
    }
  }
  let Lt = false;
  function mt(ce) {
    Lt || Oe(ce);
  }
  let hs = false;
  function ge() {
    return !!(ye != null && ye.isOpen) || hs || isGameInputBlocked();
  }
  function Le() {
    var ce;
    if (ge()) { E.clear(); C?.clear(); }
    (ce = J == null ? undefined : J.setPaused) == null || ce.call(J, ge());
  }
  window.addEventListener("neon:boundary-change", Le);
  function Oe(ce) {
    var Tt, js, Cs, vs, er;
    if (C == null || C.setVisible(je && !ge()), ge()) {
      E.consumeActions();
      ie(0, false);
      return;
    }
    const ke = Math.min(ce, .1),
      Ie = E.update(ke, T.telemetry.speed);
    ie(ke, je && !!Ie.horn);
    je ? (dt(), T.setInput({
      throttle: Ie.throttle,
      brake: Ie.brake,
      steer: Ie.steer,
      handbrake: tt ? 1 : Ie.handbrake,
      nitro: Ie.nitro,
      assistLevel: Ie.device === "gamepad" ? .7 : 1
    })) : (E.consumeActions(), T.setInput({
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: 1,
      nitro: 0
    }));
    y == null || y.beforeStep(ke, T.body.translation(), T.body.linvel());
    const pt = f.update(ke);
    v.update(pt);
    const kt = T.body.translation();
    A == null || A.update(ke, kt);
    y == null || y.update(ke, kt);
    Be == null || Be.update(ke, camera, kt, T.body.rotation());
    const ht = T.telemetry;
    J == null || J.update(ht, T.wheels, ke, {
      inCar: je
    });
    const ts = J != null && J.setAcoustics ? x == null ? undefined : x.update(ke) : null;
    if (ts && J.setAcoustics(ts), S.lights.update({
      braking: ht.brake,
      reversing: ht.gear === -1
    }), j == null || j.update(T.wheels, ke), de == null || de.update({
      speed: ht.speed,
      grounded: ht.wheelsOnGround >= 2,
      wetness: ((js = (Tt = world.rain) == null ? undefined : Tt.params) == null ? undefined : js.enabled) === false ? .25 : 1,
      velocity: T.body.linvel()
    }, ke), (Cs = world.smoke) != null && Cs.setExhaustFade) {
      const zt = Math.abs(ht.speedKmh),
        Vt = 1 - MathUtils.smoothstep(zt, 3, 35),
        Ds = Vt < te ? 4 : 1.5;
      te += (Vt - te) * Math.min(1, ke * Ds);
      world.smoke.setExhaustFade(te);
    }
    if (K) {
      V.peakRpm = Math.max(ht.rpm, V.peakRpm - ke * 5e3);
      V.cooldown -= ke;
      V.throttle = Math.max(ht.throttle, V.throttle - ke * 2);
      const zt = Math.abs(ht.speedKmh);
      let Vt = null;
      ht.gear !== V.gear ? (V.gear >= 1 && ht.gear > V.gear && zt > 12 ? Vt = {
        strength: (V.peakRpm - 2500) / 4500
      } : ht.gear >= 1 && ht.gear < V.gear && zt > 25 && (Vt = {
        strength: .5,
        pops: true
      }), V.gear = ht.gear) : V.throttle > .75 && ht.throttle < .15 && ht.rpm > 4800 && (Vt = {
        strength: .45,
        pops: true
      });
      ht.launchCount !== V.launches && (V.launches = ht.launchCount, (ht.launchGrade === "rocket" || ht.launchGrade === "good") && (Vt = {
        strength: ht.launchGrade === "rocket" ? 1 : .7
      }, V.cooldown = 0));
      Vt && V.cooldown <= 0 && (K.burst(Vt), V.throttle = 0, V.cooldown = .35);
      K.setNitro(ht.nitro > 0);
      K.update(ke, T.body.linvel());
    }
    if (je) {
      I.update(ke, ht);
      for (let zt = I.nextEvent(); zt; zt = I.nextEvent()) {
        k.onEvent(zt);
        for (const Vt of U.drift) Vt(zt);
      }
      k.update(I, ke);
      L == null || L.update(ht, ke, Ie.device);
    }
    T.upsideDownTime > 2.5 && (T.recover(), v.resetInterpolation(), M.snap());
    const yt = T.body.translation();
    if (yt.y > _r - .6 && T.telemetry.wheelsOnGround >= 3 && (Re += ke, Re > .5)) {
      Re = 0;
      const zt = T.body.rotation();
      Je = {
        position: [yt.x, _r + .4, yt.z],
        yaw: Math.atan2(2 * (zt.w * zt.y + zt.x * zt.z), 1 - 2 * (zt.y * zt.y + zt.x * zt.x))
      };
    }
    if (yt.y < w - 1.2) {
      if (Fe += ke, Fe > 1.2) {
        Fe = 0;
        const zt = Je ?? _,
          Vt = p == null ? undefined : p.nearestRoadPose(zt.position[0], zt.position[2], zt.yaw),
          Ds = Vt ? m(Vt.x, Vt.z, Vt.yaw, Vt.width) : null,
          $n = Ds ? {
            position: [Ds[0], _r + .4, Ds[1]],
            yaw: Vt.yaw
          } : zt;
        T.reset($n.position, $n.yaw);
        v.resetInterpolation();
        M.snap();
        R.flash("SPLASH · BACK ON THE ROAD");
      }
    } else Fe = 0;
    if (fe == null || fe.update(ke, T.telemetry.speedKmh, je && ((er = (vs = world.rain) == null ? undefined : vs.params) == null ? undefined : er.enabled) !== false), Ce == null || Ce.update(ke, T.telemetry.speedKmh, T.body.linvel(), je, T.telemetry.nitro), Y.waypoint && (Y.timer -= ke, Y.timer <= 0)) {
      Y.timer = .75;
      const zt = P(),
        Vt = Y.track ? Y.track() : null;
      if (Y.track && !Vt) X(null), R.flash("THEY LEFT · GPS CLEARED");else if (Y.track && Math.hypot(zt.x - Vt.x, zt.z - Vt.z) < 24) X(null), R.flash(`FOUND ${Vt.name ?? "YOUR FRIEND"}`);else {
        if (Vt) {
          const Ds = z == null ? undefined : z.snap(Vt.x, Vt.z);
          Y.waypoint = Ds ? {
            x: Ds.x,
            z: Ds.z
          } : {
            x: Vt.x,
            z: Vt.z
          };
        }
        Y.owner !== "mission" && !Y.track && Math.hypot(zt.x - Y.waypoint.x, zt.z - Y.waypoint.z) < 22 ? (X(null), R.flash("DESTINATION REACHED")) : Y.noRoute || (Y.route = G(zt, Y.waypoint));
      }
    }
    if (ae) {
      const zt = P(),
        Vt = Y.waypoint ? Y.route : null,
        Ds = ae.update(ke, Vt, zt),
        $n = Ds && Ds.length > 12 ? FG(Ds) : null;
      if ($n && $n.s < 260) {
        const [bo, fr] = Ds[$n.index],
          [Gr, Am] = Ds[Math.max(0, $n.index - 4)],
          lA = Math.hypot(bo - Gr, fr - Am) || 1;
        ae.setTurn({
          x: bo,
          z: fr,
          dirX: (bo - Gr) / lA,
          dirZ: (fr - Am) / lA,
          side: $n.turn
        });
      } else ae.setTurn(null);
      if (je && Ds && Vt) {
        const [bo, fr] = Vt.points[0],
          Gr = Math.max(0, Vt.length - Math.hypot(zt.x - bo, zt.z - fr));
        ne.update(ke, Ds, zt, Gr, $n);
      } else ne.hide();
    }
    for (const zt of U.tick) zt(ke);
    if (je) {
      if (Ne && (Ie.throttle > .1 || Ie.brake > .1 || Math.abs(Ie.steer) > .2 || Ie.handbrake > 0 || Ie.nitro > 0 || !Ne(ke)) && ze(null), !Ne && (ue && (camera.position.copy(ue.chasePos), camera.quaternion.copy(ue.chaseQuat)), M.update(ke, Ie), ue)) {
        ue.chasePos.copy(camera.position);
        ue.chaseQuat.copy(camera.quaternion);
        ue.t += ke / ue.duration;
        const zt = Math.min(1, ue.t),
          Vt = zt * zt * (3 - 2 * zt);
        camera.position.lerpVectors(ue.from, ue.chasePos, Vt);
        camera.quaternion.slerpQuaternions(ue.fromQuat, ue.chaseQuat, Vt);
        zt >= 1 && (ue = null);
      }
      R.update(T.telemetry, {
        automatic: T.drivetrain.state.automatic,
        tcsEnabled: Te
      }, ke);
      h.root.getWorldPosition(at);
      F && (h.root.getWorldQuaternion(O), H.set(0, 0, 1).applyQuaternion(O), F.update({
        x: at.x,
        z: at.z,
        heading: Math.atan2(H.x, H.z)
      }, T.telemetry.speedKmh, "", Y));
    }
  }
  function et(ce, {
    blendFromCurrent = true
  } = {}) {
    var pt;
    const Ie = !!ce;
    if (Ie !== je) if (je = Ie, E.setEnabled(je), R.setVisible(je), k.setVisible(je), L == null || L.setVisible(je), je || I.bank(), F == null || F.setVisible(je), je) {
      const kt = (pt = S.neon) == null ? undefined : pt.next();
      kt && R.flash(`NEON · ${kt.name}`, 1800);
      M.snap();
      blendFromCurrent && (ue = {
        from: camera.position.clone(),
        fromQuat: camera.quaternion.clone(),
        chasePos: camera.position.clone(),
        chaseQuat: camera.quaternion.clone(),
        t: 0,
        duration: 1.1
      });
    } else ue = null, Ne = null;
  }
  function lt(ce) {
    var kt, ht, ts;
    if (!ce || ce === S) return;
    const ke = T.body.translation(),
      Ie = T.body.rotation(),
      pt = Math.atan2(2 * (Ie.w * Ie.y + Ie.x * Ie.z), 1 - 2 * (Ie.y * Ie.y + Ie.x * Ie.x));
    h.root.remove(S.model);
    h.root.add(ce.model);
    v.dispose();
    T.dispose();
    S = ce;
    Object.assign(h, {
      model: ce.model,
      rigNode: ce.rigNode,
      body: ce.body,
      wheels: ce.wheels,
      rig: ce.rig
    });
    T = createVehicle({
      RAPIER: f.RAPIER,
      physics: f,
      config: structuredClone(ce.def.config),
      rig: ce.rig,
      spawn: {
        position: [ke.x, ke.y + .05, ke.z],
        yaw: pt
      }
    });
    T.config.assists.tcs = Te;
    T.config.assists.abs = Te;
    Te || (T.config.assists.countersteer = 0, T.config.assists.esc = 0);
    v = createVehicleRigSync({
      vehicle: T,
      physics: f,
      rig: {
        root: h.root,
        wheels: ce.wheels
      }
    });
    T.setInput({
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: 1,
      nitro: 0
    });
    for (let yt = 0; yt < 45; yt++) f.stepOnce();
    v.resetInterpolation();
    v.update(1);
    h.root.updateMatrixWorld(true);
    Ue.clear();
    for (const yt of T.chassisColliders) Ue.add(yt.handle);
    M.setExcludeBody(T.body);
    M.setCarFrame(ce.def.camera);
    M.snap();
    de == null || de.setRearWheels(T.wheels.filter(yt => !yt.front));
    K == null || K.setPipes(ce.def.tailpipes);
    Q(ce);
    (ts = (kt = p == null ? undefined : p.lightPools) == null ? undefined : kt.setUnderglow) == null || ts.call(kt, ((ht = ce.neon) == null ? undefined : ht.underglow) ?? null);
    R.setRedline(ce.def.config.engine.redlineRpm, B(ce.def));
    Object.assign(V, {
      gear: 0,
      peakRpm: 0,
      throttle: 0,
      cooldown: 0,
      launches: 0
    });
    Je = null;
  }
  function Et(ce = new Vector3()) {
    h.root.updateMatrixWorld();
    return ce.set(1.9, 0, .2).applyMatrix4(h.root.matrixWorld);
  }
  function Gt(ce) {
    h.root.getWorldPosition(ca);
    return Math.hypot(ce.x - ca.x, ce.z - ca.z);
  }
  function es({
    x: ce,
    z: ke,
    yaw: yaw,
    width = 12,
    lane = true
  }) {
    const [ht, ts] = lane ? m(ce, ke, yaw, width) : [ce, ke];
    T.reset([ht, _r + .4, ts], yaw);
    v.resetInterpolation();
    v.update(1);
    h.root.updateMatrixWorld(true);
    M.snap();
    Je = null;
    Be == null || Be.clearAround(ht, ts, 45);
  }
  return {
    physics: f,
    get vehicle() {
      return T;
    },
    get visual() {
      return v;
    },
    get car() {
      return S;
    },
    setCar: lt,
    spawn: _,
    dynamicProps: A,
    lampProps: y,
    traffic: Be,
    exhaustFlames: K,
    tireSpray: de,
    driftScore: I,
    setUiAwake: ce => k.setUiAwake(ce),
    cityMap: ye,
    setWaypoint: X,
    teleportTo: le,
    canTeleport: re,
    setMissionActive(ce) {
      se = !!ce;
      Be == null || Be.setDensity(se ? vpe : 1);
    },
    isMissionActive: () => se,
    gps: Y,
    setMenuPaused(ce) {
      hs = !!ce;
      Le();
    },
    setAudio(ce) {
      J = ce ?? null;
    },
    setHornAudio(ce) {
      xe = ce ?? null;
    },
    signals: $,
    flashHeadlights: me,
    setMapPing(ce) {
      we = ce ?? null;
    },
    setCameraOverride: ze,
    isCameraOverridden: () => !!Ne,
    onAction: ce => (U.action.add(ce), () => U.action.delete(ce)),
    input: E,
    chase: M,
    hud: R,
    update: mt,
    tick: Oe,
    setManualClock: ce => {
      Lt = !!ce;
    },
    setActive: et,
    isActive: () => je,
    isPaused: ge,
    getDoorPosition: Et,
    distanceTo: Gt,
    placeCar: es,
    setHold(ce) {
      tt = !!ce;
    },
    playerPose: P,
    minimap: F,
    onImpact: ce => (U.impact.add(ce), () => U.impact.delete(ce)),
    onDriftEvent: ce => (U.drift.add(ce), () => U.drift.delete(ce)),
    onTick: ce => (U.tick.add(ce), () => U.tick.delete(ce)),
    setBaseFov: ce => M.setBaseFov(ce)
  };
}
