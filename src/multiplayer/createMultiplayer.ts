// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isMultiplayerEnabled, lue, cue, publicRooms, wp, messageCooldowns, decodePose, lobbyUrl, closeCodes, roomUrl, normalizeRoomId, nB, GE, uue, vehicleFlags, encodePose, maxDrivers, tue, rue } from "./protocol.ts";
import { createRoster } from "./roster.ts";
import { createNameTags } from "./nameTags.ts";
import { createGhostCars } from "./ghosts.ts";
import { vge } from "./spectatorCamera.ts";
import { createFriendsPanel } from "../ui/multiplayer/createFriendsPanel.ts";
import { $me, QG, qG, VG, Qme, Lo } from "./rooms.ts";
import { createQuickChat } from "../ui/multiplayer/quickChat.ts";
import { zf, Yge, createConvoy, fv, Kge, Wge, Xge, hv, sF, jge, Hge, $ge } from "./convoy.ts";
import { createMultiplayerRace } from "./race.ts";
import { missionDefinitions } from "../game/missions/definitions.ts";
import { AE, b1, y1 } from "../game/story/definitions.ts";
import { Ume, createMultiplayerTransport } from "./transport.ts";
export function createMultiplayer({
  drive: drive,
  scene: scene,
  camera: camera,
  fleet = null,
  lightPools = null,
  uiState = null,
  missions = null,
  progress = null,
  isUiReady = () => true,
  onChange = null,
  onMenu = null,
  canOpenLobby = () => true
}) {
  var Lt, mt, hs;
  const h = drive == null ? undefined : drive.traffic;
  if (!(h != null && h.setRemoteCars) || !h.carGeometry || !isMultiplayerEnabled()) return null;
  const f = {
    id: lue()
  };
  f.name = cue(f.id);
  const p = createRoster(),
    m = createNameTags({
      camera: camera
    }),
    A = createGhostCars({
      scene: scene,
      geometry: h.carGeometry,
      fleet: fleet
    });
  let g = false;
  const b = [],
    x = [],
    y = [],
    _ = {
      m: 0,
      g: 0
    },
    w = vge({
      camera: camera
    }),
    S = new Map(),
    T = new Set();
  let v = null,
    E = null,
    C = false;
  const M = new Map();
  let B = null,
    R = "idle",
    I = null,
    k = false,
    L = false,
    F = [],
    O = 0,
    H = 0,
    W = 0,
    P = 0,
    z = ((mt = (Lt = drive.car) == null ? undefined : Lt.def) == null ? undefined : mt.id) ?? null;
  const Y = {
    x: NaN,
    y: NaN,
    z: NaN
  };
  let G = 0;
  const X = {
      tx: 0,
      rx: 0,
      txPerSec: 0,
      rxPerSec: 0,
      at: performance.now()
    },
    ae = () => {
      var ge;
      return (((ge = publicRooms.find(Le => Le.id === B)) == null ? undefined : ge.name) ?? B ?? "").toUpperCase();
    };
  function ne(ge) {
    const Le = new URL(location.href);
    ge ? Le.searchParams.set("room", ge) : Le.searchParams.delete("room");
    history.replaceState(history.state, "", Le);
  }
  const se = createFriendsPanel({
    onRooms: () => re.open(),
    onLeave: () => je(),
    onRename: ge => Te(ge),
    onTrack: ge => te(ge),
    onWatch: ge => Ue(ge),
    onSay: ge => we(ge),
    onPing: () => {
      const ge = drive.playerPose();
      ye(ge.x, ge.z);
    }
  });
  se.setName(f.name);
  const re = $me({
      state: uiState,
      getRoom: () => B,
      onJoin: ge => Je(ge),
      onLeave: () => je(),
      onToggle: ge => onMenu == null ? undefined : onMenu(ge),
      canOpen: () => canOpenLobby() && isUiReady()
    }),
    le = createQuickChat({
      state: uiState,
      canOpen: () => B ? M.size ? isUiReady() && !drive.isPaused() : (se.toast("NOBODY ELSE IS IN THE ROOM YET", {
        ms: 2400
      }), false) : false,
      onOpen: () => {
        g = true;
      },
      onSay: ge => we(ge),
      onPing: () => {
        const ge = drive.playerPose();
        ye(ge.x, ge.z);
      }
    });
  function we(ge) {
    if (!B || !wp[ge]) return false;
    g = true;
    const Le = performance.now();
    return Le - _.m < messageCooldowns.m ? false : $(["m", ge]) ? (_.m = Le, se.toast(`YOU · ${wp[ge]}`, {
      ms: 1800,
      color: zf
    }), true) : (se.toast("NOBODY ELSE IS HERE YET", {
      warn: true,
      ms: 1600
    }), false);
  }
  function Se(ge, Le, Oe, et) {
    const lt = `ping:${ge}`,
      Et = b.findIndex(Gt => Gt.key === lt);
    Et >= 0 && b.splice(Et, 1);
    b.push({
      key: lt,
      id: ge,
      name: Le,
      color: zf,
      x: Oe,
      z: et,
      expires: performance.now() + Yge
    });
  }
  function ye(ge, Le) {
    if (!B) return false;
    const Oe = performance.now();
    return Oe - _.g < messageCooldowns.g ? (se.toast("PINGING TOO FAST", {
      warn: true,
      ms: 1200
    }), false) : $(["g", Math.round(ge), Math.round(Le)]) ? (_.g = Oe, Se(f.id, "YOU", ge, Le), se.toast("PING SENT", {
      ms: 1500,
      color: zf
    }), true) : (se.toast("NOBODY ELSE IS HERE YET", {
      warn: true,
      ms: 1600
    }), false);
  }
  function U() {
    re.refreshView();
    onChange == null || onChange({
      live: !!B,
      count: B ? M.size + 1 : 0,
      state: R
    });
  }
  let J = null;
  missions && (J = createMultiplayerRace({
    drive: drive,
    missions: missions,
    roster: M,
    me: f,
    getCars: () => F,
    send: ge => $(ge),
    toast: (ge, Le) => se.toast(ge, Le)
  }), missions.setTogether({
    friends: ge => B ? J.friends(ge) : 0,
    room: () => B ? M.size : 0,
    start: ge => J.start(ge),
    invite: () => ue()
  }));
  const Q = createConvoy({
      drive: drive,
      getCars: () => F,
      canDraft: () => !drive.isMissionActive() || !!(J != null && J.racing),
      canBonus: () => !drive.isMissionActive()
    }),
    j = new Set(missionDefinitions.map(ge => ge.id)),
    de = progress == null ? undefined : progress.subscribe(ge => {
      !ge.first || !B || M.size === 0 || (ge.type === "sigil" ? $(["s", 0, ge.id]) : ge.type === "mission" && $(["s", j.has(ge.id) ? 2 : 1, ge.id]));
    });
  function K(ge, Le) {
    var et;
    if (ge === 0) {
      const lt = AE.get(b1(Le));
      return lt ? `FOUND A NEON SIGIL · ${lt.name.toUpperCase()}` : null;
    }
    const Oe = (et = y1.find(lt => lt.id === Le)) == null ? undefined : et.name;
    return Oe ? ge === 2 ? `WON ${Oe.toUpperCase()}` : `PASSED ${Oe.toUpperCase()}` : null;
  }
  const V = ge => {
    let Le = S.get(ge);
    Le || (Le = () => {
      const Oe = F.find(et => et.id === ge);
      return Oe ? {
        x: Oe.x,
        z: Oe.z,
        name: Oe.name
      } : null;
    }, S.set(ge, Le));
    return Le;
  };
  function te(ge) {
    const Le = F.find(et => et.id === ge);
    if (!Le) {
      se.toast("NO SIGNAL FROM THEM YET", {
        warn: true
      });
      return;
    }
    const Oe = V(ge);
    if (drive.gps.track === Oe) {
      drive.setWaypoint(null);
      se.toast("GPS CLEARED");
      return;
    }
    if (drive.gps.owner === "mission") {
      se.toast("A MISSION HAS THE GPS", {
        warn: true
      });
      return;
    }
    drive.setWaypoint({
      x: Le.x,
      z: Le.z
    }, {
      track: Oe
    });
    se.toast(`GPS · ${Le.name}`);
  }
  function fe() {
    E !== null && (E = null, drive.isCameraOverridden() && drive.setCameraOverride(null), se.setWatching(null));
  }
  function Ce(ge) {
    const Le = F.find(Oe => Oe.id === ge);
    Le && (E = ge, w.begin(Le), drive.setCameraOverride(Oe => {
      const et = F.find(lt => lt.id === E);
      return !et || drive.isMissionActive() ? false : (w.update(et, Oe), true);
    }), se.setWatching(Le.name));
  }
  function Ue(ge = null) {
    var et;
    if (!B) return;
    const Le = F.filter(lt => lt.age < 3e3 && !lt.onFoot);
    if (!Le.length) {
      se.toast("NOBODY TO WATCH YET", {
        warn: true
      });
      return;
    }
    if (!drive.isActive()) {
      se.toast("GET IN YOUR CAR TO WATCH", {
        warn: true
      });
      return;
    }
    if (drive.isMissionActive()) {
      se.toast("NOT DURING A MISSION", {
        warn: true
      });
      return;
    }
    if (E === null && Math.abs(drive.vehicle.telemetry.speed) > 3) {
      se.toast("STOP THE CAR TO WATCH ANOTHER DRIVER", {
        warn: true
      });
      return;
    }
    let Oe = null;
    if (ge) Oe = ge === E ? null : ((et = Le.find(lt => lt.id === ge)) == null ? undefined : et.id) ?? null;else {
      const lt = E === null ? -1 : Le.findIndex(Et => Et.id === E);
      Oe = lt + 1 < Le.length ? Le[lt + 1].id : null;
    }
    Oe === null ? fe() : Ce(Oe);
  }
  function Ae(ge) {
    var Le;
    switch (X.rx += 1, ge[0]) {
      case "w":
        M.clear(), p.clear(), m.clear();
        for (const [Oe, et, lt] of ge[2] ?? []) M.set(Oe, {
          name: et,
          car: lt
        }), p.add(Oe, {
          name: et,
          car: lt
        });
        M.size && q();
        break;
      case "j":
        {
          const [, Oe, et, lt] = ge,
            Et = M.has(Oe);
          M.set(Oe, {
            name: et,
            car: lt
          });
          p.add(Oe, {
            name: et,
            car: lt
          });
          Et || se.toast(`${et} JOINED`);
          q();
          break;
        }
      case "l":
        {
          const Oe = M.get(ge[1]);
          M.delete(ge[1]);
          p.remove(ge[1]);
          v == null || v.release(ge[1]);
          T.delete(ge[1]);
          E === ge[1] && fe();
          S.delete(ge[1]);
          Oe && se.toast(`${Oe.name} LEFT`);
          break;
        }
      case "c":
        {
          const [, Oe, et] = ge,
            lt = M.get(Oe);
          if (!lt || typeof et != "string" || et === lt.car) break;
          M.set(Oe, {
            ...lt,
            car: et
          });
          p.add(Oe, {
            name: lt.name,
            car: et
          });
          break;
        }
      case "rs":
      case "rc":
      case "rf":
      case "rx":
        J == null || J.onFrame(ge);
        return;
      case "s":
        {
          const [, Oe, et, lt] = ge,
            Et = M.get(Oe),
            Gt = Et ? K(et, lt) : null;
          Gt && se.toast(`${Et.name} ${Gt}`, {
            ms: 4200,
            color: zf
          });
          return;
        }
      case "m":
        {
          const [, Oe, et] = ge,
            lt = M.get(Oe),
            Et = wp[et];
          if (!lt || !Et) break;
          m.say(Oe, Et);
          se.toast(`${lt.name} · ${Et}`, {
            ms: 3200,
            color: ((Le = p.get(Oe)) == null ? undefined : Le.color.css) ?? "#22d3ee"
          });
          return;
        }
      case "g":
        {
          const [, Oe, et, lt] = ge,
            Et = M.get(Oe);
          if (!Et || !Number.isFinite(et + lt)) break;
          Se(Oe, Et.name, et, lt);
          const Gt = drive.playerPose(),
            es = Math.hypot(et - Gt.x, lt - Gt.z);
          se.toast(`${Et.name} PINGED A SPOT · ${es >= 1e3 ? `${(es / 1e3).toFixed(1)} KM` : `${Math.round(es / 10) * 10} M`}`, {
            ms: 3200,
            color: zf
          });
          return;
        }
      case "n":
        {
          const [, Oe, et] = ge,
            lt = M.get(Oe);
          if (!lt || typeof et != "string" || !et || et === lt.name) break;
          M.set(Oe, {
            ...lt,
            name: et
          });
          p.add(Oe, {
            name: et,
            car: lt.car
          });
          se.toast(`${lt.name} IS NOW ${et}`);
          break;
        }
      case "p":
        {
          const Oe = decodePose(ge);
          Number.isFinite(Oe.x + Oe.y + Oe.z + Oe.t + Oe.qw) && p.ingest(Oe.id, Oe, performance.now());
          return;
        }
      default:
        return;
    }
    U();
  }
  let Be = false,
    He = null;
  async function at(ge) {
    if (!B || Be) return;
    const Le = typeof navigator < "u" && navigator.onLine === false;
    let Oe = null;
    ge >= QG && !Le && ge < qG && (Be = true, Oe = await VG(lobbyUrl()), Be = false, !B) || Qme({
      attempts: ge,
      answer: Oe,
      offline: Le
    }) && (je({
      quiet: true
    }), re.open({
      closed: true
    }), re.isOpen || (He = {
      closed: true
    }, se.toast(Lo.maintenance, {
      warn: true,
      ms: 8e3
    })));
  }
  function Re(ge, Le) {
    if (R = ge, ge === "open" ? (k && se.toast("BACK ONLINE"), k = false, L = true) : ge === "reconnecting" && !k && (k = true, se.toast(L ? "CONNECTION LOST · RECONNECTING" : "COULD NOT REACH THE ROOM SERVER · RETRYING", {
      warn: true,
      ms: 5e3
    })), ge === "reconnecting" && Le != null && Le.failed && at(Le.attempts), ge === "refused") {
      const Oe = Le == null ? undefined : Le.code;
      je({
        quiet: true
      });
      Oe === closeCodes.FULL ? re.open({
        notice: Lo.filled
      }) : Oe === closeCodes.MAINTENANCE ? re.open({
        closed: true
      }) : Oe === closeCodes.IDLE ? re.open({
        notice: Lo.idle
      }) : Oe === closeCodes.TOO_MANY ? re.open({
        notice: Lo.tooMany
      }) : se.toast(Ume(Oe), {
        warn: true,
        ms: 6e3
      });
      return;
    }
    U();
  }
  const Fe = createMultiplayerTransport({
    url: () => {
      var ge, Le;
      return roomUrl(B, {
        id: f.id,
        name: f.name,
        car: (Le = (ge = drive.car) == null ? undefined : ge.def) == null ? undefined : Le.id
      });
    },
    onFrame: Ae,
    onState: Re,
    onRtt: ge => {
      I = I === null ? ge : I * .7 + ge * .3;
    }
  });
  function Je(ge) {
    var Oe, et;
    const Le = normalizeRoomId(ge);
    return Le ? (B === Le && Fe.state !== "closed" || (B && je({
      quiet: true
    }), B = Le, (Oe = progress == null ? undefined : progress.markStory) == null || Oe.call(progress, "invited"), se.setRoom(ae()), k = false, L = false, I = null, (et = drive.setMapPing) == null || et.call(drive, ({
      x: lt,
      z: Et
    }) => ye(lt, Et)), ne(Le), Fe.connect(), U()), true) : false;
  }
  function je({
    quiet = false
  } = {}) {
    var Le;
    if (B) {
      Fe.close();
      fe();
      for (const Oe of T) v == null || v.release(Oe);
      T.clear();
      b.length = 0;
      le.close();
      J == null || J.reset();
      Q.reset();
      (Le = drive.setMapPing) == null || Le.call(drive, null);
      [...S.values()].includes(drive.gps.track) && drive.setWaypoint(null);
      S.clear();
      B = null;
      M.clear();
      p.clear();
      m.clear();
      F = [];
      A.setCars([]);
      lightPools == null || lightPools.setGhostPools(null);
      h.setRemoteCars(null);
      ne(null);
      se.setVisible(false);
      quiet || se.toast("LEFT THE ROOM");
      U();
    }
  }
  function Te(ge) {
    const Le = nB(ge) || GE(f.id);
    uue(Le === GE(f.id) ? "" : Le);
    se.setName(Le);
    Le === f.name || (f.name = Le, Fe.send(JSON.stringify(["n", Le])), se.toast(`NAME SAVED · ${Le}`));
    return Le;
  }
  function ue() {
    B ? se.openPanel(6e3) : re.toggle();
  }
  function $(ge, Le = false) {
    return !Le && M.size === 0 ? false : Fe.send(JSON.stringify(ge));
  }
  function q() {
    H = 0;
    P = 0;
  }
  function oe(ge) {
    var Fs, In, qe;
    const Le = drive.vehicle.body,
      Oe = Le.translation(),
      et = Le.rotation(),
      lt = Le.linvel(),
      Et = Math.abs(Oe.x - Y.x) > fv || Math.abs(Oe.y - Y.y) > fv || Math.abs(Oe.z - Y.z) > fv || lt.x * lt.x + lt.y * lt.y + lt.z * lt.z > .09,
      Gt = drive.vehicle.telemetry;
    let es = 0;
    Gt.brake > .15 && (es |= vehicleFlags.BRAKE);
    Gt.gear === -1 && (es |= vehicleFlags.REVERSE);
    Gt.nitro > 0 && (es |= vehicleFlags.NITRO);
    (Gt.drifting || (Fs = drive.driftScore) != null && Fs.state.drifting) && (es |= vehicleFlags.DRIFT);
    drive.isActive() || (es |= vehicleFlags.ON_FOOT);
    (In = drive.signals) != null && In.horn && (es |= vehicleFlags.HORN);
    (qe = drive.signals) != null && qe.lights && (es |= vehicleFlags.LIGHTS);
    !(!Et && es === G && !(es & Kge) && ge - P < Wge) && Fe.send(encodePose(ge, Oe, et, lt, es)) && (G = es, P = ge, Y.x = Oe.x, Y.y = Oe.y, Y.z = Oe.z, X.tx += 1);
  }
  function xe() {
    switch (R) {
      case "connecting":
        return "CONNECTING…";
      case "reconnecting":
        return L ? "RECONNECTING…" : "SERVER UNREACHABLE…";
      case "open":
        return `${ae()} · ${M.size + 1}/${maxDrivers}`;
      default:
        return "OFFLINE";
    }
  }
  function me() {
    const ge = drive.playerPose(),
      Le = new Map(F.map(et => [et.id, et])),
      Oe = [...M].map(([et, lt]) => {
        var Gt;
        const Et = Le.get(et);
        return {
          id: et,
          name: lt.name,
          color: ((Gt = p.get(et)) == null ? undefined : Gt.color) ?? {
            css: "#22d3ee"
          },
          distance: Et ? Math.hypot(Et.x - ge.x, Et.z - ge.z) : null,
          canFollow: !!Et,
          canTrack: true,
          tracking: drive.gps.track !== null && drive.gps.track === S.get(et),
          watching: E === et
        };
      });
    se.update({
      state: R,
      text: xe(),
      rtt: R === "open" ? I : null,
      drivers: Oe
    });
  }
  function ie(ge) {
    for (let Le = b.length - 1; Le >= 0; Le--) b[Le].expires <= ge && b.splice(Le, 1);
    y.length = 0;
    for (const Le of A.glows) y.push(Le);
    for (let Le = 0; Le < b.length; Le++) {
      const Oe = b[Le],
        et = x[Le] ?? (x[Le] = {
          x: 0,
          z: 0,
          size: 16,
          rgb: Xge,
          intensity: 1
        }),
        lt = Math.min(1, (Oe.expires - ge) / 4e3);
      et.x = Oe.x;
      et.z = Oe.z;
      et.size = 14 + 3 * Math.sin(ge * .004 + Le);
      et.intensity = 1.1 * lt;
      y.push(et);
    }
    lightPools == null || lightPools.setGhostPools(y);
    (b.length || C) && (m.updatePings(b, drive.playerPose().y, ge), C = b.length > 0);
  }
  function Ne() {
    camera.getWorldDirection(hv);
    const ge = hv.x,
      Le = hv.z,
      Oe = Math.hypot(ge, Le) || 1;
    for (const et of F) {
      if (!et.horn || et.age > 600 || et.onFoot) {
        T.delete(et.id) && v.release(et.id);
        continue;
      }
      const lt = et.x - camera.position.x,
        Et = et.z - camera.position.z,
        Gt = Math.hypot(lt, Et),
        es = 1 - Math.min(1, Math.max(0, (Gt - sF) / (jge - sF))),
        Fs = Gt > 1 ? (lt * (-Le / Oe) + Et * (ge / Oe)) / Gt : 0;
      T.add(et.id);
      v.set(et.id, true, {
        gain: es * es * .9,
        pan: Fs
      });
    }
  }
  function ze(ge) {
    var et, lt;
    if (He && !B && isUiReady() && canOpenLobby()) {
      const Et = He;
      He = null;
      re.open(Et);
    }
    if (!B) return;
    const Le = performance.now();
    Fe.state === "open" && M.size > 0 && (H -= ge, H <= 0 && (H = Hge, oe(Le)));
    const Oe = (lt = (et = drive.car) == null ? undefined : et.def) == null ? undefined : lt.id;
    if (Oe && Oe !== z && (z = Oe, $(["c", Oe], true)), F = p.sample(Le), O = Le, E !== null && !drive.isCameraOverridden() && fe(), v && Ne(), J == null || J.update(ge), Q.update(ge), A.step(), A.setCars(F, Le), ie(Le), h.setRemoteCars(F), m.update(F), se.setVisible(isUiReady()), W -= ge, W <= 0 && (W = $ge, me()), Le - X.at > 1e3) {
      const Et = (Le - X.at) / 1e3;
      X.txPerSec = X.tx / Et;
      X.rxPerSec = X.rx / Et;
      X.tx = 0;
      X.rx = 0;
      X.at = Le;
    }
  }
  const tt = (hs = drive.onAction) == null ? undefined : hs.call(drive, ge => {
      ge === "watchFriend" ? Ue() : ge === "chat" && le.toggle();
    }),
    dt = new URLSearchParams(location.search).get("room");
  if (dt) {
    const ge = normalizeRoomId(dt);
    ge && !tue(ge) ? (ne(null), He = {
      notice: Lo.oldLink
    }) : Je(dt) || ne(null);
  }
  return {
    update: ze,
    door: ue,
    lobby: re,
    openLobby: ge => re.open(ge),
    join: Je,
    leave: je,
    rename: Te,
    trackFriend: te,
    watch: Ue,
    say: we,
    pingAt: ye,
    togglePanel: () => se.togglePanel(),
    tipState: () => {
      var ge;
      return {
        available: true,
        inRoom: !!B,
        friends: B ? M.size : 0,
        invited: !!((ge = progress == null ? undefined : progress.storySeen) != null && ge.call(progress, "invited")),
        chatUsed: g
      };
    },
    startRace: ge => (J == null ? undefined : J.start(ge)) ?? false,
    get racing() {
      return (J == null ? undefined : J.racing) ?? false;
    },
    setHornAudio(ge) {
      v = ge ?? null;
    },
    get room() {
      return B;
    },
    get state() {
      return R;
    },
    mapMarkers: () => [...F.map(ge => ({
      kind: "friend",
      id: ge.id,
      name: ge.name,
      x: ge.x,
      z: ge.z,
      color: ge.color.css,
      done: false,
      track: V(ge.id)
    })), ...b.map(ge => ({
      kind: "ping",
      id: ge.key,
      name: `${ge.name} · PING`,
      x: ge.x,
      z: ge.z,
      color: zf,
      done: false
    }))],
    stats: () => ({
      state: R,
      room: B,
      me: f,
      rtt: I === null ? null : Math.round(I),
      sentPerSec: Math.round(X.txPerSec * 10) / 10,
      receivedPerSec: Math.round(X.rxPerSec * 10) / 10,
      drivers: [...M].map(([ge, Le]) => ({
        id: ge,
        ...Le
      })),
      sampledAt: O,
      cars: F.map(ge => ({
        id: ge.id,
        x: +ge.x.toFixed(5),
        y: +ge.y.toFixed(5),
        z: +ge.z.toFixed(5),
        yaw: +ge.yaw.toFixed(5),
        speed: +ge.speed.toFixed(4)
      })),
      buffers: p.stats(),
      smoothing: {
        ...p.config
      }
    }),
    tune: ge => p.configure(ge),
    tuneGhost: ge => A.tune(ge),
    ghostObjects: A.meshes,
    ghostStats: () => A.stats(),
    warmup: () => A.warmup(),
    simulateDown(ge = true) {
      rue(ge);
      ge && Fe.drop();
    },
    dispose() {
      tt == null || tt();
      le.dispose();
      missions == null || missions.setTogether(null);
      J == null || J.dispose();
      de == null || de();
      Q.dispose();
      je({
        quiet: true
      });
      re.dispose();
      Fe.dispose();
      m.dispose();
      A.dispose();
      se.dispose();
    }
  };
}
export const Zge = 4;
export const Nb = 392;
export const nF = 1.26;
export const e0e = .014;
export const iF = .07;
