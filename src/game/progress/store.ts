// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { reportSaveFailure } from "../../platform/saveStatus.ts";
import { yE, vehicleCatalog, isVehicleUnlocked } from "../vehicles/catalog.ts";
import { b1 } from "../story/definitions.ts";
export const zG = "trapnest-neon:progress";
export const GG = 1;
export function JE() {
  return {
    v: GG,
    missions: {},
    sigils: {},
    rides: [],
    car: "quadra",
    story: {},
    inbox: []
  };
}
export function Npe() {
  try {
    const i = JSON.parse(localStorage.getItem(zG) ?? "null");
    if ((i == null ? undefined : i.v) === GG && i.missions && i.sigils) {
      const e = {
        ...JE(),
        ...i
      };
      e.car = yE(e.car);
      e.rides = (e.rides ?? []).map(yE);
      e.sigils = Object.fromEntries(Object.entries(e.sigils).map(([t, s]) => [b1(t), s]));
      e.inbox = (e.inbox ?? []).map(t => (t == null ? undefined : t.kind) === "sigil" ? {
        ...t,
        ref: b1(t.ref)
      } : t);
      return e;
    }
  } catch { reportSaveFailure(); }
  return JE();
}
export function createProgressStore({
  missionIds = [],
  raceIds = [],
  sigilIds = []
} = {}) {
  let s = Npe();
  const n = new Set();
  function r() {
    try {
      localStorage.setItem(zG, JSON.stringify(s));
    } catch { reportSaveFailure(); }
  }
  function o(p) {
    for (const m of n) m(p, f);
  }
  const a = () => missionIds.filter(p => {
      var m;
      return (m = s.missions[p]) == null ? undefined : m.done;
    }).length,
    l = () => raceIds.filter(p => {
      var m;
      return (m = s.missions[p]) == null ? undefined : m.done;
    }).length,
    c = () => sigilIds.filter(p => s.sigils[p]).length,
    u = () => missionIds.length + raceIds.length + sigilIds.length,
    d = () => u() > 0 && a() === missionIds.length && l() === raceIds.length && c() === sigilIds.length;
  function h() {
    s.rides ?? (s.rides = []);
    const p = vehicleCatalog.filter(m => m.unlock && !s.rides.includes(m.id) && isVehicleUnlocked(m, f));
    for (const m of p) s.rides.push(m.id);
    return p.map(m => m.id);
  }
  const f = {
    get missionCount() {
      return missionIds.length;
    },
    get raceCount() {
      return raceIds.length;
    },
    get sigilCount() {
      return sigilIds.length;
    },
    get totalCount() {
      return u();
    },
    missionsDone: a,
    racesDone: l,
    sigilsFound: c,
    isAllComplete: d,
    get allCars() {
      return !!s.allCars;
    },
    unlockAllCars() {
      s.allCars = true;
      const p = h();
      r();
      o({
        type: "allCars",
        rides: p
      });
      return p;
    },
    get car() {
      return s.car ?? "quadra";
    },
    setCar(p) {
      s.car !== p && (s.car = p, r(), o({
        type: "car",
        id: p
      }));
    },
    storySeen: p => {
      var m;
      return !!((m = s.story) != null && m[p]);
    },
    markStory(p) {
      s.story ?? (s.story = {});
      !s.story[p] && (s.story[p] = Date.now(), r());
    },
    get inbox() {
      return Array.isArray(s.inbox) ? s.inbox : [];
    },
    saveInbox(p) {
      s.inbox = p;
      r();
    },
    mission: p => s.missions[p] ?? null,
    isMissionDone: p => {
      var m;
      return !!((m = s.missions[p]) != null && m.done);
    },
    isSigilCollected: p => !!s.sigils[p],
    fraction() {
      return u() ? (a() + l() + c()) / u() : 0;
    },
    completeMission(p, m = {}) {
      const A = s.missions[p] ?? {
          done: false,
          runs: 0,
          best: {}
        },
        g = !A.done,
        b = [];
      A.best ?? (A.best = {});
      Number.isFinite(m.time) && (!Number.isFinite(A.best.time) || m.time < A.best.time) && (Number.isFinite(A.best.time) && b.push("time"), A.best.time = m.time);
      Number.isFinite(m.drift) && m.drift > 0 && !(A.best.drift >= m.drift) && (Number.isFinite(A.best.drift) && b.push("drift"), A.best.drift = m.drift);
      A.done = true;
      A.at ?? (A.at = Date.now());
      A.runs = (A.runs ?? 0) + 1;
      s.missions[p] = A;
      const x = h();
      r();
      o({
        type: "mission",
        id: p,
        first: g,
        newBest: b,
        rides: x
      });
      return {
        first: g,
        newBest: b,
        rides: x
      };
    },
    recordAttempt(p) {
      const m = s.missions[p] ?? {
        done: false,
        runs: 0,
        best: {}
      };
      m.runs = (m.runs ?? 0) + 1;
      s.missions[p] = m;
      r();
    },
    collectSigil(p) {
      if (s.sigils[p]) return {
        first: false,
        rides: []
      };
      s.sigils[p] = Date.now();
      const m = h();
      r();
      o({
        type: "sigil",
        id: p,
        first: true,
        rides: m
      });
      return {
        first: true,
        rides: m
      };
    },
    subscribe(p) {
      n.add(p);
      return () => n.delete(p);
    },
    reset() {
      s = JE();
      r();
      o({
        type: "reset"
      });
    },
    completeAll() {
      for (const m of [...missionIds, ...raceIds]) s.missions[m] = {
        done: true,
        at: Date.now(),
        runs: 1,
        best: {}
      };
      for (const m of sigilIds) s.sigils[m] = Date.now();
      const p = h();
      r();
      o({
        type: "reset",
        rides: p
      });
    }
  };
  h().length && r();
  return f;
}
