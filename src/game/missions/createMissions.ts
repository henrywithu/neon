// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { kpe } from "./routePlanning.ts";
import { createRoadGraph } from "../navigation/roadGraph.ts";
import { tme, createMissionUi, eme, Rk, Ik, Ype, Xpe, Jpe, Nk, Zpe, Kpe, $pe, jpe } from "../../ui/missions/createMissionUi.ts";
import { y1 } from "../story/definitions.ts";
import { createCheckpointBeacons, _g } from "./checkpointBeacons.ts";
export function createMissions({
  scene: scene,
  drive: drive,
  metro: metro,
  camera: camera,
  progress: progress,
  sfx = null,
  typeSound = null,
  voice = null,
  layer = 0,
  viewLayer = layer,
  groundY = -5.4
}) {
  const d = metro.map,
    h = kpe(d),
    f = createRoadGraph(d);
  function p(K, V, te) {
    var Ue;
    const fe = (Ue = d.highways) == null ? undefined : Ue.find(Ae => Ae.name === K);
    if (!fe) return null;
    let Ce = null;
    for (let Ae = 0; Ae < fe.points.length - 1; Ae++) {
      const [Be, He, at] = fe.points[Ae],
        [Re, Fe, Je] = fe.points[Ae + 1],
        je = Re - Be,
        Te = Je - at,
        ue = je * je + Te * Te || 1,
        $ = tme(((V - Be) * je + (te - at) * Te) / ue),
        q = Be + je * $,
        oe = at + Te * $,
        xe = Math.hypot(q - V, oe - te);
      (!Ce || xe < Ce.d) && (Ce = {
        d: xe,
        x: q,
        z: oe,
        h: He + (Fe - He) * $
      });
    }
    return Ce;
  }
  function m(K) {
    const V = Array.isArray(K) ? {
        at: K
      } : K,
      [te, fe] = V.at,
      Ce = {
        stop: !!V.stop
      };
    if (V.deck) {
      const Be = p(V.deck, te, fe);
      if (Be) return {
        ...Ce,
        x: Be.x,
        z: Be.z,
        y: groundY + Be.h,
        radius: 11,
        gps: false,
        deck: true
      };
    }
    if (V.raw) return {
      ...Ce,
      x: te,
      z: fe,
      y: groundY,
      radius: Ce.stop ? 10 : 12,
      gps: false
    };
    const Ue = h.snap(te, fe);
    if (!Ue) return {
      ...Ce,
      x: te,
      z: fe,
      y: groundY,
      radius: 12,
      gps: false
    };
    const Ae = Ce.stop ? 9 : Math.max(10, Math.min(15, Ue.width * .8));
    return {
      ...Ce,
      x: Ue.x,
      z: Ue.z,
      y: groundY,
      radius: Ae,
      gps: true,
      width: Ue.width
    };
  }
  const A = [...new Set([...y1.map(K => K.icon), "flag", "sports_score"])],
    g = y1.map((K, V) => {
      let te;
      if (K.startRaw) te = {
        x: K.start[0],
        z: K.start[1],
        yaw: K.heading ?? 0,
        width: 20
      };else {
        const fe = h.snap(K.start[0], K.start[1]);
        te = fe ? {
          x: fe.x,
          z: fe.z,
          yaw: fe.yaw,
          width: fe.width
        } : {
          x: K.start[0],
          z: K.start[1],
          yaw: 0,
          width: 12
        };
      }
      return {
        def: K,
        index: V,
        atlas: A.indexOf(K.icon),
        start: te,
        stops: K.route.map(m)
      };
    }),
    b = createCheckpointBeacons({
      scene: scene,
      groundY: groundY,
      mirrorLayer: layer,
      viewLayer: viewLayer,
      icons: A
    }),
    x = createMissionUi({
      typeSound: typeSound,
      voice: voice
    });
  let y = "idle",
    _ = null,
    w = null,
    S = 0,
    T = null;
  const v = new Set(),
    E = K => {
      for (const V of v) try {
        V(K);
      } catch (te) {
        console.error("[missions] listener failed:", te);
      }
    };
  let C = null;
  const M = K => {
      var V;
      return K != null && K.def.race && C ? {
        line: C.friends(K.def.id),
        room: ((V = C.room) == null ? undefined : V.call(C)) ?? 0
      } : null;
    },
    B = () => drive.vehicle.telemetry,
    R = () => Math.abs(B().travelKmh ?? B().speedKmh),
    I = () => drive.vehicle.body.translation();
  function k() {
    if (drive.isActive()) {
      const K = I();
      return {
        x: K.x,
        y: K.y,
        z: K.z
      };
    }
    return {
      x: camera.position.x,
      y: camera.position.y - 1.55,
      z: camera.position.z
    };
  }
  function L() {
    b.set(g.map(K => ({
      x: K.start.x,
      z: K.start.z,
      radius: 4.2,
      height: 11,
      color: _g.start,
      alpha: .9,
      fadeFar: eme,
      atlas: K.atlas
    })));
  }
  function F() {
    if (!w) return;
    const K = [];
    for (let V = 0; V < 2; V++) {
      const te = _.stops[w.stopIndex + V];
      if (!te) break;
      const fe = w.stopIndex + V === _.stops.length - 1;
      K.push({
        x: te.x,
        y: te.y,
        z: te.z,
        radius: te.radius,
        height: V === 0 ? 70 : 40,
        color: fe ? _g.finish : _g.checkpoint,
        alpha: V === 0 ? 1 : .35,
        fadeFar: 0,
        atlas: fe ? A.indexOf("sports_score") : A.indexOf("flag")
      });
    }
    b.set(K);
  }
  function O(K, V) {
    if (K.gps !== false && V.gps) {
      const te = f.route({
        x: K.x,
        z: K.z
      }, {
        x: V.x,
        z: V.z
      });
      if (te) return te.length;
    }
    return Math.hypot(V.x - K.x, V.z - K.z) * 1.15;
  }
  function H(K) {
    const V = K.def.rules;
    if (Number.isFinite(V.time)) return V.time;
    if (!Number.isFinite(V.pace) || !K.stops.length) return 1 / 0;
    let te = 0,
      fe = {
        x: K.start.x,
        z: K.start.z,
        gps: true
      };
    for (const Ue of K.stops) te += O(fe, Ue), fe = Ue;
    const Ce = K.stops.filter(Ue => Ue.stop).length;
    return Math.ceil(te / (V.pace / 3.6) + (V.slack ?? 8) + Ce * 3);
  }
  function W(K) {
    var te;
    if (Number.isFinite(K.def.heading)) return K.def.heading;
    const V = K.stops[0];
    if (V) {
      const fe = V.gps ? f.route({
          x: K.start.x,
          z: K.start.z
        }, {
          x: V.x,
          z: V.z
        }) : null,
        Ce = fe == null ? undefined : fe.points;
      let Ue = V.x,
        Ae = V.z;
      if ((Ce == null ? undefined : Ce.length) > 1) {
        let at = 0;
        for (let Re = 1; Re < Ce.length && (at += Math.hypot(Ce[Re][0] - Ce[Re - 1][0], Ce[Re][1] - Ce[Re - 1][1]), Ue = Ce[Re][0], Ae = Ce[Re][1], !(at > 15)); Re++);
      }
      const Be = Math.atan2(Ue - K.start.x, Ae - K.start.z),
        He = K.start.yaw;
      return Math.cos(Be - He) >= 0 ? He : He + Math.PI;
    }
    return ((te = drive.playerPose) == null ? undefined : te.call(drive).heading) ?? K.start.yaw;
  }
  function P() {
    const K = _ == null ? undefined : _.stops[(w == null ? undefined : w.stopIndex) ?? 0];
    if (!K) {
      drive.setWaypoint(null);
      return;
    }
    drive.setWaypoint({
      x: K.x,
      z: K.z
    }, {
      owner: "mission",
      route: K.gps
    });
  }
  function z(K) {
    var V;
    _ = K;
    y = "brief";
    x.showBrief(K.def, {
      inCar: drive.isActive(),
      record: progress.mission(K.def.id),
      limit: H(K),
      onStart: () => G(),
      onStartTogether: () => C == null ? undefined : C.start(K.def.id),
      onInvite: () => {
        var te;
        return (te = C == null ? undefined : C.invite) == null ? undefined : te.call(C);
      },
      together: M(K)
    });
    (V = sfx == null ? undefined : sfx.hover) == null || V.call(sfx);
  }
  function Y() {
    x.hideBrief();
    _ = null;
    y = "idle";
  }
  function G(K = Rk, V = null) {
    var Ce;
    if (!_ || !drive.isActive()) return;
    const te = _;
    x.hideBrief();
    x.hideResult();
    const fe = W(te);
    if (V) {
      const Ue = Math.min(3.1, te.start.width / 4),
        Ae = (V.slot % 2 === 0 ? -1 : 1) * Ue,
        Be = Math.floor(V.slot / 2) * 6.5;
      drive.placeCar({
        x: te.start.x - Math.cos(fe) * Ae - Math.sin(fe) * Be,
        z: te.start.z + Math.sin(fe) * Ae - Math.cos(fe) * Be,
        yaw: fe,
        width: te.start.width,
        lane: false
      });
    } else drive.placeCar({
      x: te.start.x,
      z: te.start.z,
      yaw: fe,
      width: te.start.width,
      lane: !te.def.startRaw
    });
    drive.setMissionActive(true);
    drive.setHold(true);
    w = {
      t: 0,
      limit: H(te),
      countdown: K,
      lastCount: Math.ceil(K) + 1,
      stopIndex: 0,
      drift0: 0,
      lastTotal: 0,
      chainBest: 0,
      crashes: 0,
      damage: 0,
      lastCrash: -1 / 0,
      props0: ((Ce = drive.dynamicProps) == null ? undefined : Ce.knocked) ?? 0,
      top: 0,
      armed: false,
      low: 0,
      lastWarn: 0,
      unmetNotice: 0,
      outside: 0,
      zoneNotice: -1 / 0,
      zoneDist: 0
    };
    y = "countdown";
    x.startRun(te.def, {
      limit: w.limit,
      stops: te.stops,
      place: !!V
    });
    F();
    P();
    E({
      type: "start",
      id: te.def.id
    });
  }
  function X() {
    var K, V;
    y = "run";
    drive.setHold(false);
    w.drift0 = drive.driftScore.state.total;
    w.lastTotal = w.drift0;
    w.props0 = ((K = drive.dynamicProps) == null ? undefined : K.knocked) ?? 0;
    x.countdown("GO");
    (V = sfx == null ? undefined : sfx.go) == null || V.call(sfx);
    E({
      type: "go",
      id: _.def.id
    });
  }
  function ae(K, V = "") {
    var Ae, Be, He;
    if (!w || !_) return;
    const te = _,
      fe = te.def.rules;
    drive.setHold(false);
    drive.setMissionActive(false);
    drive.setWaypoint(null);
    const Ce = {
      time: w.t,
      drift: drive.driftScore.state.total - w.drift0,
      chain: w.chainBest,
      crashes: w.crashes,
      damage: w.damage,
      top: w.top,
      props: (((Ae = drive.dynamicProps) == null ? undefined : Ae.knocked) ?? 0) - w.props0
    };
    let Ue = {
      first: false,
      newBest: [],
      rides: []
    };
    K ? (Ue = progress.completeMission(te.def.id, {
      time: Number.isFinite(w.limit) || te.stops.length ? Ce.time : undefined,
      drift: fe.drift || fe.chain ? fe.chain ? Ce.chain : Ce.drift : undefined
    }), (Be = sfx == null ? undefined : sfx.pass) == null || Be.call(sfx)) : (progress.recordAttempt(te.def.id), (He = sfx == null ? undefined : sfx.fail) == null || He.call(sfx));
    T = {
      passed: K,
      reason: V,
      stats: Ce,
      ...Ue,
      id: te.def.id
    };
    x.endRun();
    x.showResult({
      mission: te.def,
      passed: K,
      reason: V,
      stats: Ce,
      rules: fe,
      first: Ue.first,
      newBest: Ue.newBest,
      canRetry: !K
    });
    y = "result";
    S = K ? 6 : 9;
    w = null;
    b.set([]);
    E({
      type: K ? "pass" : "fail",
      id: te.def.id,
      reason: V,
      stats: Ce,
      rides: Ue.rides
    });
  }
  function ne() {
    x.hideResult();
    _ = null;
    y = "idle";
    L();
    Se = 1.5;
  }
  function se() {
    if (!(y !== "result" || !_ || T != null && T.passed)) {
      if (!drive.isActive()) {
        ne();
        return;
      }
      G();
    }
  }
  drive.onImpact(K => {
    var V;
    if (!(y !== "run" || !w) && (K > Ik && (w.damage = Math.min(100, w.damage + Math.min(30, (K - Ik) / 5500))), K > Ype && w.t - w.lastCrash > Xpe)) {
      w.lastCrash = w.t;
      w.crashes += 1;
      const te = _.def.rules.crashes;
      Number.isFinite(te) && (x.notice(w.crashes > te ? "" : `CRASH ${w.crashes} / ${te}`, "warn"), (V = sfx == null ? undefined : sfx.warn) == null || V.call(sfx));
    }
  });
  function re() {
    var fe;
    const K = _.def.rules,
      V = [],
      te = drive.driftScore.state.total - w.drift0;
    if (K.drift && V.push({
      key: "drift",
      met: te >= K.drift,
      text: `${(K.drift - te).toLocaleString("en-US")} MORE DRIFT POINTS`
    }), K.chain && V.push({
      key: "chain",
      met: w.chainBest >= K.chain,
      text: `LINK A ${K.chain.toLocaleString("en-US")} DRIFT CHAIN`
    }), K.topSpeed && V.push({
      key: "top",
      met: w.top >= K.topSpeed,
      text: `HIT ${K.topSpeed} KM/H FIRST`
    }), K.smash) {
      const Ce = (((fe = drive.dynamicProps) == null ? undefined : fe.knocked) ?? 0) - w.props0;
      V.push({
        key: "smash",
        met: Ce >= K.smash,
        text: `${K.smash - Ce} MORE PROPS`
      });
    }
    return V;
  }
  function le(K, V, te) {
    const fe = Math.abs(V.y - (K.y ?? groundY));
    return Math.hypot(V.x - K.x, V.z - K.z) > K.radius || fe > (K.deck ? 3.5 : 6) ? false : K.stop && te > Jpe ? (w.t - w.unmetNotice > 1.5 && (w.unmetNotice = w.t, x.notice("STOP IN THE ZONE", "info")), false) : true;
  }
  function we(K) {
    var He, at, Re, Fe, Je, je;
    const V = _,
      te = V.def.rules,
      fe = B(),
      Ce = R();
    if (w.t += K, !drive.isActive()) return ae(false, "YOU LEFT THE CAR");
    if (w.t > w.limit) return ae(false, "TIME'S UP");
    const Ue = drive.driftScore.state;
    if (Ue.total > w.lastTotal && (w.chainBest = Math.max(w.chainBest, Ue.total - w.lastTotal), w.lastTotal = Ue.total), w.top = Math.max(w.top, Ce), Number.isFinite(te.crashes) && w.crashes > te.crashes) return ae(false, te.crashes === 0 ? "YOU HIT SOMETHING" : "TOO MANY CRASHES");
    if (Number.isFinite(te.damage) && w.damage > te.damage) return ae(false, "TOO MUCH DAMAGE");
    if (te.noNitro && fe.nitro) return ae(false, "NITRO TRIPPED THE SENSORS");
    if (te.minSpeed) {
      if (Ce >= te.minSpeed) w.armed || (w.armed = true, x.notice("BOMB ARMED · KEEP IT FLOORED", "warn"), (He = sfx == null ? undefined : sfx.warn) == null || He.call(sfx)), w.low = Math.max(0, w.low - K * 2);else if (w.armed && (w.low += K, w.t - w.lastWarn > .3 && (w.lastWarn = w.t, (at = sfx == null ? undefined : sfx.tick) == null || at.call(sfx)), w.low > Nk)) return ae(false, `BOOM · UNDER ${te.minSpeed} KM/H`);
    }
    const Ae = I();
    if (te.zone) {
      w.zoneDist = Math.hypot(Ae.x - V.start.x, Ae.z - V.start.z);
      const Te = w.zoneDist > te.zone;
      if (w.outside = Te ? w.outside + K : 0, Te && w.t - w.zoneNotice > 1.2 && (w.zoneNotice = w.t, x.notice("BACK TO THE ZONE", "warn"), (Re = sfx == null ? undefined : sfx.warn) == null || Re.call(sfx)), w.outside > Zpe) return ae(false, "YOU LEFT THE ZONE");
    }
    const Be = V.stops[w.stopIndex];
    if (Be && le(Be, Ae, Ce)) if (w.stopIndex === V.stops.length - 1) {
      drive.driftScore.state.inChain && (te.drift || te.chain) && drive.driftScore.bank();
      drive.driftScore.state.total > w.lastTotal && (w.chainBest = Math.max(w.chainBest, drive.driftScore.state.total - w.lastTotal), w.lastTotal = drive.driftScore.state.total);
      const ue = re().find($ => !$.met);
      if (!ue) return ae(true);
      w.t - w.unmetNotice > 2.5 && (w.unmetNotice = w.t, x.notice(ue.text, "warn"), (Je = sfx == null ? undefined : sfx.warn) == null || Je.call(sfx));
    } else {
      w.stopIndex += 1;
      E({
        type: "checkpoint",
        id: V.def.id,
        index: w.stopIndex,
        total: V.stops.length
      });
      (Fe = sfx == null ? undefined : sfx.checkpoint) == null || Fe.call(sfx);
      const ue = V.stops.length - 1;
      x.notice(Be.stop ? `DROP ${w.stopIndex} / ${ue + 1}` : `CHECKPOINT ${w.stopIndex} / ${ue}`, "good");
      F();
      P();
    }
    if (!V.stops.length && re().every(Te => Te.met)) return ae(true);
    x.updateRun({
      t: w.t,
      limit: w.limit,
      stopIndex: w.stopIndex,
      drift: Ue.total - w.drift0,
      combo: Ue.inChain ? Ue.combo : 0,
      chainBest: w.chainBest,
      crashes: w.crashes,
      damage: w.damage,
      speed: Ce,
      top: w.top,
      armed: w.armed,
      low: w.low / Nk,
      props: (((je = drive.dynamicProps) == null ? undefined : je.knocked) ?? 0) - w.props0,
      zoneDist: w.zoneDist
    });
  }
  let Se = 0;
  function ye(K) {
    var V;
    switch (Se = Math.max(0, Se - K), y) {
      case "idle":
      case "brief":
        {
          const te = k();
          let fe = null,
            Ce = 1 / 0;
          for (const Ue of g) {
            const Ae = Math.hypot(te.x - Ue.start.x, te.z - Ue.start.z);
            Ae < Ce && Math.abs(te.y - groundY) < 3 && (Ce = Ae, fe = Ue);
          }
          y === "brief" ? !fe || fe !== _ || Ce > Kpe ? Y() : (x.setBriefInCar(drive.isActive()), x.setBriefTogether(M(_))) : fe && Ce < $pe && Se <= 0 && (!drive.isActive() || R() < jpe) && z(fe);
          break;
        }
      case "countdown":
        {
          w.countdown -= K;
          const te = Math.ceil(w.countdown);
          te !== w.lastCount && te > 0 && (w.lastCount = te, x.countdown(String(te)), (V = sfx == null ? undefined : sfx.count) == null || V.call(sfx));
          x.updateRun({
            t: 0,
            limit: w.limit,
            stopIndex: 0,
            drift: 0,
            combo: 0,
            chainBest: 0,
            crashes: 0,
            damage: 0,
            speed: 0,
            top: 0,
            armed: false,
            low: 0,
            props: 0
          });
          w.countdown <= 0 && X();
          drive.isActive() || ae(false, "YOU LEFT THE CAR");
          break;
        }
      case "run":
        we(K);
        break;
      case "result":
        S -= K, S <= 0 && ne();
        break;
    }
  }
  const U = drive.onTick(ye);
  function J(K) {
    var te, fe;
    if (K.repeat || K.defaultPrevented) return;
    const V = K.target instanceof HTMLElement ? K.target : null;
    V != null && V.matches("input, textarea, select") || (te = drive.isPaused) != null && te.call(drive) || (K.code === "Enter" || K.code === "NumpadEnter" ? y === "brief" && drive.isActive() ? (K.preventDefault(), G()) : y === "result" && (K.preventDefault(), T != null && T.passed ? ne() : se()) : K.code === "KeyU" && y === "brief" && drive.isActive() && (((fe = M(_)) == null ? undefined : fe.line) ?? 0) > 0 ? (K.preventDefault(), C.start(_.def.id)) : K.code === "Backspace" && (y === "countdown" || y === "run" ? (K.preventDefault(), ae(false, "ABANDONED")) : y === "result" && (K.preventDefault(), ne())));
  }
  window.addEventListener("keydown", J);
  x.onRetry(() => se());
  x.onClose(() => ne());
  x.onQuit(() => {
    (y === "countdown" || y === "run") && ae(false, "ABANDONED");
  });
  L();
  function Q() {
    if (y === "countdown" || y === "run") {
      const K = _ == null ? undefined : _.def.rules.zone;
      return K ? [{
        kind: "zone",
        x: _.start.x,
        z: _.start.z,
        radius: K
      }] : [];
    }
    return g.map(K => ({
      kind: "mission",
      id: K.def.id,
      name: K.def.name,
      icon: K.def.icon,
      race: !!K.def.race,
      x: K.start.x,
      z: K.start.z,
      done: progress.isMissionDone(K.def.id)
    }));
  }
  const j = [];
  function de() {
    if (j.length = 0, y === "countdown" || y === "run") {
      const K = _ == null ? undefined : _.stops[(w == null ? undefined : w.stopIndex) ?? 0];
      if (K && K.y - groundY < 1) {
        const te = w.stopIndex === _.stops.length - 1 ? _g.finish : _g.checkpoint;
        j.push({
          x: K.x,
          z: K.z,
          size: K.radius * 2.4,
          rgb: [te.r, te.g, te.b],
          intensity: .9
        });
      }
    } else for (const K of g) j.push({
      x: K.start.x,
      z: K.start.z,
      size: 14,
      rgb: [1, .72, .1],
      intensity: .45
    });
    return j;
  }
  return {
    missions: g,
    hud: x,
    get phase() {
      return y;
    },
    get active() {
      return y === "countdown" || y === "run";
    },
    get current() {
      return (_ == null ? undefined : _.def) ?? null;
    },
    get lastResult() {
      return T;
    },
    get runInfo() {
      return w && _ ? {
        stopIndex: w.stopIndex,
        stops: _.stops.length,
        t: w.t,
        limit: w.limit
      } : null;
    },
    mapMarkers: Q,
    lightPools: de,
    update: () => b.update(camera),
    timeLimit: K => {
      const V = g.find(te => te.def.id === K);
      return V ? H(V) : NaN;
    },
    subscribe(K) {
      v.add(K);
      return () => v.delete(K);
    },
    startById(K, {
      teleport = true
    } = {}) {
      const te = g.find(fe => fe.def.id === K);
      return te ? ((y === "countdown" || y === "run") && ae(false, "ABANDONED"), x.hideResult(), _ = te, y = "brief", teleport && G(), true) : false;
    },
    dismissResult: ne,
    abandon: () => (y === "countdown" || y === "run") && ae(false, "ABANDONED"),
    setTogether(K) {
      C = K;
    },
    startTogether(K, {
      countdown = Rk,
      slot = 0
    } = {}) {
      var Ce;
      const fe = g.find(Ue => Ue.def.id === K);
      return !(fe != null && fe.def.race) || !drive.isActive() || (Ce = drive.isPaused) != null && Ce.call(drive) || y === "countdown" || y === "run" ? false : (_ = fe, G(countdown, {
        slot: slot
      }), true);
    },
    raceInfo(K) {
      const V = g.find(te => te.def.id === K);
      return V != null && V.def.race ? {
        name: V.def.name,
        start: {
          x: V.start.x,
          z: V.start.z
        },
        stops: V.stops.map(te => ({
          x: te.x,
          z: te.z
        })),
        limit: H(V)
      } : null;
    },
    dispose() {
      U == null || U();
      window.removeEventListener("keydown", J);
      b.dispose();
      x.dispose();
    }
  };
}
export const nme = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L20 20 L12 15.5 L4 20 Z" fill="currentColor"/></svg>';
export const ime = 120;
export const Lk = 40;
export const rme = 3;
