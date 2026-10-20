// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { kk, Fk, ame } from "./sigilToast.ts";
import { bu } from "../../game/story/milestones.ts";
import { typewriter } from "./typewriter.ts";
export function createStoryModal({
  sfx = null,
  voice = null
} = {}) {
  let t = null,
    s = null,
    n = null;
  function r(d, h) {
    return `
      <li class="story-goal${d.done ? " is-done" : ""}" style="--i:${h}">
        ${kk(d.icon)}
        <div><b>${d.label}</b><span>${d.hint}</span></div>
        <em>${d.value}</em>
      </li>`;
  }
  function o({
    character: character,
    text: text,
    eyebrow = "INCOMING MESSAGE",
    title = "",
    goals = [],
    button = "CONTINUE",
    voiceId: voiceId
  }) {
    var _, w;
    a({
      instant: true
    });
    t = document.createElement("div");
    t.className = `story-screen${title ? " has-title" : ""}`;
    t.style.setProperty("--c", character.color);
    t.setAttribute("role", "dialog");
    t.setAttribute("aria-modal", "true");
    t.setAttribute("aria-label", `Message from ${character.name}`);
    t.setAttribute("data-ui-block-look", "true");
    t.innerHTML = `
      <div class="story-screen__veil"></div>
      <section class="story-screen__card">
        <figure class="story-screen__who">
          ${bu(character, {
      full: true
    })}
          <figcaption><b>${character.name}</b><span>${character.role}</span></figcaption>
        </figure>
        <div class="story-screen__body">
          <p class="story-screen__eyebrow"><i aria-hidden="true"></i><span>${eyebrow}</span></p>
          ${title ? `<h2 class="story-screen__title">${kk("crown")}<span>${title}</span></h2>` : ""}
          <p class="story-screen__text"></p>
          ${goals.length ? `<ul class="story-screen__goals">${goals.map(r).join("")}</ul>` : ""}
          <div class="story-screen__actions">
            <button type="button" class="story-screen__go" data-ui-sound="confirm"><kbd>ENTER</kbd><span>${button}</span></button>
          </div>
        </div>
      </section>
      <button type="button" class="story-screen__skip" data-ui-sound="close" aria-label="Skip">SKIP<kbd>ESC</kbd></button>`;
    document.body.appendChild(t);
    const b = t;
    b.addEventListener("click", c);
    document.pointerLockElement && ((_ = document.exitPointerLock) == null || _.call(document));
    const x = new Promise(S => {
        n = S;
      }),
      y = b.querySelector(".story-portrait img");
    Promise.race([(w = y == null ? undefined : y.decode) == null ? undefined : w.call(y).catch(() => {}), new Promise(S => setTimeout(S, 700))]).then(() => {
      var S;
      t === b && (requestAnimationFrame(() => b.classList.add("is-open")), (S = sfx == null ? undefined : sfx.open) == null || S.call(sfx), s = typewriter(b.querySelector(".story-screen__text"), text, {
        delay: Fk,
        sound: (sfx == null ? undefined : sfx.type) ?? null,
        voice: voice == null ? undefined : voice.say(character.id, text, {
          id: voiceId,
          priority: 3,
          delay: Fk
        }),
        onDone: () => b.classList.add("is-typed")
      }));
    });
    return x;
  }
  function a({
    instant = false
  } = {}) {
    if (!t) return;
    const h = t;
    t = null;
    s == null || s.cancel();
    s = null;
    h.classList.remove("is-open");
    h.classList.add("is-closing");
    instant ? h.remove() : setTimeout(() => h.remove(), ame);
    const f = n;
    n = null;
    f == null || f();
  }
  function l() {
    s && (s.isDone ? a() : s.finish());
  }
  function c(d) {
    const h = d.target instanceof Element ? d.target : null;
    d.stopPropagation();
    h != null && h.closest(".story-screen__go, .story-screen__skip") ? a() : s && !s.isDone && s.finish();
  }
  function u(d) {
    var f, p;
    if (!t || d.metaKey || d.ctrlKey || d.altKey) return;
    d.stopImmediatePropagation();
    const {
      code: h
    } = d;
    if (h === "Enter" || h === "NumpadEnter" || h === "Space") {
      if (d.preventDefault(), d.repeat) return;
      s != null && s.isDone && ((f = sfx == null ? undefined : sfx.confirm) == null || f.call(sfx));
      l();
    } else h === "Escape" && (d.preventDefault(), (p = sfx == null ? undefined : sfx.close) == null || p.call(sfx), a());
  }
  window.addEventListener("keydown", u, true);
  return {
    show: o,
    close: () => a(),
    get isOpen() {
      return !!t;
    }
  };
}
export const cme = 3;
export const ume = 6e3;
