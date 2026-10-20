// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const yr = 140;
export const br = 138;
export const Ya = 135;
export const Ed = 270;
export const QS = 100;
export const Tp = 107;
export const ife = 84;
export const JL = 112;
export const rfe = 120;
export const mb = 132;
export const gb = 152;
export const qS = 212;
export function Sp(i, e) {
  const t = i * Math.PI / 180;
  return [yr + Math.cos(t) * e, br + Math.sin(t) * e];
}
export function yd(i, e, t) {
  const [s, n] = Sp(e, i),
    [r, o] = Sp(t, i),
    a = t - e > 180 ? 1 : 0;
  return `M ${s.toFixed(2)} ${n.toFixed(2)} A ${i} ${i} 0 ${a} 1 ${r.toFixed(2)} ${o.toFixed(2)}`;
}
export const tx = i => Ya + Ed * i;
export const ZL = (i, e) => Math.PI * 2 * i * e / 360;
export function ek(i, e) {
  let t = "";
  for (let s = 0; s <= i; s += 500) {
    const n = s % 1e3 === 0,
      r = tx(s / i),
      [o, a] = Sp(r, n ? Tp - 11 : Tp - 6),
      [l, c] = Sp(r, Tp),
      u = s > e - 500;
    if (t += `<line class="drive-hud__tick${n ? " is-major" : ""}${u ? " is-red" : ""}" x1="${o.toFixed(2)}" y1="${a.toFixed(2)}" x2="${l.toFixed(2)}" y2="${c.toFixed(2)}"/>`, n) {
      const [d, h] = Sp(r, ife);
      t += `<text class="drive-hud__numeral${u ? " is-red" : ""}" x="${d.toFixed(1)}" y="${(h + 4).toFixed(1)}">${s / 1e3}</text>`;
    }
  }
  return t;
}
export function createSpeedometer({
  maxRpm = 8e3,
  redlineRpm = 7600
} = {}) {
  const t = document.createElement("div");
  t.className = "drive-hud";
  const s = redlineRpm / maxRpm,
    n = ZL(QS, Ed),
    r = ZL(mb, qS - gb),
    [o, a] = Sp(gb - 8, mb);
  t.innerHTML = `
    <div class="drive-hud__disc" aria-hidden="true"></div>
    <svg class="drive-hud__dial" viewBox="0 0 280 262" aria-hidden="true">
      <path class="drive-hud__ring" d="${yd(rfe, Ya, Ya + Ed)}"/>
      <path class="drive-hud__track" d="${yd(QS, Ya, Ya + Ed)}"/>
      <path class="drive-hud__red" d="${yd(JL, tx(s), Ya + Ed)}"/>
      <path class="drive-hud__fill" d="${yd(QS, Ya, Ya + Ed)}"
        stroke-dasharray="${n.toFixed(1)}" stroke-dashoffset="${n.toFixed(1)}"/>
      <g class="drive-hud__ticks">${ek(maxRpm, redlineRpm)}</g>
      <g class="drive-hud__needle" transform="rotate(${Ya} ${yr} ${br})">
        <line class="drive-hud__needle-glow" x1="${yr + 62}" y1="${br}" x2="${yr + Tp + 3}" y2="${br}"/>
        <line class="drive-hud__needle-core" x1="${yr + 62}" y1="${br}" x2="${yr + Tp + 3}" y2="${br}"/>
        <line class="drive-hud__needle-hot" x1="${yr + 66}" y1="${br}" x2="${yr + Tp + 1}" y2="${br}"/>
      </g>
      <path class="drive-hud__nitro-track" d="${yd(mb, gb, qS)}"/>
      <path class="drive-hud__nitro-fill" d="${yd(mb, gb, qS)}"
        stroke-dasharray="${r.toFixed(1)}" stroke-dashoffset="0"/>
      <g class="drive-hud__bolt" transform="translate(${(o - 7).toFixed(1)} ${(a + 2).toFixed(1)})">
        <path d="M8 0 L1 10 H6 L4 18 L12 7 H7 Z"/>
      </g>
      <text class="drive-hud__rpm-label" x="${yr}" y="${br - 44}">RPM</text>
      <text class="drive-hud__speed" x="${yr}" y="${br + 14}">0</text>
      <text class="drive-hud__unit" x="${yr}" y="${br + 32}">km/h</text>
      <text class="drive-hud__gear" x="${yr}" y="${br + 66}">N</text>
      <text class="drive-hud__mode" x="${yr}" y="${br + 84}">AUTO</text>
    </svg>
    <div class="drive-hud__flags">
      <span class="drive-hud__flag" data-flag="tcs">TCS</span>
      <span class="drive-hud__flag" data-flag="abs">ABS</span>
      <span class="drive-hud__flag" data-flag="esc">ESC</span>
    </div>`;
  document.body.appendChild(t);
  const l = document.createElement("div");
  l.className = "drive-hint";
  l.innerHTML = [["W S", "Accel / brake"], ["A D", "Steer"], ["Space", "Drift"], ["Shift", "Nitro"], ["Q E", "Gears"], ["C", "Camera"], ["R", "Reset"], ["F", "Exit car"], ["Tab", "Map"], ["M", "Radio"], ["J", "Achievements"]].map(([C, M]) => `<span class="drive-hint__item"><kbd>${C}</kbd>${M}</span>`).join("") + '<span class="drive-hint__item drive-hint__item--help"><kbd>H</kbd>All controls</span>';
  document.body.appendChild(l);
  const c = document.createElement("div");
  c.className = "drive-toast";
  document.body.appendChild(c);
  const u = t.querySelector(".drive-hud__speed"),
    d = t.querySelector(".drive-hud__gear"),
    h = t.querySelector(".drive-hud__mode"),
    f = t.querySelector(".drive-hud__fill"),
    p = t.querySelector(".drive-hud__needle"),
    m = t.querySelector(".drive-hud__nitro-fill"),
    A = t.querySelector('[data-flag="tcs"]'),
    g = t.querySelector('[data-flag="abs"]'),
    b = t.querySelector('[data-flag="esc"]'),
    x = t.querySelector(".drive-hud__red"),
    y = {
      speed: -1,
      gear: "",
      mode: "",
      arc: -1,
      red: null,
      tcs: null,
      abs: null,
      esc: null,
      tcsOff: null,
      nitro: -1,
      burning: null
    };
  let _ = null,
    w = null,
    S = 0;
  function T(C, {
    automatic = true,
    tcsEnabled = true
  } = {}, R = 1 / 60) {
    const I = Math.round(Math.abs(C.travelKmh ?? C.speedKmh));
    I !== y.speed && (u.textContent = String(I), y.speed = I);
    const k = C.gear === -1 ? "R" : C.gear === 0 ? "N" : String(C.gear);
    k !== y.gear && (d.textContent = k, y.gear = k);
    const L = automatic ? "AUTO" : "MAN";
    L !== y.mode && (h.textContent = L, y.mode = L);
    S += (C.rpm - S) * Math.min(1, R * 18);
    const F = Math.min(1, Math.max(0, S / maxRpm)),
      O = Math.round(F * 540) / 540;
    O !== y.arc && (f.setAttribute("stroke-dashoffset", (n * (1 - O)).toFixed(1)), p.setAttribute("transform", `rotate(${tx(O).toFixed(2)} ${yr} ${br})`), y.arc = O);
    const H = S >= redlineRpm;
    H !== y.red && (t.classList.toggle("is-redline", H), y.red = H);
    C.tcsActive !== y.tcs && (A.classList.toggle("is-on", C.tcsActive), y.tcs = C.tcsActive);
    !tcsEnabled !== y.tcsOff && (A.classList.toggle("is-off", !tcsEnabled), y.tcsOff = !tcsEnabled);
    C.absActive !== y.abs && (g.classList.toggle("is-on", C.absActive), y.abs = C.absActive);
    const W = !!C.escActive;
    W !== y.esc && (b.classList.toggle("is-on", W), y.esc = W);
    const P = Math.round((C.nitroCharge ?? 1) * 100);
    P !== y.nitro && (m.setAttribute("stroke-dashoffset", (r * (1 - P / 100)).toFixed(1)), t.classList.toggle("is-nitro-empty", P < 3), y.nitro = P);
    const z = !!C.nitro;
    z !== y.burning && (t.classList.toggle("is-nitro-burning", z), y.burning = z);
  }
  function v(C) {
    t.classList.toggle("is-visible", C);
    document.body.classList.toggle("is-driving", C);
    const M = B => {
      l.classList.toggle("is-visible", B);
      document.body.classList.toggle("drive-hint-on", B);
    };
    clearTimeout(_);
    M(C);
    C && (_ = setTimeout(() => M(false), 9e3));
  }
  function E(C, M = 1400) {
    c.textContent = C;
    c.classList.add("is-visible");
    clearTimeout(w);
    w = setTimeout(() => c.classList.remove("is-visible"), M);
  }
  return {
    update: T,
    setVisible: v,
    flash: E,
    setRedline(C, M = maxRpm) {
      redlineRpm = C;
      M !== maxRpm && (maxRpm = M, t.querySelector(".drive-hud__ticks").innerHTML = ek(maxRpm, redlineRpm));
      x.setAttribute("d", yd(JL, tx(redlineRpm / maxRpm), Ya + Ed));
    },
    showHint: () => v(true),
    dispose() {
      clearTimeout(_);
      clearTimeout(w);
      document.body.classList.remove("is-driving", "drive-hint-on");
      t.remove();
      l.remove();
      c.remove();
    }
  };
}
export const $E = 2 * Math.PI * 28;
export const tk = 3;
export const sk = 1.4;
export const afe = `
  <svg class="hud-life-ring" viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="driftRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f472b6" />
        <stop offset="50%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(168,85,247,0.15)" stroke-width="2" />
    <circle class="drift-hud__timer" cx="32" cy="32" r="28" fill="none" stroke="url(#driftRingGrad)"
      stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${$E.toFixed(1)}"
      stroke-dashoffset="${$E.toFixed(1)}" transform="rotate(-90 32 32)" />
    <g class="hud-life-ticks">
      ${Array.from({
  length: 24
}, (i, e) => {
  const t = e * 2 * Math.PI / 24,
    s = 32 + Math.cos(t) * 24,
    n = 32 + Math.sin(t) * 24,
    r = 32 + Math.cos(t) * 27,
    o = 32 + Math.sin(t) * 27;
  return `<line x1="${s}" y1="${n}" x2="${r}" y2="${o}" stroke="rgba(34,211,238,0.5)" stroke-width="1" />`;
}).join("")}
    </g>
  </svg>
`;
export const HS = i => Math.round(i).toLocaleString("en-US");
export const nk = i => String(Math.round(i)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
