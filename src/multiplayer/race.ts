// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Rge } from "../ui/multiplayer/quickChat.ts";
export function Jk(i) {
  const e = Math.max(0, i) / 1e3,
    t = Math.floor(e / 60);
  return `${t}:${(e - t * 60).toFixed(1).padStart(4, "0")}`;
}
export function Ige() {
  const i = document.createElement("aside");
  i.className = "mp-race";
  i.setAttribute("data-ui-block-look", "true");
  i.setAttribute("aria-label", "Race standings");
  i.innerHTML = `
    <header class="mp-race__head"><span class="mp-race__tag">RACE</span><b class="mp-race__name"></b></header>
    <ol class="mp-race__rows"></ol>
    <p class="mp-race__foot"></p>`;
  document.body.appendChild(i);
  const e = i.querySelector(".mp-race__name"),
    t = i.querySelector(".mp-race__rows"),
    s = i.querySelector(".mp-race__foot");
  let n = "";
  return {
    show(r) {
      e.textContent = r.toUpperCase();
      i.classList.add("is-visible");
      n = "";
    },
    hide() {
      i.classList.remove("is-visible");
    },
    update(r, o = "") {
      const a = `${o}#${r.map(l => `${l.key}|${l.rank}|${l.name}|${l.you ? 1 : 0}|${l.text}|${l.state}`).join(";")}`;
      a !== n && (n = a, t.replaceChildren(...r.map(l => {
        const c = document.createElement("li");
        c.className = `mp-race__row is-${l.state}${l.you ? " is-you" : ""}`;
        const u = document.createElement("i");
        u.textContent = l.rank > 0 ? String(l.rank) : "–";
        l.rank > 0 && l.rank <= 3 && l.state === "finished" && u.style.setProperty("--medal", Rge[l.rank - 1]);
        const d = document.createElement("span");
        d.textContent = l.you ? `${l.name} (YOU)` : l.name;
        const h = document.createElement("em");
        h.textContent = l.text;
        c.append(u, d, h);
        return c;
      })), s.textContent = o, s.hidden = !o);
    },
    dispose() {
      i.remove();
    }
  };
}
export const cv = 160;
export const Nge = 2500;
export const Lge = 9e3;
export const kge = 12e3;
export const Fge = .25;
export const Ib = "#ffd60a";
export const Dge = i => ["1ST", "2ND", "3RD", "4TH"][i - 1] ?? `${i}TH`;
export const Pge = i => i >= 1e3 ? `${(i / 1e3).toFixed(1)} KM` : `${Math.round(i / 10) * 10} M`;
export function createMultiplayerRace({
  drive: drive,
  missions: missions,
  roster: roster,
  me: me,
  getCars: getCars,
  send: send,
  toast: toast,
  now = () => performance.now()
}) {
  const l = Ige();
  let c = null,
    u = null,
    d = 0;
  function h(w) {
    const S = missions.raceInfo(w);
    if (!S) return 0;
    let T = 0;
    for (const v of getCars()) !v.onFoot && v.age < 3e3 && Math.hypot(v.x - S.start.x, v.z - S.start.z) < cv && (T += 1);
    return T;
  }
  function f(w) {
    return !roster.size || c && !c.over || u && now() - u.at < 1500 || !missions.raceInfo(w) || !send(["rs", w]) ? false : (clearTimeout(u == null ? undefined : u.timer), u = {
      at: now(),
      timer: setTimeout(() => {
        u && !c && toast("THE ROOM DID NOT ANSWER · ENTER STARTS IT ALONE", {
          warn: true
        });
        u = null;
      }, 2800)
    }, toast("RACE STARTING · FRIENDS AT THE LINE JOIN", {
      ms: 1800,
      color: Ib
    }), true);
  }
  const p = (w, S) => {
    var v;
    let T = c.racers.get(w);
    T || (T = {
      id: w,
      name: S ?? ((v = roster.get(w)) == null ? undefined : v.name) ?? "FRIEND",
      you: false,
      cleared: 0,
      finishMs: null,
      out: false,
      announced: false
    }, c.racers.set(w, T));
    return T;
  };
  function m([, w, S, T]) {
    var I;
    clearTimeout(u == null ? undefined : u.timer);
    u = null;
    const v = missions.raceInfo(S);
    if (!v || !Number.isFinite(T) || c && !c.over) return;
    const E = w === me.id ? "YOU" : ((I = roster.get(w)) == null ? undefined : I.name) ?? "A FRIEND",
      C = drive.playerPose(),
      M = Math.hypot(C.x - v.start.x, C.z - v.start.z);
    let B = null;
    if (drive.isActive() ? drive.isMissionActive() ? B = "YOU ARE IN A MISSION" : w !== me.id && M > cv && (B = `${Pge(M)} AWAY`) : B = "GET IN YOUR CAR NEXT TIME", B) {
      toast(`${E} STARTED ${v.name.toUpperCase()} · ${B}`, {
        ms: 4200,
        color: Ib
      });
      !drive.isMissionActive() && drive.isActive() && M > cv && drive.setWaypoint({
        x: v.start.x,
        z: v.start.z
      });
      return;
    }
    const R = [me.id, ...roster.keys()].sort().indexOf(me.id) % 4;
    if (!missions.startTogether(S, {
      countdown: T / 1e3,
      slot: R
    })) {
      toast("COULD NOT JOIN THE RACE · FINISH WHAT YOU ARE DOING", {
        warn: true
      });
      return;
    }
    c = {
      id: S,
      info: v,
      by: w,
      goAt: null,
      racers: new Map(),
      over: false,
      doneAt: null,
      finishedToast: false
    };
    c.racers.set(me.id, {
      id: me.id,
      name: me.name,
      you: true,
      cleared: 0,
      finishMs: null,
      out: false,
      announced: true
    });
    for (const [k, L] of roster) p(k, L.name);
    l.show(v.name);
    d = 0;
  }
  function A([w, S, T, v]) {
    if (!c || c.id !== T || S === me.id) return;
    const E = p(S);
    E.announced = true;
    w === "rc" ? E.cleared = Math.max(E.cleared, v) : w === "rf" ? (E.finishMs = v, E.cleared = c.info.stops.length) : E.out = true;
  }
  function g(w) {
    w[0] === "rs" ? m(w) : A(w);
  }
  const b = missions.subscribe(w => {
    if (!c || w.id !== c.id) return;
    const S = c.racers.get(me.id);
    if (!(S.out || S.finishMs != null)) switch (w.type) {
      case "go":
        c.goAt = now(), send(["rc", c.id, 0]);
        break;
      case "checkpoint":
        S.cleared = w.index, send(["rc", c.id, w.index]);
        break;
      case "pass":
        {
          const T = Math.min(36e5, Math.max(1, Math.round(now() - (c.goAt ?? now()))));
          S.finishMs = T;
          S.cleared = c.info.stops.length;
          send(["rf", c.id, T]);
          const v = [...c.racers.values()].filter(E => !E.you && E.finishMs != null && E.finishMs < T).length;
          document.documentElement.classList.contains("mp-compact") || toast(`${Dge(v + 1)} ACROSS THE LINE · ${Jk(T)}`, {
            ms: 4200,
            color: Ib
          });
          break;
        }
      case "fail":
        S.out = true, send(["rx", c.id]);
        break;
    }
  });
  function x() {
    const w = c.info,
      S = w.stops.length,
      T = new Map(getCars().map(C => [C.id, C])),
      v = drive.playerPose(),
      E = [...c.racers.values()].map(C => {
        let M, B, R;
        if (C.finishMs != null) M = "finished", B = Jk(C.finishMs), R = 1e7 - C.finishMs;else if (C.out) M = "out", B = "OUT", R = -1;else if (!c.goAt || !C.announced && !C.you) M = "grid", B = "ON THE GRID", R = 0;else {
          M = "racing";
          const I = w.stops[Math.min(C.cleared, S - 1)],
            k = C.cleared > 0 ? w.stops[C.cleared - 1] : w.start,
            L = C.you ? v : T.get(C.id);
          let F = 0;
          if (L && I) {
            const O = Math.max(30, Math.hypot(I.x - k.x, I.z - k.z));
            F = 1 - Math.min(1, Math.max(0, Math.hypot(L.x - I.x, L.z - I.z) / O));
          }
          R = 10 + C.cleared + F * .95;
          B = `CP ${C.cleared} / ${S - 1}`;
        }
        return {
          key: C.id,
          name: C.you ? me.name : C.name,
          you: C.you,
          state: M,
          text: B,
          score: R,
          rank: 0
        };
      });
    E.sort((C, M) => M.score - C.score);
    E.forEach((C, M) => {
      C.rank = C.state === "out" ? 0 : M + 1;
    });
    return E;
  }
  function y(w) {
    var C, M, B, R;
    if (!c || (d -= w, d > 0)) return;
    d = Fge;
    const S = now();
    if (c.goAt && S - c.goAt > Nge) for (const [I, k] of c.racers) !k.you && !k.announced && c.racers.delete(I);
    for (const I of c.racers.values()) !I.you && !roster.has(I.id) && (I.out = true);
    const T = x(),
      v = T.some(I => I.state === "racing" || I.state === "grid");
    l.update(T, v ? "" : "RACE OVER");
    const E = T.find(I => I.you);
    if (E) {
      const I = c.goAt ? E.state === "out" ? "OUT" : `${E.rank} / ${T.length}` : "–";
      (M = (C = missions.hud) == null ? undefined : C.setPlace) == null || M.call(C, I, E.state === "out" ? "bad" : c.goAt && E.rank === 1 && T.length > 1 ? "met" : "");
    }
    if (document.documentElement.classList.contains("mp-compact") && ((R = (B = missions.hud) == null ? undefined : B.setResultStandings) == null || R.call(B, T)), !c.over && (!v || c.goAt && S - c.goAt > c.info.limit * 1e3 + kge)) {
      c.over = true;
      c.doneAt = S;
      const I = T.find(L => L.state === "finished"),
        k = document.body.classList.contains("mission-result-on") && document.documentElement.classList.contains("mp-compact");
      I && !k && T.filter(L => L.state === "finished").length > 1 && toast(I.you ? "YOU WON THE RACE" : `${I.name} WON THE RACE`, {
        ms: 4200,
        color: Ib
      });
    }
    c.over && S - c.doneAt > Lge && (l.hide(), c = null);
  }
  function _() {
    clearTimeout(u == null ? undefined : u.timer);
    u = null;
    c = null;
    l.hide();
  }
  return {
    friends: h,
    start: f,
    onFrame: g,
    update: y,
    reset: _,
    get racing() {
      return !!(c && !c.over);
    },
    dispose() {
      b();
      _();
      l.dispose();
    }
  };
}
export const uv = 5;
export const Zk = 30;
export const Uge = 2;
export const dv = 20;
export const zge = 38;
export const Gge = 45;
export const eF = 1.5;
export const tF = {
  draftUp: 4,
  draftDown: 2.5
};
export const Vge = (i, e, t, s) => i + (e - i) * (1 - Math.exp(-t * s));
