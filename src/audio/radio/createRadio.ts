// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Mde, Bde, Cf, Cde } from "../engine/createCarEngineAudio.ts";
import { Audio } from "three/webgpu";
import { isAudioPlaying, getAudioVolume, setAudioPlaying, subscribeAudioState } from "../audioState.ts";
export async function createRadio({
  context: context,
  playlistUrl = Mde
}) {
  const t = await fetch(playlistUrl).then(C => C.ok ? C.json() : {
      tracks: []
    }).catch(() => ({
      tracks: []
    })),
    s = playlistUrl.slice(0, playlistUrl.lastIndexOf("/") + 1),
    n = (t.tracks ?? []).map(C => ({
      ...C,
      src: new URL(C.file, new URL(s, location.href)).href
    })),
    r = {
      volume: 1,
      shuffle: false,
      repeat: "all",
      index: 0,
      on: true,
      ...Bde()
    },
    o = new Map(),
    a = (C, M) => {
      var B;
      return (B = o.get(C)) == null ? undefined : B.forEach(R => R(M));
    },
    l = context.createGain();
  l.gain.value = 0;
  const c = context.createAnalyser();
  c.fftSize = 512;
  c.smoothingTimeConstant = .78;
  l.connect(c);
  c.connect(context.destination);
  function u() {
    const C = new Audio();
    C.preload = "auto";
    C.crossOrigin = "anonymous";
    const M = context.createGain();
    M.gain.value = 0;
    context.createMediaElementSource(C).connect(M).connect(l);
    C.addEventListener("ended", () => {
      C === h.el && v(1, true);
    });
    C.addEventListener("timeupdate", () => {
      C === h.el && a("time", C.currentTime);
    });
    C.addEventListener("error", () => {
      if (!(C !== h.el || !C.src)) {
        if (n[f].unavailable = true, a("track", f), n.every(B => B.unavailable)) {
          S({
            remember: false
          });
          return;
        }
        p && v(1, true);
      }
    });
    return {
      el: C,
      gain: M
    };
  }
  const d = [u(), u()];
  let h = d[0],
    f = Math.min(r.index ?? 0, Math.max(0, n.length - 1)),
    p = false,
    m = isAudioPlaying(),
    A = [],
    g = 1;
  function b(C = .12) {
    const M = p && m ? r.volume * getAudioVolume() * 1.6 * g : 0;
    l.gain.setTargetAtTime(M, context.currentTime, C);
  }
  function x(C) {
    var R;
    if (!n.length || !n.filter(I => !I.unavailable).length) return -1;
    let B = y(C);
    for (let I = 0; I < n.length && (R = n[B]) != null && R.unavailable; I++) B = (B + C + n.length) % n.length;
    return B;
  }
  function y(C) {
    if (r.shuffle && C > 0) {
      if (n.length === 1) return 0;
      let M = f;
      for (; M === f;) M = Math.floor(Math.random() * n.length);
      return M;
    }
    return r.shuffle && C < 0 && A.length ? A.pop() : (f + C + n.length) % n.length;
  }
  async function _(C, {
    autoplay = true,
    fade = true
  } = {}) {
    if (!n[C]) return;
    C !== f && A.push(f);
    A.length > 32 && A.shift();
    f = C;
    r.index = f;
    Cf(r);
    const R = h,
      I = d[0] === h ? d[1] : d[0];
    if (I.el.src = n[f].src, I.el.currentTime = 0, h = I, a("track", f), !autoplay) {
      R.el.pause();
      R.gain.gain.setValueAtTime(0, context.currentTime);
      I.gain.gain.setValueAtTime(1, context.currentTime);
      return;
    }
    const k = context.currentTime,
      L = fade && !R.el.paused ? Cde : .05;
    I.gain.gain.cancelScheduledValues(k);
    I.gain.gain.setValueAtTime(0, k);
    I.gain.gain.linearRampToValueAtTime(1, k + L);
    R.gain.gain.cancelScheduledValues(k);
    R.gain.gain.setValueAtTime(R.gain.gain.value, k);
    R.gain.gain.linearRampToValueAtTime(0, k + L);
    setTimeout(() => {
      R !== h && R.el.pause();
    }, L * 1e3 + 50);
    await w();
  }
  async function w() {
    n.length && (h.el.src || (h.el.src = n[f].src, h.gain.gain.setValueAtTime(1, context.currentTime)), p = true, m || setAudioPlaying(true), context.state !== "running" && (await context.resume().catch(() => {})), r.on = true, Cf(r), h.gain.gain.setTargetAtTime(1, context.currentTime, .05), await h.el.play().catch(() => {
      p = false;
    }), b(), a("state", {
      playing: p
    }));
  }
  function S({
    remember = true
  } = {}) {
    p = false;
    remember && (r.on = false, Cf(r));
    b();
    const M = h.el;
    setTimeout(() => {
      p || M.pause();
    }, 250);
    a("state", {
      playing: p
    });
  }
  function T() {
    S();
    setTimeout(() => {
      h.el.currentTime = 0;
      a("time", 0);
    }, 260);
  }
  function v(C, M = false) {
    if (M && r.repeat === "one") {
      h.el.currentTime = 0;
      h.el.play().catch(() => {});
      return;
    }
    if (M && r.repeat === "off" && !r.shuffle && f === n.length - 1) {
      S({
        remember: false
      });
      return;
    }
    const B = x(C);
    B >= 0 && _(B, {
      autoplay: p || M,
      fade: !M
    });
  }
  const E = subscribeAudioState(({
    isMusicPlaying: isMusicPlaying
  }) => {
    const M = m;
    if (m = isMusicPlaying, m && !M && r.on && !p) w();else if (!m && M && p) {
      p = false;
      b();
      const B = h.el;
      setTimeout(() => {
        p || B.pause();
      }, 250);
      a("state", {
        playing: p
      });
    } else b();
  });
  return {
    tracks: n,
    analyser: c,
    get index() {
      return f;
    },
    get playing() {
      return p;
    },
    get currentTime() {
      return h.el.currentTime || 0;
    },
    get duration() {
      var C;
      return h.el.duration || ((C = n[f]) == null ? undefined : C.duration) || 0;
    },
    get volume() {
      return r.volume;
    },
    get shuffle() {
      return r.shuffle;
    },
    get repeat() {
      return r.repeat;
    },
    play: C => typeof C == "number" && C !== f ? _(C) : w(),
    pause: () => S(),
    toggle: () => p ? S() : w(),
    stop: T,
    next: () => v(1),
    prev: () => {
      if (h.el.currentTime > 4 && !r.shuffle) {
        h.el.currentTime = 0;
        return;
      }
      v(-1);
    },
    seek(C) {
      const M = h.el.duration;
      Number.isFinite(M) && M > 0 && (h.el.currentTime = Math.max(0, Math.min(M - .1, M * C)));
    },
    setVolume(C) {
      r.volume = Math.max(0, Math.min(1, C));
      Cf(r);
      b();
    },
    setDuck(C) {
      if (C === g) return;
      const M = C < g;
      g = C;
      b(M ? .08 : .35);
    },
    setShuffle(C) {
      r.shuffle = !!C;
      Cf(r);
    },
    cycleRepeat() {
      r.repeat = r.repeat === "all" ? "one" : r.repeat === "one" ? "off" : "all";
      Cf(r);
      return r.repeat;
    },
    on(C, M) {
      o.has(C) || o.set(C, new Set());
      o.get(C).add(M);
      return () => o.get(C).delete(M);
    },
    dispose() {
      E();
      for (const C of d) C.el.pause();
      l.disconnect();
    }
  };
}
export const ab = 112;
export function kS(i) {
  if (!Number.isFinite(i) || i < 0) return "--:--";
  const e = Math.floor(i);
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
export const kl = {
  prev: '<svg viewBox="0 0 16 16"><path d="M3 3h2v10H3zM14 3v10L6 8z"/></svg>',
  play: '<svg viewBox="0 0 16 16"><path d="M4 2.5v11L13.5 8z"/></svg>',
  pause: '<svg viewBox="0 0 16 16"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
  stop: '<svg viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/></svg>',
  next: '<svg viewBox="0 0 16 16"><path d="M11 3h2v10h-2zM2 3v10l8-5z"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  voiceOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H11l-5 4v-4H4z" fill="currentColor"/></svg>',
  voiceOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H11l-5 4v-4H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
};
