// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const RL = "/audio/ui/";
export const Nde = {
  hover: ["hover.mp3", .2, 3, 70],
  click: ["click.mp3", .34, 4, 35],
  open: ["open.mp3", .3, 2, 90],
  close: ["close.mp3", .32, 2, 90],
  confirm: ["confirm.mp3", .32, 2, 90],
  celebrate: ["drift-celebrate.mp3", .4, 1, 1200]
};
export const lb = {
  file: "typing.mp3",
  volume: .2,
  gap: 38
};
export const IL = 'button, [role="button"], a[href], summary, select, input[type="checkbox"], input[type="radio"], input[type="range"], label[for]';
export const NL = /\b(close|dismiss|cancel)\b/i;
export const LL = i => i.disabled || i.getAttribute("aria-disabled") === "true";
export function Lde(i) {
  const e = i.getChannelData(0),
    t = Math.max(1, Math.round(i.sampleRate * .0025)),
    s = [];
  let n = 0;
  for (let a = 0; a + t <= e.length; a += t) {
    let l = 0;
    for (let u = a; u < a + t; u++) l += e[u] * e[u];
    const c = Math.sqrt(l / t);
    s.push(c);
    n = Math.max(n, c);
  }
  const r = [];
  let o = true;
  s.forEach((a, l) => {
    o && a > n * .3 ? (r.push(Math.max(0, l - 1) * t / i.sampleRate), o = false) : !o && a < n * .1 && (o = true);
  });
  return r.map((a, l) => [a, Math.min(.05, (r[l + 1] ?? i.duration) - a - .002)]);
}
export function kde(i) {
  var e;
  return i.dataset.close !== undefined || i.dataset.act === "close" || i.dataset.uiSound === "close" ? true : NL.test(i.getAttribute("aria-label") ?? "") || NL.test(((e = i.className) == null ? undefined : e.baseVal) ?? i.className ?? "");
}
