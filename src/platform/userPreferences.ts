// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const NU = "trapnest-neon-development-mode";
export const d1 = "trapnest-neon-look-preset";
export const h1 = "trapnest-neon-quality";
export const f1 = "trapnest-neon-mobile-resolution";
export const p1 = "trapnest-neon-car-reflections";
export const m1 = "trapnest-neon-voices";
export let I2 = false;
export function isDevelopmentMode() {
  return I2;
}
export function setDevelopmentMode(i) {
  I2 = !!i;
}
export function getLookPreference() {
  try {
    return localStorage.getItem(d1);
  } catch {
    return null;
  }
}
export function setLookPreference(i) {
  try {
    i ? localStorage.setItem(d1, i) : localStorage.removeItem(d1);
  } catch {}
}
export function getQualityPreference() {
  try {
    return localStorage.getItem(h1);
  } catch {
    return null;
  }
}
export function setQualityPreference(i) {
  try {
    i ? localStorage.setItem(h1, i) : localStorage.removeItem(h1);
  } catch {}
}
export function getResolutionPreference() {
  try {
    const i = Number.parseFloat(localStorage.getItem(f1));
    return Number.isFinite(i) ? i : null;
  } catch {
    return null;
  }
}
export function setResolutionPreference(i) {
  try {
    i ? localStorage.setItem(f1, String(i)) : localStorage.removeItem(f1);
  } catch {}
}
export function rne() {
  try {
    const i = localStorage.getItem(p1);
    return i === "on" ? true : i === "off" ? false : null;
  } catch {
    return null;
  }
}
export function one(i) {
  try {
    i == null ? localStorage.removeItem(p1) : localStorage.setItem(p1, i ? "on" : "off");
  } catch {}
}
export function ane() {
  try {
    const i = localStorage.getItem(m1);
    return i === "on" ? true : i === "off" ? false : null;
  } catch {
    return null;
  }
}
export function lne(i) {
  try {
    i == null ? localStorage.removeItem(m1) : localStorage.setItem(m1, i ? "on" : "off");
  } catch {}
}
export function resetPreferences() {
  I2 = false;
  try {
    localStorage.removeItem(NU);
    localStorage.removeItem(d1);
    localStorage.removeItem(h1);
    localStorage.removeItem(f1);
    localStorage.removeItem(p1);
    localStorage.removeItem(m1);
  } catch {}
}
