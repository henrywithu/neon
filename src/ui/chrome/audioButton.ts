// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Bce, Rce } from "./createSettingsPanel.ts";
import { getAudioVolume, setAudioPlaying, subscribeAudioState, isAudioPlaying } from "../../audio/audioState.ts";
import { isTouchDevice } from "../../platform/deviceLayout.ts";
export function createAudioButton({
  urls = Bce,
  url: url,
  showButton = true
} = {}) {
  const s = url ? [url] : urls,
    n = document.createElement("div");
  n.className = `audio-btn-root audio-btn-root--hidden${showButton ? "" : " audio-btn-root--headless"}`;
  n.setAttribute("data-ui-block-look", "true");
  n.innerHTML = `
    ${showButton ? `<button type="button" id="buttonAudio" class="audio-btn" aria-label="Toggle sound">${Rce}</button>` : ""}
    ${s.map(E => `<audio src="${E}"></audio>`).join("")}
  `;
  const r = n.querySelector("#buttonAudio"),
    o = n.querySelector(".audio-btn-wave"),
    a = [...n.querySelectorAll("audio")],
    l = a[0];
  let c = false;
  const u = ["pointerdown", "keydown", "touchstart"];
  for (const E of a) E.loop = true, E.volume = getAudioVolume();
  function d(E) {
    o == null || o.classList.toggle("animated", E);
  }
  function h() {
    return a.some(E => !E.paused);
  }
  function f() {
    setAudioPlaying(true);
    d(true);
  }
  function p() {
    h() || (setAudioPlaying(false), d(false));
  }
  function m() {
    h() || (setAudioPlaying(false), d(false));
  }
  for (const E of a) E.addEventListener("play", f), E.addEventListener("pause", p), E.addEventListener("ended", m);
  function A() {
    for (const E of u) window.removeEventListener(E, x);
  }
  function g() {
    const E = getAudioVolume();
    return Promise.all(a.map(C => (C.volume = E, C.loop = true, C.play()))).then(C => (A(), C));
  }
  function b() {
    for (const E of a) E.pause();
  }
  function x(E) {
    var C, M;
    (M = (C = E.target) == null ? undefined : C.closest) != null && M.call(C, "#buttonAudio") || g().catch(() => {});
  }
  function y() {
    c && g().catch(() => {});
  }
  function _() {
    const E = h();
    c = E;
    E && b();
  }
  r == null || r.addEventListener("click", () => {
    h() ? (A(), b()) : g().catch(() => {});
  });
  const w = subscribeAudioState(({
    isMusicPlaying: isMusicPlaying
  }) => {
    d(isMusicPlaying);
    isMusicPlaying && !h() ? g().catch(() => {}) : !isMusicPlaying && h() && b();
  });
  d(isAudioPlaying());
  for (const E of u) window.addEventListener(E, x, {
    passive: true
  });
  window.addEventListener("focus", y);
  window.addEventListener("blur", _);
  document.body.appendChild(n);
  function S(E) {
    n.classList.toggle("audio-btn-root--hidden", !E);
    n.setAttribute("aria-hidden", E ? "false" : "true");
  }
  function T(E) {
    n.classList.toggle("audio-btn-root--force-hidden", E);
  }
  function v() {
    w();
    A();
    window.removeEventListener("focus", y);
    window.removeEventListener("blur", _);
    for (const E of a) E.removeEventListener("play", f), E.removeEventListener("pause", p), E.removeEventListener("ended", m);
    n.remove();
  }
  return {
    root: n,
    button: r,
    audioEl: l,
    audioEls: a,
    play: g,
    pause: b,
    setVisible: S,
    setForceHidden: T,
    destroy: v
  };
}
export const Nce = 5e3;
export const Lce = 12e3;
export function kce(i) {
  return typeof i == "number" ? i : isTouchDevice() ? Lce : Nce;
}
