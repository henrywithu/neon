// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const SG = 2;
export const lB = "trapnest-neon:engine-tuning";
export const VE = [45, 90, 180, 360, 720, 1400, 2800, 5600];
export const Uue = {
  45: 4.5,
  90: 8,
  5600: 12.5
};
export const cB = [["pitch", "sampler", "pitch (lower = bigger)", .5, 1.3, .01, .98], ["drive", "sampler", "saturation drive", .5, 12, .1, 1.9], ["makeup", "sampler", "output level", .2, 1.2, .01, .73], ["width", "sampler", "stereo width", 0, 1, .01, .2], ["shelfFreq", "sampler", "low shelf freq (Hz)", 60, 400, 5, 135], ["shelfGain", "sampler", "low shelf gain (dB)", -6, 15, .5, 2.5], ["subLevel", "sampler", "sub level", 0, 1, .01, .16], ["subLoad", "sampler", "sub + under load", 0, 1, .01, .3], ["subCutoff", "sampler", "sub cutoff (Hz)", 60, 400, 5, 170], ["mufflerBase", "sampler", "muffler base (Hz)", 60, 4e3, 10, 200], ["mufflerLoad", "sampler", "muffler + load (Hz)", 0, 1e4, 50, 4200], ["mufflerRpm", "sampler", "muffler + rpm (Hz)", 0, 6e3, 50, 0], ["levelBase", "sampler", "level at idle", 0, 1.5, .01, .5], ["levelLoad", "sampler", "level + load", 0, 1.5, .01, 1.06], ["revGain", "sampler", "level + revs", 0, 1.5, .01, .49], ["grainMs", "sampler", "grain length (ms)", 30, 160, 1, 70], ["drift", "sampler", "playhead drift (s)", .01, .2, .005, .06], ["pops", "sampler", "overrun pops", 0, 3, .05, 1], ...VE.map(i => [`eq${i}`, "eq", `${i < 1e3 ? i : `${i / 1e3}k`} Hz (dB)`, -15, 15, .5, Uue[i] ?? 0]), ["eqQ", "eq", "band Q", .3, 4, .05, 2.05], ["engineGain", "mix", "engine gain", 0, 2, .01, .46], ["engineLoadGain", "mix", "engine + load", 0, 1, .01, .19], ["compThreshold", "mix", "compressor threshold (dB)", -40, 0, .5, -1.5], ["compRatio", "mix", "compressor ratio", 1, 20, .1, 8.1], ["compKnee", "mix", "compressor knee (dB)", 0, 30, .5, 17], ["compAttack", "mix", "compressor attack (s)", 0, .1, .001, .021], ["compRelease", "mix", "compressor release (s)", .01, 1, .01, .16], ["squealGain", "mix", "tire squeal", 0, 4, .01, 2], ["scrubGain", "mix", "brake scrub", 0, 2, .01, 1.41], ["padGain", "mix", "brake pad squeal", 0, .3, .005, .05], ["roadGain", "mix", "road noise", 0, 1, .01, .3], ["windGain", "mix", "wind", 0, 1, .01, .26], ["backfireGain", "mix", "exhaust backfire", 0, 3, .01, 1], ["turboGain", "mix", "nitro turbo", 0, 3, .01, 1], ["blowoffGain", "mix", "turbo blow-off", 0, 3, .01, 1], ["whistleGain", "mix", "turbo whistle", 0, 3, .01, 1], ["blowoffEcho", "mix", "turbo echo", 0, 1.5, .01, .75], ["blowoffEchoTime", "mix", "turbo echo time (s)", .04, .4, .005, .12], ["blowoffEchoFeedback", "mix", "turbo echo repeats", 0, .8, .01, .3], ["acousticReverb", "mix", "acoustics reverb", 0, 3, .01, 1], ["acousticEcho", "mix", "acoustics reflections", 0, 3, .01, 1], ["master", "mix", "master", 0, 6, .01, 2.97]];
export const i0 = Object.fromEntries(cB.map(i => [i[0], i[6]]));
export const yL = cB.filter(i => i[1] === "sampler").map(i => i[0]);
export function zue() {
  try {
    const i = JSON.parse(localStorage.getItem(lB) ?? "null");
    if ((i == null ? undefined : i.version) === SG && i.values) return {
      ...i0,
      ...i.values
    };
  } catch {}
  return {
    ...i0
  };
}
export function Gue(i) {
  try {
    localStorage.setItem(lB, JSON.stringify({
      version: SG,
      values: i
    }));
  } catch {}
}
export function Vue() {
  try {
    localStorage.removeItem(lB);
  } catch {}
}
export const Que = {
  sampler: "Engine voice",
  eq: "Engine EQ",
  mix: "Mix · brakes · tires"
};
export function que(i, e) {
  var o, a, l;
  const t = i.createParameters("Engine sound"),
    s = {};
  for (const [c, u, d, h, f, p] of cB) {
    if (u === "sampler" && !e.sampled) continue;
    s[u] || (s[u] = t.addFolder(Que[u]), u !== "sampler" && s[u].close());
    const m = s[u].add(e.values, c, h, f, p).name(d).onChange(A => e.set(c, A));
    (o = m.listen) == null || o.call(m);
  }
  const n = {
      note: "drive and tweak — values persist"
    },
    r = {
      "copy changes": async () => {
        const c = JSON.stringify(e.changes(), null, 2);
        console.info(`[engine sound] changes from defaults:
` + c);
        try {
          await navigator.clipboard.writeText(c);
          n.note = "copied to clipboard ✓";
        } catch {
          n.note = "see the console (clipboard blocked)";
        }
      },
      "copy all values": async () => {
        const c = JSON.stringify(e.values, null, 2);
        console.info(`[engine sound] all values:
` + c);
        try {
          await navigator.clipboard.writeText(c);
          n.note = "copied to clipboard ✓";
        } catch {
          n.note = "see the console (clipboard blocked)";
        }
      },
      "reset to defaults": () => {
        e.reset();
        n.note = "defaults restored";
      },
      "test blow-off": () => {
        var c;
        return (c = e.testBlowoff) == null ? undefined : c.call(e);
      }
    };
  t.add(r, "test blow-off");
  t.add(r, "copy changes");
  t.add(r, "copy all values");
  t.add(r, "reset to defaults");
  (l = (a = t.add(n, "note")).listen) == null || l.call(a);
  return t;
}
export const Hue = 5e3;
export const Wue = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
export function $ue() {
  return `
    <svg class="move-hint__keys" viewBox="0 0 74 48" aria-hidden="true">
      <rect class="move-hint__key move-hint__key--active" x="26" y="0" width="22" height="22" rx="2" />
      <text class="move-hint__key-label move-hint__key-label--active" x="${26 + 22 / 2}" y="${22 / 2}">W</text>

      <rect class="move-hint__key move-hint__key--active" x="0" y="26" width="22" height="22" rx="2" />
      <text class="move-hint__key-label move-hint__key-label--active" x="${22 / 2}" y="${26 + 22 / 2}">A</text>

      <rect class="move-hint__key move-hint__key--active" x="26" y="26" width="22" height="22" rx="2" />
      <text class="move-hint__key-label move-hint__key-label--active" x="${26 + 22 / 2}" y="${26 + 22 / 2}">S</text>

      <rect class="move-hint__key move-hint__key--active" x="52" y="26" width="22" height="22" rx="2" />
      <text class="move-hint__key-label move-hint__key-label--active" x="${52 + 22 / 2}" y="${26 + 22 / 2}">D</text>
    </svg>
  `;
}
