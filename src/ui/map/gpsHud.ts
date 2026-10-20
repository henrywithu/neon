// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { FG, jE, KE, jS } from "../../game/navigation/gpsRibbon.ts";
import { Vector3, Quaternion } from "three/webgpu";
export function createGpsHud() {
  const i = document.createElement("div");
  i.className = "gps-hud";
  i.innerHTML = `
    <svg class="gps-hud__arrow" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L33 31 L20 24 L7 31 Z"/></svg>
    <div class="gps-hud__text">
      <span class="gps-hud__action">CONTINUE</span>
      <span class="gps-hud__distance"></span>
    </div>
    <span class="gps-hud__total"></span>`;
  document.body.appendChild(i);
  const e = i.querySelector(".gps-hud__arrow"),
    t = i.querySelector(".gps-hud__action"),
    s = i.querySelector(".gps-hud__distance"),
    n = i.querySelector(".gps-hud__total");
  let r = false,
    o = 0,
    a = "";
  function l(c, u, d, h, f = u ? FG(u) : null) {
    const p = !!(u && u.length > 2 && d);
    if (p !== r && (r = p, i.classList.toggle("is-visible", p)), !p) return;
    const m = u[Math.min(u.length - 1, 12)],
      A = jE(d.x, d.z, m[0], m[1]),
      g = KE(A - d.heading);
    o += KE(g - o) * Math.min(1, c * 8);
    e.style.transform = `rotate(${-o * 180 / Math.PI}deg)`;
    let b,
      x = "";
    h < 60 ? b = "ARRIVING" : Math.abs(g) > 115 * Math.PI / 180 ? b = "TURN AROUND" : f && f.s < 900 ? (b = f.angle > 140 * Math.PI / 180 ? "U-TURN" : f.turn > 0 ? "TURN LEFT" : "TURN RIGHT", x = jS(f.s)) : b = "CONTINUE";
    const y = `${b}|${x}|${jS(h)}`;
    y !== a && (a = y, t.textContent = b, s.textContent = x, n.textContent = jS(h), i.classList.toggle("is-turn", b.startsWith("TURN") || b === "U-TURN"));
  }
  return {
    update: l,
    hide() {
      r && (r = false, i.classList.remove("is-visible"));
    },
    dispose() {
      i.remove();
    }
  };
}
export const Dl = new Vector3();
export const jn = new Quaternion();
export const qc = new Vector3();
