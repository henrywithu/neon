// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { contacts, wG } from "./contacts.ts";
import { glyphPaths } from "../../ui/walk/hudPanel.ts";
import { vehicleCatalog } from "../vehicles/catalog.ts";
export const TG = i => `/textures/story/${i}-thumb.webp`;
export const L1 = i => contacts[i == null ? undefined : i.from] ?? contacts.nyx;
export const hL = new Map();
export function Sue(i, e) {
  const t = e ? i.pass : i.fail;
  if (!(t != null && t.length)) return "";
  let s = Math.floor(Math.random() * t.length);
  t.length > 1 && s === hL.get(i.id) && (s = (s + 1) % t.length);
  hL.set(i.id, s);
  return t[s];
}
export const fL = `Took you long enough. I'm Nyx.
Every night, this city crowns an owner. Tonight, the crown is up for grabs.
Run jobs for my crew. Win Rio's street races. Hunt down the Neon Sigils. Earn rides nobody else can touch.
Do it all, and the night is yours.`;
export function vue({
  missionsLeft: missionsLeft,
  racesLeft = 0,
  sigilsLeft: sigilsLeft,
  complete: complete,
  started: started
}) {
  const r = (a, l) => `${a} ${l}${a === 1 ? "" : "s"}`;
  if (complete) return RS.complete;
  if (!started) return RS.fresh;
  const o = [];
  missionsLeft && o.push(r(missionsLeft, "job"));
  racesLeft && o.push(r(racesLeft, "race"));
  sigilsLeft && o.push(r(sigilsLeft, "sigil"));
  return o.length ? o.length === 1 ? sigilsLeft ? `Every job and race is done. Hex still needs ${o[0]}. Then the night is yours.` : racesLeft ? `Every job and sigil is done. Rio still has ${o[0]} for you. Then the night is yours.` : `Hex has every sigil, Rio has no races left. ${o[0]} to go. Then the night is yours.` : `The night's still up for grabs: ${o.slice(0, -1).join(", ")} and ${o.at(-1)} to go.` : RS.mixed;
}
export function Eue({
  missionsLeft: missionsLeft,
  racesLeft = 0,
  sigilsLeft: sigilsLeft,
  complete: complete,
  started: started
}) {
  return complete ? "complete" : started ? [missionsLeft, racesLeft, sigilsLeft].filter(Boolean).length !== 1 ? "mixed" : sigilsLeft ? "sigils" : racesLeft ? "races" : "jobs" : "fresh";
}
export const Mue = i => `welcome-${i}`;
export const RS = {
  complete: "Evening, owner. The night's still yours. Go enjoy it.",
  fresh: "Back again? The crown's still empty. Go earn it.",
  mixed: "The night's still up for grabs. Jobs, races, sigils. It's all out there waiting."
};
export const vf = {
  title: "OWNER OF THE NIGHT",
  text: `Every job. Every race. Every sigil. Every ride.
The city knows your name now: the screens, the radio, the rain.
The night is yours. Don't make me take it back.`
};
export const ib = {
  first: "There's a Neon Sigil near you. A shard of the old city code. Follow the pin, then the signal.",
  lines: ["Caught another sigil signal. Weak, but close. Go get it.", "The old grid is glowing again. Pin's on your map.", "Another shard is humming out there. Bring it to me.", "Sigil signal, clear as neon. Follow the pin, then the signal."]
};
export const Cue = "The night's big enough for more. Hit ONLINE, pick a room, and run it with other drivers. Chat. Race. Make noise.";
export const pL = {
  first: "That's a Neon Sigil, a shard of the city's old code. There are more out there. Bring me every one.",
  last: "That's all of them. The old grid knows your face now."
};
export function bu(i, {
  full = false,
  className = ""
} = {}) {
  const s = typeof i == "string" ? contacts[i] : i,
    n = full ? wG(s.id) : TG(s.id);
  return `<span class="story-portrait${full ? " story-portrait--full" : ""}${className ? ` ${className}` : ""}" style="--c:${s.color}"><img src="${n}" alt="" draggable="false" decoding="async"/></span>`;
}
export function mL(i) {
  return Promise.all(i.map(e => {
    const t = new Image();
    t.decoding = "async";
    t.src = e;
    return t.decode().catch(() => {});
  }));
}
export const Bue = () => Object.keys(contacts).map(TG);
export const Ef = (i, e = "") => `<svg class="ach-icon ${e}" viewBox="0 -960 960 960" aria-hidden="true"><path d="${glyphPaths[i]}" fill="currentColor"/></svg>`;
export function IS(i, e = "", t = "") {
  return `
    <header class="ach-crew__head ${e}" style="--c:${i.color}">
      ${bu(i)}
      <div><h4>${i.name}<span>${i.role}</span></h4><p>${i.bio}</p></div>
      ${t ? `<b>${t}</b>` : ""}
    </header>`;
}
export const gL = vehicleCatalog.filter(i => {
  var e;
  return ((e = i.unlock) == null ? undefined : e.sigils) && Object.keys(i.unlock).length === 1;
}).sort((i, e) => i.unlock.sigils - e.unlock.sigils);
export const NS = vehicleCatalog.find(i => {
  var e;
  return ((e = i.unlock) == null ? undefined : e.races) && Object.keys(i.unlock).length === 1;
}) ?? null;
export const Rue = {
  ...contacts.rio,
  bio: "Runs the city's street circuit. Every chequered flag on the map is one of Rio's races."
};
export const Iue = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/></svg>';
