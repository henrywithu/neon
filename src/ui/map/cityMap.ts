// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { cc } from "./markers.ts";
import { L2 } from "../../game/missions/definitions.ts";
import { yb } from "./minimap.ts";
import { bG } from "../../game/sigils/placements.ts";
export const ak = [25, 50, 100, 200, 250, 500, 1e3, 2e3];
export const Rf = 250;
export function createCityMap({
  url: url,
  bounds: bounds,
  viewBounds = bounds,
  highways = [],
  labels = [],
  canOpen = () => true,
  canOpenWithEscape = () => true,
  getPlayer: getPlayer,
  getRoute: getRoute,
  onWaypoint: onWaypoint,
  onTeleport = null,
  canTeleport = () => false,
  canPing = () => false,
  onPing = null,
  onToggle: onToggle
}) {
  var ue;
  const m = document.createElement("div");
  m.className = "citymap";
  m.setAttribute("role", "dialog");
  m.setAttribute("aria-label", "City map");
  m.innerHTML = `
    <canvas class="citymap__canvas"></canvas>
    <div class="citymap__scan" aria-hidden="true"></div>
    <div class="citymap__corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <header class="citymap__top">
      <div class="citymap__title"><b>METRO</b><span>// CITY GRID</span></div>
      <div class="citymap__coords" aria-hidden="true">X +0000 · Z +0000</div>
      <button type="button" class="citymap__close">CLOSE <kbd>TAB</kbd></button>
    </header>
    <aside class="citymap__legend">
      <h3>LEGEND</h3>
      <ul>
        <li><i class="citymap__swatch citymap__swatch--you"></i>YOU</li>
        <li><i class="citymap__swatch citymap__swatch--waypoint"></i>WAYPOINT</li>
        <li><i class="citymap__swatch citymap__swatch--route"></i>GPS ROUTE</li>
        <li>${cc("flag", {
    size: 16,
    className: "citymap__swatch-badge"
  })}MISSION</li>
        <li>${cc(L2, {
    size: 16,
    className: "citymap__swatch-badge"
  })}STREET RACE</li>
        <li><i class="citymap__swatch citymap__swatch--sigil"></i>NEON SIGIL</li>
        <li>${cc("garage", {
    size: 16,
    className: "citymap__swatch-badge",
    variant: "garage"
  })}GARAGE · CLICK TO ENTER</li>
        <li class="citymap__room" hidden><i class="citymap__swatch" style="--c:#22d3ee"></i>FRIEND · CLICK FOR GPS</li>
        <li class="citymap__room" hidden><i class="citymap__swatch" style="--c:#ffd60a"></i>PING · SHIFT + CLICK</li>
        ${highways.map(($, q) => `<li><i class="citymap__swatch" style="--c:${yb[q % yb.length]}"></i>${$.name.toUpperCase()}</li>`).join("")}
      </ul>
    </aside>
    <div class="citymap__route">
      <span class="citymap__route-label">NO WAYPOINT</span>
      <span class="citymap__route-value">CLICK THE MAP TO SET ONE</span>
    </div>
    <button type="button" class="citymap__teleport" hidden><kbd>T</kbd><span>TELEPORT HERE</span></button>
    <div class="citymap__controls">
      <button type="button" data-act="in" aria-label="Zoom in">+</button>
      <button type="button" data-act="out" aria-label="Zoom out">−</button>
      <button type="button" data-act="center" aria-label="Center on player">◎</button>
    </div>
    <div class="citymap__scale" aria-hidden="true"><i></i><span>200 M</span></div>
    <footer class="citymap__hints">
      <span><kbd>DRAG</kbd> PAN</span>
      <span><kbd>WHEEL</kbd> ZOOM</span>
      <span><kbd>CLICK</kbd> WAYPOINT</span>
      <span><kbd>RMB</kbd> CLEAR</span>
      <span class="citymap__room" hidden><kbd>SHIFT</kbd> <kbd>CLICK</kbd> PING THE ROOM</span>
      <span><kbd>C</kbd> CENTER</span>
      ${onTeleport ? "<span><kbd>T</kbd> <kbd>DBL-CLICK</kbd> TELEPORT</span>" : ""}
      <span><kbd>TAB</kbd> <kbd>ESC</kbd> CLOSE</span>
    </footer>`;
  document.body.appendChild(m);
  const A = m.querySelector("canvas"),
    g = A.getContext("2d"),
    b = m.querySelector(".citymap__coords"),
    x = m.querySelector(".citymap__route-label"),
    y = m.querySelector(".citymap__route-value"),
    _ = m.querySelector(".citymap__teleport"),
    w = _.querySelector("span");
  let S = "";
  const T = m.querySelector(".citymap__scale i"),
    v = m.querySelector(".citymap__scale span"),
    E = new Image();
  let C = false;
  E.onload = () => {
    C = true;
  };
  E.src = url;
  const M = () => E.width / (bounds.maxX - bounds.minX),
    B = highways.map(($, q) => {
      const oe = $.points[Math.floor($.points.length * .42)] ?? $.points[0];
      return {
        text: $.name.toUpperCase(),
        x: oe[0],
        z: oe[2],
        color: yb[q % yb.length]
      };
    }),
    R = bG();
  let I = null,
    k = null,
    L = false,
    F = 0,
    O = 1,
    H = 1,
    W = 1;
  const P = {
    x: 0,
    z: 0,
    scale: .55
  };
  let z = null,
    Y = "";
  const G = () => .92 * Math.min(H / (viewBounds.maxX - viewBounds.minX), W / (viewBounds.maxZ - viewBounds.minZ)),
    X = 1.1,
    ae = () => {
      P.scale = Math.max(G(), Math.min(X, P.scale));
      P.x = Math.max(viewBounds.minX, Math.min(viewBounds.maxX, P.x));
      P.z = Math.max(viewBounds.minZ, Math.min(viewBounds.maxZ, P.z));
    },
    ne = ($, q) => [($ - P.x) * P.scale + H / 2, (q - P.z) * P.scale + W / 2],
    se = ($, q) => ({
      x: ($ - H / 2) / P.scale + P.x,
      z: (q - W / 2) / P.scale + P.z
    });
  function re($, q = H / 2, oe = W / 2) {
    const xe = se(q, oe);
    P.scale *= $;
    P.scale = Math.max(G(), Math.min(X, P.scale));
    P.x = xe.x - (q - H / 2) / P.scale;
    P.z = xe.z - (oe - W / 2) / P.scale;
    ae();
  }
  function le() {
    const $ = getPlayer == null ? undefined : getPlayer();
    $ && (P.x = $.x, P.z = $.z, ae());
  }
  function we() {
    O = Math.min(2, window.devicePixelRatio || 1);
    H = m.clientWidth || window.innerWidth;
    W = m.clientHeight || window.innerHeight;
    A.width = Math.round(H * O);
    A.height = Math.round(W * O);
    ae();
  }
  function Se($) {
    g.beginPath();
    $.forEach(([q, oe], xe) => {
      const [me, ie] = ne(q, oe);
      xe ? g.lineTo(me, ie) : g.moveTo(me, ie);
    });
  }
  function ye($) {
    var Ne;
    if (g.setTransform(1, 0, 0, 1, 0, 0), g.fillStyle = "#04070e", g.fillRect(0, 0, A.width, A.height), g.setTransform(O, 0, 0, O, 0, 0), C) {
      const ze = P.scale / M(),
        [tt, dt] = ne(bounds.minX, bounds.minZ);
      g.save();
      g.imageSmoothingEnabled = P.scale < 1.2;
      g.setTransform(O * ze, 0, 0, O * ze, tt * O, dt * O);
      g.drawImage(E, 0, 0);
      g.restore();
    }
    g.lineWidth = 1;
    g.strokeStyle = "rgba(34, 211, 238, 0.07)";
    g.beginPath();
    const q = se(0, 0),
      oe = se(H, W);
    for (let ze = Math.ceil(q.x / Rf) * Rf; ze <= oe.x; ze += Rf) {
      const tt = Math.round(ne(ze, 0)[0]) + .5;
      g.moveTo(tt, 0);
      g.lineTo(tt, W);
    }
    for (let ze = Math.ceil(q.z / Rf) * Rf; ze <= oe.z; ze += Rf) {
      const tt = Math.round(ne(0, ze)[1]) + .5;
      g.moveTo(0, tt);
      g.lineTo(H, tt);
    }
    if (g.stroke(), g.textAlign = "center", g.textBaseline = "middle", P.scale < 1.6) {
      g.font = `700 ${Math.round(11 + P.scale * 6)}px Orbitron, sans-serif`;
      for (const ze of labels) {
        const [tt, dt] = ne(ze.x, ze.z);
        g.fillStyle = "rgba(4, 7, 14, 0.7)";
        g.fillText(ze.text, tt + 1, dt + 1);
        g.fillStyle = "rgba(226, 232, 255, 0.5)";
        g.fillText(ze.text, tt, dt);
      }
    }
    g.font = "600 10px Orbitron, sans-serif";
    for (const ze of B) {
      const [tt, dt] = ne(ze.x, ze.z),
        Lt = g.measureText(ze.text).width + 14;
      g.fillStyle = "rgba(4, 7, 14, 0.82)";
      g.fillRect(tt - Lt / 2, dt - 9, Lt, 18);
      g.strokeStyle = ze.color;
      g.strokeRect(tt - Lt / 2 + .5, dt - 8.5, Lt - 1, 17);
      g.fillStyle = ze.color;
      g.fillText(ze.text, tt, dt + .5);
    }
    const {
      route: xe,
      waypoint: me
    } = (getRoute == null ? undefined : getRoute()) ?? {};
    ((Ne = xe == null ? undefined : xe.points) == null ? undefined : Ne.length) > 1 && (g.lineJoin = "round", g.lineCap = "round", Se(xe.points), g.strokeStyle = "rgba(255, 45, 154, 0.35)", g.lineWidth = 11, g.stroke(), g.strokeStyle = "#ff2d9a", g.lineWidth = 4, g.stroke(), g.setLineDash([2, 14]), g.lineDashOffset = -$ * .03, g.strokeStyle = "rgba(255, 255, 255, 0.9)", g.lineWidth = 2, g.stroke(), g.setLineDash([]));
    U($);
    me && J(...ne(me.x, me.z), $);
    const ie = getPlayer == null ? undefined : getPlayer();
    ie && Q(...ne(ie.x, ie.z), ie.heading, $);
    z && (g.strokeStyle = "rgba(34, 211, 238, 0.55)", g.lineWidth = 1, g.beginPath(), g.moveTo(z.x - 14, z.y + .5), g.lineTo(z.x - 5, z.y + .5), g.moveTo(z.x + 5, z.y + .5), g.lineTo(z.x + 14, z.y + .5), g.moveTo(z.x + .5, z.y - 14), g.lineTo(z.x + .5, z.y - 5), g.moveTo(z.x + .5, z.y + 5), g.lineTo(z.x + .5, z.y + 14), g.stroke());
    K(ie, xe, me);
  }
  function U($) {
    const q = (I == null ? undefined : I()) ?? [];
    k = null;
    let oe = 1 / 0;
    for (const xe of q) {
      if (xe.kind === "sigil" && xe.done) continue;
      const [me, ie] = ne(xe.x, xe.z);
      if (xe.kind === "zone") {
        g.beginPath();
        g.arc(me, ie, xe.radius * P.scale, 0, Math.PI * 2);
        g.fillStyle = "rgba(255, 214, 10, 0.06)";
        g.fill();
        g.setLineDash([8, 6]);
        g.lineWidth = 2;
        g.strokeStyle = "rgba(255, 214, 10, 0.85)";
        g.stroke();
        g.setLineDash([]);
        continue;
      }
      if (!(me < -40 || ie < -40 || me > H + 40 || ie > W + 40)) {
        if (xe.kind === "mission" || xe.kind === "garage") {
          const Ne = xe.kind === "garage" ? R(xe.icon, 28, false, "garage") : R(xe.icon, 26, xe.done);
          if (g.drawImage(Ne, me - Ne.cssSize / 2, ie - Ne.cssSize / 2, Ne.cssSize, Ne.cssSize), xe.kind === "garage") {
            g.font = "700 9px Orbitron, sans-serif";
            g.fillStyle = "rgba(4, 7, 14, 0.85)";
            const ze = g.measureText("GARAGE").width + 12;
            g.fillRect(me - ze / 2, ie + 17, ze, 14);
            g.fillStyle = "#4ade80";
            g.fillText("GARAGE", me, ie + 27.5);
          }
        } else {
          const Ne = ($ * 8e-4 + xe.x % 1) % 1;
          g.strokeStyle = xe.color;
          g.globalAlpha = .6 * (1 - Ne);
          g.lineWidth = 1.5;
          g.beginPath();
          g.arc(me, ie, 5 + Ne * 14, 0, Math.PI * 2);
          g.stroke();
          g.globalAlpha = 1;
          g.save();
          g.translate(me, ie);
          g.rotate(Math.PI / 4);
          g.fillStyle = xe.color;
          g.fillRect(-4.5, -4.5, 9, 9);
          g.lineWidth = 1.5;
          g.strokeStyle = "#04070e";
          g.strokeRect(-4.5, -4.5, 9, 9);
          g.restore();
        }
        if (z) {
          const Ne = Math.hypot(z.x - me, z.y - ie);
          Ne < (xe.kind === "sigil" ? 11 : 16) && Ne < oe && (oe = Ne, k = {
            ...xe,
            sx: me,
            sy: ie
          });
        }
      }
    }
    if (k) {
      const xe = k,
        me = xe.name.toUpperCase(),
        ie = xe.kind === "mission" ? `${xe.race ? "STREET RACE" : "MISSION"}${xe.done ? xe.race ? " · WON" : " · PASSED" : ""}` : xe.kind === "garage" ? "CLICK TO ENTER" : xe.kind === "ping" ? "PING · CLICK FOR GPS" : xe.kind === "friend" ? "DRIVING WITH YOU · CLICK FOR GPS" : "NEON SIGIL";
      g.font = "700 11px Orbitron, sans-serif";
      const Ne = Math.max(g.measureText(me).width, g.measureText(ie).width * .8) + 22,
        ze = xe.sx - Ne / 2,
        tt = xe.sy - 58;
      g.fillStyle = "rgba(4, 7, 14, 0.9)";
      g.fillRect(ze, tt, Ne, 38);
      g.fillStyle = xe.kind === "mission" ? "#ffd60a" : xe.kind === "garage" ? "#4ade80" : xe.color;
      g.fillRect(ze, tt, 3, 38);
      g.textAlign = "left";
      g.fillStyle = "#fff";
      g.fillText(me, ze + 11, tt + 14);
      g.font = "600 8.5px Orbitron, sans-serif";
      g.fillStyle = "rgba(34, 211, 238, 0.9)";
      g.fillText(ie, ze + 11, tt + 29);
      g.textAlign = "center";
    }
  }
  function J($, q, oe) {
    const xe = oe * .0012 % 1;
    g.strokeStyle = `rgba(255, 214, 10, ${.8 * (1 - xe)})`;
    g.lineWidth = 2;
    g.beginPath();
    g.arc($, q, 8 + xe * 22, 0, Math.PI * 2);
    g.stroke();
    g.save();
    g.translate($, q);
    g.rotate(Math.PI / 4);
    g.fillStyle = "#ffd60a";
    g.fillRect(-7, -7, 14, 14);
    g.fillStyle = "#04070e";
    g.fillRect(-2.5, -2.5, 5, 5);
    g.restore();
  }
  function Q($, q, oe, xe) {
    const me = xe * 9e-4 % 1;
    g.strokeStyle = `rgba(255, 45, 154, ${.7 * (1 - me)})`;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc($, q, 10 + me * 26, 0, Math.PI * 2);
    g.stroke();
    g.save();
    g.translate($, q);
    g.rotate(Math.PI - oe);
    g.fillStyle = "#ff2d9a";
    g.beginPath();
    g.moveTo(0, -12);
    g.lineTo(8, 10);
    g.lineTo(0, 5);
    g.lineTo(-8, 10);
    g.closePath();
    g.fill();
    g.strokeStyle = "#fff";
    g.lineWidth = 1.2;
    g.stroke();
    g.restore();
  }
  const j = $ => $ >= 1e3 ? `${($ / 1e3).toFixed(1)} KM` : `${Math.round($ / 10) * 10} M`,
    de = $ => `${$ < 0 ? "−" : "+"}${String(Math.abs(Math.round($))).padStart(4, "0")}`;
  function K($, q, oe) {
    const xe = ak.filter(Ne => Ne * P.scale <= 140).pop() ?? ak[0];
    if (T.style.width = `${(xe * P.scale).toFixed(1)}px`, v.textContent = j(xe), z) {
      const Ne = se(z.x, z.y),
        ze = $ ? ` · ${j(Math.hypot(Ne.x - $.x, Ne.z - $.z))}` : "";
      b.textContent = `X ${de(Ne.x)} · Z ${de(Ne.z)}${ze}`;
    }
    let me;
    if (q && oe) {
      const Ne = Math.max(1, Math.round(q.length / 15.277777777777777 / 60));
      me = `ROUTE|${j(q.length)} · ~${Ne} MIN`;
    } else oe ? me = "WAYPOINT|NO ROAD ROUTE" : me = "NO WAYPOINT|CLICK THE MAP TO SET ONE";
    if (me !== Y) {
      Y = me;
      const [Ne, ze] = me.split("|");
      x.textContent = Ne;
      y.textContent = ze;
      m.classList.toggle("has-route", !!oe);
    }
    const ie = !oe || !onTeleport ? "none" : canTeleport() ? "ready" : "locked";
    ie !== S && (S = ie, _.hidden = ie === "none", _.disabled = ie === "locked", w.textContent = ie === "locked" ? "TELEPORT LOCKED · MISSION" : "TELEPORT HERE");
  }
  function V($) {
    !$ || !onTeleport || !canTeleport() || onTeleport($) && fe(false);
  }
  function te($) {
    L && (ye($), F = requestAnimationFrame(te));
  }
  function fe($) {
    var q;
    if ($ = !!$, !($ === L || $ && !canOpen())) {
      if (L = $, m.classList.toggle("is-open", L), cancelAnimationFrame(F), L) {
        document.pointerLockElement && ((q = document.exitPointerLock) == null || q.call(document));
        for (const oe of m.querySelectorAll(".citymap__room")) oe.hidden = !(onPing && canPing());
        we();
        le();
        F = requestAnimationFrame(te);
      } else z = null, Be.clear();
      onToggle == null || onToggle(L);
    }
  }
  let Ce = -1 / 0;
  const Ue = (ue = document.exitPointerLock) == null ? undefined : ue.bind(document);
  Ue && (document.exitPointerLock = () => (Ce = performance.now(), Ue()));
  function Ae() {
    document.pointerLockElement || L || performance.now() - Ce < 500 || document.hidden || !document.hasFocus() || canOpen() && canOpenWithEscape() && fe(true);
  }
  document.addEventListener("pointerlockchange", Ae);
  const Be = new Map();
  let He = null,
    at = null;
  const Re = $ => {
    const q = A.getBoundingClientRect();
    return {
      x: $.clientX - q.left,
      y: $.clientY - q.top
    };
  };
  A.addEventListener("pointerdown", $ => {
    if ($.button !== 0) return;
    const q = Re($);
    if (Be.set($.pointerId, q), A.setPointerCapture($.pointerId), Be.size === 1) He = {
      ...q,
      moved: false
    };else {
      He = null;
      const [oe, xe] = [...Be.values()];
      at = {
        distance: Math.hypot(oe.x - xe.x, oe.y - xe.y) || 1
      };
    }
  });
  A.addEventListener("pointermove", $ => {
    const q = Re($);
    $.pointerType === "mouse" && (z = q);
    const oe = Be.get($.pointerId);
    if (oe) {
      if (Be.set($.pointerId, q), at && Be.size >= 2) {
        const [xe, me] = [...Be.values()],
          ie = Math.hypot(xe.x - me.x, xe.y - me.y) || 1;
        re(ie / at.distance, (xe.x + me.x) / 2, (xe.y + me.y) / 2);
        at.distance = ie;
        return;
      }
      He && !He.moved && Math.hypot(q.x - He.x, q.y - He.y) > 5 && (He.moved = true, m.classList.add("is-dragging"));
      He != null && He.moved && (P.x -= (q.x - oe.x) / P.scale, P.z -= (q.y - oe.y) / P.scale, ae());
    }
  });
  const Fe = $ => {
    if (Be.has($.pointerId)) {
      if (Be.delete($.pointerId), Be.size < 2 && (at = null), m.classList.remove("is-dragging"), $.type === "pointerup" && He && !He.moved) {
        const q = Re($);
        if ($.shiftKey && onPing && canPing()) {
          He = null;
          onPing(se(q.x, q.y));
          return;
        }
        const oe = Je(q.x, q.y);
        if (oe != null && oe.onSelect) {
          He = null;
          fe(false);
          oe.onSelect();
          return;
        }
        if (oe) {
          onWaypoint == null || onWaypoint({
            x: oe.x,
            z: oe.z
          }, oe);
          He = null;
          return;
        }
        const {
          waypoint: xe
        } = (getRoute == null ? undefined : getRoute()) ?? {};
        if (xe) {
          const [me, ie] = ne(xe.x, xe.z);
          if (Math.hypot(q.x - me, q.y - ie) < 16) {
            onWaypoint == null || onWaypoint(null);
            He = null;
            return;
          }
        }
        onWaypoint == null || onWaypoint(se(q.x, q.y));
      }
      He = null;
    }
  };
  function Je($, q) {
    let oe = null,
      xe = 1 / 0;
    for (const me of (I == null ? undefined : I()) ?? []) {
      if (me.kind === "sigil" && me.done || me.kind === "zone") continue;
      const [ie, Ne] = ne(me.x, me.z),
        ze = Math.hypot($ - ie, q - Ne);
      ze < (me.kind === "sigil" ? 11 : 16) && ze < xe && (xe = ze, oe = me);
    }
    return oe;
  }
  A.addEventListener("pointerup", Fe);
  A.addEventListener("pointercancel", Fe);
  A.addEventListener("pointerleave", () => {
    z = null;
  });
  A.addEventListener("dblclick", $ => {
    const q = Re($);
    if (onTeleport) V(se(q.x, q.y));else {
      const oe = Je(q.x, q.y);
      onWaypoint == null || onWaypoint(oe ?? se(q.x, q.y), oe);
    }
  });
  _.addEventListener("click", () => {
    var $;
    return V(($ = getRoute == null ? undefined : getRoute()) == null ? undefined : $.waypoint);
  });
  A.addEventListener("contextmenu", $ => {
    $.preventDefault();
    onWaypoint == null || onWaypoint(null);
  });
  A.addEventListener("wheel", $ => {
    $.preventDefault();
    const q = Re($);
    re(Math.exp(-$.deltaY * ($.deltaMode === 1 ? .05 : .0015)), q.x, q.y);
  }, {
    passive: false
  });
  m.querySelector(".citymap__close").addEventListener("click", () => fe(false));
  m.querySelector(".citymap__controls").addEventListener("click", $ => {
    var oe;
    const q = (oe = $.target.closest("button")) == null ? undefined : oe.dataset.act;
    q === "in" ? re(1.5) : q === "out" ? re(1 / 1.5) : q === "center" && le();
  });
  function je($) {
    var me;
    if ($.defaultPrevented) return;
    const q = $.target instanceof HTMLElement ? $.target : null;
    if (q != null && q.matches("input, textarea, select")) return;
    const oe = $.code;
    if (!L) {
      const ie = q == null ? undefined : q.closest("dialog, [role='dialog'], [aria-modal='true']");
      oe === "Tab" && $.type === "keydown" && !ie && !$.altKey && !$.metaKey && !$.ctrlKey && canOpen() ? ($.preventDefault(), $.stopImmediatePropagation(), $.repeat || fe(true)) : oe === "Escape" && $.type === "keydown" && !$.repeat && canOpen() && canOpenWithEscape() && ($.preventDefault(), $.stopImmediatePropagation(), fe(true));
      return;
    }
    if ($.type !== "keydown" || $.metaKey || $.ctrlKey || /^F\d+$/.test(oe) || oe === "KeyM" || oe === "KeyP" || oe === "KeyN") return;
    $.preventDefault();
    $.stopImmediatePropagation();
    const xe = 110 / P.scale;
    (oe === "Tab" || oe === "Escape") && !$.repeat ? fe(false) : oe === "Equal" || oe === "NumpadAdd" || oe === "KeyE" ? re(1.25) : oe === "Minus" || oe === "NumpadSubtract" || oe === "KeyQ" ? re(1 / 1.25) : oe === "KeyC" || oe === "Home" ? le() : oe === "KeyT" && !$.repeat ? V((me = getRoute == null ? undefined : getRoute()) == null ? undefined : me.waypoint) : oe === "Backspace" || oe === "Delete" ? onWaypoint == null || onWaypoint(null) : oe === "ArrowLeft" || oe === "KeyA" ? P.x -= xe : oe === "ArrowRight" || oe === "KeyD" ? P.x += xe : oe === "ArrowUp" || oe === "KeyW" ? P.z -= xe : (oe === "ArrowDown" || oe === "KeyS") && (P.z += xe);
    ae();
  }
  document.addEventListener("keydown", je, true);
  document.addEventListener("keyup", je, true);
  const Te = () => L && we();
  window.addEventListener("resize", Te);
  return {
    root: m,
    open: () => fe(true),
    close: () => fe(false),
    toggle: () => fe(!L),
    get isOpen() {
      return L;
    },
    setMarkerSource($) {
      I = $;
    },
    dispose() {
      cancelAnimationFrame(F);
      document.removeEventListener("keydown", je, true);
      document.removeEventListener("keyup", je, true);
      window.removeEventListener("resize", Te);
      m.remove();
    }
  };
}
export const yfe = {
  boulevard: .9,
  avenue: 1,
  street: 1.15
};
export const bb = 400;
export const bfe = .35;
