// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { reducedMotion } from "../../platform/experiencePreferences.ts";
import { showRecovery } from "../../runtime/recovery.ts";
import { gsap } from "gsap";
export const X3 = "app-loader-style";
export const kE = 66;
export const FE = 2 * Math.PI * kE;
export const DE = 84;
export const ua = 168;
function getLoaderRevealRadius() {
  const {
    innerWidth: i,
    innerHeight: e
  } = window;
  return Math.ceil(Math.hypot(i, e) * .72) + 48;
}
export { getLoaderRevealRadius };
export function injectLoaderStyles() {
  if (document.getElementById(X3)) return;
  const i = document.createElement("style");
  i.id = X3;
  i.textContent = `
    #app-loader {
      --reveal: ${DE}px;
      position: fixed;
      inset: 0;
      z-index: 30;
      display: grid;
      place-items: center;
      background: #0a0a0a;
      color: #e8eaed;
    }

    #app-loader.app-loader--revealing {
      will-change: mask-image, -webkit-mask-image;
      -webkit-mask-image: radial-gradient(
        circle at center,
        transparent calc(var(--reveal) - 80px),
        rgba(0, 0, 0, 0.55) calc(var(--reveal) - 28px),
        rgba(0, 0, 0, 0.92) calc(var(--reveal) - 8px),
        #000 calc(var(--reveal) + 1px)
      );
      mask-image: radial-gradient(
        circle at center,
        transparent calc(var(--reveal) - 80px),
        rgba(0, 0, 0, 0.55) calc(var(--reveal) - 28px),
        rgba(0, 0, 0, 0.92) calc(var(--reveal) - 8px),
        #000 calc(var(--reveal) + 1px)
      );
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
    }

    .app-loader__stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.35rem;
    }

    .app-loader__stage {
      position: relative;
      width: ${ua}px;
      height: ${ua}px;
      display: grid;
      place-items: center;
      transition: opacity 320ms ease, transform 320ms ease;
    }

    /* Assets in (100 %): only the shader compile is left — the ring and the
       number go (a full "100" read as loading still going on) and the status
       settles in the middle. */
    #app-loader.app-loader--done .app-loader__stage {
      opacity: 0;
      transform: scale(0.92);
    }

    #app-loader.app-loader--done .app-loader__status {
      transform: translateY(calc(-${ua / 2}px - 0.675rem));
    }

    .app-loader__ring {
      width: ${ua}px;
      height: ${ua}px;
      transform: rotate(-90deg);
    }

    .app-loader__ring-bg {
      fill: none;
      stroke: #2a2d30;
      stroke-width: 2.5;
    }

    .app-loader__ring-fill {
      fill: none;
      stroke: #e8eaed;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: ${FE};
      stroke-dashoffset: ${FE};
      transition: stroke-dashoffset 180ms ease;
    }

    .app-loader__percent {
      position: absolute;
      margin: 0;
      font-family: "Orbitron", sans-serif;
      font-size: 48px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.04em;
      line-height: 1;
      color: #e8eaed;
      pointer-events: none;
      user-select: none;
    }

    .app-loader__status {
      margin: 0;
      min-height: 1em;
      font-family: "Orbitron", sans-serif;
      font-size: 0.72rem;
      font-weight: 400;
      letter-spacing: 0.38em;
      text-transform: uppercase;
      color: rgba(232, 234, 237, 0.55);
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transition: opacity 220ms ease, transform 320ms ease;
    }

    .app-loader__status.is-visible {
      opacity: 1;
      animation: app-loader-status-pulse 1.6s ease-in-out infinite;
    }

    @keyframes app-loader-status-pulse {
      0%,
      100% {
        opacity: 0.45;
      }
      50% {
        opacity: 0.9;
      }
    }
  `;
  document.head.appendChild(i);
}
export function Hle(i) {
  return Math.max(0, Math.min(1, i));
}
export function createLoaderOverlay() {
  injectLoaderStyles();
  const i = document.createElement("div");
  i.id = "app-loader";
  i.setAttribute("role", "status");
  i.setAttribute("aria-busy", "true");
  i.setAttribute("aria-label", "Loading");
  i.innerHTML = `
    <div class="app-loader__stack">
      <div class="app-loader__stage">
        <svg class="app-loader__ring" viewBox="0 0 ${ua} ${ua}" aria-hidden="true">
          <circle class="app-loader__ring-bg" cx="${ua / 2}" cy="${ua / 2}" r="${kE}"></circle>
          <circle class="app-loader__ring-fill" cx="${ua / 2}" cy="${ua / 2}" r="${kE}"></circle>
        </svg>
        <p class="app-loader__percent" aria-hidden="true">0</p>
      </div>
      <p class="app-loader__status" aria-hidden="true"></p>
    </div>
  `;
  const e = i.querySelector(".app-loader__stack"),
    t = i.querySelector(".app-loader__ring-fill"),
    s = i.querySelector(".app-loader__percent"),
    n = i.querySelector(".app-loader__status");
  let r = false,
    o = null,
    a = 0,
    l = "";
  document.body.appendChild(i);
  function c() {
    if (l) {
      i.setAttribute("aria-label", l);
      return;
    }
    i.setAttribute("aria-label", "Preparing the city");
  }
  function u(p) {
    if (!t || r) return;
    const m = Hle(p);
    a = m;
    const A = FE * (1 - m);
    t.style.strokeDashoffset = `${A}`;
    s.textContent = `${Math.round(m * 100)}`;
    i.classList.toggle("app-loader--done", m >= 1);
    c();
  }
  function d(p = "") {
    if (!n || r) return;
    const m = typeof p == "string" ? p.trim() : "";
    l = m;
    n.textContent = m;
    n.classList.toggle("is-visible", m.length > 0);
    c();
  }
  function h(error: unknown = new Error("Initialization failed")) {
    i.setAttribute("aria-busy", "false");
    showRecovery(error);
  }
  function f({
    onRevealUpdate: onRevealUpdate
  } = {}) {
    if (reducedMotion()) { i.remove(); return Promise.resolve(); }
    return o || (r ? Promise.resolve() : (r = true, i.setAttribute("aria-busy", "false"), u(1), o = new Promise(m => {
      const A = getLoaderRevealRadius(),
        g = {
          radius: DE
        };
      let timeline = null;
      const complete = () => { clearTimeout(deadline); timeline?.kill(); i.remove(); m(); };
      // Readiness must not depend on GSAP's lag-smoothed animation clock.
      const deadline = setTimeout(complete, 1500);
      timeline = gsap.timeline({ onComplete: complete }).to(e, {
        opacity: 0,
        duration: .12,
        ease: "power1.out"
      }, 0).add(() => {
        i.classList.add("app-loader--revealing");
        i.style.setProperty("--reveal", `${DE}px`);
      }, .04).to(g, {
        radius: A,
        duration: .85,
        ease: "power3.inOut",
        onUpdate: () => {
          i.style.setProperty("--reveal", `${g.radius}px`);
          onRevealUpdate == null || onRevealUpdate();
        }
      }, .05);
    }), o));
  }
  return {
    setProgress: u,
    setStatus: d,
    fail: h,
    finish: f
  };
}
