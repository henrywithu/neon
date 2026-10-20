// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const ik = 1.6;
export const rk = {
  keyboard: "SHIFT",
  gamepad: "L3",
  touch: "NITRO"
};
export const ok = {
  rocket: ["ROCKET LAUNCH", "PERFECT TIMING"],
  good: ["GOOD LAUNCH", "NITRO ON"],
  bog: ["BOGGED", "TOO EARLY"],
  spin: ["WHEELSPIN", "TOO LATE"]
};
export function createLaunchHud(i) {
  const [e, t] = i.zone,
    s = g => `${(Math.min(1, Math.max(0, g)) * 100).toFixed(2)}%`,
    n = document.createElement("div");
  n.className = "launch-hud";
  n.setAttribute("aria-hidden", "true");
  n.innerHTML = `
    <div class="launch-hud__title">LAUNCH CONTROL</div>
    <div class="launch-hud__sub"></div>
    <div class="launch-hud__bar">
      <span class="launch-hud__fill"></span>
      <span class="launch-hud__good" style="left:${s(e - i.goodMargin)};width:${s(t - e + 2 * i.goodMargin)}"></span>
      <span class="launch-hud__zone" style="left:${s(e)};width:${s(t - e)}"></span>
      <span class="launch-hud__ticks"></span>
      <span class="launch-hud__track"><span class="launch-hud__needle"></span></span>
    </div>`;
  document.body.appendChild(n);
  const r = n.querySelector(".launch-hud__title"),
    o = n.querySelector(".launch-hud__sub"),
    a = n.querySelector(".launch-hud__fill"),
    l = n.querySelector(".launch-hud__track");
  let c = false,
    u = 0,
    d = null,
    h = 0;
  const f = {
    mode: "",
    title: "",
    sub: "",
    needle: -1,
    grade: ""
  };
  function p(g, b, x) {
    f[g] !== x && (b.innerHTML = x, f[g] = x);
  }
  function m(g) {
    const b = Math.round(g * 1e3) / 1e3;
    b !== f.needle && (l.style.transform = `translateX(${(b * 100).toFixed(1)}%)`, a.style.transform = `scaleX(${b})`, f.needle = b);
  }
  function A(g, b, x = "keyboard") {
    const y = g.launch ?? "off";
    g.launchCount !== u && (u = g.launchCount, d = {
      grade: g.launchGrade,
      needle: g.launchNeedle,
      t100: NaN
    }, h = ik, n.classList.remove("is-pop"), n.offsetWidth, n.classList.add("is-pop"));
    (y === "blocked" || y === "armed" || y === "timing") && (d = null);
    d && (y === "launch" ? h = ik : h -= b, Number.isFinite(g.launchT100) && !Number.isFinite(d.t100) && (d.t100 = g.launchT100), h <= 0 && (d = null));
    const _ = c ? d ? "result" : y === "launch" || y === "off" ? "" : y : "";
    if (_ !== f.mode) {
      n.classList.toggle("is-visible", _ !== "");
      for (const S of ["blocked", "armed", "timing", "result"]) n.classList.toggle(`is-${S}`, _ === S);
      f.mode = _;
    }
    if (!_) return;
    const w = _ === "result" ? d.grade : "";
    if (w !== f.grade && (n.dataset.grade = w, f.grade = w), _ === "result") {
      const [S, T] = ok[w] ?? ok.bog;
      p("title", r, S);
      p("sub", o, (w === "rocket" || w === "good") && Number.isFinite(d.t100) ? `0–100 KM/H <b>${d.t100.toFixed(2)} S</b>` : T);
      m(d.needle);
      return;
    }
    p("title", r, "LAUNCH CONTROL");
    _ === "blocked" ? p("sub", o, `NITRO NOT FULL <b>${Math.floor((g.nitroCharge ?? 0) * 100)}%</b>`) : _ === "armed" ? (p("sub", o, `HOLD <b>${rk[x] ?? rk.keyboard}</b>`), m(0)) : (p("sub", o, "RELEASE IN THE <b>GREEN</b>"), m(g.launchNeedle ?? 0));
  }
  return {
    update: A,
    setVisible(g) {
      c = !!g;
      c || (d = null, n.classList.remove("is-visible", "is-blocked", "is-armed", "is-timing", "is-result"), f.mode = "");
    },
    dispose() {
      n.remove();
    }
  };
}
