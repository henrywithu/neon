// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { mixGain } from "../platform/experiencePreferences.ts";
import { isAudioPlaying } from "./audioState.ts";
export function createHornAudio({
  context: context,
  volume = .42
} = {}) {
  if (!context) return null;
  const t = context.createGain();
  t.gain.value = volume;
  const s = context.createDynamicsCompressor();
  s.threshold.value = -14;
  s.ratio.value = 4;
  t.connect(s);
  s.connect(context.destination);
  let n = null;
  function r() {
    if (!n) {
      n = context.createBuffer(1, context.sampleRate * .5, context.sampleRate);
      const u = n.getChannelData(0);
      for (let d = 0; d < u.length; d++) u[d] = Math.random() * 2 - 1;
    }
    return n;
  }
  const o = () => { t.gain.setTargetAtTime(volume * mixGain("effects"), context.currentTime, .08); return isAudioPlaying() && context.state === "running"; };
  function a({
    freq: freq,
    freq2 = freq,
    type = "square",
    dur = .12,
    gain = .2,
    delay = 0,
    attack = .004,
    cutoff = 6e3,
    detune = 0
  }) {
    const x = context.currentTime + delay,
      y = context.createOscillator();
    y.type = type;
    y.frequency.setValueAtTime(freq, x);
    freq2 !== freq && y.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), x + dur);
    y.detune.value = detune;
    const _ = context.createBiquadFilter();
    _.type = "lowpass";
    _.frequency.value = cutoff;
    const w = context.createGain();
    w.gain.setValueAtTime(1e-4, x);
    w.gain.exponentialRampToValueAtTime(gain, x + attack);
    w.gain.exponentialRampToValueAtTime(1e-4, x + dur);
    y.connect(_);
    _.connect(w);
    w.connect(t);
    y.start(x);
    y.stop(x + dur + .05);
  }
  function l({
    dur = .3,
    gain = .08,
    delay = 0,
    from = 2e3,
    to = 9e3,
    q = 1.2
  }) {
    const A = context.currentTime + delay,
      g = context.createBufferSource();
    g.buffer = r();
    const b = context.createBiquadFilter();
    b.type = "bandpass";
    b.Q.value = q;
    b.frequency.setValueAtTime(from, A);
    b.frequency.exponentialRampToValueAtTime(to, A + dur);
    const x = context.createGain();
    x.gain.setValueAtTime(1e-4, A);
    x.gain.exponentialRampToValueAtTime(gain, A + .02);
    x.gain.exponentialRampToValueAtTime(1e-4, A + dur);
    g.connect(b);
    b.connect(x);
    x.connect(t);
    g.start(A);
    g.stop(A + dur + .05);
  }
  const c = u => (...d) => {
    o() && u(...d);
  };
  return {
    count: c(() => a({
      freq: 660,
      dur: .16,
      gain: .18,
      cutoff: 3e3
    })),
    go: c(() => {
      a({
        freq: 1320,
        dur: .5,
        gain: .2,
        cutoff: 5e3
      });
      a({
        freq: 660,
        dur: .5,
        gain: .12,
        type: "sawtooth",
        cutoff: 2400
      });
    }),
    checkpoint: c(() => {
      a({
        freq: 880,
        dur: .1,
        gain: .16,
        type: "triangle"
      });
      a({
        freq: 1320,
        dur: .18,
        gain: .16,
        type: "triangle",
        delay: .08
      });
    }),
    pass: c(() => {
      [523.25, 659.25, 783.99, 1046.5].forEach((u, d) => a({
        freq: u,
        dur: .32 + d * .08,
        gain: .14,
        type: "sawtooth",
        cutoff: 3200,
        delay: d * .1
      }));
      a({
        freq: 1046.5,
        dur: .9,
        gain: .1,
        type: "triangle",
        delay: .4
      });
      l({
        dur: .8,
        gain: .05,
        delay: .35,
        from: 3e3,
        to: 12e3
      });
    }),
    fail: c(() => {
      a({
        freq: 440,
        freq2: 90,
        dur: .9,
        gain: .2,
        type: "sawtooth",
        cutoff: 1400
      });
      a({
        freq: 220,
        freq2: 60,
        dur: 1,
        gain: .14,
        type: "square",
        cutoff: 900,
        delay: .05
      });
    }),
    warn: c(() => {
      a({
        freq: 220,
        dur: .12,
        gain: .16,
        type: "square",
        cutoff: 1200
      });
      a({
        freq: 220,
        dur: .12,
        gain: .16,
        type: "square",
        cutoff: 1200,
        delay: .16
      });
    }),
    tick: c(() => a({
      freq: 1760,
      dur: .05,
      gain: .12,
      type: "square",
      cutoff: 4e3
    })),
    hover: c(() => a({
      freq: 1200,
      freq2: 1600,
      dur: .12,
      gain: .07,
      type: "triangle"
    })),
    collect: c(() => {
      [880, 1108.73, 1318.51, 1760, 2217.46].forEach((u, d) => a({
        freq: u,
        dur: .5,
        gain: .08,
        type: "triangle",
        delay: d * .055,
        detune: (d % 2 ? 1 : -1) * 6
      }));
      a({
        freq: 440,
        freq2: 880,
        dur: .6,
        gain: .08,
        type: "sine"
      });
      l({
        dur: .9,
        gain: .05,
        from: 4e3,
        to: 14e3,
        q: 3
      });
    }),
    message: c(() => {
      for (const u of [0, .24]) a({
        freq: 1318.51,
        dur: .08,
        gain: .1,
        type: "triangle",
        delay: u
      }), a({
        freq: 1975.53,
        dur: .15,
        gain: .1,
        type: "triangle",
        delay: u + .07
      });
      a({
        freq: 987.77,
        dur: .4,
        gain: .04,
        type: "sine",
        delay: .31
      });
      l({
        dur: .16,
        gain: .02,
        delay: .01,
        from: 6e3,
        to: 12e3,
        q: 5
      });
    }),
    unlock: c(() => {
      [392, 523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((u, d) => a({
        freq: u,
        dur: .6,
        gain: .12,
        type: "sawtooth",
        cutoff: 3600,
        delay: d * .12
      }));
    }),
    setVolume(u) {
      t.gain.value = u;
    }
  };
}
export const Rme = ["count", "go", "checkpoint", "pass", "fail", "warn", "tick", "hover", "collect", "unlock", "message"];
