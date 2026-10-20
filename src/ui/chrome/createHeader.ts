// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { rce, oce, ace, lce, eB } from "../core/fullscreen.ts";
import { isMobileDevice, isTouchDevice } from "../../platform/deviceLayout.ts";
import { svgIcon, MS, ex, Tce, tL, gce, sB, _ce, UE, Ace, yce, xce, bce } from "../core/icons.ts";
import { oG, Kle, Z3, jle, eL, R1, Yle } from "../core/phosphorIcons.ts";
import { createHudPanel } from "../walk/hudPanel.ts";
import { subscribeAudioState } from "../../audio/audioState.ts";
export function createHeader({
  state: state,
  onOpenSettings: onOpenSettings,
  onOpenRadio: onOpenRadio,
  onOpenAchievements = null,
  onOpenGarage = null,
  onOpenMessages = null,
  onOpenMultiplayer = null,
  onFirstJob = null,
  onOpenHelp = null,
  onPause = null,
  onOpenMap = null,
  onOpenFriends = null
} = {}) {
  const l = document.createElement("div");
  l.className = "app-header app-header--force-hidden";
  l.setAttribute("data-ui-block-look", "true");
  const c = rce() && !oce(),
    u = (Ae, Be, He, at, Re = "", Fe = at) => `
      <button type="button" class="hdr-btn hdr-btn--${Ae}" data-act="${Ae}" style="--accent:${Be}" aria-label="${Fe}${Re ? ` (${Re})` : ""}" title="${Fe}${Re ? ` (${Re})` : ""}">
        <span class="hdr-btn__icon">${He}</span>
        ${at ? `<span class="hdr-btn__label">${at}</span>` : ""}
        ${Re ? `<kbd class="hdr-btn__key">${Re}</kbd>` : ""}
      </button>`,
    d = true,
    h = onOpenGarage ? u("garage", "#4ade80", svgIcon("garage"), "GARAGE", "", "Garage") : "",
    f = onOpenMessages ? u("messages", "#ff4f5e", svgIcon("mail"), "MESSAGES", "I", "Messages") : "",
    p = onOpenAchievements ? u("achievements", "#ffd60a", svgIcon("trophy"), "ACHIEVEMENTS", "J", "Achievements") : "",
    m = !!onOpenMultiplayer && !MS(ex),
    A = onOpenMultiplayer ? u("invite", "#c084fc", oG, `ONLINE${m ? '<em class="hdr-btn__new">NEW</em>' : ""}`, "", "Online rooms") : "",
    g = u("radio", "#34f5e9", Tce, "RADIO", "M", "Radio · sound"),
    b = d && onOpenMultiplayer ? u("friends", "#c084fc", Kle, "", "", "Your room") : "",
    x = c ? u("fullscreen", "#e2e8ff", Z3, d ? "FULLSCREEN" : "", "", "Fullscreen") : "",
    y = u("settings", "#e2e8ff", jle, d ? "SETTINGS" : "", "", "Settings");
  l.innerHTML = d ? `
    <div class="app-header-brand"></div>
    <nav class="app-header-actions app-header-actions--compact" aria-label="Game menu">
      <button type="button" class="hdr-btn" data-act="pause" aria-label="Pause"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>
      ${g}
      ${b}
      <button type="button" class="hdr-btn hdr-btn--menu" data-act="menu" style="--accent:#e2e8ff" aria-label="Menu" aria-expanded="false" aria-haspopup="true">
        <span class="hdr-btn__icon">${eL}</span>
      </button>
      <div class="hdr-menu" role="menu" hidden>
        <button type="button" class="hdr-btn" data-act="first-job">First Fare</button><button type="button" class="hdr-btn" data-act="help">Help</button><button type="button" class="hdr-btn" data-act="map">City map</button>${h}${f}${p}${A}${x}${y}
      </div>
    </nav>
  ` : `
    <div class="app-header-brand"></div>
    <nav class="app-header-actions" aria-label="Game menu">
      <button type="button" class="hdr-btn" data-act="pause" aria-label="Pause (P)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button><button type="button" class="hdr-btn" data-act="help" aria-label="Help (H)">Help</button>${h}${f}${p}${A}${g}${x}${y}
    </nav>
  `;
  const _ = l.querySelector(".app-header-brand"),
    w = createHudPanel();
  _.appendChild(w.root);
  const S = {
      "first-job": () => onFirstJob?.(),
      help: () => onOpenHelp?.(),
      pause: () => onPause?.(),
      map: () => onOpenMap?.(),
      garage: () => onOpenGarage == null ? undefined : onOpenGarage(),
      messages: () => onOpenMessages == null ? undefined : onOpenMessages(),
      achievements: () => onOpenAchievements == null ? undefined : onOpenAchievements(),
      invite: () => {
        ae();
        onOpenMultiplayer == null || onOpenMultiplayer();
      },
      friends: () => onOpenFriends == null ? undefined : onOpenFriends(),
      radio: () => onOpenRadio == null ? undefined : onOpenRadio(),
      fullscreen: () => ace(),
      settings: () => {
        state == null || state.openPanel("settings");
        onOpenSettings == null || onOpenSettings();
      }
    },
    T = l.querySelector(".hdr-menu"),
    v = l.querySelector(".hdr-btn--menu");
  function E(Ae) {
    T && (T.hidden = !Ae, Ae && le(), v.classList.toggle("is-open", Ae), v.setAttribute("aria-expanded", String(Ae)), v.querySelector(".hdr-btn__icon").innerHTML = Ae ? R1 : eL);
  }
  S.menu = () => E(T.hidden);
  const C = Ae => {
      T && !T.hidden && !l.querySelector(".app-header-actions").contains(Ae.target) && E(false);
    },
    M = Ae => {
      Ae.code === "Escape" && T && !T.hidden && E(false);
    };
  T && (document.addEventListener("pointerdown", C, true), window.addEventListener("keydown", M));
  l.querySelector(".app-header-actions").addEventListener("click", Ae => {
    var He, at, Re, Fe, Je;
    const Be = (Re = (at = (He = Ae.target).closest) == null ? undefined : at.call(He, "[data-act]")) == null ? undefined : Re.dataset.act;
    Be && (Ae.stopPropagation(), (Fe = state == null ? undefined : state.showAllUi) == null || Fe.call(state), Be !== "menu" && E(false), (Je = S[Be]) == null || Je.call(S));
  });
  const B = l.querySelector(".hdr-btn--radio"),
    R = subscribeAudioState(({
      isMusicPlaying: isMusicPlaying
    }) => {
      B.classList.toggle("is-sound-on", isMusicPlaying);
      B.classList.toggle("is-muted", !isMusicPlaying);
      B.title = `Radio (M) · sound ${isMusicPlaying ? "on" : "off"}`;
    }),
    I = l.querySelector(".hdr-btn--messages"),
    k = document.createElement("b");
  k.className = "hdr-btn__badge";
  k.setAttribute("aria-hidden", "true");
  I == null || I.append(k);
  function L(Ae) {
    if (!I) return;
    k.textContent = Ae > 9 ? "9+" : String(Ae);
    I.classList.toggle("has-unread", Ae > 0);
    const Be = Ae > 0 ? `Messages (I) · ${Ae} unread` : "Messages (I)";
    I.title = Be;
    I.setAttribute("aria-label", Be);
  }
  const F = l.querySelector(".hdr-btn--invite"),
    O = () => d ? v : F,
    H = document.createElement("div");
  H.className = "hdr-tip";
  H.setAttribute("role", "tooltip");
  H.hidden = true;
  l.appendChild(H);
  let W = 0,
    P = 0,
    z = 0,
    Y = false,
    G = 0;
  const X = () => !F || !!MS(ex);
  function ae() {
    var Ae;
    X() || (tL(ex, String(Date.now())), F.classList.remove("has-cue"), v == null || v.classList.remove("has-cue"), (Ae = F.querySelector(".hdr-btn__new")) == null || Ae.remove(), clearTimeout(z), le());
  }
  function ne(Ae) {
    const Be = isTouchDevice(),
      He = F.classList.contains("is-live"),
      at = He ? `IN A ROOM · ${G} DRIVING` : "DRIVE WITH OTHERS",
      Re = He ? "Click for your room: who is here, quick chat, leave." : d && Ae ? "Open ☰ and tap ONLINE to pick a room." : gce;
    H.innerHTML = `
      <p class="hdr-tip__kicker">${Ae ? "<b>NEW</b>" : ""}<span>${at}</span></p>
      <p class="hdr-tip__text">${Re}</p>
      <ul class="hdr-tip__keys">${Be ? ["PICK A ROOM", "QUICK CHAT", "GPS TO A DRIVER", "RACE TOGETHER"].map(Fe => `<li>${Fe}</li>`).join("") : sB.map(Fe => `<li><kbd>${Fe.keys.join("")}</kbd>${Fe.short}</li>`).join("")}</ul>
      <p class="hdr-tip__foot">${Be ? "In a room, the button up here holds who is there, GPS to them and quick chat." : "Talk, honk, race and find each other. H lists it all while you drive."}</p>`;
  }
  function se() {
    const Ae = l.getBoundingClientRect(),
      Be = O().getBoundingClientRect(),
      He = H.offsetWidth,
      at = Math.max(12, Math.min(Be.right - He, document.documentElement.clientWidth - He - 12));
    H.style.left = `${at - Ae.left}px`;
    H.style.top = `${Be.bottom - Ae.top + 12}px`;
    H.style.setProperty("--arrow", `${Math.max(14, Math.min(He - 14, Be.left + Be.width / 2 - at))}px`);
  }
  function re({
    callout = false
  } = {}) {
    if (!F || !callout && F.classList.contains("is-live")) return;
    clearTimeout(W);
    ne(callout);
    H.classList.toggle("is-callout", callout);
    H.hidden = false;
    se();
    const Be = ++P;
    requestAnimationFrame(() => Be === P && H.classList.add("is-visible"));
    callout && (W = setTimeout(le, _ce));
  }
  function le() {
    clearTimeout(W);
    P += 1;
    H.classList.remove("is-visible");
    W = setTimeout(() => {
      H.classList.contains("is-visible") || (H.hidden = true);
    }, 220);
  }
  F && (m && (F.classList.add("has-cue"), v == null || v.classList.add("has-cue")), F.addEventListener("pointerenter", Ae => {
    Ae.pointerType === "mouse" && re();
  }), F.addEventListener("pointerleave", () => le()), F.addEventListener("focus", () => F.matches(":focus-visible") && re()), F.addEventListener("blur", () => le()), window.addEventListener("resize", () => !H.hidden && se()));
  let we = 0,
    Se = -1 / 0;
  function ye() {
    return l.classList.contains("show") && !l.classList.contains("app-header--force-hidden");
  }
  function U() {
    if (X() || !ye() || !H.hidden || state != null && state.openedPanel) return;
    const Ae = Number(MS(UE)) || 0;
    Ae >= Ace || we >= yce || performance.now() - Se < xce || (we += 1, Se = performance.now(), tL(UE, String(Ae + 1)), re({
      callout: true
    }));
  }
  function J() {
    Y || X() || (Y = true, z = setTimeout(U, bce));
  }
  const Q = l.querySelector(".hdr-btn--friends"),
    j = document.createElement("b");
  j.className = "hdr-btn__badge hdr-btn__badge--friends";
  j.setAttribute("aria-hidden", "true");
  Q == null || Q.append(j);
  function de({
    live = false,
    count = 0
  } = {}) {
    if (!F) return;
    if (F.classList.toggle("is-live", live), Q) {
      Q.classList.toggle("is-live", live);
      j.textContent = String(count);
      const at = `In a room · ${count} driving`;
      Q.title = at;
      Q.setAttribute("aria-label", at);
    }
    G = count;
    const He = live ? `In a room · ${count} driving (click for the room)` : "Online rooms";
    F.setAttribute("aria-label", He);
    live && ae();
    H.hidden || (ne(H.classList.contains("is-callout")), se());
  }
  const K = l.querySelector(".hdr-btn--fullscreen"),
    V = Ae => {
      if (!K) return;
      K.querySelector(".hdr-btn__icon").innerHTML = Ae ? Yle : Z3;
      const Be = Ae ? "Exit fullscreen" : "Fullscreen";
      K.title = Be;
      K.setAttribute("aria-label", Be);
    },
    te = K ? lce(V) : () => {};
  V(eB());
  document.body.appendChild(l);
  function fe() {
    l.classList.add("show");
    // Room discovery remains available in Menu without an automatic callout.
  }
  function Ce() {
    l.classList.remove("show");
  }
  function Ue(Ae) {
    l.classList.toggle("app-header--force-hidden", Ae);
    !Ae && Y && (clearTimeout(z), z = setTimeout(U, 700));
  }
  return {
    root: l,
    show: fe,
    hide: Ce,
    setForceHidden: Ue,
    setMessageCount: L,
    setInviteState: de,
    bindWalkControls: w.bindWalkControls,
    bindDriveMotion: w.bindDriveMotion,
    setPointerAwake: w.setPointerAwake,
    updateHud: w.update,
    dispose() {
      R();
      te();
      clearTimeout(z);
      clearTimeout(W);
      document.removeEventListener("pointerdown", C, true);
      window.removeEventListener("keydown", M);
      l.remove();
    }
  };
}
export const vce = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;
