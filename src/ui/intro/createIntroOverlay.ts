// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { FEATURES } from "../../world/createWorld.ts";
import { splitIntroLetters } from "../../audio/voice/createVoice.ts";
import { gsap } from "gsap";
import { setAudioPlaying } from "../../audio/audioState.ts";
import { AudioContext } from "three/webgpu";
export function createIntroOverlay({
  onStart: onStart,
  scrim = false,
  taglineText = FEATURES.cityMode === "metro" ? "A rain-soaked city under neon." : "A rain-soaked alley under neon."
} = {}) {
  const s = document.createElement("div");
  s.className = scrim ? "intro-container intro-container--scrim" : "intro-container";
  s.setAttribute("aria-hidden", "false");
  s.innerHTML = `
    <div class="intro-stack">
      <p class="intro-kicker">through the glass</p>
      <h1 class="intro-brand" aria-label="TRAPNEST NEON">
        <span class="intro-brand-line">TRAPNEST</span>
        <span class="intro-brand-line intro-brand-line--accent">NEON</span>
      </h1>
      <p class="intro-rule" aria-hidden="true"></p>
      <p class="intro-tagline">${taglineText}</p>
      <div class="intro-actions">
        <button type="button" class="intro-button" disabled>ENTER</button>
      </div>
      <p class="intro-credit">Henry · Trapnest</p>
    </div>
  `;
  const n = s.querySelector(".intro-button"),
    r = s.querySelector(".intro-kicker"),
    o = [...s.querySelectorAll(".intro-brand-line")],
    a = s.querySelector(".intro-rule"),
    l = s.querySelector(".intro-tagline"),
    c = s.querySelector(".intro-credit");
  document.body.appendChild(s);
  const u = o.flatMap(b => splitIntroLetters(b, "intro-letter"));
  let d = false,
    h = null,
    f = null;
  gsap.set(r, {
    opacity: 0,
    y: 12
  });
  gsap.set(u, {
    opacity: 0,
    y: 28,
    filter: "blur(8px)"
  });
  gsap.set(a, {
    scaleX: 0,
    opacity: 0
  });
  gsap.set(l, {
    opacity: 0,
    y: 14
  });
  gsap.set(n, {
    opacity: 0,
    y: 10
  });
  gsap.set(c, {
    opacity: 0,
    y: 8
  });
  function p() {
    h == null || h.kill();
    h = gsap.timeline().to(r, {
      opacity: 1,
      y: 0,
      duration: .7,
      ease: "power2.out"
    }).to(u, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: .9,
      ease: "power3.out",
      stagger: {
        each: .035,
        from: "start"
      }
    }, "-=0.35").to(a, {
      scaleX: 1,
      opacity: 1,
      duration: .75,
      ease: "power2.inOut"
    }, "-=0.55").to(l, {
      opacity: 1,
      y: 0,
      duration: .75,
      ease: "power2.out"
    }, "-=0.4").to(n, {
      opacity: 1,
      y: 0,
      duration: .65,
      ease: "power2.out",
      onComplete: () => {
        n.disabled = false;
      }
    }, "-=0.25").to(c, {
      opacity: 1,
      y: 0,
      duration: .6,
      ease: "power2.out"
    }, "-=0.35");
  }
  function m({
    duration = .6
  } = {}) {
    return new Promise(x => {
      h == null || h.kill();
      f == null || f.kill();
      f = gsap.to(s, {
        opacity: 0,
        duration: duration,
        ease: "power1.out",
        onComplete: () => {
          s.remove();
          x();
        }
      });
    });
  }
  function A() {
    d || n.disabled || (d = true, window.removeEventListener("keydown", g, true), n.disabled = true, n.style.pointerEvents = "none", (async () => (await m(), await (onStart == null ? undefined : onStart())))());
  }
  function g(b) {
    var x, y;
    if (!s.isConnected) {
      window.removeEventListener("keydown", g, true);
      return;
    }
    b.code !== "Enter" && b.code !== "NumpadEnter" && b.code !== "Space" || (b.preventDefault(), b.stopImmediatePropagation(), !b.repeat && (FEATURES.audio && !n.disabled && (setAudioPlaying(true), (y = (x = AudioContext.getContext()).resume) == null || y.call(x).catch(() => {})), A()));
  }
  n.addEventListener("click", A);
  window.addEventListener("keydown", g, true);
  return {
    root: s,
    playEnter: p,
    playExit: m,
    destroy() {
      h == null || h.kill();
      f == null || f.kill();
      n.removeEventListener("click", A);
      window.removeEventListener("keydown", g, true);
      s.remove();
    }
  };
}
function createTransitionOverlay({
  message = "Adjusting performance"
} = {}) {
  const e = document.createElement("p");
  e.className = "performance-notice";
  e.textContent = message;
  e.setAttribute("aria-live", "polite");
  e.hidden = true;
  document.body.appendChild(e);
  function t() {
    e.hidden = false;
    requestAnimationFrame(() => {
      e.classList.add("performance-notice--visible");
    });
  }
  function s({
    delay = 420
  } = {}) {
    return new Promise(o => {
      e.classList.remove("performance-notice--visible");
      window.setTimeout(() => {
        e.hidden = true;
        o();
      }, delay);
    });
  }
  function n() {
    e.remove();
  }
  return {
    show: t,
    hide: s,
    destroy: n
  };
}
export { createTransitionOverlay };
