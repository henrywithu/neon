// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { R1, oG } from "../core/phosphorIcons.ts";
import { uG, wp, dG, nB } from "../../multiplayer/protocol.ts";
import { sB } from "../core/icons.ts";
import { isMobileDevice, onDeviceLayoutChange } from "../../platform/deviceLayout.ts";
import { Xk } from "../../multiplayer/spectatorCamera.ts";
export function createFriendsPanel({
  onRooms: onRooms,
  onLeave: onLeave,
  onRename: onRename,
  onTrack = null,
  onWatch = null,
  onSay = null,
  onPing = null
}) {
  const a = document.createElement("div");
  a.className = "mp-chip";
  a.setAttribute("aria-label", "Your room");
  a.dataset.state = "closed";
  a.setAttribute("data-ui-block-look", "true");
  a.innerHTML = `
    <button type="button" class="mp-chip__bar" aria-expanded="false">
      <span class="mp-chip__dot"></span>
      <span class="mp-chip__title"></span>
      <span class="mp-chip__ping"></span>
    </button>
    <div class="mp-chip__panel">
      <header class="mp-chip__sheethead">
        <span><b class="mp-chip__room">ROOM</b> · <b class="mp-chip__count">1</b>/4</span>
        <button type="button" class="mp-chip__x" aria-label="Close">${R1}</button>
      </header>
      <label class="mp-chip__row">
        <span class="mp-chip__tag">YOUR NAME</span>
        <input class="mp-chip__name" type="text" maxlength="${uG}" spellcheck="false" autocomplete="off" autocapitalize="characters" enterkeyhint="done" aria-label="Your name" />
      </label>
      <span class="mp-chip__label mp-chip__label--room">IN THE ROOM</span>
      <ul class="mp-chip__drivers"></ul>
      <p class="mp-chip__empty">NOBODY ELSE IS HERE YET. DRIVERS SHOW UP HERE, OVER THEIR CAR AND ON THE RADAR, WHEN THEY JOIN.</p>
      <span class="mp-chip__label mp-chip__label--together">TOGETHER</span>
      <ul class="mp-chip__keys">${sB.map(L => `<li><kbd>${L.keys.join("")}</kbd>${L.short}</li>`).join("")}</ul>
      <section class="mp-chip__chat">
        <span class="mp-chip__label">QUICK CHAT</span>
        <div class="mp-chip__phrases">
          ${wp.map((L, F) => `<button type="button" data-say="${F}">${L}</button>`).join("")}
          <button type="button" data-ping class="mp-chip__ping-here">PING WHERE I AM</button>
        </div>
      </section>
      <div class="mp-chip__actions">
        <button type="button" class="mp-chip__btn" data-act="rooms">${oG}<span>ROOMS</span></button>
        <button type="button" class="mp-chip__btn" data-act="leave">${R1}<span>LEAVE</span></button>
      </div>
    </div>`;
  document.body.appendChild(a);
  const l = document.createElement("div");
  l.className = "mp-toast";
  l.setAttribute("role", "status");
  document.body.appendChild(l);
  const c = document.createElement("div");
  c.className = "mp-watch";
  c.setAttribute("role", "status");
  c.innerHTML = '<span class="mp-watch__label">WATCHING</span><b class="mp-watch__name"></b><span class="mp-watch__hint">V NEXT · DRIVE TO RETURN</span>';
  document.body.appendChild(c);
  const u = c.querySelector(".mp-watch__name"),
    d = a.querySelector(".mp-chip__bar"),
    h = a.querySelector(".mp-chip__title"),
    f = a.querySelector(".mp-chip__ping"),
    p = a.querySelector(".mp-chip__room"),
    m = a.querySelector(".mp-chip__name"),
    A = a.querySelector(".mp-chip__drivers"),
    g = a.querySelector(".mp-chip__empty"),
    b = a.querySelector(".mp-chip__count");
  let x = false,
    y = 0,
    _ = 0,
    w = "",
    S = "",
    T = "",
    v = "";
  function E() {
    const L = isMobileDevice();
    a.dataset.compact = L ? "1" : "";
    document.documentElement.classList.toggle("mp-compact", L);
  }
  E();
  const C = onDeviceLayoutChange(E),
    M = () => x && B();
  function B() {
    if (a.dataset.compact !== "1") return;
    const L = document.querySelector(".hdr-btn--friends.is-live") ?? document.querySelector(".app-header-actions"),
      F = L == null ? undefined : L.getBoundingClientRect(),
      O = F ? F.bottom + 8 : 64,
      H = F ? window.innerWidth - F.right : 12;
    a.style.setProperty("--sheet-top", `${Math.round(O)}px`);
    a.style.setProperty("--sheet-right", `${Math.max(8, Math.round(H))}px`);
  }
  function R(L) {
    x = L;
    clearTimeout(y);
    x && B();
    a.classList.toggle("is-open", x);
    document.body.classList.toggle("mp-sheet-open", x && a.dataset.compact === "1");
    d.setAttribute("aria-expanded", String(x));
  }
  window.addEventListener("resize", M);
  d.addEventListener("click", () => R(!x));
  a.querySelector(".mp-chip__x").addEventListener("click", () => R(false));
  a.querySelector(".mp-chip__phrases").addEventListener("click", L => {
    const F = L.target.closest("button");
    F && (R(false), F.hasAttribute("data-ping") ? onPing == null || onPing() : onSay == null || onSay(Number(F.dataset.say)));
  });
  const I = () => clearTimeout(y);
  a.addEventListener("pointerdown", I);
  a.addEventListener("focusin", I);
  m.addEventListener("focus", () => m.select());
  m.addEventListener("input", () => {
    const L = m.value,
      F = dG(L);
    if (F === L) return;
    const O = Math.max(0, (m.selectionStart ?? L.length) - (L.length - F.length));
    m.value = F;
    m.setSelectionRange(O, O);
  });
  m.addEventListener("keypress", L => L.stopPropagation());
  m.addEventListener("keydown", L => {
    L.stopPropagation();
    L.key === "Enter" ? m.blur() : L.key === "Escape" && (m.value = v, m.blur());
  });
  m.addEventListener("blur", () => {
    const L = nB(m.value);
    m.value = v;
    L !== v && (onRename == null || onRename(L));
  });
  A.addEventListener("click", L => {
    var H;
    const F = L.target.closest("button[data-do]");
    if (!F) return;
    const O = (H = F.closest("li")) == null ? undefined : H.dataset.id;
    O && (F.dataset.do === "track" ? onTrack == null || onTrack(O) : onWatch == null || onWatch(O));
  });
  a.querySelector('[data-act="rooms"]').addEventListener("click", () => {
    R(false);
    onRooms == null || onRooms();
  });
  a.querySelector('[data-act="leave"]').addEventListener("click", () => {
    R(false);
    onLeave == null || onLeave();
  });
  const k = L => {
    var F, O;
    x && !a.contains(L.target) && !((O = (F = L.target).closest) != null && O.call(F, ".hdr-btn--friends")) && R(false);
  };
  document.addEventListener("pointerdown", k, true);
  return {
    setVisible(L) {
      a.classList.toggle("is-visible", L);
      L || R(false);
    },
    setName(L) {
      v = L;
      document.activeElement !== m && (m.value = L);
    },
    setRoom(L) {
      p.textContent = L || "ROOM";
    },
    openPanel(L = 0) {
      R(true);
      L && (y = setTimeout(() => R(false), L));
    },
    togglePanel() {
      R(!x);
    },
    get isOpen() {
      return x;
    },
    update({
      state: state,
      text: text,
      rtt: rtt,
      drivers: drivers
    }) {
      a.dataset.state = state;
      text !== w && (w = text, h.textContent = text);
      const W = rtt == null ? "" : `${Math.round(rtt)} MS`;
      W !== S && (S = W, f.textContent = W);
      const P = String(drivers.length + 1);
      b.textContent !== P && (b.textContent = P);
      const z = drivers.map(Y => `${Y.id}|${Y.name}|${Y.distance == null ? "" : Xk(Y.distance)}|${Y.canFollow ? 1 : 0}${Y.canTrack ? 1 : 0}${Y.tracking ? 1 : 0}${Y.watching ? 1 : 0}`).join(";");
      z !== T && (T = z, A.replaceChildren(...drivers.map(Y => {
        const G = document.createElement("li");
        G.style.setProperty("--c", Y.color.css);
        G.dataset.id = Y.id;
        const X = document.createElement("i"),
          ae = document.createElement("span");
        ae.textContent = Y.name;
        const ne = document.createElement("em");
        if (ne.textContent = Y.distance == null ? "" : Xk(Y.distance), G.append(X, ae, ne), Y.canFollow) {
          const se = document.createElement("button");
          if (se.type = "button", se.dataset.do = "watch", se.textContent = Y.watching ? "VIEW ✓" : "VIEW", se.title = "Watch from their car (V)", se.classList.toggle("is-on", !!Y.watching), Y.canTrack) {
            const re = document.createElement("button");
            re.type = "button";
            re.dataset.do = "track";
            re.textContent = Y.tracking ? "GPS ✓" : "GPS";
            re.title = Y.tracking ? "Stop the GPS" : "GPS to them";
            re.classList.toggle("is-on", !!Y.tracking);
            G.append(re);
          }
          G.append(se);
        }
        return G;
      })), g.style.display = drivers.length ? "none" : "");
    },
    setWatching(L) {
      c.classList.toggle("is-visible", !!L);
      L && (u.textContent = L);
    },
    toast(L, {
      warn = false,
      ms = 2800,
      color = null
    } = {}) {
      l.textContent = L;
      l.classList.toggle("is-warn", warn);
      l.classList.toggle("is-chat", !!color);
      color && l.style.setProperty("--c", color);
      l.classList.add("is-visible");
      clearTimeout(_);
      _ = setTimeout(() => l.classList.remove("is-visible"), ms);
    },
    dispose() {
      document.removeEventListener("pointerdown", k, true);
      C == null || C();
      window.removeEventListener("resize", M);
      document.documentElement.classList.remove("mp-compact");
      document.body.classList.remove("mp-sheet-open");
      clearTimeout(y);
      clearTimeout(_);
      a.remove();
      l.remove();
      c.remove();
    }
  };
}
export const Mge = 7e3;
