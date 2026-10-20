// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const Vo = document;
export function rce() {
  return !!(Vo.fullscreenEnabled || Vo.webkitFullscreenEnabled);
}
export function eB() {
  return !!(Vo.fullscreenElement || Vo.webkitFullscreenElement);
}
export function oce() {
  var i, e;
  return ((i = window.matchMedia) == null ? undefined : i.call(window, "(display-mode: fullscreen)").matches) || ((e = window.matchMedia) == null ? undefined : e.call(window, "(display-mode: standalone)").matches) || navigator.standalone === true;
}
export async function ace() {
  var i, e;
  try {
    if (eB()) {
      await ((i = Vo.exitFullscreen ?? Vo.webkitExitFullscreen) == null ? undefined : i.call(Vo));
      return;
    }
    const t = Vo.documentElement;
    await ((e = t.requestFullscreen ?? t.webkitRequestFullscreen) == null ? undefined : e.call(t, {
      navigationUI: "hide"
    }));
  } catch (t) {
    console.warn("[fullscreen]", t);
  }
}
export function lce(i) {
  const e = () => i(eB());
  Vo.addEventListener("fullscreenchange", e);
  Vo.addEventListener("webkitfullscreenchange", e);
  return () => {
    Vo.removeEventListener("fullscreenchange", e);
    Vo.removeEventListener("webkitfullscreenchange", e);
  };
}
