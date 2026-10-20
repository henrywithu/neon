export const gF = "(max-width: 768px)";
export function isTouchDevice() {
  return typeof window.matchMedia == "function" && window.matchMedia("(pointer: coarse)").matches ? true : typeof navigator < "u" && navigator.maxTouchPoints > 0;
}
export function isDesktopPointer() {
  return !isMobileLayout() && !isTouchDevice();
}
export function isMobileLayout() {
  return typeof window.matchMedia != "function" ? window.innerWidth <= 768 : window.matchMedia(gF).matches;
}
export function isAppleMobile() {
  if (typeof navigator > "u") return false;
  const i = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(i) ? true : navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
export const jG = new Set(["375x667", "414x736", "375x812", "390x844", "414x896", "428x926"]);
export function isOlderIPhone() {
  if (typeof navigator > "u" || !/iPhone/.test(navigator.userAgent || "")) return false;
  const i = Math.min(screen.width, screen.height),
    e = Math.max(screen.width, screen.height);
  return jG.has(`${i}x${e}`);
}
export function isSafari() {
  if (typeof navigator > "u") return false;
  if (isAppleMobile()) return true;
  const i = navigator.userAgent || "";
  return /Safari/.test(i) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg|OPR|Android/.test(i);
}
export function isMobileDevice() {
  return isMobileLayout() || isTouchDevice() || isAppleMobile();
}
export function syncDeviceLayout() {
  document.documentElement.classList.toggle("layout-mobile", isMobileLayout());
}
export function onDeviceLayoutChange(i: (mobile: boolean) => void): () => void {
  if (typeof window.matchMedia != "function") {
    const s = () => i(isMobileLayout());
    window.addEventListener("resize", s);
    return () => window.removeEventListener("resize", s);
  }
  const e = window.matchMedia(gF),
    t = () => i(isMobileLayout());
  return typeof e.addEventListener == "function" ? (e.addEventListener("change", t), () => e.removeEventListener("change", t)) : (e.addListener(t), () => e.removeListener(t));
}
