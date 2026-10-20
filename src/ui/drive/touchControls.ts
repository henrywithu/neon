// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isAppleMobile } from "../../platform/deviceLayout.ts";
export function createTouchControls({
  input: input
}) {
  if (!(typeof window.matchMedia == "function" && window.matchMedia("(pointer: coarse)").matches) && !isAppleMobile()) return null;
  const t = document.createElement("div");
  t.className = "touch-drive";
  t.hidden = true;
  t.setAttribute("data-ui-block-look", "true");
  t.innerHTML = `
    <div class="touch-drive__utils">
      <button type="button" class="touch-drive__util" data-action="camera">CAM</button>
      <button type="button" class="touch-drive__util" data-action="reset">RESET</button>
      <button type="button" class="touch-drive__util" data-action="exitVehicle">EXIT</button>
    </div>
    <div class="touch-drive__steer" aria-label="Steer">
      <div class="touch-drive__pad" data-side="left"><span>◀</span></div>
      <div class="touch-drive__pad" data-side="right"><span>▶</span></div>
    </div>
    <div class="touch-drive__pedals">
      <div class="touch-drive__btn touch-drive__btn--nitro" data-hold="nitro">NITRO</div>
      <div class="touch-drive__btn touch-drive__btn--drift" data-hold="handbrake">DRIFT</div>
      <div class="touch-drive__btn touch-drive__btn--brake" data-hold="brake">BRAKE</div>
      <div class="touch-drive__btn touch-drive__btn--gas" data-hold="throttle">GAS</div>
    </div>`;
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
      ...o
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
    u(m);
    (A = s.setPointerCapture) == null || A.call(s, m.pointerId);
    a.set(m.pointerId, d(m.clientX));
    c();
  });
  s.addEventListener("pointermove", m => {
    if (!a.has(m.pointerId)) return;
    u(m);
    const A = d(m.clientX);
    A !== a.get(m.pointerId) && (a.set(m.pointerId, A), c());
  });
  const h = m => {
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
      g.clear();
      m.classList.remove("is-down");
    };
  }
  for (const m of t.querySelectorAll("[data-action]")) m.addEventListener("pointerdown", u), m.addEventListener("click", A => {
    u(A);
    input.pushAction(m.dataset.action);
  });
  t.addEventListener("contextmenu", m => m.preventDefault());
  function f() {
    var m;
    a.clear();
    for (const A of Object.keys(o)) o[A] = 0;
    for (const A of t.querySelectorAll("[data-hold]")) (m = A.releaseAll) == null || m.call(A);
    c();
  }
  function p(m) {
    m = !!m;
    m !== l && (l = m, t.hidden = !l, document.documentElement.classList.toggle("touch-drive-active", l), f());
  }
  return {
    root: t,
    setVisible: p,
    dispose() {
      p(false);
      t.remove();
    }
  };
}
