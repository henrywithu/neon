// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { mixGain } from "../../platform/experiencePreferences.ts";
import { ane, lne } from "../../platform/userPreferences.ts";
import { isAudioPlaying, subscribeAudioState } from "../audioState.ts";
import { gsap } from "gsap";
export const CG = "/audio/voice";
export const ihe = (i, e, t) => `${CG}/${i}/${e}.mp3?v=${t}`;
export function GL(i, e) {
  const t = `${i}|${e}`;
  let s = 2166136261;
  for (let n = 0; n < t.length; n++) s = Math.imul(s ^ t.charCodeAt(n), 16777619);
  return (s >>> 0).toString(16).padStart(8, "0");
}
export const rhe = `${CG}/manifest.json`;
export const ohe = 3;
export const cb = .012;
export const DS = {
  highpass: 280,
  lowpass: 3900,
  drive: 1.6
};
export function ahe(i) {
  const e = new Float32Array(1024);
  for (let t = 0; t < e.length; t++) {
    const s = t / (e.length - 1) * 2 - 1;
    e[t] = Math.tanh(s * i) / Math.tanh(i);
  }
  return e;
}
export function createVoice({
  context: context
} = {}) {
  if (!context) return null;
  let e = ane() !== false,
    t = null,
    s = null,
    n = null,
    r = false;
  const o = new Set(),
    a = new Set(),
    l = new Map(),
    c = context.createDynamicsCompressor();
  c.threshold.value = -18;
  c.ratio.value = 3;
  const voiceMix = context.createGain();
  c.connect(voiceMix); voiceMix.connect(context.destination);
  const syncMix = () => voiceMix.gain.setTargetAtTime(mixGain("voice"), context.currentTime, .08);
  syncMix(); window.addEventListener("neon:preferences", syncMix);
  const u = context.createBiquadFilter();
  u.type = "highpass";
  u.frequency.value = DS.highpass;
  const d = context.createBiquadFilter();
  d.type = "lowpass";
  d.frequency.value = DS.lowpass;
  const h = context.createWaveShaper();
  h.curve = ahe(DS.drive);
  u.connect(h);
  h.connect(d);
  d.connect(c);
  const f = () => e && isAudioPlaying();
  function p(_) {
    if (_ !== r) {
      r = _;
      for (const w of o) w(_);
    }
  }
  function m() {
    t || s || !e || (s = (async () => {
      var _;
      try {
        const w = await fetch(rhe);
        t = w.ok ? ((_ = await w.json().catch(() => null)) == null ? undefined : _.lines) ?? {} : {};
      } catch {
        s = null;
      }
    })());
    return s;
  }
  function A(_, w, S) {
    let T = l.get(w);
    if (T) return l.delete(w), l.set(w, T), T;
    for (T = fetch(ihe(_, w, S.v)).then(v => {
      if (!v.ok) throw new Error(`voice clip ${v.status}`);
      return v.arrayBuffer();
    }).then(v => context.decodeAudioData(v)), T.catch(() => l.delete(w)), l.set(w, T); l.size > ohe;) l.delete(l.keys().next().value);
    return T;
  }
  function g(_, {
    natural = false,
    replaced = false
  } = {}) {
    if (_.over) return;
    _.over = true;
    const {
      gain: T,
      source: v
    } = _;
    if (v) {
      const E = () => {
        v.disconnect();
        T.disconnect();
        _.source = _.gain = null;
      };
      if (natural) E();else {
        const C = context.currentTime;
        try {
          T.gain.cancelScheduledValues(C);
          T.gain.setValueAtTime(T.gain.value, C);
          T.gain.linearRampToValueAtTime(0, C + cb);
          v.stop(C + cb + .005);
        } catch {}
        setTimeout(E, (cb + .05) * 1e3);
      }
    }
    n === _ && (n = null, replaced || p(false));
  }
  function b(_, w, {
    id = GL(_, w),
    priority = 1,
    delay = 0,
    comms = false
  } = {}) {
    var R, I, k;
    if (!f()) return null;
    if (!t) return m(), null;
    const C = t[id];
    if (!C || n && !n.over && priority < n.priority) return null;
    n && g(n, {
      replaced: true
    });
    context.state !== "running" && ((k = (R = context.resume) == null ? undefined : (I = R.call(context)).catch) == null || k.call(I, () => {}));
    const M = {
      id: id,
      who: _,
      priority: priority,
      duration: C.dur,
      over: false,
      failed: false,
      source: null,
      gain: null,
      stop: () => g(M)
    };
    n = M;
    p(true);
    const B = performance.now() + delay * 1e3;
    A(_, id, C).then(L => {
      if (M.over) return;
      if (!f()) {
        M.failed = true;
        g(M);
        return;
      }
      const F = context.createBufferSource();
      F.buffer = L;
      const O = context.createGain(),
        H = Math.max(context.currentTime, context.currentTime + (B - performance.now()) / 1e3);
      O.gain.setValueAtTime(0, H);
      O.gain.linearRampToValueAtTime(1, H + cb);
      F.connect(O);
      O.connect(comms ? u : c);
      F.onended = () => g(M, {
        natural: true
      });
      F.start(H);
      M.source = F;
      M.gain = O;
    }).catch(() => {
      M.failed = true;
      g(M);
    });
    return M;
  }
  function x() {
    n && g(n);
  }
  function y(_) {
    if (_ = !!_, _ !== e) {
      e = _;
      lne(_);
      _ ? m() : (x(), l.clear());
      for (const w of a) w(e);
    }
  }
  subscribeAudioState(({
    isMusicPlaying: isMusicPlaying
  }) => {
    isMusicPlaying || x();
  });
  return {
    say: b,
    stop: x,
    prefetch(_, w, {
      id = GL(_, w)
    } = {}) {
      var v;
      if (!e) return;
      const T = () => {
        const E = t == null ? undefined : t[id];
        E && A(_, id, E).catch(() => {});
      };
      t ? T() : (v = m()) == null || v.then(T);
    },
    get enabled() {
      return e;
    },
    setEnabled: y,
    subscribe(_) {
      a.add(_);
      _(e);
      return () => a.delete(_);
    },
    onSpeaking(_) {
      o.add(_);
      return () => o.delete(_);
    },
    state: () => ({
      enabled: e,
      soundOn: isAudioPlaying(),
      speaking: r,
      current: n && {
        who: n.who,
        id: n.id,
        priority: n.priority
      },
      clips: t ? Object.keys(t).length : null,
      cached: [...l.keys()]
    })
  };
}
function createRainGlassIntro({
  pipeline: pipeline,
  intensity = .05,
  speed = 6,
  blurRadius = 2.5,
  distortionStrength = .28,
  dropSize = .45
} = {}) {
  const o = pipeline == null ? undefined : pipeline.introRainGlass;
  if (!o) throw new Error("createRainGlassIntro requires pipeline.introRainGlass");
  let a = false,
    l = null;
  o.intensity.value = intensity;
  o.speed.value = speed;
  o.blurRadius.value = blurRadius;
  o.distortionStrength.value = distortionStrength;
  o.dropSize.value = dropSize;
  o.amount.value = 1;
  function c() {}
  function u({
    duration = 1.2
  } = {}) {
    return new Promise(f => {
      if (a) {
        f();
        return;
      }
      l == null || l.kill();
      const p = {
        amount: o.amount.value
      };
      l = gsap.to(p, {
        amount: 0,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          o.amount.value = p.amount;
        },
        onComplete: f
      });
    });
  }
  function d() {
    var h;
    a || (a = true, l == null || l.kill(), l = null, o.amount.value = 0, (h = pipeline == null ? undefined : pipeline.disposeIntroRainGlass) == null || h.call(pipeline));
  }
  return {
    update: c,
    fadeOut: u,
    destroy: d
  };
}
export { createRainGlassIntro };
function splitIntroLetters(i, e = "intro-letter") {
  const t = i.textContent.trim();
  i.textContent = "";
  i.setAttribute("aria-label", t);
  return [...t].map(s => {
    const n = document.createElement("span");
    n.className = e;
    n.textContent = s === " " ? " " : s;
    n.setAttribute("aria-hidden", "true");
    i.appendChild(n);
    return n;
  });
}
export { splitIntroLetters };
