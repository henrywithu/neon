// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { eF, Gge, dv, uv, Zk, Uge, zge, Vge, tF } from "./race.ts";
import { Vector3 } from "three/webgpu";
import { vehicleFlags } from "./protocol.ts";
export const Qge = (i, e, t) => {
  const s = Math.min(1, Math.max(0, (i - e) / (t - e)));
  return s * s * (3 - 2 * s);
};
export function createConvoy({
  drive: drive,
  getCars: getCars,
  canDraft = () => true,
  canBonus = () => true
}) {
  const n = document.createElement("div");
  n.className = "mp-convoy";
  n.setAttribute("aria-hidden", "true");
  n.innerHTML = `
    <div class="mp-convoy__chip" data-chip="draft"><span>SLIPSTREAM</span><i></i></div>
    <div class="mp-convoy__chip" data-chip="tandem"><span>TANDEM DRIFT</span><b>×${eF}</b></div>`;
  document.body.appendChild(n);
  const r = n.querySelector('[data-chip="draft"]'),
    o = r.querySelector("i"),
    a = n.querySelector('[data-chip="tandem"]');
  let l = 0,
    c = false,
    u = false,
    d = -1;
  function h(m, A) {
    var x, y, _, w;
    (y = (x = drive.vehicle).setDraft) == null || y.call(x, m);
    (w = (_ = drive.driftScore) == null ? undefined : _.setBonus) == null || w.call(_, A ? eF : 1);
    const g = m > .06;
    g !== c && (c = g, r.classList.toggle("is-on", g));
    const b = Math.round(m * 20) * 5;
    g && b !== d && (d = b, o.style.setProperty("--fill", `${b}%`));
    A !== u && (u = A, a.classList.toggle("is-on", A));
  }
  function f(m) {
    var R;
    if (!drive.isActive() || drive.isPaused()) {
      l = 0;
      h(0, false);
      return;
    }
    const A = getCars(),
      g = drive.vehicle.body,
      b = g.translation(),
      x = g.rotation(),
      y = g.linvel(),
      _ = Math.hypot(y.x, y.z);
    let w = 2 * (x.x * x.z + x.w * x.y),
      S = 1 - 2 * (x.x * x.x + x.y * x.y);
    const T = Math.hypot(w, S) || 1;
    w /= T;
    S /= T;
    const v = !!((R = drive.driftScore) != null && R.state.drifting);
    let E = 0,
      C = false;
    const M = canDraft(),
      B = canBonus();
    for (const I of A) {
      if (I.onFoot || I.age > 600) continue;
      const k = I.x - b.x,
        L = I.z - b.z;
      if (B && v && I.drift && Math.hypot(k, L) < Gge && (C = true), !M || _ < dv || I.speed < dv) continue;
      const F = k * w + L * S;
      if (F < uv || F > Zk || Math.abs(k * S - L * w) > Uge + F * .06 || Math.cos(I.yaw - Math.atan2(w, S)) < .85) continue;
      const O = 1 - (F - uv) / (Zk - uv),
        H = Qge(Math.min(_, I.speed), dv, zge);
      E = Math.max(E, Math.pow(O, .8) * H);
    }
    l = Vge(l, E, E > l ? tF.draftUp : tF.draftDown, m);
    l < .005 && (l = 0);
    h(l, C);
  }
  function p() {
    l = 0;
    h(0, false);
  }
  return {
    update: f,
    reset: p,
    get draft() {
      return l;
    },
    dispose() {
      p();
      n.remove();
    }
  };
}
export const hv = new Vector3();
export const Hge = 1 / 15;
export const Wge = 500;
export const fv = .03;
export const $ge = .25;
export const Kge = vehicleFlags.HORN | vehicleFlags.LIGHTS;
export const sF = 20;
export const jge = 230;
export const Yge = 4e4;
export const zf = "#ffd60a";
export const Xge = [1, .84, .04];
