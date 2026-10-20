// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { nme, Lk, rme, ime } from "../../game/missions/createMissions.ts";
import { contacts, aB } from "../../game/story/contacts.ts";
import { pL, bu } from "../../game/story/milestones.ts";
import { oB } from "../../game/sigils/placements.ts";
import { typewriter } from "./typewriter.ts";
import { lG, glyphPaths } from "../walk/hudPanel.ts";
export function createSigilToast({
  total: total,
  typeSound = null,
  voice = null
}) {
  const s = document.createElement("div");
  s.className = "sigil-toast";
  s.setAttribute("role", "status");
  const n = document.createElement("div");
  n.className = "sigil-signal";
  n.innerHTML = `<i class="sigil-signal__arrow">${nme}</i><span class="sigil-signal__text"></span>`;
  document.body.append(s, n);
  const r = n.querySelector(".sigil-signal__arrow"),
    o = n.querySelector(".sigil-signal__text");
  let a = null,
    l = null,
    c = "",
    u = 0;
  const d = contacts[aB];
  function h(p, m) {
    const A = m === 1 ? pL.first : m === total ? pL.last : p.lore;
    s.style.setProperty("--c", p.color);
    s.innerHTML = `
      <i class="sigil-toast__icon" style="--icon: url('${oB(p.id)}')"></i>
      <div class="sigil-toast__body">
        <p class="sigil-toast__eyebrow">NEON SIGIL ACQUIRED</p>
        <h3 class="sigil-toast__name">${p.name}</h3>
        <div class="sigil-toast__msg" style="--c:${d.color}">
          ${bu(d)}
          <p><b>${d.name}</b><span class="sigil-toast__lore"></span></p>
        </div>
      </div>
      <span class="sigil-toast__count"><b>${m}</b>/${total}</span>`;
    s.classList.remove("is-visible");
    s.offsetWidth;
    s.classList.add("is-visible");
    l == null || l.cancel();
    const g = .5,
      b = voice == null ? undefined : voice.say(d.id, A, {
        priority: 1,
        delay: g,
        comms: true
      });
    l = typewriter(s.querySelector(".sigil-toast__lore"), A, {
      delay: g,
      cps: Lk,
      sound: typeSound,
      voice: b
    });
    clearTimeout(a);
    a = setTimeout(() => {
      l == null || l.cancel();
      s.classList.remove("is-visible");
    }, (g + Math.max(A.length / Lk, (b == null ? undefined : b.duration) ?? 0) + rme) * 1e3);
  }
  function f(p, m, A, g) {
    if (u -= p, u > 0) return;
    u = .1;
    const b = ime;
    if (!m || m.distance > b || m.item.dissolve >= 0) {
      c && (c = "", n.classList.remove("is-visible"));
      return;
    }
    const {
        item: x,
        distance: y
      } = m,
      _ = y < 10 ? `${x.def.name} · RIGHT HERE` : `SIGIL SIGNAL · ${Math.round(y)} M`,
      w = `${_}|${x.def.id}|${g}`;
    w !== c && (c = w, o.textContent = _, n.style.setProperty("--c", x.def.color), n.classList.add("is-visible"), n.classList.toggle("is-car", !g));
    const S = Math.atan2(x.x - A.x, x.z - A.z) - A.heading;
    r.style.transform = `rotate(${-S * 180 / Math.PI}deg)`;
    n.style.setProperty("--strength", String(Math.max(.35, 1 - y / b)));
  }
  return {
    showCollected: h,
    update: f,
    get busy() {
      return s.classList.contains("is-visible");
    },
    dispose() {
      clearTimeout(a);
      l == null || l.cancel();
      s.remove();
      n.remove();
    }
  };
}
export const kk = i => `<svg class="story-icon" viewBox="${lG}" aria-hidden="true"><path d="${glyphPaths[i] ?? glyphPaths.flag}" fill="currentColor"/></svg>`;
export const Fk = .8;
export const ame = 450;
