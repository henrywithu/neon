// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { wp } from "../../multiplayer/protocol.ts";
import { Mge } from "./createFriendsPanel.ts";
export function Cge(i) {
  return i instanceof HTMLElement ? i.tagName === "INPUT" || i.tagName === "TEXTAREA" || i.tagName === "SELECT" || i.isContentEditable : false;
}
export function createQuickChat({
  state = null,
  canOpen = () => true,
  onSay: onSay,
  onPing: onPing,
  onOpen = null
}) {
  var f;
  const r = document.createElement("div");
  r.className = "mp-chat";
  r.hidden = true;
  r.setAttribute("data-ui-block-look", "true");
  r.setAttribute("role", "menu");
  r.setAttribute("aria-label", "Quick chat");
  const o = [...wp.map((p, m) => [String(m + 1), p, () => onSay == null ? undefined : onSay(m)]), [String(wp.length + 1), "PING HERE", () => onPing == null ? undefined : onPing()]];
  r.innerHTML = '<span class="mp-chat__title">QUICK CHAT <kbd>Y</kbd></span>';
  for (const [p, m, A] of o) {
    const g = document.createElement("button");
    g.type = "button";
    g.className = "mp-chat__row";
    g.setAttribute("role", "menuitem");
    g.innerHTML = `<kbd>${p}</kbd><span>${m}</span>`;
    g.addEventListener("pointerdown", b => b.stopPropagation());
    g.addEventListener("click", () => {
      u();
      A();
    });
    r.appendChild(g);
  }
  document.body.appendChild(r);
  let a = false,
    l = 0;
  function c(p) {
    var m;
    p !== a && (a = p, r.hidden = !a, clearTimeout(l), a ? (l = setTimeout(u, Mge), (m = state == null ? undefined : state.openPanel) == null || m.call(state, "quick-chat"), onOpen == null || onOpen()) : (state == null ? undefined : state.openedPanel) === "quick-chat" && state.closePanel());
  }
  function u() {
    c(false);
  }
  const d = (f = state == null ? undefined : state.subscribe) == null ? undefined : f.call(state, ({
    openedPanel: openedPanel
  }) => {
    a && openedPanel !== "quick-chat" && c(false);
  });
  function h(p) {
    var m;
    if (!(p.metaKey || p.ctrlKey || p.altKey)) {
      if (a) {
        const A = (m = /^(?:Digit|Numpad)([1-9])$/.exec(p.code)) == null ? undefined : m[1];
        A && Number(A) <= o.length ? (p.preventDefault(), p.stopImmediatePropagation(), u(), o[Number(A) - 1][2]()) : (p.code === "Escape" || p.code === "KeyY") && (p.preventDefault(), p.stopImmediatePropagation(), u());
        return;
      }
      p.code !== "KeyY" || p.repeat || Cge(p.target) || (state == null ? undefined : state.openedPanel) != null || !canOpen() || (p.preventDefault(), c(true));
    }
  }
  window.addEventListener("keydown", h, true);
  return {
    toggle() {
      a ? u() : (state == null ? undefined : state.openedPanel) == null && canOpen() && c(true);
    },
    close: u,
    get isOpen() {
      return a;
    },
    dispose() {
      u();
      d == null || d();
      window.removeEventListener("keydown", h, true);
      clearTimeout(l);
      r.remove();
    }
  };
}
export const Rge = ["#ffd60a", "#d6dbe8", "#f59e0b"];
