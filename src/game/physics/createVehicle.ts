// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Fl, Whe, hb, $he, fb, $L, jhe, Yhe, Khe, Xhe } from "./launchControl.ts";
import { Ghe, GS, vd } from "./tires.ts";
import { createDrivetrain } from "./drivetrain.ts";
export function gs(i, e, t) {
  return i < e ? e : i > t ? t : i;
}
export function pb(i, e, t, s, n) {
  const r = i.w * e + i.y * s - i.z * t,
    o = i.w * t + i.z * e - i.x * s,
    a = i.w * s + i.x * t - i.y * e,
    l = -i.x * e - i.y * t - i.z * s;
  n.x = r * i.w + l * -i.x + o * -i.z - a * -i.y;
  n.y = o * i.w + l * -i.y + a * -i.x - r * -i.z;
  n.z = a * i.w + l * -i.z + r * -i.y - o * -i.x;
  return n;
}
export const nn = (i, e) => i.x * e.x + i.y * e.y + i.z * e.z;
export function Jhe(i, e, t) {
  const s = i.y * e.z - i.z * e.y,
    n = i.z * e.x - i.x * e.z,
    r = i.x * e.y - i.y * e.x;
  t.x = s;
  t.y = n;
  t.z = r;
  return t;
}
export function Zhe(i) {
  const e = Math.hypot(i.x, i.y, i.z) || 1;
  i.x /= e;
  i.y /= e;
  i.z /= e;
  return i;
}
export const Mi = (i = 0, e = 0, t = 0) => ({
  x: i,
  y: e,
  z: t
});
export function createVehicle({
  RAPIER: RAPIER,
  physics: physics,
  config: config,
  rig: rig,
  spawn: spawn
}) {
  var je;
  const r = physics.world,
    o = config.mass,
    a = config.centerOfMass,
    l = RAPIER.RigidBodyDesc.dynamic().setTranslation(spawn.position[0], spawn.position[1], spawn.position[2]).setRotation(le(spawn.yaw)).setAdditionalMassProperties(o, {
      x: a[0],
      y: a[1],
      z: a[2]
    }, {
      x: config.inertia[0],
      y: config.inertia[1],
      z: config.inertia[2]
    }, {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    }).setCanSleep(false).setAngularDamping(.02).setCcdEnabled(true),
    c = r.createRigidBody(l),
    u = [];
  for (const Te of config.chassisColliders) {
    const ue = RAPIER.ColliderDesc.roundCuboid(Te.half[0] - Te.radius, Te.half[1] - Te.radius, Te.half[2] - Te.radius, Te.radius).setTranslation(Te.offset[0], Te.offset[1], Te.offset[2]).setDensity(0).setFriction(config.chassisFriction).setRestitution(config.chassisRestitution).setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(1500);
    u.push(r.createCollider(ue, c));
  }
  const d = rig.wheelbase,
    h = rig.wheels.find(Te => Te.front).position[2],
    f = rig.wheels.find(Te => !Te.front).position[2],
    p = (a[2] - f) / (h - f),
    m = rig.wheels.map((Te, ue) => {
      const $ = Te.front ? "front" : "rear",
        q = config.suspension[$],
        oe = config.tires[$],
        xe = Te.front ? p : 1 - p,
        me = o * Fl * xe / 2;
      return {
        id: Te.id,
        index: ue,
        front: Te.front,
        left: Te.left,
        driven: !Te.front,
        radius: Te.radius,
        width: Te.width,
        hub: Te.position,
        hardpoint: [Te.position[0], Te.position[1] + q.travelUp, Te.position[2]],
        travel: q.travelUp + q.travelDown,
        susp: q,
        tire: Ghe(oe),
        inertia: oe.inertia,
        staticLoad: me,
        omega: 0,
        spin: 0,
        steer: 0,
        contact: false,
        suspensionLength: q.travelUp,
        compression: q.travelDown,
        compressionVelocity: 0,
        Fz: me,
        fx: 0,
        fy: 0,
        kappa: 0,
        tanAlpha: 0,
        gainX: 0,
        kOmega: 0,
        effInertia: oe.inertia,
        omegaBefore: 0,
        tau: 0,
        slipRatio: 0,
        slipAngle: 0,
        slipCombined: 0,
        vLong: 0,
        vLat: 0,
        grip: 1,
        surface: null,
        absFactor: 1,
        brakeTorque: 0,
        skid: 0,
        contactPoint: Mi(),
        contactNormal: Mi(0, 1, 0),
        hubWorld: Mi(),
        fwd: Mi(),
        lat: Mi(),
        fxAcc: 0,
        fyAcc: 0,
        subFx: 0,
        subFy: 0
      };
    }),
    A = m.filter(Te => Te.driven),
    g = A.find(Te => Te.left),
    b = A.find(Te => !Te.left),
    x = createDrivetrain(config),
    y = Mi(),
    _ = {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    w = Mi(),
    S = Mi(),
    T = Mi(),
    v = Mi(),
    E = Mi(),
    C = Mi(),
    M = Mi(),
    B = Mi(),
    R = Mi(),
    I = {
      fx: 0,
      fy: 0,
      s: 0,
      mu: 0
    },
    k = {
      fx: 0,
      fy: 0,
      s: 0,
      mu: 0
    },
    L = new RAPIER.Ray({
      x: 0,
      y: 0,
      z: 0
    }, {
      x: 0,
      y: -1,
      z: 0
    }),
    F = {
      speed: 0,
      speedKmh: 0,
      travelKmh: 0,
      rpm: 0,
      gear: 1,
      throttle: 0,
      brake: 0,
      steer: 0,
      lateralG: 0,
      longitudinalG: 0,
      yawRate: 0,
      slipAngleBody: 0,
      wheelsOnGround: 0,
      load: 0,
      soundLoad: 0,
      shifting: false,
      tcsActive: false,
      absActive: false,
      escActive: false,
      nitro: 0,
      nitroCharge: 1,
      launch: "off",
      launchNeedle: 0,
      launchGrade: "",
      launchCount: 0,
      launchT100: NaN,
      drifting: false,
      driftAngle: 0,
      driftDir: 0,
      turnTarget: 0
    };
  let O = Mi(),
    H = 0,
    W = 0,
    P = 0;
  const z = .55,
    Y = 1.5,
    G = {
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: 0,
      nitro: 0,
      assistLevel: 1
    };
  let X = 0,
    ae = 1,
    ne = false;
  const se = (je = config.arcade) != null && je.launch ? Whe(config.arcade.launch) : null,
    re = {
      active: false,
      dir: 0,
      time: 0,
      closed: 0,
      flipTimer: 0,
      tireScale: 1
    };
  function le(Te) {
    return {
      x: 0,
      y: Math.sin(Te / 2),
      z: 0,
      w: Math.cos(Te / 2)
    };
  }
  function we() {
    const Te = c.translation();
    y.x = Te.x;
    y.y = Te.y;
    y.z = Te.z;
    const ue = c.rotation();
    _.x = ue.x;
    _.y = ue.y;
    _.z = ue.z;
    _.w = ue.w;
    const $ = c.linvel();
    w.x = $.x;
    w.y = $.y;
    w.z = $.z;
    pb(_, 1, 0, 0, S);
    pb(_, 0, 1, 0, T);
    pb(_, 0, 0, 1, v);
  }
  function Se(Te, ue, $, q) {
    pb(_, Te, ue, $, q);
    q.x += y.x;
    q.y += y.y;
    q.z += y.z;
    return q;
  }
  function ye(Te) {
    const ue = config.steering,
      $ = nn(w, v),
      q = Math.abs($);
    let oe = ue.maxAngle;
    if (G.assistLevel > 0 && config.assists.steerLimit && q > 1) {
      const ie = ue.assistUndersteerSpeed ?? 1 / 0,
        Ne = ue.assistLateralG * Fl * d / (q * q) * (1 + (q / ie) ** 2),
        ze = ue.assistFastFrom ?? 20,
        tt = gs((q - ze) / ((ue.assistFastSpeed ?? 55) - ze), 0, 1),
        dt = ue.assistSlipAllowance + ((ue.assistSlipAllowanceFast ?? ue.assistSlipAllowance) - ue.assistSlipAllowance) * tt;
      oe = Math.min(oe, Ne + dt);
    }
    let xe = G.steer * oe;
    if (re.active) xe = gs(-F.driftAngle * .85 + G.steer * ue.maxAngle * .2, -ue.maxAngle, ue.maxAngle);else if (G.assistLevel > 0 && config.assists.countersteer > 0 && q > 2) {
      const ie = c.velocityAtPoint(Se(0, .3, h, B)),
        Ne = nn(ie, v),
        ze = nn(ie, S),
        tt = Math.atan2(ze, Math.max(Math.abs(Ne), .5)),
        dt = c.velocityAtPoint(Se(0, .3, f, B)),
        Lt = Math.atan2(nn(dt, S), Math.max(Math.abs(nn(dt, v)), .5)),
        mt = gs((Math.abs(Lt) - .06) / .18, 0, 1);
      xe += tt * config.assists.countersteer * mt * G.assistLevel;
    }
    xe = gs(xe, -ue.maxAngle, ue.maxAngle);
    const me = Math.abs(m[0].hub[0]);
    for (const ie of m) {
      if (!ie.front) {
        ie.steer = 0;
        continue;
      }
      if (Math.abs(xe) < 1e-4) {
        ie.steer = xe;
        continue;
      }
      const Ne = d / Math.tan(Math.abs(xe)),
        ze = xe > 0 === ie.left,
        tt = Math.atan(d / (Ne + (ze ? -me : me))),
        dt = Math.abs(xe) + (tt - Math.abs(xe)) * ue.ackermann;
      ie.steer = Math.sign(xe) * dt;
    }
    F.steer = xe;
  }
  function U() {
    let Te = 0;
    for (const ue of m) {
      const $ = Se(ue.hardpoint[0], ue.hardpoint[1], ue.hardpoint[2], E);
      L.origin.x = $.x;
      L.origin.y = $.y;
      L.origin.z = $.z;
      L.dir.x = -T.x;
      L.dir.y = -T.y;
      L.dir.z = -T.z;
      const q = ue.travel + ue.radius,
        oe = r.castRayAndGetNormal(L, q, true, RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC, undefined, undefined, c),
        xe = ue.compression;
      if (oe) {
        const me = oe.timeOfImpact;
        ue.contact = true;
        ue.suspensionLength = gs(me - ue.radius, 0, ue.travel);
        ue.compression = ue.travel - ue.suspensionLength;
        ue.contactPoint.x = $.x + L.dir.x * me;
        ue.contactPoint.y = $.y + L.dir.y * me;
        ue.contactPoint.z = $.z + L.dir.z * me;
        ue.contactNormal.x = oe.normal.x;
        ue.contactNormal.y = oe.normal.y;
        ue.contactNormal.z = oe.normal.z;
        const ie = physics.getSurface(oe.collider);
        ue.surface = ie;
        ue.grip = ie.grip * config.weatherGrip;
        const Ne = c.velocityAtPoint(ue.contactPoint);
        ue.compressionVelocity = -(Ne.x * oe.normal.x + Ne.y * oe.normal.y + Ne.z * oe.normal.z);
        Te += 1;
      } else ue.contact = false, ue.suspensionLength = ue.travel, ue.compression = 0, ue.compressionVelocity = 0, ue.surface = null, ue.grip = 0;
      ue.hubWorld.x = $.x + L.dir.x * ue.suspensionLength;
      ue.hubWorld.y = $.y + L.dir.y * ue.suspensionLength;
      ue.hubWorld.z = $.z + L.dir.z * ue.suspensionLength;
      ue.prevCompression = xe;
    }
    return Te;
  }
  function J() {
    for (const Te of m) {
      if (!Te.contact) {
        Te.Fz = 0;
        continue;
      }
      const ue = Te.susp,
        $ = ue.travelDown;
      let q = Te.staticLoad + ue.spring * (Te.compression - $);
      q = Math.max(q, 0);
      const oe = Te.compressionVelocity;
      q += oe > 0 ? ue.bumpDamping * oe : ue.reboundDamping * oe;
      const xe = Te.travel - ue.bumpStop;
      Te.compression > xe && (q += ue.bumpStopRate * (Te.compression - xe));
      Te.Fz = q;
    }
    for (const Te of ["front", "rear"]) {
      const ue = m.filter(me => Te === "front" === me.front),
        [$, q] = ue;
      if (!$.contact || !q.contact) continue;
      const xe = config.suspension[Te].antiRoll * ($.compression - q.compression);
      $.Fz += xe;
      q.Fz -= xe;
    }
    for (const Te of m) Te.Fz < 0 && (Te.Fz = 0);
  }
  function Q() {
    for (const Te of m) {
      if (!Te.contact) continue;
      const ue = Math.cos(Te.steer),
        $ = Math.sin(Te.steer);
      Te.fwd.x = v.x * ue + S.x * $;
      Te.fwd.y = v.y * ue + S.y * $;
      Te.fwd.z = v.z * ue + S.z * $;
      const q = Te.contactNormal,
        oe = nn(Te.fwd, q);
      Te.fwd.x -= q.x * oe;
      Te.fwd.y -= q.y * oe;
      Te.fwd.z -= q.z * oe;
      Zhe(Te.fwd);
      Jhe(q, Te.fwd, Te.lat);
      const xe = c.velocityAtPoint(Te.contactPoint);
      Te.vLong = nn(xe, Te.fwd);
      Te.vLat = nn(xe, Te.lat);
    }
  }
  function j(Te, ue) {
    const $ = Te / hb,
      q = config.brakes,
      oe = config.assists.abs;
    let xe = false;
    for (const me of m) {
      me.fxAcc = 0;
      me.fyAcc = 0;
      const ie = me.front ? q.frontBias : 1 - q.frontBias,
        Ne = me.front ? 1 : te;
      me.brakeTorque = ue.brake * q.maxTorque * ie * .5 * Ne + (me.escTorque ?? 0);
      me.handbrakeTorque = !me.front && !re.active ? G.handbrake * q.handbrakeTorque * V : 0;
    }
    for (let me = 0; me < hb; me++) {
      for (const ie of m) {
        const Ne = ie.tire;
        if (!ie.contact || ie.Fz <= 0) {
          const es = Math.exp(-30 * $);
          ie.kappa *= es;
          ie.tanAlpha *= es;
          ie.subFx = 0;
          ie.subFy = 0;
          ie.kOmega = 0;
          ie.tau = 0;
          continue;
        }
        const ze = Math.max(Math.abs(ie.vLong), $he),
          tt = gs(1 - ie.slipCombined * ie.slipCombined, .06, 1),
          dt = ze / (Ne.relaxationLongitudinal * tt),
          Lt = ze / (Ne.relaxationLateral * tt),
          mt = Math.exp(-dt * $),
          hs = Math.exp(-Lt * $);
        ie.gainX = (1 - mt) / ze;
        const ge = (ie.omega * ie.radius - ie.vLong) / ze,
          Le = -ie.vLat / ze;
        ie.kappa = gs(ge + (ie.kappa - ge) * mt, -fb, fb);
        ie.tanAlpha = gs(Le + (ie.tanAlpha - Le) * hs, -$L, $L);
        const Oe = ie.tanAlpha * re.tireScale;
        GS(Ne, ie.Fz, ie.kappa, Oe, ie.grip, I);
        const et = I.fx,
          lt = .004;
        GS(Ne, ie.Fz, ie.kappa + lt, Oe, ie.grip, k);
        const Et = Math.max((k.fx - et) / lt, 0);
        ie.kOmega = Et * ie.gainX * ie.radius;
        const Gt = Ne.rollingResistance * ie.Fz * ie.radius * Math.tanh(ie.omega * 2);
        ie.tau = -et * ie.radius - Gt;
        ie.effInertia = ie.inertia + $ * ie.radius * ie.kOmega;
      }
      for (const ie of m) ie.omegaBefore = ie.omega;
      x.step($, g, b, g.tau, b.tau);
      for (const ie of m) ie.driven || (ie.omega += ie.tau / (ie.effInertia ?? ie.inertia) * $);
      for (const ie of m) {
        let Ne = ie.brakeTorque;
        if (oe && Ne > 0 && ie.contact) {
          const Lt = -ie.tire.peakSlipRatio * 1.1;
          ie.kappa < Lt && Math.abs(ie.vLong) > 2 ? (ie.absFactor = Math.max(.15, ie.absFactor - 22 * $), xe = true) : ie.absFactor = Math.min(1, ie.absFactor + 9 * $);
          Ne *= ie.absFactor;
        } else ie.absFactor = 1;
        if (Ne += ie.handbrakeTorque, Ne <= 0) continue;
        const ze = ie.effInertia ?? ie.inertia,
          tt = ie.driven ? x.drivenInertia(ze) : ze,
          dt = Ne * $ / tt;
        Math.abs(ie.omega) <= dt ? ie.omega = 0 : ie.omega -= Math.sign(ie.omega) * dt;
      }
      for (const ie of m) {
        if (!ie.contact || ie.Fz <= 0) continue;
        ie.kappa = gs(ie.kappa + (ie.omega - ie.omegaBefore) * ie.radius * ie.gainX, -fb, fb);
        GS(ie.tire, ie.Fz, ie.kappa, ie.tanAlpha * re.tireScale, ie.grip, I);
        let Ne = I.fx,
          ze = I.fy * re.tireScale;
        ie.slipCombined = I.s;
        const tt = gs(1 - Math.abs(ie.vLong) / 5, 0, 1);
        tt > 0 && (ze -= 2.2 * ie.Fz * ie.vLat * tt, ie.omega === 0 && (Ne -= 1.5 * ie.Fz * ie.vLong * tt));
        const dt = I.mu * ie.Fz * 1.05,
          Lt = Math.hypot(Ne, ze);
        Lt > dt && Lt > 0 && (Ne *= dt / Lt, ze *= dt / Lt);
        ie.subFx = Ne;
        ie.subFy = ze;
      }
      for (const ie of m) ie.fxAcc += ie.subFx, ie.fyAcc += ie.subFy;
    }
    for (const me of m) {
      me.fx = me.fxAcc / hb;
      me.fy = me.fyAcc / hb;
      me.slipRatio = me.kappa;
      me.slipAngle = Math.atan(me.tanAlpha);
      me.spin += me.omega * Te;
      const ie = Math.hypot(me.omega * me.radius - me.vLong, me.vLat);
      me.skid = me.contact ? gs((ie - 1.5) / 6, 0, 1) * gs(me.Fz / me.staticLoad, 0, 1.5) : 0;
    }
    F.absActive = xe;
  }
  let de = 1,
    K = 0,
    V = 1,
    te = 1;
  function fe(Te) {
    var Oe;
    for (const et of m) et.escTorque = 0;
    F.escActive = false;
    V = 1;
    te = 1;
    const ue = config.assists.esc;
    if (!ue || G.assistLevel <= 0 || re.active || re.tireScale < .95) return;
    let $ = config.assists.escDeadband ?? .14;
    G.handbrake > .1 && (K = config.assists.escHandbrakeHold ?? .3);
    const q = K > 0 || G.handbrake > .1;
    q && ($ = config.assists.escHandbrakeAllowance ?? .9, K -= Te);
    const oe = Math.abs(nn(w, v));
    if (oe < 5) return;
    const xe = (config.assists.escDeadbandSpeed ?? 20) / oe;
    $ *= q ? gs(xe, config.assists.escHandbrakeAllowanceMin ?? 1, 1) : gs(xe, config.assists.escDeadbandMin ?? 1, 1);
    const me = c.angvel(),
      ie = me.x * T.x + me.y * T.y + me.z * T.z,
      Ne = F.steer,
      ze = config.assists.escCharSpeed ?? 24;
    let tt = oe * Math.tan(Ne) / d / (1 + (oe / ze) ** 2);
    const dt = .9 * config.tires.rear.mu * (config.weatherGrip ?? 1) * Fl / oe;
    tt = gs(tt, -dt, dt);
    (Oe = config.arcade) != null && Oe.turn && Math.abs(F.turnTarget) > Math.abs(tt) && (tt = F.turnTarget);
    let mt = Math.sign(ie) === Math.sign(tt) && Math.abs(tt) > .02 ? Math.abs(ie) - Math.abs(tt) : Math.abs(ie);
    const hs = config.assists.escSlipLimit ?? 0;
    if (hs > 0 && !q && oe > 12) {
      const et = Math.atan2(nn(w, S), oe);
      et * ie < 0 && (mt += Math.max(0, Math.abs(et) - hs) * (config.assists.escSlipGain ?? 2.5));
    }
    if (G.brake > .05 && !q && (te = 1 - gs((mt - $ * .5) / .3, 0, .75) * ue), G.handbrake > .1 && (V = 1 - gs((mt - $ * .35) / .45, 0, .9) * ue), mt <= $) return;
    const ge = Math.min(config.brakes.escMaxTorque ?? 2400, (mt - $) * 4500 * ue),
      Le = ie < 0;
    for (const et of m) et.front && et.left === Le && (et.escTorque = ge);
    F.escActive = true;
  }
  function Ce(Te) {
    const ue = x.state,
      $ = Math.abs(x.gearRatio(ue.gear));
    if (!config.assists.tcs || $ === 0 || re.active) {
      ue.torqueLimit = 1 / 0;
      F.tcsActive = false;
      return;
    }
    let q = 0,
      oe = 0;
    for (const ze of A) {
      if (!ze.contact) continue;
      const tt = ze.tire,
        dt = gs(1 - tt.loadSensitivity * (ze.Fz - tt.nominalLoad) / tt.nominalLoad, .65, 1.25),
        Lt = tt.mu * ze.grip * dt * ze.Fz,
        mt = gs(Math.abs(ze.fy) / Math.max(Lt, 1), 0, .98);
      q += Lt * Math.sqrt(1 - mt * mt) * tt.longitudinalGrip * ze.radius;
      const hs = (ze.omega * ze.radius - ze.vLong) / Math.max(Math.abs(ze.vLong), 4);
      oe = Math.max(oe, hs * Math.sign(ze.omega || 1));
    }
    const xe = g.tire.peakSlipRatio * 1.15,
      me = ue.throttle * x.fullTorque(x.engineRpm()),
      ie = me >= ue.torqueLimit * .98;
    oe > xe ? de = Math.max(.5, de - (oe - xe) * 10 * Te) : oe < xe * .7 && ie ? de = Math.min(1.03, de + 1.2 * Te) : ie || (de += (1 - de) * Math.min(1, 2 * Te));
    const Ne = q * .96 * de / ($ * config.gearbox.efficiency);
    ue.torqueLimit = Ne;
    F.tcsActive = me > Ne * 1.02 || de < .97;
  }
  function Ue(Te, ue) {
    c.resetForces(false);
    c.resetTorques(false);
    for (const ie of m) {
      if (!ie.contact) continue;
      M.x = T.x * ie.Fz;
      M.y = T.y * ie.Fz;
      M.z = T.z * ie.Fz;
      c.addForceAtPoint(M, ie.contactPoint, false);
      const Ne = ie.susp.rollCenter;
      B.x = ie.contactPoint.x + T.x * Ne;
      B.y = ie.contactPoint.y + T.y * Ne;
      B.z = ie.contactPoint.z + T.z * Ne;
      M.x = ie.fwd.x * ie.fx + ie.lat.x * ie.fy;
      M.y = ie.fwd.y * ie.fx + ie.lat.y * ie.fy;
      M.z = ie.fwd.z * ie.fx + ie.lat.z * ie.fy;
      c.addForceAtPoint(M, B, false);
    }
    const $ = config.aero,
      q = Math.hypot(w.x, w.y, w.z);
    if (q > .1) {
      const ie = .5 * $.airDensity,
        Ne = ie * $.dragArea * (1 - z * P) * q;
      M.x = -w.x * Ne;
      M.y = -w.y * Ne;
      M.z = -w.z * Ne;
      Se(a[0], a[1], a[2], B);
      c.addForceAtPoint(M, B, false);
      const ze = nn(w, v),
        tt = ie * ze * ze;
      for (const [dt, Lt] of [[$.downforceFront, h], [$.downforceRear, f]]) {
        const mt = tt * dt;
        M.x = -T.x * mt;
        M.y = -T.y * mt;
        M.z = -T.z * mt;
        Se(0, a[1], Lt, B);
        c.addForceAtPoint(M, B, false);
      }
    }
    const oe = config.arcade,
      xe = Math.hypot(w.x, w.z);
    let me = ue >= 2 ? (se == null ? undefined : se.state.push) ?? 0 : 0;
    if (ne && oe != null && oe.nitro) {
      const ie = oe.nitro;
      me += ie.accel * gs((ie.maxSpeed - Math.max(0, nn(w, v))) / 15, 0, 1);
    }
    if (oe != null && oe.forward && x.state.gear >= 1 && ue >= 2) {
      const ie = oe.forward;
      me += ie.accel * Te.throttle * gs(1 - nn(w, v) / ie.maxSpeed, 0, 1);
    }
    if (oe != null && oe.reverse && x.state.gear === -1 && ue >= 2) {
      const ie = oe.reverse;
      me -= ie.accel * Te.throttle * gs((ie.maxSpeed + nn(w, v)) / 5, 0, 1);
    }
    if (P > .01 && ue >= 2 && xe > 8 && (me += Y * P * Te.throttle), me !== 0) {
      const ie = Math.hypot(v.x, v.z) || 1,
        Ne = o * me;
      M.x = v.x / ie * Ne;
      M.y = 0;
      M.z = v.z / ie * Ne;
      Se(a[0], a[1], a[2], B);
      c.addForceAtPoint(M, B, false);
    }
    if (oe && ue >= 2 && xe > .3) {
      let ie = Te.brake * (oe.brakeAssist ?? 0);
      if (Te.throttle < .05 && Te.brake < .05 && (ie += oe.coastDrag ?? 0), ie > 0) {
        const Ne = o * ie * gs(xe / 4, 0, 1) / xe;
        M.x = -w.x * Ne;
        M.y = 0;
        M.z = -w.z * Ne;
        Se(a[0], a[1], a[2], B);
        c.addForceAtPoint(M, B, false);
      }
    }
    He(ue);
  }
  function Ae() {
    return Math.atan2(-nn(w, S), Math.max(nn(w, v), .5));
  }
  function Be(Te, ue) {
    var ze;
    const $ = (ze = config.arcade) == null ? undefined : ze.drift;
    if (!$) return;
    const q = nn(w, v),
      oe = Math.hypot(w.x, w.z),
      xe = Ae(),
      me = G.handbrake > .5;
    if (re.active) {
      re.time += Te;
      -G.steer * re.dir > .85 && G.throttle > .5 ? (re.flipTimer += Te, re.flipTimer >= $.flipHold && (re.dir = -re.dir, re.flipTimer = 0, re.closed = 0, re.time = 0)) : re.flipTimer = 0;
      const tt = !me && re.time > $.grace && Math.abs(xe) < $.exitAngle;
      re.closed = tt ? re.closed + Te : 0;
      (oe < $.exitSpeed || q <= 0 || ue < 2 || re.closed >= $.exitHold) && (re.active = false, re.dir = 0);
    } else if (me && oe > $.minSpeed && q > 0 && ue >= 3 && (Math.abs(G.steer) > .15 || Math.abs(xe) > .1)) {
      re.active = true;
      re.dir = Math.sign(Math.abs(G.steer) > .15 ? G.steer : xe);
      re.time = 0;
      re.closed = 0;
      re.flipTimer = 0;
      const tt = c.angvel(),
        dt = re.dir * $.kick;
      c.setAngvel({
        x: tt.x + T.x * dt,
        y: tt.y + T.y * dt,
        z: tt.z + T.z * dt
      }, true);
    }
    const ie = re.active ? Math.max(me ? 1 : 0, Math.max(0, G.steer * re.dir)) : 0,
      Ne = re.active ? $.tireLateral + (1 - $.tireLateral) * $.settleGrip * (1 - ie) : 1;
    re.tireScale += (Ne - re.tireScale) * Math.min(1, Te * (re.active ? 25 : 3 / $.regain));
    F.drifting = re.active;
    F.driftDir = re.dir;
    F.driftAngle = oe > 2 ? xe : 0;
  }
  function He(Te) {
    const ue = config.arcade;
    if (F.turnTarget = 0, !ue || Te < 3) return;
    const $ = nn(w, v),
      q = Math.hypot(w.x, w.z),
      oe = config.inertia[1],
      xe = nn(c.angvel(), T);
    if (Se(a[0], a[1], a[2], B), re.active && ue.drift) {
      const mt = ue.drift;
      if (q < 1) return;
      const hs = w.x / q,
        ge = w.z / q,
        Le = ge,
        Oe = -hs,
        et = Math.max(0, G.steer * re.dir),
        lt = Math.max(0, -G.steer * re.dir),
        Et = gs(G.throttle, 0, 1),
        Gt = G.handbrake > .5,
        es = Gt ? 1 : et,
        Fs = Gt ? 1 : Et * et,
        In = ((mt.angleLift + (mt.angle - mt.angleLift) * Fs) * es + (mt.angleMax - mt.angle) * et) * (1 - lt) + (Gt ? mt.handbrakeAngle : 0),
        qe = mt.lateralGLift + (mt.lateralG - mt.lateralGLift) * Et,
        st = qe + (mt.lateralGMax - qe) * et,
        it = mt.lateralGMin + (st - mt.lateralGMin) * es * (1 - lt),
        Mt = re.dir * it * Fl * gs(q / 10, 0, 1),
        Pe = Ae(),
        Pt = mt.drag * Math.abs(Math.sin(Pe)) + (Gt ? mt.handbrakeDrag : 0);
      M.x = (Le * Mt - hs * Pt) * o;
      M.y = 0;
      M.z = (Oe * Mt - ge * Pt) * o;
      c.addForceAtPoint(M, B, false);
      const ce = gs(mt.yawP * (re.dir * In - Pe) + mt.yawD * (Mt / q - xe), -mt.maxYawAccel, mt.maxYawAccel);
      R.x = T.x * oe * ce;
      R.y = T.y * oe * ce;
      R.z = T.z * oe * ce;
      c.addTorque(R, false);
      return;
    }
    const me = ue.drift ? gs((re.tireScale - ue.drift.tireLateral) / (1 - ue.drift.tireLateral), 0, 1) : 1;
    if (me < .999 && q > 2 && $ > 0) {
      const mt = w.x / q,
        hs = w.z / q;
      let ge = v.x - mt * (v.x * mt + v.z * hs),
        Le = v.z - hs * (v.x * mt + v.z * hs);
      const Oe = Math.hypot(ge, Le);
      if (Oe > 1e-4) {
        ge /= Oe;
        Le /= Oe;
        const et = Math.abs(Ae()) / ue.drift.exitTurn * (1 - me);
        M.x = ge * et * q * o;
        M.y = 0;
        M.z = Le * et * q * o;
        c.addForceAtPoint(M, B, false);
      }
    }
    const ie = ue.turn;
    if (!ie || G.assistLevel <= 0 || $ <= 0) return;
    const Ne = gs(($ - ie.fromSpeed) / (ie.fullSpeed - ie.fromSpeed), 0, 1) * me * G.assistLevel;
    if (Ne <= 0) return;
    const ze = Math.min($ * Math.tan(config.steering.maxAngle) / d, ie.lateralG * Fl / $),
      tt = G.steer * ze;
    F.turnTarget = tt;
    const dt = gs((tt - xe) * ie.yawGain, -ie.maxYawAccel, ie.maxYawAccel) * Ne;
    R.x = T.x * oe * dt;
    R.y = T.y * oe * dt;
    R.z = T.z * oe * dt;
    c.addTorque(R, false);
    const Lt = gs(-nn(w, S) * ie.grip, -ie.maxGripG * Fl, ie.maxGripG * Fl) * Ne;
    M.x = S.x * Lt * o;
    M.y = 0;
    M.z = S.z * Lt * o;
    c.addForceAtPoint(M, B, false);
  }
  function at(Te) {
    var ge, Le, Oe, et;
    we();
    const ue = nn(w, v),
      $ = se != null && se.state.forceNitro ? 1 : G.throttle;
    if (se) {
      se.update(Te, {
        speed: ue,
        throttle: $,
        brake: G.brake,
        handbrake: X,
        nitro: G.nitro,
        nitroCharge: ae,
        gear: x.state.gear,
        wheelsOnGround: F.wheelsOnGround
      });
      const lt = se.state;
      G.handbrake = lt.muteHandbrake ? 0 : X;
      x.state.revTarget = lt.revTarget;
      x.state.launchRpm = lt.launchRpm;
      F.launch = lt.phase;
      F.launchNeedle = lt.needle;
      F.launchGrade = lt.grade;
      F.launchCount = lt.count;
      F.launchT100 = lt.t100;
    }
    const q = (g.omega + b.omega) * .5,
      oe = x.update(Te, {
        throttle: $,
        brake: G.brake,
        forwardSpeed: ue,
        drivenOmega: q,
        wheelRadius: g.radius
      }),
      xe = ((ge = config.arcade) == null ? undefined : ge.drift) && Math.hypot(w.x, w.z) > config.arcade.drift.minSpeed;
    G.handbrake > .1 && !re.active && !xe && (x.state.clutchTarget = 0);
    const me = (Le = config.arcade) == null ? undefined : Le.nitro,
      ie = se == null ? undefined : se.state,
      Ne = G.handbrake > .5 && Math.abs(ue) < (((et = (Oe = config.arcade) == null ? undefined : Oe.launch) == null ? undefined : et.armSpeed) ?? 1);
    ne = !!(me && (G.nitro > .5 || ie != null && ie.forceNitro) && !(ie != null && ie.blockNitro) && ae > 0 && oe.brake < .1 && x.state.gear >= 0 && F.wheelsOnGround >= 2 && !Ne);
    me && (ae = ne ? Math.max(0, ae - me.drain * Te) : Math.min(1, ae + me.recharge * Te));
    F.nitro = ne ? 1 : 0;
    F.nitroCharge = ae;
    ye();
    const ze = U();
    Be(Te, ze);
    J();
    Q();
    Ce(Te);
    fe(Te);
    j(Te, oe);
    Ue(oe, ze);
    const tt = c.angvel();
    F.speed = ue;
    F.speedKmh = ue * 3.6;
    F.travelKmh = Math.hypot(w.x, w.z) * 3.6 * (ue < 0 ? -1 : 1);
    F.rpm = x.engineRpm();
    F.gear = x.state.gear;
    F.throttle = oe.throttle;
    F.brake = oe.brake;
    F.yawRate = nn(tt, T);
    F.wheelsOnGround = ze;
    F.load = x.state.load;
    F.soundLoad = x.state.soundLoad;
    F.shifting = x.state.shifting;
    const dt = nn(w, S);
    F.slipAngleBody = Math.abs(ue) > 1 ? Math.atan2(dt, Math.abs(ue)) : 0;
    const Lt = (w.x - O.x) / Te,
      mt = (w.y - O.y) / Te,
      hs = (w.z - O.z) / Te;
    C.x = Lt;
    C.y = mt;
    C.z = hs;
    F.lateralG = nn(C, S) / Fl;
    F.longitudinalG = nn(C, v) / Fl;
    O.x = w.x;
    O.y = w.y;
    O.z = w.z;
    H = ze === 0 ? H + Te : 0;
    W = T.y < .2 && Math.hypot(w.x, w.z) < 3 ? W + Te : 0;
  }
  function Re(Te = spawn.position, ue = spawn.yaw) {
    c.setTranslation({
      x: Te[0],
      y: Te[1],
      z: Te[2]
    }, true);
    c.setRotation(le(ue), true);
    c.setLinvel({
      x: 0,
      y: 0,
      z: 0
    }, true);
    c.setAngvel({
      x: 0,
      y: 0,
      z: 0
    }, true);
    c.resetForces(true);
    c.resetTorques(true);
    for (const $ of m) $.omega = 0, $.kappa = 0, $.tanAlpha = 0, $.slipCombined = 0, $.absFactor = 1;
    x.reset();
    se == null || se.reset();
    O = Mi();
    H = 0;
    W = 0;
  }
  function Fe() {
    we();
    const Te = Math.atan2(v.x, v.z);
    L.origin.x = y.x;
    L.origin.y = y.y + jhe;
    L.origin.z = y.z;
    L.dir.x = 0;
    L.dir.y = -1;
    L.dir.z = 0;
    const ue = r.castRay(L, Yhe, true, RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC, undefined, undefined, c),
      $ = ue ? L.origin.y - ue.timeOfImpact + Khe : y.y + Xhe;
    Re([y.x, $, y.z], Te);
  }
  function Je(Te) {
    G.throttle = gs(Te.throttle ?? G.throttle, 0, 1);
    G.brake = gs(Te.brake ?? G.brake, 0, 1);
    G.steer = gs(Te.steer ?? G.steer, -1, 1);
    X = gs(Te.handbrake ?? X, 0, 1);
    G.handbrake = se != null && se.state.muteHandbrake ? 0 : X;
    G.nitro = gs(Te.nitro ?? G.nitro, 0, 1);
    Te.assistLevel !== undefined && (G.assistLevel = Te.assistLevel);
  }
  physics.addStepListener({
    preStep: at
  });
  return {
    body: c,
    chassisColliders: u,
    wheels: m,
    drivetrain: x,
    config: config,
    telemetry: F,
    input: G,
    setInput: Je,
    reset: Re,
    recover: Fe,
    shiftUp: () => {
      x.state.automatic = false;
      x.shiftUp();
    },
    shiftDown: () => {
      x.state.automatic = false;
      x.shiftDown();
    },
    setAutomatic: Te => {
      x.state.automatic = !!Te;
    },
    setDraft(Te) {
      P = gs(Te, 0, 1);
    },
    get draft() {
      return P;
    },
    get airborneTime() {
      return H;
    },
    get upsideDownTime() {
      return W;
    },
    engineRpmToOmega: Te => Te / vd,
    dispose() {
      physics.removeStepListener({
        preStep: at
      });
      r.removeRigidBody(c);
    }
  };
}
