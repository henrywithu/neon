// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { maxDrivers, publicRooms, lobbyUrl } from "./protocol.ts";
import { zme } from "./transport.ts";
import { phosphorIcon } from "../ui/core/phosphorIcons.ts";
export const Gme = 1e4;
export const Lo = Object.freeze({
  title: "ONLINE",
  brand: `PUBLIC ROOMS · UP TO ${maxDrivers} DRIVERS`,
  loading: "LOOKING FOR OPEN ROOMS…",
  fullTitle: "THE GAME IS A HIT",
  full: "EVERY ROOM IS FULL RIGHT NOW. COME BACK SOON AND TRY AGAIN.",
  maintenanceTitle: "ROOMS ARE BEING PREPARED",
  maintenance: "ROOMS ARE BEING PREPARED AND CLEANED FOR THE NEXT DRIVERS. COME BACK IN A FEW HOURS.",
  filled: "THAT ROOM JUST FILLED UP · PICK ANOTHER",
  idle: "YOUR SEAT WAS RELEASED · YOU WERE PARKED TOO LONG",
  tooMany: "TOO MANY CONNECTIONS FROM THIS NETWORK",
  oldLink: "THAT LINK IS FROM THE OLD INVITES · PICK A ROOM BELOW",
  lost: "THE ROOM SERVER STOPPED ANSWERING"
});
export const Vme = i => Number.isFinite(i) ? Math.max(0, Math.min(maxDrivers, Math.floor(i))) : 0;
export async function VG(i, {
  timeout = zme,
  fetchImpl = globalThis.fetch
} = {}) {
  if (!i || typeof fetchImpl != "function") return {
    kind: "down"
  };
  const s = typeof AbortController == "function" ? new AbortController() : null;
  let n = 0;
  const r = new Promise((o, a) => {
    n = setTimeout(() => {
      s == null || s.abort();
      a(new Error("lobby timeout"));
    }, timeout);
  });
  try {
    const o = await Promise.race([fetchImpl(i, {
      signal: s == null ? undefined : s.signal,
      cache: "no-store"
    }), r]);
    if (!o.ok) {
      const u = await o.json().catch(() => null);
      return u && u.open === false && !u.error ? {
        kind: "closed",
        reopenAt: u.reopenAt ?? null
      } : {
        kind: "down"
      };
    }
    const a = await o.json();
    if (!a || typeof a.open != "boolean" || !Array.isArray(a.rooms)) return {
      kind: "down"
    };
    if (!a.open) return {
      kind: "closed",
      reopenAt: Number.isFinite(a.reopenAt) ? a.reopenAt : null
    };
    const l = new Map(a.rooms.map(u => [String(u == null ? undefined : u.id), Vme(u == null ? undefined : u.count)]));
    return {
      kind: "rooms",
      rooms: publicRooms.map(({
        id: id,
        name: name
      }) => ({
        id: id,
        name: name,
        count: l.get(id) ?? 0,
        max: maxDrivers
      }))
    };
  } catch {
    return {
      kind: "down"
    };
  } finally {
    clearTimeout(n);
  }
}
export const QG = 3;
export const qG = 8;
export function Qme({
  attempts: attempts,
  answer = null,
  offline = false
}) {
  return offline ? false : attempts >= qG ? true : attempts >= QG && answer !== null && answer.kind !== "rooms";
}
export function qme(i) {
  return !i || i.kind !== "rooms" ? "maintenance" : i.rooms.every(e => e.count >= e.max) ? "full" : "open";
}
export function Hme(i) {
  let e = null;
  for (const t of i) t.count >= t.max || (!e || t.count > e.count) && (e = t);
  return (e == null ? undefined : e.id) ?? null;
}
export const Wme = 2500;
export const zk = i => String(i).replace(/[&<>"]/g, e => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
})[e]);
export function $me({
  state = null,
  getRoom = () => null,
  onJoin: onJoin,
  onLeave: onLeave,
  onToggle = null,
  canOpen = () => true,
  fetchImpl = undefined
}) {
  var v;
  const a = document.createElement("div");
  a.className = "lby";
  a.hidden = true;
  a.setAttribute("data-ui-block-look", "true");
  a.innerHTML = `
    <div class="lby__veil" data-close="true"></div>
    <section class="lby__panel" role="dialog" aria-modal="true" aria-label="Online rooms">
      <header class="lby__head">
        <h2>${Lo.title}</h2>
        <p class="lby__brand">${Lo.brand}</p>
        <button type="button" class="lby__close" data-close="true" aria-label="Close (Esc)">${phosphorIcon("x")}</button>
      </header>
      <div class="lby__body">
        <p class="lby__notice" role="status" hidden></p>
        <div class="lby__banner" role="status" hidden>
          <span class="lby__banner-icon"></span>
          <h3></h3>
          <p></p>
        </div>
        <ul class="lby__rooms"></ul>
      </div>
      <footer class="lby__bar">
        <p class="lby__hint">↑ ↓ PICK · ENTER JOIN · R REFRESH · ESC CLOSE</p>
        <div class="lby__actions">
          <button type="button" class="lby-btn lby-btn--ghost" data-leave="true" hidden>${phosphorIcon("sign-out")}<span>LEAVE ROOM</span></button>
          <button type="button" class="lby-btn lby-btn--ghost" data-refresh="true">${phosphorIcon("arrow-clockwise")}<span>REFRESH</span></button>
          <button type="button" class="lby-btn lby-btn--main" data-quick="true"><span>QUICK JOIN</span></button>
        </div>
      </footer>
    </section>`;
  document.body.appendChild(a);
  const l = {
    notice: a.querySelector(".lby__notice"),
    banner: a.querySelector(".lby__banner"),
    bannerIcon: a.querySelector(".lby__banner-icon"),
    bannerTitle: a.querySelector(".lby__banner h3"),
    bannerText: a.querySelector(".lby__banner p"),
    list: a.querySelector(".lby__rooms"),
    leave: a.querySelector("[data-leave]"),
    refresh: a.querySelector("[data-refresh]"),
    quick: a.querySelector("[data-quick]")
  };
  let c = false,
    u = "loading",
    d = null,
    h = 0,
    f = 0,
    p = 0,
    m = 0,
    A = "";
  const g = () => (d == null ? undefined : d.kind) === "rooms" ? d.rooms : publicRooms.map(({
    id: id,
    name: name
  }) => ({
    id: id,
    name: name,
    count: 0,
    max: maxDrivers
  }));
  function b() {
    const E = getRoom(),
      C = g(),
      M = u !== "maintenance";
    a.dataset.phase = u;
    l.notice.hidden = !A;
    l.notice.textContent = A;
    const B = {
      loading: null,
      open: null,
      full: ["flag-checkered", Lo.fullTitle, Lo.full],
      maintenance: ["wrench", Lo.maintenanceTitle, Lo.maintenance]
    }[u];
    l.banner.hidden = !B;
    B && (l.bannerIcon.innerHTML = phosphorIcon(B[0]), l.bannerTitle.textContent = B[1], l.bannerText.textContent = B[2]);
    u === "loading" && (l.banner.hidden = false, l.bannerIcon.innerHTML = phosphorIcon("arrow-clockwise"), l.bannerTitle.textContent = Lo.loading, l.bannerText.textContent = "");
    l.list.hidden = !M;
    h = Math.min(h, C.length - 1);
    l.list.innerHTML = C.map((R, I) => {
      const k = R.id === E,
        L = R.count >= R.max && !k,
        F = u === "loading" ? "" : k ? "YOU ARE HERE" : L ? "FULL" : R.count === 0 ? "BE FIRST" : "JOIN",
        O = Array.from({
          length: R.max
        }, (H, W) => `<i class="${W < R.count ? "is-on" : ""}"></i>`).join("");
      return `<li><button type="button" class="lby-room${I === h ? " is-selected" : ""}${L ? " is-full" : ""}${k ? " is-here" : ""}" data-room="${zk(R.id)}" ${L || k || u === "loading" ? 'aria-disabled="true"' : ""}>
          <span class="lby-room__name">${zk(R.name.toUpperCase())}</span>
          <span class="lby-room__pips" aria-hidden="true">${O}</span>
          <span class="lby-room__count">${u === "loading" ? "…" : `${R.count}/${R.max}`}</span>
          <span class="lby-room__go">${F}</span>
        </button></li>`;
    }).join("");
    l.leave.hidden = !E;
    l.quick.hidden = u !== "open";
    l.refresh.querySelector("span").textContent = u === "maintenance" || u === "full" ? "TRY AGAIN" : "REFRESH";
  }
  async function x({
    force = false
  } = {}) {
    const C = performance.now();
    if (!force && C - p < Wme) return;
    p = C;
    const M = ++m,
      B = await VG(lobbyUrl(), fetchImpl ? {
        fetchImpl: fetchImpl
      } : undefined);
    M !== m || !c || (d = B, u = qme(B), b());
  }
  function y() {
    clearInterval(f);
    f = setInterval(() => {
      c && !document.hidden && x({
        force: true
      });
    }, Gme);
  }
  function _(E, {
    notice = "",
    closed = false
  } = {}) {
    var B, R;
    if (E = !!E, E === c) {
      E && (A = notice, closed && (d = {
        kind: "closed"
      }, u = "maintenance"), b(), x({
        force: true
      }));
      return;
    }
    E && !canOpen() || (c = E, a.hidden = !c, c ? (A = notice, h = 0, d = closed ? {
      kind: "closed"
    } : null, u = closed ? "maintenance" : "loading", b(), document.pointerLockElement && ((B = document.exitPointerLock) == null || B.call(document)), (R = state == null ? undefined : state.openPanel) == null || R.call(state, "lobby"), requestAnimationFrame(() => a.classList.add("is-open")), y(), x({
      force: true
    })) : (m += 1, clearInterval(f), a.classList.remove("is-open"), (state == null ? undefined : state.openedPanel) === "lobby" && state.closePanel()), onToggle == null || onToggle(c));
  }
  function w(E) {
    if (!E || u === "loading") return;
    const C = g().find(M => M.id === E);
    !C || E === getRoom() || C.count >= C.max || (_(false), onJoin == null || onJoin(E));
  }
  a.addEventListener("click", E => {
    const C = E.target;
    if (!(C instanceof Element)) return;
    const M = C.closest("[data-room]");
    M ? w(M.dataset.room) : C.closest("[data-leave]") ? (onLeave == null || onLeave(), A = "", b()) : C.closest("[data-refresh]") ? x() : C.closest("[data-quick]") ? w(Hme(g().filter(B => B.id !== getRoom()))) : C.closest("[data-close]") && _(false);
  });
  function S(E) {
    var M;
    if (!c || E.metaKey || E.ctrlKey || E.altKey) return;
    const C = g();
    switch (E.code) {
      case "Escape":
        E.preventDefault(), E.stopImmediatePropagation(), _(false);
        break;
      case "ArrowDown":
      case "ArrowUp":
        E.preventDefault(), E.stopImmediatePropagation(), u !== "maintenance" && (h = (h + (E.code === "ArrowDown" ? 1 : -1) + C.length) % C.length, b());
        break;
      case "Enter":
      case "NumpadEnter":
        E.preventDefault(), E.stopImmediatePropagation(), E.repeat || (u === "maintenance" || u === "full" ? x() : w((M = C[h]) == null ? undefined : M.id));
        break;
      case "KeyR":
        E.preventDefault(), E.stopImmediatePropagation(), x();
        break;
    }
  }
  window.addEventListener("keydown", S, true);
  const T = (v = state == null ? undefined : state.subscribe) == null ? undefined : v.call(state, ({
    openedPanel: openedPanel
  }) => {
    c && openedPanel !== "lobby" && _(false);
  });
  return {
    root: a,
    open: E => _(true, E),
    close: () => _(false),
    toggle: () => _(!c),
    refreshView: () => c && b(),
    get isOpen() {
      return c;
    },
    dispose() {
      clearInterval(f);
      window.removeEventListener("keydown", S, true);
      T == null || T();
      a.remove();
    }
  };
}
export const Kme = Math.PI * 2;
export const jme = .36;
