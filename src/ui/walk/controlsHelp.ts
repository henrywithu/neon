// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Pce } from "../chrome/visibility.ts";
import { isDesktopPointer } from "../../platform/deviceLayout.ts";
import { sB, mce } from "../core/icons.ts";
export const Oce = `
  <svg class="walk-controls__chip-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect class="walk-controls__chip-key" x="8.5" y="3" width="7" height="5.5" rx="1" />
    <rect class="walk-controls__chip-key" x="3" y="10.5" width="5.5" height="5.5" rx="1" />
    <rect class="walk-controls__chip-key" x="9.25" y="10.5" width="5.5" height="5.5" rx="1" />
    <rect class="walk-controls__chip-key" x="15.5" y="10.5" width="5.5" height="5.5" rx="1" />
    <rect class="walk-controls__chip-key walk-controls__chip-key--shift" x="3" y="18" width="18" height="3" rx="0.75" />
  </svg>
`;
export function wf(i, e, t, s, n, r = false, o = "") {
  const a = r ? " walk-key--active" : "",
    l = r ? " walk-key-label walk-key-label--active" : " walk-key-label",
    c = i + t / 2,
    u = e + s / 2;
  return `
    <rect class="walk-key${a}${o ? ` ${o}` : ""}" x="${i}" y="${e}" width="${t}" height="${s}" />
    <text class="${l.trim()}" x="${c}" y="${u}">${n}</text>
  `;
}
export function Uce(i, e, t = 1, s = false) {
  const n = s ? " walk-mouse--active" : "";
  return `
    <g transform="translate(${i}, ${e}) scale(${t})">
      <path class="walk-mouse${n}" d="M12 22C16.13 22 19.5 18.63 19.5 14.5V9.5C19.5 5.37 16.13 2 12 2C7.87 2 4.5 5.37 4.5 9.5V14.5C4.5 18.63 7.87 22 12 22Z" />
      <path class="walk-mouse${n}" d="M12 11C11.17 11 10.5 10.33 10.5 9.5V7.5C10.5 6.67 11.17 6 12 6C12.82 6 13.5 6.67 13.5 7.5V9.5C13.5 10.33 12.82 11 12 11Z" />
      <path class="walk-mouse${n}" d="M12 6V2" />
    </g>
  `;
}
export function tb(i, e, t, s, n) {
  const r = i + t / 2;
  return `
    <g class="walk-callout">
      <line class="walk-callout-accent" x1="${r - 16}" y1="${e}" x2="${r + 16}" y2="${e}" />
      <text class="walk-callout-title" x="${r}" y="${e + 22}">${s}</text>
      <text class="walk-callout-copy" x="${r}" y="${e + 40}">${n}</text>
    </g>
  `;
}
export function zce() {
  return `
    <svg class="walk-controls__diagram" viewBox="0 0 860 440" role="img" aria-label="Walk mode controls">
      <line class="walk-leader" x1="430" y1="78" x2="314" y2="112" />
      <line class="walk-leader" x1="132" y1="248" x2="256" y2="274" />
      <line class="walk-leader" x1="430" y1="368" x2="${388 + 40 / 2}" y2="302" />
      <line class="walk-leader" x1="706" y1="248" x2="620" y2="220" />

      ${tb(318, 18, 224, "Movement", "WASD or arrows")}
      ${tb(38, 220, 188, "Sprint", "Hold Shift")}
      ${tb(318, 348, 224, "Crouch", "Press C to toggle")}
      ${tb(634, 220, 188, "Look", "Click to lock mouse")}

      ${wf(314, 118, 56, 56, "W", true)}
      ${wf(250, 182, 56, 56, "A", true)}
      ${wf(314, 182, 56, 56, "S", true)}
      ${wf(378, 182, 56, 56, "D", true)}
      ${wf(232, 262, 148, 40, "Shift", true, "walk-key--shift")}
      ${wf(388, 262, 40, 40, "C", true)}

      ${Uce(560, 140, 3.2, true)}
    </svg>
  `;
}
function createWalkHelp({
  state: state,
  domElement: domElement,
  together = false
} = {}) {
  var _;
  const s = document.createElement("div");
  s.className = "walk-controls walk-controls--hidden";
  s.setAttribute("data-ui-block-look", "true");
  s.innerHTML = `
    <button type="button" class="walk-controls__chip" aria-label="Show walk controls" aria-expanded="false">
      ${Oce}
      <span class="walk-controls__chip-label">Controls</span>
    </button>

    <div class="walk-controls__overlay" hidden>
      <div class="walk-controls__backdrop" data-close="true"></div>
      <button type="button" class="walk-controls__close" aria-label="Close controls">
        ${Pce}
      </button>
      <div class="walk-controls__content" role="dialog" aria-modal="true" aria-label="Walk controls">
        <header class="walk-controls__header">
          <p class="walk-controls__eyebrow">Interface</p>
          <h2 class="walk-controls__title">Navigation</h2>
        </header>
        ${zce()}
        <ul class="walk-controls__shortcuts">
          <li><kbd>F</kbd><kbd>E</kbd><kbd>Enter</kbd><span>Get in the car (next to it)</span></li>
          <li><kbd>Tab</kbd><kbd>Esc</kbd><span>City map · pause</span></li>
          <li><kbd>M</kbd><span>Radio · pause</span></li>
          <li><kbd>N</kbd><span>Next track</span></li>
          <li><kbd>J</kbd><span>Achievements · pause</span></li>
          <li><kbd>I</kbd><span>Messages · jobs and sigil tips</span></li>
          ${together ? `<li><kbd>Online</kbd><span>Top bar: public rooms, up to 4 drivers</span></li>
          <li><kbd>Y</kbd><span>Quick chat with the room · then 1 – 8, 9 pings</span></li>` : ""}
          <li><kbd>Walk</kbd><span>Into a Neon Sigil to collect it</span></li>
        </ul>
        <p class="walk-controls__footer">Esc to close</p>
      </div>
    </div>
  `;
  document.body.appendChild(s);
  const n = s.querySelector(".walk-controls__chip"),
    r = s.querySelector(".walk-controls__overlay"),
    o = s.querySelector(".walk-controls__backdrop"),
    a = s.querySelector(".walk-controls__close");
  let l = false,
    c = false,
    u = false;
  function d() {
    var w;
    domElement && document.pointerLockElement === domElement && ((w = document.exitPointerLock) == null || w.call(document));
  }
  function h() {
    const w = l && !c && isDesktopPointer() && !u;
    s.classList.toggle("walk-controls--hidden", !w);
    s.classList.toggle("walk-controls--force-hidden", c && !u);
    s.classList.toggle("walk-controls--overlay-open", u);
  }
  function f() {
    var w;
    u || (d(), u = true, r.hidden = false, n.setAttribute("aria-expanded", "true"), (w = state == null ? undefined : state.openPanel) == null || w.call(state, "walk-controls"), h());
  }
  function p({
    skipStateClose = false
  } = {}) {
    u && (u = false, r.hidden = true, n.setAttribute("aria-expanded", "false"), !skipStateClose && (state == null ? undefined : state.openedPanel) === "walk-controls" && state.closePanel(), h());
  }
  function m({
    openedPanel: openedPanel
  }) {
    u && openedPanel !== "walk-controls" && p({
      skipStateClose: true
    });
  }
  const A = (_ = state == null ? undefined : state.subscribe) == null ? undefined : _.call(state, m);
  function g(w) {
    w.code === "Escape" && u && (w.preventDefault(), p());
  }
  n.addEventListener("click", f);
  o.addEventListener("click", p);
  a.addEventListener("click", p);
  window.addEventListener("keydown", g);
  function b(w) {
    l = w;
    w || p();
    h();
  }
  function x(w) {
    c = w;
    h();
  }
  function y() {
    p();
    A == null || A();
    window.removeEventListener("keydown", g);
    s.remove();
  }
  return {
    setVisible: b,
    setForceHidden: x,
    isOverlayOpen: () => u,
    destroy: y
  };
}
export { createWalkHelp };
export const Vce = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;
export const Qce = [["Drive", [[["W"], "Accelerate"], [["S"], "Brake", "Reverse when stopped"], [["A", "D"], "Steer"], [["Space"], "Handbrake", "Tap at speed, steering: drift"], [["Shift"], "Nitro", "Accelerates too"], [["B"], "Look back"]]], ["Car", [[["Q", "E"], "Gear down / up", "Switches to manual"], [["G"], "Manual / automatic"], [["T"], "Driving aids", "TCS · ABS · ESC"], [["C"], "Camera"], [["R"], "Reset car"], [["F"], "Get out", "Slow down first"]]], ["Game", [[["Tab", "Esc"], "City map · pause"], [["J"], "Achievements"], [["M"], "Radio"], [["N"], "Next track"], [["H"], "These controls"]]]];
export const qce = sB.map(i => [i.keys, i.label, i.note]);
export const Hce = `${mce}.`;
export const Wce = [["I"], "Messages", "Jobs and sigil tips"];
export const nL = [[["Enter"], "Start · retry", "In a yellow marker"], [["⌫"], "Quit the mission"]];
export const iL = [{
  name: "Drift",
  when: "Moving · 45+ km/h",
  kind: "moving",
  steps: [{
    keys: ["A", "D"],
    text: "Steer into the turn"
  }, {
    keys: ["Space"],
    text: "Tap"
  }, {
    keys: ["W"],
    text: "Hold: it keeps sliding"
  }],
  foot: "Lift off or countersteer to straighten out"
}, {
  name: "Launch control",
  when: "Stopped · full nitro",
  kind: "stopped",
  steps: [{
    keys: ["W", "Space"],
    text: "Hold both"
  }, {
    keys: ["Shift"],
    text: "Hold too: a needle sweeps"
  }, {
    keys: ["Shift"],
    text: "Let go in the green",
    release: true
  }],
  foot: "Rocket start: nitro and an extra push"
}];
export const $ce = [{
  name: "Join a room",
  when: "Anytime",
  kind: "together",
  steps: [{
    tag: "ONLINE",
    text: "Top bar: the public rooms"
  }, {
    tag: "ROOM",
    text: "Pick one: up to 4 drivers"
  }, {
    keys: ["Y"],
    text: "Say hi once they are in"
  }],
  foot: "Everyone in a room shares the city · missions, traffic and saves stay your own"
}, {
  name: "Race together",
  when: "At a race's flag",
  kind: "together",
  steps: [{
    tag: "ROOM",
    text: "Another driver in your room"
  }, {
    tag: "FLAG",
    text: "Both stop at the start flag"
  }, {
    keys: ["U"],
    text: "Start together: one countdown"
  }],
  foot: "Standings on screen · what you win is still your own"
}];
export const cG = (i, e = false) => i.map(t => `<kbd${e ? ' class="is-release"' : ""}>${t}</kbd>`).join("");
export const pg = ([i, e, t = ""]) => `
  <section class="drive-controls__group">
    <h3 class="drive-controls__group-title">${i}</h3>
    <ul>
      ${e.map(([s, n, r]) => `
        <li>
          <span class="drive-controls__keys">${cG(s)}</span>
          <span class="drive-controls__label">${n}${r ? `<small>${r}</small>` : ""}</span>
        </li>`).join("")}
    </ul>
    ${t ? `<p class="drive-controls__note">${t}</p>` : ""}
  </section>`;
