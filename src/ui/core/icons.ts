// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { glyphPaths } from "../walk/hudPanel.ts";
export const sB = [{
  keys: ["Y"],
  label: "Quick chat",
  note: "Then 1 – 8 · 9 pings",
  short: "CHAT"
}, {
  keys: ["K"],
  label: "Horn",
  note: "Hold: the room hears it",
  short: "HORN"
}, {
  keys: ["L"],
  label: "Flash lights",
  note: "A signal for the others",
  short: "LIGHTS"
}, {
  keys: ["V"],
  label: "Watch a driver",
  note: "Again: the next one",
  short: "WATCH"
}, {
  keys: ["U"],
  label: "Race together",
  note: "On a race's start card",
  short: "RACE"
}];
export const mce = "On the city map: click a driver's dot for a GPS · Shift + click pings the room";
export const gce = "Public rooms named for tech pioneers: up to 4 drivers share the city.";
export const ex = "trapnest-neon:mp-online-seen";
export const UE = "trapnest-neon:mp-online-callouts";
export const Ace = 3;
export const yce = 2;
export const bce = 1200;
export const xce = 2e4;
export const _ce = 12e3;
export function wce() {
  try {
    localStorage.removeItem(ex);
    localStorage.removeItem(UE);
  } catch {}
}
export const MS = i => {
  try {
    return localStorage.getItem(i);
  } catch {
    return null;
  }
};
export const tL = (i, e) => {
  try {
    localStorage.setItem(i, e);
  } catch {}
};
const svgIcon = i => `<svg viewBox="0 -960 960 960" aria-hidden="true"><path fill="currentColor" d="${glyphPaths[i]}"/></svg>`;
export { svgIcon };
export const Tce = '<span class="hdr-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
