// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Ul } from "../../game/story/createStory.ts";
import { bu } from "../../game/story/milestones.ts";
import { typewriter } from "./typewriter.ts";
import { cc } from "../map/markers.ts";
import { J3 } from "../core/phosphorIcons.ts";
export const hme = 30;
export const fme = .9;
export const pme = 380;
export const mme = 2600;
export function Dk(i, e = hme) {
  if (i.length <= e) return i;
  const t = i.lastIndexOf(" ", e);
  return `${i.slice(0, t > e / 2 ? t : e).replace(/[\s,.;:!?]+$/, "")}…`;
}
export function gme(i) {
  let e = 2166136261;
  for (const t of i) e = Math.imul(e ^ t.charCodeAt(0), 16777619);
  e >>>= 0;
  return `${100 + e % 156}.${(e >>> 8) % 100}.${(e >>> 16) % 100}`;
}
export const Ame = 1392;
export const yme = () => {
  const i = Math.floor(Ame + performance.now() / 6e4) % 1440;
  return `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`;
};
export const bme = i => "★".repeat(i) + "☆".repeat(Math.max(0, 3 - i));
export const xme = i => `<i class="phone-sigil" style="--icon: url('${i.iconUrl}'); --g: ${i.color}"></i>`;
export function createMessagesPanel({
  sfx = null
} = {}) {
  const e = document.createElement("div");
  e.className = "phone-toast is-hidden";
  e.setAttribute("role", "button");
  e.setAttribute("aria-live", "polite");
  e.setAttribute("data-ui-block-look", "true");
  const t = document.createElement("button");
  t.type = "button";
  t.className = "phone-chip is-hidden";
  t.setAttribute("aria-label", "Read messages");
  t.setAttribute("data-ui-block-look", "true");
  t.innerHTML = `${Ul("mail")}<b>1</b><span>MESSAGE</span><kbd>I</kbd>`;
  document.body.append(e, t);
  const s = t.querySelector("b"),
    n = t.querySelector("span");
  let r = null;
  e.addEventListener("click", G => {
    G.stopPropagation();
    r == null || r("toast");
  });
  t.addEventListener("click", G => {
    G.stopPropagation();
    r == null || r("chip");
  });
  let o = null,
    a = 0;
  function l() {
    s.textContent = String(a);
    n.textContent = a === 1 ? "MESSAGE" : "MESSAGES";
    t.classList.toggle("is-visible", a > 0 && !e.classList.contains("is-visible"));
  }
  function c({
    character: character,
    text: text,
    eyebrow = "NEW MESSAGE",
    time = 10
  }) {
    o == null || o.cancel();
    e.style.setProperty("--c", character.color);
    e.style.setProperty("--t", `${time}s`);
    t.style.setProperty("--c", character.color);
    e.setAttribute("aria-label", `Message from ${character.name}. Press I to read.`);
    e.innerHTML = `
      <p class="phone-toast__link"><i></i><span>INCOMING · LINK ${gme(character.id)}</span><b class="phone-bars"><i></i><i></i><i></i><i></i></b></p>
      <div class="phone-toast__main">
        <span class="phone-toast__ring">${Ul("vibration")}</span>
        ${bu(character, {
      className: "phone-toast__portrait"
    })}
        <div class="phone-toast__body">
          <p class="phone-toast__eyebrow">${Ul("mail")}<span>${eyebrow}</span></p>
          <h3 class="phone-toast__name">${character.name}<small>${character.role}</small></h3>
          <p class="phone-toast__preview"></p>
        </div>
      </div>
      <p class="phone-toast__read"><span>READ MESSAGE</span><kbd>I</kbd></p>
      <i class="phone-toast__timer"></i>`;
    e.classList.remove("is-visible", "is-folding");
    e.offsetWidth;
    e.classList.add("is-visible");
    l();
    o = typewriter(e.querySelector(".phone-toast__preview"), Dk(text), {
      delay: .45,
      cps: 48
    });
  }
  function u() {
    e.classList.contains("is-visible") && (o == null || o.finish(), e.classList.remove("is-visible"), e.classList.add("is-folding"), l());
  }
  function d() {
    o == null || o.cancel();
    o = null;
    e.classList.remove("is-visible", "is-folding");
    l();
  }
  function h(G) {
    a = G;
    l();
  }
  function f(G) {
    e.classList.toggle("is-hidden", G);
    t.classList.toggle("is-hidden", G);
  }
  let p = null,
    m = null,
    A = null,
    g = [],
    b = null,
    x = {},
    y = null,
    _ = "",
    w = 0,
    S = null,
    T = 0,
    v = null;
  function E(G) {
    return `
      <li class="${["phone-row", G.unread ? "is-unread" : "", G.done ? "is-done" : "", G.gps ? "is-gps" : ""].filter(Boolean).join(" ")}" data-id="${G.id}" style="--c:${G.who.color}">
        ${bu(G.who, {
      className: "phone-row__who"
    })}
        <div class="phone-row__body">
          <p class="phone-row__head"><b>${G.who.name}</b><em>${G.tag}</em></p>
          <p class="phone-row__text">${Dk(G.text, 34)}</p>
        </div>
        <span class="phone-row__side"><time>${G.when}</time><i class="phone-row__mark" aria-hidden="true">${G.done ? "✓" : G.gps ? Ul("near_me") : ""}</i></span>
      </li>`;
  }
  function C() {
    const G = g.filter(X => !X.done).length;
    p.querySelector(".phone__inbox-count").textContent = g.length ? String(G || g.length) : "";
    m.innerHTML = g.length ? g.map(E).join("") : '<li class="phone-row phone-row--empty">NO MESSAGES</li>';
    M();
  }
  function M() {
    for (const G of m.querySelectorAll(".phone-row[data-id]")) {
      const X = G.dataset.id === (b == null ? undefined : b.id);
      G.classList.toggle("is-selected", X);
      X && G.scrollIntoView({
        block: "nearest"
      });
    }
  }
  function B(G) {
    const X = G.kind === "job" ? cc(G.icon, {
        size: 34
      }) : G.kind === "friends" ? `<i class="phone-friends">${J3}</i>` : xme(G),
      ae = G.kind === "job" ? `JOB OFFER <em>${bme(G.tier)}</em>` : G.kind === "friends" ? "MULTIPLAYER · ROOMS" : "NEON SIGIL · SIGNAL",
      ne = G.status ? `<span class="phone__attach-status">${G.status}</span>` : G.kind === "friends" ? `<span class="phone__attach-dist">${G.note}</span>` : `<span class="phone__attach-dist">${Ul("near_me")}${G.distance}</span>`;
    return `
      <div class="phone__attach phone__attach--${G.kind}">
        <span class="phone__map">${X}</span>
        <div class="phone__attach-info">
          <span class="phone__attach-kicker">${ae}</span>
          <b>${G.name}</b>
          ${ne}
        </div>
      </div>`;
  }
  function R(G) {
    var ae, ne;
    if (clearTimeout(w), y == null || y.cancel(), y = null, W(), b = G, M(), !G) {
      _ = "";
      A.className = "phone__chat is-empty";
      A.style.removeProperty("--c");
      A.innerHTML = `
        <div class="phone__empty">
          ${Ul("mail")}
          <b>NO MESSAGES</b>
          <span>The crew texts you when there's work.</span>
        </div>`;
      return;
    }
    const X = G.unread;
    if (A.className = `phone__chat${G.done ? " is-done" : ""}`, A.style.setProperty("--c", G.who.color), A.innerHTML = `
      <div class="phone__contact">
        ${bu(G.who, {
      className: "phone__portrait"
    })}
        <p class="phone__who"><b>${G.who.name}</b><span>${G.who.role}</span></p>
        <span class="phone__secure">${Ul("lock")}SECURE</span>
      </div>
      <div class="phone__thread">
        <p class="phone__day"><span>RECEIVED · ${G.ago}</span></p>
        <div class="phone__typing" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="phone__bubble"><p class="phone__text"></p></div>
        ${B(G.attach)}
      </div>
      <footer class="phone__actions">
        ${G.done ? `<span class="phone__done">${G.attach.status}</span>` : G.attach.kind === "friends" ? G.attach.canInvite ? `<button type="button" class="phone__gps" data-act="gps" data-ui-sound="confirm">${J3}<span>JOIN A ROOM</span><kbd>ENTER</kbd></button>` : "<span></span>" : `<button type="button" class="phone__gps${G.gps ? " is-on" : ""}" data-act="gps" data-ui-sound="confirm">${Ul("near_me")}<span>${G.gps ? "GPS ON" : "SET GPS"}</span><kbd>ENTER</kbd></button>`}
        <button type="button" class="phone__delete" data-act="delete"><span>DELETE</span><kbd>⌫</kbd></button>
      </footer>`, G.unread && (G.unread = false, (ae = m.querySelector(`.phone-row[data-id="${G.id}"]`)) == null || ae.classList.remove("is-unread"), (ne = x.onSelect) == null || ne.call(x, G.id)), !X) {
      A.querySelector(".phone__text").textContent = G.text;
      A.classList.add("is-talking", "is-typed", "is-instant");
      _ = "typed";
      return;
    }
    _ = "dots";
    w = setTimeout(I, fme * 1e3);
  }
  function I() {
    if (!p || _ !== "dots") return;
    clearTimeout(w);
    _ = "typing";
    const G = A;
    G.classList.add("is-talking");
    y = typewriter(G.querySelector(".phone__text"), b.text, {
      delay: .15,
      cps: 38,
      sound: (sfx == null ? undefined : sfx.type) ?? null,
      onDone: () => {
        _ = "typed";
        G.classList.add("is-typed");
      }
    });
  }
  function k({
    items = [],
    selected = null,
    onSelect = null,
    onGps = null,
    onDelete = null
  }) {
    var Se, ye;
    F({
      instant: true
    });
    x = {
      onSelect: onSelect,
      onGps: onGps,
      onDelete: onDelete
    };
    g = items;
    const re = yme();
    p = document.createElement("div");
    p.className = "phone-screen";
    p.setAttribute("role", "dialog");
    p.setAttribute("aria-modal", "true");
    p.setAttribute("aria-label", "Messages");
    p.setAttribute("data-ui-block-look", "true");
    p.innerHTML = `
      <div class="phone-screen__veil" data-act="close" data-close="true"></div>
      <div class="phone-wrap">
        <section class="phone">
          <header class="phone__status">
            <span class="phone__clock">${re}</span>
            <span class="phone__carrier">NIGHT//NET</span>
            <span class="phone__state"><b class="phone-bars"><i></i><i></i><i></i><i></i></b><i class="phone__battery"></i></span>
          </header>
          <div class="phone__inbox">
            <p class="phone__inbox-title">${Ul("mail")}<span>MESSAGES</span><b class="phone__inbox-count"></b></p>
            <ol class="phone__list"></ol>
            <p class="phone__inbox-keys"><kbd>↑</kbd><kbd>↓</kbd><span>SELECT</span></p>
          </div>
          <div class="phone__chat"></div>
        </section>
      </div>
      <button type="button" class="phone-screen__close" data-act="close" aria-label="Close messages"><span>CLOSE</span><kbd>ESC</kbd></button>`;
    document.body.appendChild(p);
    m = p.querySelector(".phone__list");
    A = p.querySelector(".phone__chat");
    const le = p;
    le.addEventListener("click", z);
    document.pointerLockElement && ((Se = document.exitPointerLock) == null || Se.call(document));
    const we = new Promise(U => {
      v = U;
    });
    C();
    R(g.find(U => U.id === selected) ?? g[0] ?? null);
    requestAnimationFrame(() => le.classList.add("is-open"));
    (ye = sfx == null ? undefined : sfx.open) == null || ye.call(sfx);
    return we;
  }
  function L(G) {
    if (!p) return;
    const X = Math.max(0, g.findIndex(ae => ae.id === (b == null ? undefined : b.id)));
    g = G;
    C();
    R(g.find(ae => ae.id === (b == null ? undefined : b.id)) ?? g[Math.min(X, g.length - 1)] ?? null);
  }
  function F({
    instant = false,
    gps = false
  } = {}) {
    var re;
    if (!p) return;
    const ae = p,
      ne = b;
    p = null;
    m = null;
    A = null;
    b = null;
    _ = "";
    clearTimeout(w);
    y == null || y.cancel();
    y = null;
    W();
    ae.classList.remove("is-open");
    ae.classList.add("is-closing");
    instant ? ae.remove() : setTimeout(() => ae.remove(), pme);
    gps && ne && ((re = x.onGps) == null || re.call(x, ne.id));
    const se = v;
    v = null;
    se == null || se();
  }
  function O(G) {
    if (!g.length) return;
    const X = g.findIndex(ne => ne.id === (b == null ? undefined : b.id)),
      ae = g[(X + G + g.length) % g.length];
    ae !== b && R(ae);
  }
  function H() {
    var G;
    _ === "dots" ? (I(), y == null || y.finish()) : _ === "typing" ? y == null || y.finish() : _ === "typed" && b && !b.done && ((G = sfx == null ? undefined : sfx.confirm) == null || G.call(sfx), F({
      gps: true
    }));
  }
  function W() {
    clearTimeout(T);
    S = null;
    const G = A == null ? undefined : A.querySelector(".phone__delete");
    G == null || G.classList.remove("is-armed");
    const X = G == null ? undefined : G.querySelector("span");
    X && (X.textContent = "DELETE");
  }
  function P() {
    var X, ae;
    if (!b) return;
    if (S !== b.id) {
      W();
      S = b.id;
      const ne = A.querySelector(".phone__delete");
      ne == null || ne.classList.add("is-armed");
      const se = ne == null ? undefined : ne.querySelector("span");
      se && (se.textContent = "DELETE?");
      T = setTimeout(W, mme);
      return;
    }
    const G = b.id;
    W();
    (X = sfx == null ? undefined : sfx.close) == null || X.call(sfx);
    (ae = x.onDelete) == null || ae.call(x, G);
  }
  function z(G) {
    var se;
    G.stopPropagation();
    const X = G.target instanceof Element ? G.target : null,
      ae = (se = X == null ? undefined : X.closest("[data-act]")) == null ? undefined : se.dataset.act;
    if (ae === "close") {
      F();
      return;
    }
    if (ae === "gps") {
      b && !b.done && F({
        gps: true
      });
      return;
    }
    if (ae === "delete") {
      P();
      return;
    }
    const ne = X == null ? undefined : X.closest(".phone-row[data-id]");
    if (ne) {
      const re = g.find(le => le.id === ne.dataset.id);
      re && re !== b && R(re);
      return;
    }
    X != null && X.closest(".phone__thread") && (_ === "dots" || _ === "typing") && H();
  }
  function Y(G) {
    var ne;
    if (!p || G.metaKey || G.ctrlKey || G.altKey) return;
    G.stopImmediatePropagation();
    const {
        code: X
      } = G,
      ae = () => G.preventDefault();
    if (X === "Enter" || X === "NumpadEnter" || X === "Space") ae(), G.repeat || H();else if (X === "ArrowUp" || X === "KeyW" || X === "Tab" && G.shiftKey) ae(), O(-1);else if (X === "ArrowDown" || X === "KeyS" || X === "Tab") ae(), O(1);else if (X === "Backspace" || X === "Delete") ae(), G.repeat || P();else if (X === "Escape" || X === "KeyI") {
      if (ae(), G.repeat) return;
      (ne = sfx == null ? undefined : sfx.close) == null || ne.call(sfx);
      F();
    }
  }
  window.addEventListener("keydown", Y, true);
  return {
    notify: c,
    fold: u,
    clear: d,
    setUnread: h,
    setHidden: f,
    open: k,
    refresh: L,
    close: () => F(),
    onActivate(G) {
      r = G;
    },
    get isOpen() {
      return !!p;
    },
    get isRinging() {
      return e.classList.contains("is-visible") && !e.classList.contains("is-hidden");
    },
    dispose() {
      F({
        instant: true
      });
      window.removeEventListener("keydown", Y, true);
      o == null || o.cancel();
      e.remove();
      t.remove();
    }
  };
}
export const wme = 4;
export const Pk = 4;
export const Ok = 70;
export const Tme = 120;
export const Sme = 2;
export const Uk = 10;
export const vme = 12;
export const Eme = i => i < 950 ? `${Math.max(10, Math.round(i / 10) * 10)} M AWAY` : `${(i / 1e3).toFixed(1)} KM AWAY`;
