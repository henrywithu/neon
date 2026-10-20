// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isTouchDevice } from "../../platform/deviceLayout.ts";
import { Due, AL, kue, Fue } from "../walk/prompts.ts";
function createDriveTutorial({
  state: state,
  drive: drive,
  store: store
}) {
  var C;
  const s = document.createElement("div");
  s.className = "walk-prompt walk-prompt--passive drive-tutorial";
  s.setAttribute("role", "status");
  s.hidden = true;
  s.innerHTML = `
    <div class="walk-prompt-frame">
      <div class="walk-prompt-pulse" aria-hidden="true"></div>
      <span class="walk-prompt-corner walk-prompt-corner--tl"></span>
      <span class="walk-prompt-corner walk-prompt-corner--tr"></span>
      <span class="walk-prompt-corner walk-prompt-corner--bl"></span>
      <span class="walk-prompt-corner walk-prompt-corner--br"></span>
      <div class="walk-prompt-inner">
        <span class="walk-prompt-kicker"></span>
        <span class="walk-prompt-title"></span>
      </div>
    </div>
  `;
  document.body.appendChild(s);
  const n = s.querySelector(".walk-prompt-kicker"),
    r = s.querySelector(".walk-prompt-title");
  let o = false,
    a = !!(state != null && state.openedPanel),
    l = 0,
    c = 0,
    u = 0,
    d = null,
    h = 0,
    f = null;
  const p = new Map();
  let m = null,
    A = 0,
    g = null;
  const b = () => drive.vehicle.telemetry.launchCount ?? 0;
  let x = b();
  function y() {
    const M = drive.input.state.device;
    return M === "gamepad" ? "gamepad" : M === "touch" || isTouchDevice() ? "touch" : "keyboard";
  }
  function _() {
    var k, L, F, O;
    const M = drive.vehicle.telemetry,
      B = drive.input.state,
      R = b(),
      I = R > 0 && R !== x;
    x = R;
    return {
      speed: Math.abs(M.speedKmh ?? 0),
      throttle: B.throttle,
      nitro: M.nitro === 1,
      nitroCharge: M.nitroCharge ?? 1,
      drifting: (((L = (k = drive.driftScore) == null ? undefined : k.state) == null ? undefined : L.chainTime) ?? 0) > .4,
      launched: I,
      launchArmed: M.launch === "armed" || M.launch === "timing",
      together: g,
      withFriends: A,
      honked: !!((F = drive.signals) != null && F.horn),
      watching: !!((O = drive.isCameraOverridden) != null && O.call(drive))
    };
  }
  function w(M) {
    clearTimeout(f);
    d = M;
    h = 0;
    n.textContent = M.kicker;
    r.textContent = M.text[y()] ?? "";
    s.hidden = false;
    requestAnimationFrame(() => d === M && s.classList.add("walk-prompt--visible"));
  }
  function S() {
    d && (d = null, s.classList.remove("walk-prompt--visible"), clearTimeout(f), f = setTimeout(() => {
      d || (s.hidden = true);
    }, Due));
  }
  function T() {
    var M, B;
    return !o || a || ((M = drive.isPaused) == null ? undefined : M.call(drive)) || ((B = drive.isMissionActive) == null ? undefined : B.call(drive));
  }
  function v(M) {
    var k;
    l = 0;
    const B = Math.min(.1, (M - c) / 1e3);
    if (c = M, !o) return;
    if (l = requestAnimationFrame(v), T()) {
      S();
      return;
    }
    g = (m == null ? undefined : m()) ?? null;
    ((g == null ? undefined : g.friends) ?? 0) > 0 && (A += B);
    const R = _();
    for (const L of AL) !store.isDone(L.id) && L.used(R) && store.markDone(L.id);
    if (R.speed > 5 && (u += B), d) {
      h += B;
      const L = store.isDone(d.id);
      (L || h > (d.hold ?? kue) || (k = d.hidden) != null && k.call(d, R)) && (L || p.set(d.id, u + Fue), S());
      return;
    }
    const I = AL.find(L => {
      var F;
      return !store.isDone(L.id) && !!L.text[y()] && u >= L.after && u >= (p.get(L.id) ?? 0) && L.ready(R) && !((F = L.hidden) != null && F.call(L, R));
    });
    I && w(I);
  }
  const E = (C = state == null ? undefined : state.subscribe) == null ? undefined : C.call(state, ({
    openedPanel: openedPanel
  }) => {
    a = !!openedPanel;
  });
  return {
    root: s,
    setTogether(M) {
      m = M ?? null;
    },
    advance(M) {
      u += M;
    },
    setEnabled(M) {
      o = !!M;
      o ? l || (c = performance.now(), l = requestAnimationFrame(v)) : S();
    },
    destroy() {
      cancelAnimationFrame(l);
      clearTimeout(f);
      E == null || E();
      s.remove();
    }
  };
}
export { createDriveTutorial };
export function Oue({
  onEnter: onEnter
}) {
  const e = document.createElement("button");
  e.type = "button";
  e.className = "enter-car";
  e.hidden = true;
  e.setAttribute("data-ui-block-look", "true");
  e.setAttribute("aria-label", "Drive (F, E or Enter)");
  e.innerHTML = `
    <span class="enter-car__keys" aria-hidden="true"><kbd>F</kbd><kbd>E</kbd><kbd>↵</kbd></span>
    <span class="enter-car__label">DRIVE</span>`;
  e.addEventListener("click", s => {
    s.stopPropagation();
    onEnter == null || onEnter();
  });
  document.body.appendChild(e);
  let t = false;
  return {
    setVisible(s) {
      s = !!s;
      s !== t && (t = s, t && (e.hidden = false), requestAnimationFrame(() => e.classList.toggle("is-visible", t)), t || setTimeout(() => {
        t || (e.hidden = true);
      }, 220));
    },
    dispose() {
      e.remove();
    }
  };
}
