// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { glyphPaths } from "../walk/hudPanel.ts";
export const pG = "#ffd166";
export const au = "#07060b";
export const mG = "#4ade80";
export const gG = "#6de6ff";
export const AG = i => glyphPaths[i] ?? glyphPaths.flag;
export const due = '<rect x="17" y="17" width="66" height="66" rx="9" transform="rotate(45 50 50)"';
export const hue = "translate(26 74) scale(0.05)";
export const fue = `<g transform="translate(66 66)"><circle r="15" fill="${gG}" stroke="${au}" stroke-width="4"/><g transform="translate(-10.5 10.5) scale(0.0219)"><path d="${glyphPaths.check}" fill="${au}"/></g></g>`;
export function cc(i, {
  size = 40,
  done = false,
  locked = false,
  className = "",
  variant = "mission"
} = {}) {
  const o = variant === "garage";
  return `<svg class="mission-badge ${className}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${o ? '<rect x="8" y="8" width="84" height="84" rx="14"' : due} fill="${locked ? "#4b4f5c" : o ? mG : pG}" stroke="${au}" stroke-width="6" stroke-linejoin="round"/><g transform="${hue}"><path d="${AG(i)}" fill="${au}"/></g>${done ? fue : ""}</svg>`;
}