export const Kce = i => `
  <article class="drive-move drive-move--${i.kind}">
    <header class="drive-move__head">
      <h4>${i.name}</h4>
      <span class="drive-move__when">${i.when}</span>
    </header>
    <ol class="drive-move__steps">
      ${i.steps.map(e => `
        <li class="drive-move__step${e.release ? " is-release" : ""}">
          <span class="drive-move__keys">${e.tag ? `<span class="drive-move__tag">${e.tag}</span>` : cG(e.keys, e.release)}</span>
          <span class="drive-move__text">${e.text}</span>
        </li>`).join("")}
    </ol>
    <p class="drive-move__foot">${i.foot}</p>
  </article>`;
function createControlsHelp({
  state: state,
  domElement: domElement,
  onToggle: onToggle,
  missions = false,
  messages = false,
  together = false
} = {}) {
  var x;
  const [o, a, l] = Qce,
    c = document.createElement("div");
  c.className = "walk-controls drive-controls walk-controls--hidden";
  c.setAttribute("data-ui-block-look", "true");
  c.innerHTML = `
    <button type="button" class="walk-controls__chip drive-controls__chip" aria-label="Show driving controls" aria-expanded="false">
      <kbd>H</kbd><span class="walk-controls__chip-label">Controls</span>
    </button>
    <div class="walk-controls__overlay" hidden>
      <div class="walk-controls__backdrop" data-close="true"></div>
      <button type="button" class="walk-controls__close" aria-label="Close controls">${Vce}</button>
      <div class="walk-controls__content drive-controls__content" role="dialog" aria-modal="true" aria-label="Driving controls">
        <header class="walk-controls__header">
          <p class="walk-controls__eyebrow">Interface</p>
          <h2 class="walk-controls__title">Driving</h2>
        </header>
        <div class="drive-controls__groups">
          ${pg(o)}
          <div class="drive-controls__stack">
            ${pg(a)}
            ${together ? pg(["Together", qce, Hce]) : ""}
          </div>
          <div class="drive-controls__stack">
            ${pg(l)}
            ${missions ? pg(["Missions", messages ? [Wce, ...nL] : nL]) : ""}
          </div>
        </div>
        <section class="drive-controls__moves" aria-label="Moves">
          <h3 class="drive-controls__group-title">Moves</h3>
          <div class="drive-controls__move-list">${(together ? [...iL, ...$ce] : iL).map(Kce).join("")}</div>
        </section>
        <p class="walk-controls__footer">H or Esc to close</p>
      </div>
    </div>
  `;
  document.body.appendChild(c);
  const u = c.querySelector(".walk-controls__overlay"),
    d = c.querySelector(".drive-controls__chip");
  let h = false,
    f = false,
    p = (state == null ? undefined : state.uiVisible) ?? true;
  function m() {
    c.classList.toggle("walk-controls--hidden", !(h && p && !f));
  }
  function A(y) {
    var _, w;
    y = !!y && (h || !y);
    y !== f && (f = y, u.hidden = !f, c.classList.toggle("walk-controls--overlay-open", f), d.setAttribute("aria-expanded", String(f)), m(), f ? (domElement && document.pointerLockElement === domElement && ((_ = document.exitPointerLock) == null || _.call(document)), (w = state == null ? undefined : state.openPanel) == null || w.call(state, "drive-controls")) : (state == null ? undefined : state.openedPanel) === "drive-controls" && state.closePanel(), onToggle == null || onToggle(f));
  }
  const g = (x = state == null ? undefined : state.subscribe) == null ? undefined : x.call(state, ({
    openedPanel: openedPanel,
    uiVisible: uiVisible
  }) => {
    p = uiVisible;
    f && openedPanel !== "drive-controls" && A(false);
    m();
  });
  function b(y) {
    if (y.repeat || y.metaKey || y.ctrlKey || y.altKey) return;
    const _ = y.target instanceof HTMLElement ? y.target : null;
    _ != null && _.matches("input, textarea, select") || (y.code === "KeyH" && (f || h && !(state != null && state.openedPanel)) ? (y.preventDefault(), A(!f)) : y.code === "Escape" && f && (y.preventDefault(), A(false)));
  }
  d.addEventListener("click", () => A(true));
  c.querySelector(".walk-controls__backdrop").addEventListener("click", () => A(false));
  c.querySelector(".walk-controls__close").addEventListener("click", () => A(false));
  window.addEventListener("keydown", b);
  return {
    setDriving(y) {
      h = !!y;
      h || A(false);
      m();
    },
    open: () => A(true),
    close: () => A(false),
    isOpen: () => f,
    destroy() {
      A(false);
      g == null || g();
      window.removeEventListener("keydown", b);
      c.remove();
    }
  };
}
export { createControlsHelp };
