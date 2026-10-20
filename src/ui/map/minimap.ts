// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { bG } from "../../game/sigils/placements.ts";
export function createMinimap({
  url: url,
  bounds: bounds,
  size = 188,
  onClick: onClick
}) {
  const n = document.createElement(onClick ? "button" : "div");
  n.className = "minimap";
  onClick && (n.type = "button", n.classList.add("is-clickable"), n.setAttribute("aria-label", "Open city map (Tab)"), n.title = "City map · Tab", n.addEventListener("click", x => {
    x.stopPropagation();
    onClick();
  }));
  n.innerHTML = `
    <canvas class="minimap__canvas"></canvas>
    <div class="minimap__ring"></div>
    <span class="minimap__north">N</span>
    <svg class="minimap__player" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2 L16 17 L10 13.5 L4 17 Z"/>
    </svg>
    <span class="minimap__label"></span>`;
  document.body.appendChild(n);
  const r = n.querySelector("canvas"),
    o = n.querySelector(".minimap__north"),
    a = n.querySelector(".minimap__label"),
    l = r.getContext("2d"),
    c = Math.min(2, window.devicePixelRatio || 1);
  r.width = Math.round(size * c);
  r.height = Math.round(size * c);
  n.style.setProperty("--minimap-size", `${size}px`);
  const u = new Image();
  let d = false;
  u.onload = () => {
    d = true;
  };
  u.src = url;
  const h = bounds.maxX - bounds.minX,
    f = bG(c);
  let p = null,
    m = 1.6,
    A = 0,
    g = "";
  function b(x, y = 0, _ = "", w = null) {
    var O;
    if (A += 1, !d || A % 2) return;
    const S = 1.5 + Math.min(1.6, Math.abs(y) / 110);
    m += (S - m) * .08;
    const T = r.width,
      v = r.height,
      E = u.width / h,
      C = c / (m * E);
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.fillStyle = "#060a13";
    l.fillRect(0, 0, T, v);
    l.translate(T / 2, v / 2 + v * .12);
    l.rotate(Math.PI + x.heading);
    l.scale(C, C);
    const M = (x.x - bounds.minX) * E,
      B = (x.z - bounds.minZ) * E;
    l.drawImage(u, -M, -B);
    const R = (O = w == null ? undefined : w.route) == null ? undefined : O.points;
    if ((R == null ? undefined : R.length) > 1) {
      l.beginPath();
      for (let H = 0; H < R.length; H++) {
        const W = (R[H][0] - x.x) * E,
          P = (R[H][1] - x.z) * E;
        H ? l.lineTo(W, P) : l.moveTo(W, P);
      }
      l.lineJoin = "round";
      l.lineCap = "round";
      l.strokeStyle = "rgba(255, 45, 154, 0.35)";
      l.lineWidth = 7 * c / C;
      l.stroke();
      l.strokeStyle = "#ff2d9a";
      l.lineWidth = 3 * c / C;
      l.stroke();
    }
    const I = p == null ? undefined : p();
    if (I != null && I.length) {
      const H = Math.cos(Math.PI + x.heading),
        W = Math.sin(Math.PI + x.heading),
        P = T * .43;
      for (const z of I) {
        if (z.kind === "sigil" && z.done) continue;
        if (z.kind === "zone") {
          const ne = (z.x - x.x) * E * C,
            se = (z.z - x.z) * E * C;
          l.setTransform(1, 0, 0, 1, T / 2 + ne * H - se * W, v / 2 + ne * W + se * H + v * .12);
          l.beginPath();
          l.arc(0, 0, z.radius * E * C, 0, Math.PI * 2);
          l.setLineDash([5 * c, 4 * c]);
          l.lineWidth = 2 * c;
          l.strokeStyle = "rgba(255, 214, 10, 0.85)";
          l.stroke();
          l.setLineDash([]);
          continue;
        }
        const Y = (z.x - x.x) * E * C,
          G = (z.z - x.z) * E * C,
          X = Y * H - G * W,
          ae = Y * W + G * H + v * .12;
        if (!(Math.hypot(X, ae) > P)) if (l.setTransform(1, 0, 0, 1, T / 2 + X, v / 2 + ae), z.kind === "mission" || z.kind === "garage") {
          const ne = z.kind === "garage" ? f(z.icon, 18, false, "garage") : f(z.icon, 17, z.done);
          l.drawImage(ne, -ne.width / 2, -ne.height / 2);
        } else {
          const ne = 3.2 * c;
          l.rotate(Math.PI / 4);
          l.fillStyle = z.color;
          l.fillRect(-ne, -ne, ne * 2, ne * 2);
        }
      }
    }
    const k = w == null ? undefined : w.waypoint;
    if (k) {
      const H = (k.x - x.x) * E * C,
        W = (k.z - x.z) * E * C,
        P = Math.cos(Math.PI + x.heading),
        z = Math.sin(Math.PI + x.heading);
      let Y = H * P - W * z,
        G = H * z + W * P + v * .12;
      const X = T * .42,
        ae = Math.hypot(Y, G);
      ae > X && (Y *= X / ae, G *= X / ae);
      l.setTransform(1, 0, 0, 1, T / 2 + Y, v / 2 + G);
      l.rotate(Math.PI / 4);
      const ne = 4.5 * c;
      l.fillStyle = "#ffd60a";
      l.fillRect(-ne, -ne, ne * 2, ne * 2);
      l.fillStyle = "#060a13";
      l.fillRect(-ne * .35, -ne * .35, ne * .7, ne * .7);
    }
    const L = Math.PI + x.heading,
      F = size / 2 - 11;
    if (o.style.transform = `translate(${(Math.sin(L) * F).toFixed(1)}px, ${(-Math.cos(L) * F).toFixed(1)}px)`, w != null && w.waypoint) {
      const H = w.route ? w.route.length : Math.hypot(w.waypoint.x - x.x, w.waypoint.z - x.z);
      _ = `◆ ${H >= 1e3 ? `${(H / 1e3).toFixed(1)} KM` : `${Math.round(H / 10) * 10} M`}`;
    }
    _ !== g && (a.textContent = _, g = _);
  }
  return {
    update: b,
    setMarkerSource(x) {
      p = x;
    },
    setVisible(x) {
      n.classList.toggle("is-visible", x);
    },
    dispose() {
      n.remove();
    }
  };
}
export const yb = ["#22d3ee", "#ff2d9a", "#ff9a1a", "#7dff3a"];
