// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { afe, HS, $E, tk, sk, nk } from "./speedometer.ts";
export function createDriftHud() {
  const i = document.createElement("div");
  i.className = "cyber-hud drift-hud";
  i.setAttribute("aria-hidden", "true");
  i.innerHTML = `
    <div class="cyber-hud-frame">
      <span class="cyber-hud-corner cyber-hud-corner--tl"></span>
      <span class="cyber-hud-corner cyber-hud-corner--tr"></span>
      <span class="cyber-hud-corner cyber-hud-corner--bl"></span>
      <span class="cyber-hud-corner cyber-hud-corner--br"></span>
      <div class="cyber-hud-inner">
        <div class="hud-avatar drift-hud__avatar">
          ${afe}
          <span class="drift-hud__mult">x1</span>
        </div>
        <div class="hud-stats">
          <div class="hud-vitals">
            <div class="hud-vitals-header">
              <span class="hud-label">DRIFT</span>
              <span class="hud-value drift-hud__total">0</span>
            </div>
            <div class="hud-gauge">
              <div class="hud-gauge-track">
                <div class="hud-gauge-fill drift-hud__fill" style="width: 0%"></div>
              </div>
            </div>
          </div>
          <div class="hud-substats">
            <div class="hud-stat-chip drift-hud__combo-chip">
              <span class="hud-stat-dot hud-stat-dot--energy"></span>
              <span class="hud-label">COMBO</span>
              <span class="hud-value drift-hud__combo">0</span>
            </div>
            <div class="hud-stat-chip">
              <span class="hud-label">BEST</span>
              <span class="hud-value drift-hud__best">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(i);
  const e = document.createElement("div");
  e.className = "drift-combo";
  e.setAttribute("aria-hidden", "true");
  e.innerHTML = `
    <div class="drift-combo__row">
      <span class="drift-combo__points">0</span>
      <span class="drift-combo__mult">x1</span>
    </div>
    <div class="drift-combo__label"><span class="drift-combo__rating">DRIFT</span><b class="drift-combo__detail"></b></div>`;
  document.body.appendChild(e);
  const t = {
      timer: i.querySelector(".drift-hud__timer"),
      mult: i.querySelector(".drift-hud__mult"),
      total: i.querySelector(".drift-hud__total"),
      fill: i.querySelector(".drift-hud__fill"),
      combo: i.querySelector(".drift-hud__combo"),
      best: i.querySelector(".drift-hud__best"),
      bigPoints: e.querySelector(".drift-combo__points"),
      bigMult: e.querySelector(".drift-combo__mult"),
      bigRating: e.querySelector(".drift-combo__rating"),
      bigDetail: e.querySelector(".drift-combo__detail")
    },
    s = {
      total: -1,
      combo: -1,
      best: -1,
      mult: -1,
      fill: -1,
      ring: -1,
      drifting: null,
      chain: null,
      big: "",
      bigMult: -1,
      rating: "",
      detail: "",
      panel: null,
      combo_: null
    };
  let n = false,
    r = false,
    o = 0,
    a = 0,
    l = 0,
    c = null,
    u = null,
    d = null;
  function h(m, A, g) {
    s[m] !== g && (A.textContent = g, s[m] = g);
  }
  function f(m, A = 1 / 60) {
    const g = m.state,
      b = Math.round(g.total);
    b !== s.total && (t.total.textContent = HS(b), s.total = b);
    const x = Math.round(g.combo);
    x !== s.combo && (t.combo.textContent = x > 0 ? `+${HS(x)}` : "0", s.combo = x);
    g.best !== s.best && (t.best.textContent = HS(g.best), s.best = g.best);
    g.multiplier !== s.mult && (t.mult.textContent = `x${g.multiplier}`, i.classList.toggle("is-multiplied", g.multiplier > 1), g.multiplier > s.mult && s.mult > 0 && g.inChain && (e.classList.remove("is-pop"), e.offsetWidth, e.classList.add("is-pop"), clearTimeout(d), d = setTimeout(() => e.classList.remove("is-pop"), 400)), s.mult = g.multiplier);
    const y = g.inChain ? Math.round(m.stepProgress() * 100) : 0;
    y !== s.fill && (t.fill.style.width = `${y}%`, s.fill = y);
    const _ = Math.round(m.graceFraction() * 200) / 200;
    _ !== s.ring && (t.timer.setAttribute("stroke-dashoffset", ($E * (1 - _)).toFixed(1)), s.ring = _);
    g.drifting !== s.drifting && (i.classList.toggle("is-drifting", g.drifting), e.classList.toggle("is-drifting", g.drifting), s.drifting = g.drifting);
    g.inChain !== s.chain && (i.classList.toggle("is-chain", g.inChain), g.inChain && (l = 0), s.chain = g.inChain);
    g.inChain ? (o = tk, a = sk, c = null) : (o = Math.max(0, o - A), a = Math.max(0, a - A));
    const w = r && !document.body.classList.contains("ui-moving-compact"),
      S = n && (g.inChain || o > 0 || w);
    S !== s.panel && (i.classList.toggle("is-visible", S), s.panel = S);
    const T = n && (g.inChain || a > 0);
    T !== s.combo_ && (e.classList.toggle("is-visible", T), T || e.classList.remove("is-banked", "is-lost"), s.combo_ = T);
    g.inChain ? (l += (g.combo - l) * Math.min(1, A * 10), h("big", t.bigPoints, nk(l)), h("bigMult", t.bigMult, `x${g.multiplier}`), h("rating", t.bigRating, g.rating || "DRIFT"), h("detail", t.bigDetail, g.drifting ? `${Math.round(g.angle)}°` : "")) : c ? (h("big", t.bigPoints, nk(c.points)), h("rating", t.bigRating, c.type === "lost" ? "DRIFT LOST" : "BANKED"), h("detail", t.bigDetail, "")) : l = 0;
  }
  function p(m) {
    c = m;
    a = sk;
    o = tk;
    e.classList.remove("is-banked", "is-lost");
    i.classList.remove("is-bank", "is-lost");
    i.offsetWidth;
    const A = m.type === "lost";
    e.classList.add(A ? "is-lost" : "is-banked");
    i.classList.add(A ? "is-lost" : "is-bank");
    clearTimeout(u);
    u = setTimeout(() => i.classList.remove("is-bank", "is-lost"), 900);
  }
  return {
    update: f,
    onEvent: p,
    setUiAwake(m) {
      r = !!m;
    },
    setVisible(m) {
      n = !!m;
      n || (i.classList.remove("is-visible"), e.classList.remove("is-visible", "is-banked", "is-lost"), s.panel = false, s.combo_ = false);
    },
    dispose() {
      clearTimeout(u);
      clearTimeout(d);
      i.remove();
      e.remove();
    }
  };
}
