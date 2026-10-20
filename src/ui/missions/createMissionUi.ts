// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { L1, bu, Sue } from "../../game/story/milestones.ts";
import { xG, _G, N1, md } from "../../game/sigils/placements.ts";
import { cc } from "../map/markers.ts";
import { Hpe, typewriter, qpe } from "../story/typewriter.ts";
export function wg(i, e = "") {
  const t = document.createElement("div");
  t.className = i;
  t.innerHTML = e;
  return t;
}
export function createMissionUi({
  typeSound = null,
  voice = null
} = {}) {
  const t = wg("mission-brief"),
    s = wg("mission-panel"),
    n = wg("mission-count"),
    r = wg("mission-notice"),
    o = wg("mission-result");
  for (const P of [t, s, n, r, o]) document.body.appendChild(P);
  let a = null,
    l = null,
    c = null,
    u = "",
    d = null,
    h = null,
    f = null,
    p = null,
    m = null,
    A = null,
    g = null;
  const b = new Set();
  function x(P, {
    inCar = true,
    record = null,
    limit: limit,
    onStart: onStart,
    onStartTogether = null,
    onInvite = null,
    together = null
  } = {}) {
    var U, J;
    a = onStart;
    l = onStartTogether;
    c = onInvite;
    const re = L1(P),
      le = xG(P, limit),
      we = _G(record);
    A == null || A.cancel();
    t.classList.remove("is-typed");
    t.style.setProperty("--c", re.color);
    t.innerHTML = `
      <div class="mission-brief__who">
        ${bu(re)}
        <p class="mission-brief__name"><b>${re.name}</b><span>${re.role}</span></p>
      </div>
      <div class="mission-brief__body">
        <p class="mission-brief__eyebrow">${cc(P.icon, {
      size: 20,
      done: !!(record != null && record.done)
    })}<span>${P.race ? "STREET RACE" : "MISSION"}</span><span class="mission-brief__tier" aria-label="Difficulty ${P.tier} of 3">${Hpe(P.tier)}</span>${record != null && record.done ? `<span class="mission-brief__done">${P.race ? "✓ WON" : "✓ PASSED"}</span>` : ""}</p>
        <h2 class="mission-brief__title">${P.name}</h2>
        <p class="mission-brief__text"></p>
        <ul class="mission-brief__goals">${le.map((Q, j) => `<li style="--i:${j}">${Q}</li>`).join("")}</ul>
        ${we ? `<p class="mission-brief__record">${we}</p>` : ""}
        <div class="mission-brief__actions">
          <button type="button" class="mission-brief__start"><kbd>ENTER</kbd><span>${P.race ? "START RACE" : "START MISSION"}</span></button>
          ${P.race ? '<button type="button" class="mission-brief__together" hidden><kbd>U</kbd><span></span></button>' : ""}
          <p class="mission-brief__foot">GET IN THE CAR TO START</p>
          ${P.race ? '<p class="mission-brief__friends" hidden></p>' : ""}
        </div>
      </div>`;
    t.querySelector(".mission-brief__start").addEventListener("click", Q => {
      Q.stopPropagation();
      a == null || a();
    });
    (U = t.querySelector(".mission-brief__together")) == null || U.addEventListener("click", Q => {
      Q.stopPropagation();
      l == null || l();
    });
    (J = t.querySelector(".mission-brief__friends")) == null || J.addEventListener("click", Q => {
      Q.target.closest(".mission-brief__invite") && (Q.stopPropagation(), c == null || c());
    });
    u = null;
    y(together);
    const Se = t.querySelector(".mission-brief__text");
    Se.addEventListener("click", Q => {
      Q.stopPropagation();
      A == null || A.finish();
    });
    const ye = b.has(P.id) ? null : voice == null ? undefined : voice.say(re.id, P.brief, {
      priority: 2,
      delay: .3
    });
    ye && b.add(P.id);
    A = typewriter(Se, P.brief, {
      delay: .3,
      cps: 44,
      sound: typeSound,
      voice: ye,
      onDone: () => t.classList.add("is-typed")
    });
    _(inCar);
    t.classList.add("is-visible");
    document.body.classList.add("mission-brief-on");
  }
  function y(P) {
    const z = P ? `${P.line}|${P.room}` : "";
    if (z === u) return;
    u = z;
    const Y = t.querySelector(".mission-brief__together"),
      G = t.querySelector(".mission-brief__friends");
    if (!Y || !G) return;
    const X = (P == null ? undefined : P.line) ?? 0;
    Y.hidden = X < 1;
    X >= 1 && (Y.querySelector("span").textContent = `START WITH ${X === 1 ? "YOUR FRIEND" : `${X} FRIENDS`}`);
    G.hidden = !P || X >= 1;
    !G.hidden && (G.innerHTML = P.room < 1 ? 'RACE ANOTHER DRIVER · <button type="button" class="mission-brief__invite">JOIN A ROOM</button>, THEN MEET AT THE LINE' : `${P.room === 1 ? "ANOTHER DRIVER IS" : "OTHER DRIVERS ARE"} IN THE ROOM · MEET AT THE LINE, THEN ${qpe ? "TAP START WITH FRIEND" : "PRESS <kbd>U</kbd>"}`);
  }
  function _(P) {
    t.classList.toggle("is-on-foot", !P);
  }
  function w() {
    A == null || A.cancel();
    A = null;
    t.classList.remove("is-visible");
    document.body.classList.remove("mission-brief-on");
    a = null;
    l = null;
    c = null;
  }
  let S = {},
    T = {},
    v = null,
    E = [];
  function C(P, z) {
    return `<li class="mission-panel__row" data-key="${P}"><span class="mission-panel__label">${z}</span><span class="mission-panel__value"></span><i class="mission-panel__bar"><b></b></i></li>`;
  }
  function M(P, {
    limit: limit,
    stops = [],
    place = false
  } = {}) {
    v = P;
    E = stops;
    const X = P.rules,
      ae = stops.filter(se => se.stop).length,
      ne = [];
    stops.length > 1 && ne.push(C("stops", ae === stops.length ? "DROPS" : "CHECKPOINT"));
    place && ne.push(C("place", "POSITION"));
    X.topSpeed && ne.push(C("top", "TOP SPEED"));
    X.drift && ne.push(C("drift", "DRIFT"));
    X.chain && ne.push(C("chain", "CHAIN"));
    X.smash && ne.push(C("smash", "PROPS"));
    X.minSpeed && ne.push(C("floor", `FLOOR ${X.minSpeed}`));
    Number.isFinite(X.crashes) && ne.push(C("crashes", "CRASHES"));
    Number.isFinite(X.damage) && ne.push(C("damage", "DAMAGE"));
    X.noNitro && ne.push(C("nitro", "NITRO"));
    X.zone && ne.push(C("zone", "ZONE"));
    s.innerHTML = `
      <header class="mission-panel__head">${cc(P.icon, {
      size: 30
    })}<span>${P.name}</span></header>
      <div class="mission-panel__clock${Number.isFinite(limit) ? "" : " is-elapsed"}">0:00.0</div>
      <ul class="mission-panel__rows">${ne.join("")}</ul>
      <footer class="mission-panel__foot"><kbd>⌫</kbd> QUIT</footer>
      <button type="button" class="mission-panel__quit" aria-label="Quit mission">✕</button>`;
    s.querySelector(".mission-panel__quit").addEventListener("click", se => {
      se.stopPropagation();
      f == null || f();
    });
    S = {};
    for (const se of s.querySelectorAll("[data-key]")) S[se.dataset.key] = {
      li: se,
      value: se.querySelector(".mission-panel__value"),
      bar: se.querySelector(".mission-panel__bar b")
    };
    S.clock = {
      value: s.querySelector(".mission-panel__clock")
    };
    T = {};
    S.nitro && B("nitro", "OFF", null, "bad");
    s.classList.add("is-visible");
    document.body.classList.add("mission-running");
  }
  function B(P, z, Y = null, G = "") {
    const X = S[P];
    if (!X) return;
    const ae = `${z}|${Y === null ? "" : Math.round(Y * 200)}|${G}`;
    T[P] !== ae && (T[P] = ae, X.value.textContent = z, X.bar && (X.li.classList.toggle("has-bar", Y !== null), Y !== null && (X.bar.style.transform = `scaleX(${Math.min(1, Math.max(0, Y)).toFixed(3)})`)), X.li && (X.li.classList.toggle("is-met", G === "met"), X.li.classList.toggle("is-bad", G === "bad"), X.li.classList.toggle("is-warn", G === "warn")));
  }
  function R(P, z = "") {
    B("place", P, null, z);
  }
  function I(P) {
    if (!v) return;
    const z = v.rules,
      Y = Number.isFinite(P.limit) ? P.limit - P.t : P.t,
      G = N1(Y),
      X = Number.isFinite(P.limit) && Y < 10,
      ae = `${G}|${X}`;
    if (T.clock !== ae && (T.clock = ae, S.clock.value.textContent = G, S.clock.value.classList.toggle("is-low", X)), S.stops) {
      const ne = E.length,
        se = Math.min(P.stopIndex, ne);
      B("stops", `${se} / ${E.filter(re => re.stop).length === ne ? ne : ne - 1}`);
    }
    if (S.top && B("top", `${Math.round(P.top)} / ${z.topSpeed}`, P.top / z.topSpeed, P.top >= z.topSpeed ? "met" : ""), S.drift) {
      const ne = P.combo > 0 ? ` +${md(P.combo)}` : "";
      B("drift", `${md(P.drift)} / ${md(z.drift)}${ne}`, P.drift / z.drift, P.drift >= z.drift ? "met" : "");
    }
    if (S.chain) {
      const ne = Math.max(P.combo, P.chainBest);
      B("chain", `${md(ne)} / ${md(z.chain)}`, ne / z.chain, P.chainBest >= z.chain ? "met" : "");
    }
    if (S.smash && B("smash", `${P.props} / ${z.smash}`, P.props / z.smash, P.props >= z.smash ? "met" : ""), S.floor && (P.armed ? B("floor", P.low > .02 ? "SPEED UP!" : "ARMED", 1 - P.low, P.low > .02 ? "bad" : "warn") : B("floor", `ARM AT ${z.minSpeed}`, Math.min(1, P.speed / z.minSpeed))), S.crashes && B("crashes", `${P.crashes} / ${z.crashes}`, null, P.crashes >= z.crashes && z.crashes > 0 ? "warn" : ""), S.damage && B("damage", `${Math.round(P.damage)}% / ${z.damage}%`, P.damage / z.damage, P.damage > z.damage * .7 ? "bad" : ""), S.zone) {
      const ne = P.zoneDist / z.zone;
      B("zone", ne > 1 ? "OUTSIDE!" : `${Math.round(P.zoneDist)} / ${z.zone} M`, Math.min(1, ne), ne > 1 ? "bad" : ne > .85 ? "warn" : "");
    }
  }
  function k() {
    s.classList.remove("is-visible");
    document.body.classList.remove("mission-running");
    v = null;
  }
  function L(P) {
    n.textContent = P;
    n.classList.remove("is-pop");
    n.offsetWidth;
    n.classList.add("is-pop", "is-visible");
    n.classList.toggle("is-go", P === "GO");
    clearTimeout(m);
    m = setTimeout(() => n.classList.remove("is-visible"), P === "GO" ? 900 : 1100);
  }
  function F(P, z = "info") {
    P && (r.textContent = P, r.dataset.kind = z, r.classList.remove("is-pop"), r.offsetWidth, r.classList.add("is-visible", "is-pop"), clearTimeout(p), p = setTimeout(() => r.classList.remove("is-visible"), 1800));
  }
  function O({
    mission: mission,
    passed: passed,
    reason: reason,
    stats: stats,
    rules: rules,
    first: first,
    newBest = [],
    canRetry: canRetry
  }) {
    var U;
    const re = [],
      le = J => newBest.includes(J) ? "<em>NEW BEST</em>" : "";
    (passed || Number.isFinite(stats.time)) && re.push(`<li><span>TIME</span><b>${N1(stats.time)}</b>${le("time")}</li>`);
    rules.drift && re.push(`<li><span>DRIFT</span><b>${md(stats.drift)}</b>${le("drift")}</li>`);
    rules.chain && re.push(`<li><span>BEST CHAIN</span><b>${md(stats.chain)}</b>${le("drift")}</li>`);
    rules.topSpeed && re.push(`<li><span>TOP SPEED</span><b>${Math.round(stats.top)} KM/H</b></li>`);
    rules.smash && re.push(`<li><span>PROPS</span><b>${stats.props}</b></li>`);
    Number.isFinite(rules.crashes) && re.push(`<li><span>CRASHES</span><b>${stats.crashes}</b></li>`);
    Number.isFinite(rules.damage) && re.push(`<li><span>DAMAGE</span><b>${Math.round(stats.damage)}%</b></li>`);
    const we = L1(mission),
      Se = Sue(we, passed);
    o.className = `mission-result ${passed ? "is-passed" : "is-failed"}`;
    o.innerHTML = `
      <div class="mission-result__badge">${cc(mission.icon, {
      size: 60,
      done: passed
    })}</div>
      <p class="mission-result__eyebrow">${mission.name}</p>
      <h2 class="mission-result__title">${mission.race ? passed ? "RACE WON" : "RACE LOST" : passed ? "MISSION PASSED" : "MISSION FAILED"}</h2>
      ${reason ? `<p class="mission-result__reason">${reason}</p>` : ""}
      ${passed && first ? '<p class="mission-result__first">FIRST CLEAR · ADDED TO ACHIEVEMENTS</p>' : ""}
      ${Se ? `<div class="mission-result__say" style="--c:${we.color}">${bu(we)}<p><b>${we.name}</b><span class="mission-result__line"></span></p></div>` : ""}
      <ul class="mission-result__stats">${re.join("")}</ul>
      <ul class="mission-result__race" hidden></ul>
      <div class="mission-result__actions">
        ${canRetry ? '<button type="button" data-act="retry"><kbd>ENTER</kbd>RETRY</button>' : ""}
        <button type="button" data-act="close"><kbd>${canRetry ? "⌫" : "ENTER"}</kbd>CONTINUE</button>
      </div>`;
    (U = o.querySelector('[data-act="retry"]')) == null || U.addEventListener("click", J => {
      J.stopPropagation();
      d == null || d();
    });
    o.querySelector('[data-act="close"]').addEventListener("click", J => {
      J.stopPropagation();
      h == null || h();
    });
    g == null || g.cancel();
    const ye = o.querySelector(".mission-result__line");
    g = ye ? typewriter(ye, Se, {
      delay: .6,
      cps: 36,
      sound: typeSound,
      voice: voice == null ? undefined : voice.say(we.id, Se, {
        priority: 2,
        delay: .6
      })
    }) : null;
    o.offsetWidth;
    o.classList.add("is-visible");
    document.body.classList.add("mission-result-on");
  }
  function H(P) {
    const z = o.querySelector(".mission-result__race");
    if (!z || (z.hidden = !(P != null && P.length), z.hidden)) return;
    const Y = P.map(G => `${G.rank}|${G.name}|${G.you ? 1 : 0}|${G.text}|${G.state}`).join(";");
    z.dataset.key !== Y && (z.dataset.key = Y, z.replaceChildren(...P.map(G => {
      const X = document.createElement("li");
      X.className = `${G.you ? "is-you " : ""}is-${G.state}`;
      const ae = document.createElement("i");
      ae.textContent = G.rank > 0 ? String(G.rank) : "–";
      const ne = document.createElement("span");
      ne.textContent = G.you ? `${G.name} (YOU)` : G.name;
      const se = document.createElement("em");
      se.textContent = G.text;
      X.append(ae, ne, se);
      return X;
    })));
  }
  function W() {
    g == null || g.cancel();
    g = null;
    o.classList.remove("is-visible");
    document.body.classList.remove("mission-result-on");
  }
  return {
    showBrief: x,
    hideBrief: w,
    setBriefInCar: _,
    setBriefTogether: y,
    startRun: M,
    updateRun: I,
    setPlace: R,
    endRun: k,
    countdown: L,
    notice: F,
    showResult: O,
    setResultStandings: H,
    hideResult: W,
    onRetry: P => {
      d = P;
    },
    onQuit: P => {
      f = P;
    },
    onClose: P => {
      h = P;
    },
    dispose() {
      clearTimeout(p);
      clearTimeout(m);
      A == null || A.cancel();
      g == null || g.cancel();
      for (const P of [t, s, n, r, o]) P.remove();
      document.body.classList.remove("mission-brief-on", "mission-running", "mission-result-on");
    }
  };
}
export const $pe = 9;
export const Kpe = 15;
export const jpe = 45;
export const Rk = 3;
export const Ype = 45e3;
export const Ik = 22e3;
export const Xpe = .8;
export const Jpe = 12;
export const Nk = 1.6;
export const Zpe = 4;
export const eme = 420;
export const tme = i => Math.min(1, Math.max(0, i));
