// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { getExperiencePreferences } from "../../platform/experiencePreferences.ts";
import { isGameInputBlocked } from "../core/inputBoundary.ts";
import { isTouchDevice } from "../../platform/deviceLayout.ts";
import { isAppleMobile } from "../../platform/deviceLayout.ts";
export function createTouchControls({
  input: input
}) {
  if (!isTouchDevice() && !isAppleMobile()) return null;
  const t = document.createElement("div");
  t.className = "touch-drive";
  t.hidden = true;
  t.setAttribute("data-ui-block-look", "true");
  t.innerHTML = `
    <details class="touch-drive__utils"><summary class="touch-drive__util">Utilities</summary><div class="touch-drive__utility-menu">
      <button type="button" class="touch-drive__util" data-action="camera">Camera</button>
      <button type="button" class="touch-drive__util" data-action="reset" aria-label="Hold to recover car">Hold to recover</button>
      <button type="button" class="touch-drive__util" data-action="exitVehicle">Exit car</button>
    </div></details>
    <div class="touch-drive__steer" aria-label="Steer">
      <div class="touch-drive__analog" aria-hidden="true"><i></i><span>STEER</span></div>
      <button type="button" class="touch-drive__pad" data-side="left" aria-label="Steer left"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3 7 12 16 21Z"/></svg></button>
      <button type="button" class="touch-drive__pad" data-side="right" aria-label="Steer right"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 3 9 9-9 9Z"/></svg></button>
    </div>
    <div class="touch-drive__pedals">
      <div class="touch-drive__btn touch-drive__btn--nitro" data-hold="nitro">NITRO</div>
      <div class="touch-drive__btn touch-drive__btn--drift" data-hold="handbrake">DRIFT + GAS</div>
      <div class="touch-drive__btn touch-drive__btn--brake" data-hold="brake">■ BRAKE</div>
      <div class="touch-drive__btn touch-drive__btn--gas" data-hold="throttle">▲ GAS</div>
    </div>`;
  const rotateHint = document.createElement("button"); rotateHint.type = "button"; rotateHint.className = "portrait-drive-hint"; rotateHint.textContent = "Rotate for a wider road view · dismiss";
  rotateHint.addEventListener("click", () => { rotateHint.hidden = true; }); t.append(rotateHint);
  document.body.appendChild(t);
  const s = t.querySelector(".touch-drive__steer"),
    n = t.querySelector('[data-side="left"]'),
    r = t.querySelector('[data-side="right"]'),
    o = {
      throttle: 0,
      brake: 0,
      handbrake: 0,
      nitro: 0
    },
    a = new Map();
  const origins = new Map();
  let recoveryTimer = 0;
  const syncPreferences = () => { f(); t.dataset.steering = getExperiencePreferences().steering; t.dataset.size = getExperiencePreferences().controls; };
  window.addEventListener("neon:preferences", syncPreferences);
  t.dataset.steering = getExperiencePreferences().steering; t.dataset.size = getExperiencePreferences().controls;
  let l = false;
  function c() {
    let m = 0;
    for (const A of a.values()) m += A;
    m = Math.max(-1, Math.min(1, m));
    n.classList.toggle("is-down", m > 0);
    r.classList.toggle("is-down", m < 0);
    input.setTouch({
      active: l,
      steer: m,
      ...o,
      throttle: Math.max(o.throttle, o.handbrake)
    });
  }
  function u(m) {
    m.preventDefault();
    m.stopPropagation();
  }
  function d(m) {
    const A = s.getBoundingClientRect();
    return m < A.left + A.width / 2 ? 1 : -1;
  }
  s.addEventListener("pointerdown", m => {
    var A;
    if (!l || isGameInputBlocked()) return;
    u(m);
    (A = s.setPointerCapture) == null || A.call(s, m.pointerId);
    origins.set(m.pointerId, m.clientX);
    a.set(m.pointerId, t.dataset.steering === "analog" ? 0 : d(m.clientX));
    c();
  });
  s.addEventListener("pointermove", m => {
    if (!a.has(m.pointerId)) return;
    u(m);
    let A = d(m.clientX);
    if (t.dataset.steering === "analog") {
      const delta = Math.max(-1, Math.min(1, (origins.get(m.pointerId) - m.clientX) / 64));
      A = Math.abs(delta) < .1 ? 0 : Math.sign(delta) * Math.pow((Math.abs(delta) - .1) / .9, 1.35);
      t.style.setProperty("--steer", String(-A));
    }
    A !== a.get(m.pointerId) && (a.set(m.pointerId, A), c());
  });
  const h = m => {
    origins.delete(m.pointerId); t.style.setProperty("--steer", "0");
    a.delete(m.pointerId) && c();
  };
  s.addEventListener("pointerup", h);
  s.addEventListener("pointercancel", h);
  s.addEventListener("lostpointercapture", h);
  for (const m of t.querySelectorAll("[data-hold]")) {
    const A = m.dataset.hold,
      g = new Set(),
      b = () => {
        o[A] = g.size ? 1 : 0;
        m.classList.toggle("is-down", g.size > 0);
        c();
      };
    m.addEventListener("pointerdown", y => {
      var _;
      if (!l || isGameInputBlocked()) return;
      u(y);
      (_ = m.setPointerCapture) == null || _.call(m, y.pointerId);
      g.add(y.pointerId);
      b();
    });
    const x = y => {
      g.delete(y.pointerId) && b();
    };
    m.addEventListener("pointerup", x);
    m.addEventListener("pointercancel", x);
    m.addEventListener("lostpointercapture", x);
    m.releaseAll = () => {
      for (const id of g) if (m.hasPointerCapture?.(id)) m.releasePointerCapture(id);
      g.clear();
      m.classList.remove("is-down");
    };
  }
  for (const m of t.querySelectorAll("[data-action]")) {
    m.addEventListener("pointerdown", event => {
      u(event);
      if (m.dataset.action !== "reset") return;
      clearTimeout(recoveryTimer); m.classList.add("is-holding");
      m.setPointerCapture?.(event.pointerId);
      recoveryTimer = setTimeout(() => { input.pushAction("reset"); m.classList.remove("is-holding"); t.querySelector("details").open = false; }, 650);
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) m.addEventListener(event, () => { clearTimeout(recoveryTimer); m.classList.remove("is-holding"); });
    m.addEventListener("click", event => { u(event); if (m.dataset.action !== "reset" || event.detail === 0) { input.pushAction(m.dataset.action); t.querySelector("details").open = false; } });
  }
  t.addEventListener("contextmenu", m => m.preventDefault());
  function f() {
    var m;
    for (const id of a.keys()) if (s.hasPointerCapture?.(id)) s.releasePointerCapture(id);
    a.clear(); origins.clear(); clearTimeout(recoveryTimer); t.style.setProperty("--steer", "0");
    t.querySelector("[data-action=reset]").classList.remove("is-holding");
    for (const A of Object.keys(o)) o[A] = 0;
    for (const A of t.querySelectorAll("[data-hold]")) (m = A.releaseAll) == null || m.call(A);
    c();
  }
  function p(m) {
    m = !!m;
    m !== l && (l = m, t.hidden = !l, document.documentElement.classList.toggle("touch-drive-active", l), f());
  }
  window.addEventListener("neon:clear-input", f);
  window.addEventListener("blur", f);
  return {
    clear: f,
    root: t,
    setVisible: p,
    dispose() {
      p(false);
      window.removeEventListener("neon:clear-input", f);
      window.removeEventListener("blur", f);
      window.removeEventListener("neon:preferences", syncPreferences);
      t.remove();
    }
  };
}
