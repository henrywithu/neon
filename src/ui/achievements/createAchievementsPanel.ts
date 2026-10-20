// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Ef, Iue, IS, Rue, gL, L1, NS } from "../../game/story/milestones.ts";
import { contacts, aB, Tue } from "../../game/story/contacts.ts";
import { xG, _G, oB } from "../../game/sigils/placements.ts";
import { cc } from "../map/markers.ts";
import { mm, sigilDefinitions } from "../../game/story/definitions.ts";
import { missionDefinitions } from "../../game/missions/definitions.ts";
import { isVehicleUnlocked, Lie, getUnlockDescription } from "../../game/vehicles/catalog.ts";
function createAchievementsPanel({
  state: state,
  progress: progress,
  getTimeLimit = () => {},
  onLocate = null,
  onOpenGarage = null,
  onToggle = null,
  canOpen = () => true,
  domElement = null
}) {
  var C;
  const l = document.createElement("div");
  l.className = "achievements";
  l.hidden = true;
  l.setAttribute("data-ui-block-look", "true");
  l.innerHTML = `
    <div class="achievements__backdrop" data-close="true"></div>
    <section class="achievements__panel" role="dialog" aria-modal="true" aria-label="Achievements">
      <header class="achievements__head">
        <div class="achievements__title">${Ef("trophy", "achievements__trophy")}<div><p>TRAPNEST NEON</p><h2>ACHIEVEMENTS</h2></div></div>
        <div class="achievements__total">
          <span class="achievements__total-count"></span>
          <i class="achievements__meter"><b></b></i>
        </div>
        <button type="button" class="achievements__close" aria-label="Close achievements">${Iue}</button>
      </header>
      <div class="achievements__scroll">
        <h3 class="achievements__section"><span>MISSIONS</span><b class="achievements__missions-count"></b></h3>
        <div class="achievements__crews"></div>
        <h3 class="achievements__section"><span>STREET RACES</span><b class="achievements__races-count"></b></h3>
        ${IS(Rue, "ach-crew__head--races")}
        <p class="achievements__hint achievements__races-hint"></p>
        <ul class="achievements__missions achievements__races"></ul>
        <h3 class="achievements__section"><span>SIDE JOBS · NEON SIGILS</span><b class="achievements__sigils-count"></b></h3>
        ${IS(contacts[aB], "ach-crew__head--sigils")}
        <p class="achievements__hint">Hidden between the buildings, at eye level: walk into one, or brush past it in the car. The signal readout points the way, the city map (Tab) shows where. Every batch you find unlocks a ride:</p>
        <ol class="ach-rewards" style="--n:${gL.length}"></ol>
        <ul class="achievements__sigils"></ul>
      </div>
      <footer class="achievements__garage"></footer>
    </section>`;
  document.body.appendChild(l);
  const c = l.querySelector(".achievements__crews"),
    u = l.querySelector(".achievements__races"),
    d = l.querySelector(".achievements__races-hint"),
    h = l.querySelector(".achievements__sigils"),
    f = l.querySelector(".ach-rewards"),
    p = l.querySelector(".achievements__garage");
  let m = false;
  function A(M) {
    const B = progress.mission(M.id),
      R = !!(B != null && B.done),
      I = xG(M, getTimeLimit(M.id));
    return `
      <li class="ach-mission${R ? " is-done" : ""}">
        ${cc(M.icon, {
      size: 46,
      done: R
    })}
        <div class="ach-mission__body">
          <p class="ach-mission__tier">${"★".repeat(M.tier)}${"☆".repeat(3 - M.tier)}</p>
          <h4>${M.name}</h4>
          <p class="ach-mission__goal">${I.join(" · ")}</p>
          <p class="ach-mission__status">${R ? _G(B) || "PASSED" : B != null && B.runs ? `${B.runs} ATTEMPT${B.runs > 1 ? "S" : ""}` : "NOT PLAYED"}</p>
        </div>
        ${onLocate ? `<button type="button" class="ach-mission__gps" data-mission="${M.id}" title="Set GPS to the start">${Ef("location_on")}<span>GPS</span></button>` : ""}
      </li>`;
  }
  function g() {
    c.innerHTML = Tue.map(M => {
      const B = contacts[M],
        R = mm.filter(k => L1(k) === B);
      if (!R.length) return "";
      const I = R.filter(k => progress.isMissionDone(k.id)).length;
      return `
        <section class="ach-crew${I === R.length ? " is-done" : ""}" style="--c:${B.color}">
          ${IS(B, "", `${I} / ${R.length}`)}
          <ul class="achievements__missions">${R.map(A).join("")}</ul>
        </section>`;
    }).join("");
  }
  function b() {
    u.innerHTML = missionDefinitions.map(A).join("");
    const M = missionDefinitions.length - progress.racesDone(),
      B = NS ? M ? ` Win every one and the ${NS.name} is yours: ${M} to go.` : ` Every race won: the ${NS.name} is yours.` : "";
    d.textContent = `Chequered flags on the map: checkpoint runs on the clock and nothing else, so crash all you like.${B}`;
  }
  function x() {
    const M = progress.sigilsFound();
    let B = 0;
    f.innerHTML = gL.map(R => {
      const I = R.unlock.sigils,
        k = isVehicleUnlocked(R, progress),
        L = k ? 1 : Math.min(1, Math.max(0, (M - B) / (I - B)));
      B = I;
      return `
        <li class="ach-reward${k ? " is-open" : ""}" style="--k:${L.toFixed(3)}">
          <i class="ach-reward__meter"><b></b></i>
          ${Ef(k ? "lock_open" : "lock")}
          <div>
            <h5>${R.name}</h5>
            <p>${k ? "UNLOCKED" : `${I} SIGILS · ${Math.max(0, I - M)} MORE`}</p>
          </div>
        </li>`;
    }).join("");
  }
  function y() {
    x();
    h.innerHTML = sigilDefinitions.map(M => {
      const B = progress.isSigilCollected(M.id);
      return `
        <li class="ach-sigil${B ? " is-found" : ""}" style="--c:${M.color}" title="${B ? `${M.name} — ${M.lore}` : "Unknown signal"}">
          <i class="ach-sigil__icon" style="--icon:url('${oB(M.id)}')"></i>
          <span>${B ? M.name : "???"}</span>
        </li>`;
    }).join("");
  }
  function _() {
    const M = progress.missionsDone(),
      B = progress.racesDone(),
      R = progress.sigilsFound(),
      I = progress.totalCount,
      k = Math.round(progress.fraction() * 100);
    l.querySelector(".achievements__missions-count").textContent = `${M} / ${progress.missionCount}`;
    l.querySelector(".achievements__races-count").textContent = `${B} / ${progress.raceCount}`;
    l.querySelector(".achievements__sigils-count").textContent = `${R} / ${progress.sigilCount}`;
    const L = progress.isAllComplete();
    l.querySelector(".achievements__total").classList.toggle("is-owner", L);
    l.querySelector(".achievements__total-count").innerHTML = L ? `${Ef("crown")}<span>OWNER OF THE NIGHT · ${I} / ${I}</span>` : `${M + B + R} / ${I} · ${k}%`;
    l.querySelector(".achievements__meter b").style.transform = `scaleX(${progress.fraction().toFixed(3)})`;
    const F = Lie(progress);
    p.classList.add("is-unlocked");
    p.innerHTML = `${Ef("garage", "achievements__garage-icon")}<div><h4>GARAGE</h4><p>${F ? `Pick your ride. The ${F.name} unlocks after ${getUnlockDescription(F, progress)}.` : "Every ride unlocked — pick your car, then drive it anywhere in the city."}</p></div>${onOpenGarage ? `<button type="button" class="achievements__garage-btn" data-garage="true">${Ef("garage")}<span>ENTER GARAGE</span></button>` : ""}`;
  }
  function w() {
    g();
    b();
    y();
    _();
  }
  function S(M) {
    var B, R;
    M = !!M;
    !(M === m || M && !canOpen()) && (m = M, l.hidden = !m, m ? (w(), domElement && document.pointerLockElement && ((B = document.exitPointerLock) == null || B.call(document)), (R = state == null ? undefined : state.openPanel) == null || R.call(state, "achievements"), requestAnimationFrame(() => l.classList.add("is-open"))) : (l.classList.remove("is-open"), (state == null ? undefined : state.openedPanel) === "achievements" && state.closePanel()), onToggle == null || onToggle(m));
  }
  l.addEventListener("click", M => {
    var R, I, k, L, F, O, H;
    if ((I = (R = M.target).closest) != null && I.call(R, "[data-garage]")) {
      M.stopPropagation();
      S(false);
      onOpenGarage == null || onOpenGarage();
      return;
    }
    const B = (L = (k = M.target).closest) == null ? undefined : L.call(k, "[data-mission]");
    if (B) {
      M.stopPropagation();
      onLocate == null || onLocate(B.dataset.mission);
      S(false);
      return;
    }
    ((O = (F = M.target).closest) != null && O.call(F, ".achievements__close") || (H = M.target.dataset) != null && H.close) && S(false);
  });
  function T(M) {
    const B = M.target instanceof HTMLElement ? M.target : null;
    if (!(B != null && B.matches("input, textarea, select") || M.metaKey || M.ctrlKey || M.altKey)) if (M.code === "KeyJ" && !M.repeat) {
      if (!m && state != null && state.openedPanel && state.openedPanel !== "achievements") return;
      M.preventDefault();
      S(!m);
    } else m && M.code === "Escape" && (M.preventDefault(), S(false));
  }
  window.addEventListener("keydown", T);
  const v = (C = state == null ? undefined : state.subscribe) == null ? undefined : C.call(state, ({
      openedPanel: openedPanel
    }) => {
      m && openedPanel !== "achievements" && S(false);
    }),
    E = progress.subscribe(() => m && w());
  return {
    root: l,
    open: () => S(true),
    close: () => S(false),
    toggle: () => S(!m),
    get isOpen() {
      return m;
    },
    dispose() {
      window.removeEventListener("keydown", T);
      v == null || v();
      E();
      l.remove();
    }
  };
}
export { createAchievementsPanel };
