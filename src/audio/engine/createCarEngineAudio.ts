// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { mixGain } from "../../platform/experiencePreferences.ts";
import { TL, mde, Ade, qE, pde, gde, ude } from "./transients.ts";
import { sde, tde, ode } from "./acoustics.ts";
import { zue, VE, yL, i0, Gue, Vue } from "./settings.ts";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { PositionalAudio } from "three/webgpu";
import { getAudioVolume, subscribeAudioState } from "../audioState.ts";
export const HE = "trapnest-neon:car-volume";
export const yde = .7;
export const SL = .3;
export function bde() {
  try {
    const i = Number(localStorage.getItem(HE));
    return localStorage.getItem(HE) !== null && Number.isFinite(i) ? Math.min(1, Math.max(0, i)) : SL;
  } catch {
    return SL;
  }
}
export async function vL(i, e) {
  const t = await fetch(e).then(r => {
      if (!r.ok) throw new Error(`${e}: ${r.status}`);
      return r.json();
    }),
    s = new URL(t.file, new URL(e, location.href)).href,
    n = await fetch(s).then(r => r.arrayBuffer()).then(r => i.decodeAudioData(r));
  return {
    samples: n.getChannelData(0).slice(),
    sampleRate: n.sampleRate,
    times: t.points.map(r => r[0]),
    freqs: t.points.map(r => r[1]),
    gains: t.points.map(r => r[2]),
    rpmPerHz: t.rpmPerHz,
    cylinders: t.cylinders ?? 8
  };
}
export function xde(i, e = 2) {
  const t = Math.floor(i.sampleRate * e),
    s = i.createBuffer(1, t, i.sampleRate),
    n = s.getChannelData(0);
  let r = 0;
  for (let o = 0; o < t; o++) {
    const a = Math.random() * 2 - 1;
    r = .97 * r + .03 * a;
    n[o] = a * .6 + r * 3;
  }
  return s;
}
export function Mf(i, e) {
  const t = i.createBufferSource();
  t.buffer = e;
  t.loop = true;
  t.loopStart = Math.random();
  t.start(0, Math.random() * e.duration);
  return t;
}
export const na = i => Math.min(1, Math.max(0, i));
export const EL = 6;
export const ML = 8;
export const gd = [.4, .7, 1];
export const _de = 2;
export const wde = .25;
export const Tde = .3;
export const Sde = .035;
export const CL = .012;
export const BL = () => new Promise(i => setTimeout(i, 0));
export async function vde(i, e) {
  const t = await fetch(e).then(a => {
      if (!a.ok) throw new Error(`${e}: ${a.status}`);
      return a.json();
    }),
    s = new URL(t.file, new URL(e, location.href)).href,
    n = await fetch(s).then(a => a.arrayBuffer()).then(a => i.decodeAudioData(a)),
    r = n.getChannelData(0),
    o = n.sampleRate / t.sampleRate;
  return Object.fromEntries(Object.entries(t.takes).map(([a, [l, c]]) => {
    const u = Math.round(l * o);
    return [a, r.slice(u, Math.min(r.length, u + Math.round(c * o)))];
  }));
}
export async function createCarEngineAudio({
  listener: listener,
  car: car,
  engineSampleUrl = TL,
  rpmRange = [900, 7800]
}) {
  const n = listener.context,
    r = await Promise.all([n.audioWorklet.addModule(sde), vL(n, engineSampleUrl)]).then(([, qe]) => qe).catch(qe => (console.warn("[drive-audio] engine sample unavailable, using the synth:", qe), null));
  r || (await n.audioWorklet.addModule(tde));
  const o = zue();
  let a = {};
  const l = {
      ...o
    },
    c = n.createGain(),
    u = n.createDynamicsCompressor(),
    d = n.createGain();
  d.gain.value = 0;
  c.connect(u).connect(d);
  const h = performanceProfile.acoustics ? ode(n, {
      input: c,
      output: u,
      tune: l
    }) : null,
    f = n.createGain();
  f.gain.value = 0;
  const p = n.createGain();
  p.gain.value = 1;
  d.connect(f).connect(listener.getInput());
  d.connect(p);
  const m = new AudioWorkletNode(n, r ? "engine-sampler" : "engine-synth", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [r ? 2 : 1]
    }),
    A = new Map();
  let g = engineSampleUrl;
  r && (A.set(engineSampleUrl, r), m.port.postMessage({
    ...r,
    rpmRange: rpmRange,
    tune: l
  }));
  const b = n.createGain();
  b.gain.value = .55;
  const x = VE.map(qe => {
    const st = n.createBiquadFilter();
    st.type = "peaking";
    st.frequency.value = qe;
    return st;
  });
  x.reduce((qe, st) => qe.connect(st), m).connect(b).connect(c);
  const y = r ? 1 : .52,
    _ = m.parameters.get("rpm"),
    w = m.parameters.get("load"),
    S = m.parameters.get("throttle"),
    T = xde(n),
    v = n.createBiquadFilter();
  v.type = "bandpass";
  v.frequency.value = 950;
  v.Q.value = 9;
  const E = n.createGain();
  E.gain.value = 0;
  let C = Mf(n, T);
  C.connect(v).connect(E);
  E.connect(c);
  let M = null;
  fetch(mde).then(qe => qe.ok ? qe.arrayBuffer() : Promise.reject(new Error(`HTTP ${qe.status}`))).then(qe => n.decodeAudioData(qe)).then(qe => {
    M = n.createBufferSource();
    M.buffer = qe;
    M.loop = true;
    const st = n.createGain();
    st.gain.value = Ade;
    M.connect(st).connect(E);
    M.start(0, Math.random() * qe.duration);
    C.stop();
    v.disconnect();
    C = M;
  }).catch(qe => console.warn("[drive-audio] tire squeal sample unavailable:", qe));
  const B = Mf(n, T),
    R = n.createBiquadFilter();
  R.type = "bandpass";
  R.frequency.value = 1300;
  R.Q.value = 1.1;
  const I = n.createGain();
  I.gain.value = 0;
  const k = n.createGain();
  k.gain.value = 1;
  const L = n.createOscillator();
  L.type = "triangle";
  L.frequency.value = 14;
  const F = n.createGain();
  F.gain.value = 0;
  L.connect(F).connect(k.gain);
  B.connect(R).connect(I).connect(k).connect(c);
  L.start();
  const O = n.createOscillator();
  O.type = "sine";
  O.frequency.value = 2900;
  const H = n.createOscillator();
  H.frequency.value = 2.5;
  const W = n.createGain();
  W.gain.value = 8;
  H.connect(W).connect(O.frequency);
  const P = Mf(n, T),
    z = n.createBiquadFilter();
  z.type = "bandpass";
  z.frequency.value = 2400;
  z.Q.value = .8;
  const Y = n.createGain();
  Y.gain.value = 0;
  P.connect(z).connect(Y).connect(c);
  const G = n.createGain();
  G.gain.value = 0;
  O.connect(G).connect(c);
  O.start();
  H.start();
  const X = Mf(n, T),
    ae = n.createBiquadFilter();
  ae.type = "lowpass";
  ae.frequency.value = 320;
  const ne = n.createGain();
  ne.gain.value = 0;
  X.connect(ae).connect(ne).connect(c);
  const se = Mf(n, T),
    re = n.createBiquadFilter();
  re.type = "bandpass";
  re.frequency.value = 700;
  re.Q.value = .6;
  const le = n.createGain();
  le.gain.value = 0;
  se.connect(re).connect(le).connect(c);
  const we = qe => {
      const st = Array.isArray(qe) ? qe : [qe],
        it = n.createBuffer(st.length, st[0].length, n.sampleRate);
      st.forEach((Mt, Pe) => it.copyToChannel(Mt, Pe));
      return it;
    },
    Se = n.createGain();
  Se.connect(c);
  const ye = {
    bang: [],
    crackle: []
  };
  (async () => {
    for (let qe = 0; qe < Math.max(EL, ML); qe++) await BL(), qe < EL && ye.bang.push(we(qE(n.sampleRate, {
      big: true,
      seed: 101 + qe
    }))), qe < ML && ye.crackle.push(we(qE(n.sampleRate, {
      seed: 1 + qe
    })));
  })();
  const U = n.createGain();
  U.connect(c);
  let J = null;
  fetch(pde).then(qe => qe.ok ? qe.arrayBuffer() : Promise.reject(new Error(`HTTP ${qe.status}`))).then(qe => n.decodeAudioData(qe)).then(qe => {
    J = qe;
  }).catch(qe => console.warn("[drive-audio] nitro turbo sample unavailable:", qe));
  let Q = null,
    j = false;
  function de(qe = .14) {
    if (!Q) return;
    const st = n.currentTime;
    Q.gain.gain.cancelScheduledValues(st);
    Q.gain.gain.setTargetAtTime(0, st, qe);
    Q.src.stop(st + qe * 6);
    Q = null;
  }
  function K() {
    if (!J) return;
    de(.05);
    const qe = n.currentTime,
      st = n.createBufferSource();
    st.buffer = J;
    st.playbackRate.value = .97 + Math.random() * .06;
    const it = n.createGain();
    it.gain.setValueAtTime(1e-4, qe);
    it.gain.exponentialRampToValueAtTime(1, qe + .03);
    st.connect(it).connect(U);
    st.start(qe, .05);
    const Mt = {
      src: st,
      gain: it
    };
    st.onended = () => {
      it.disconnect();
      Q === Mt && (Q = null);
    };
    Q = Mt;
  }
  let V = rpmRange;
  const te = {
      profile: null,
      spin: 0,
      held: 0,
      cooldown: 0,
      hush: 0
    },
    fe = n.createGain();
  fe.connect(c);
  const Ce = n.createGain();
  Ce.channelCount = 1;
  Ce.channelCountMode = "explicit";
  fe.connect(Ce);
  const Ue = n.createChannelMerger(2);
  Ue.connect(c);
  const Ae = [0, 1].map(qe => {
    const st = n.createDelay(1),
      it = n.createBiquadFilter();
    it.type = "highpass";
    it.frequency.value = 250;
    const Mt = n.createBiquadFilter();
    Mt.type = "lowpass";
    Mt.frequency.value = 6500;
    const Pe = n.createGain();
    Ce.connect(st).connect(it).connect(Mt);
    Mt.connect(Pe).connect(st);
    Mt.connect(Ue, 0, qe);
    return {
      delay: st,
      feedback: Pe
    };
  });
  let Be = null,
    He = 0;
  const at = vde(n, gde).catch(qe => (console.warn("[drive-audio] turbo releases unavailable (no blow-off):", qe), null)),
    Re = n.createGain();
  Re.gain.value = 0;
  Re.connect(c);
  const Fe = n.createOscillator(),
    Je = n.createGain();
  Fe.connect(Je).connect(Re);
  Fe.start();
  const je = Mf(n, T),
    Te = n.createBiquadFilter();
  Te.type = "bandpass";
  Te.Q.value = 30;
  const ue = n.createGain();
  je.connect(Te).connect(ue).connect(Re);
  const $ = qe => .375 * Math.sqrt(Math.PI / 2 * (qe / Te.Q.value) / (n.sampleRate / 2));
  function q(qe) {
    te.profile = qe ?? null;
    te.spin = 0;
    te.held = 0;
    const st = ++He;
    Be = qe ? gd.map(() => []) : null;
    qe && (async () => {
      const Mt = await at;
      for (let Pe = 0; Pe < _de && Mt; Pe++) for (let Pt = 0; Pt < gd.length; Pt++) {
        if (await BL(), st !== He) return;
        const ce = gd[Pt],
          ke = ude(n.sampleRate, qe, {
            strength: ce,
            seed: Pe * 7 + Pt + 1,
            takes: Mt
          });
        ke && Be[Pt].push(we(ke));
      }
    })();
    Re.gain.cancelScheduledValues(n.currentTime);
    Re.gain.value = 0;
    const it = qe == null ? undefined : qe.whistle;
    if (it) {
      const Mt = it.tone ?? .3;
      Je.gain.value = CL * Mt * Math.SQRT2;
      ue.gain.value = CL * (1 - Mt) / $(Math.sqrt(it.from * it.to));
    }
  }
  function oe(qe = 1) {
    if (!me || !Be) return;
    const st = na(qe);
    let it = -1;
    for (let ce = 0; ce < gd.length; ce++) Be[ce].length && (it < 0 || Math.abs(gd[ce] - st) < Math.abs(gd[it] - st)) && (it = ce);
    if (it < 0) return;
    const Mt = Be[it],
      Pe = n.createBufferSource();
    Pe.buffer = Mt[Math.floor(Math.random() * Mt.length)];
    Pe.playbackRate.value = .96 + Math.random() * .08;
    const Pt = n.createGain();
    Pt.gain.value = (.35 + .65 * st) / (.35 + .65 * gd[it]);
    Pe.connect(Pt).connect(fe);
    Pe.start(n.currentTime + Sde);
    Pe.onended = () => Pt.disconnect();
  }
  const xe = new PositionalAudio(listener);
  xe.name = "drive-audio";
  xe.setRefDistance(6);
  xe.setRolloffFactor(1.6);
  xe.setDistanceModel("inverse");
  xe.setNodeSource(p);
  xe.position.set(0, .6, 0);
  car.add(xe);
  let me = false,
    ie = false,
    Ne = getAudioVolume(),
    ze = bde();
  const tt = () => {
    const qe = ze / yde;
    d.gain.setTargetAtTime(me && !ie ? Ne * mixGain("effects") * l.master * qe : 0, n.currentTime, .08);
  };
  function dt() {
    u.threshold.value = l.compThreshold;
    u.knee.value = l.compKnee;
    u.ratio.value = l.compRatio;
    u.attack.value = l.compAttack;
    u.release.value = l.compRelease;
    Se.gain.value = l.backfireGain;
    U.gain.value = l.turboGain;
    fe.gain.value = l.blowoffGain;
    Ce.gain.value = l.blowoffEcho;
    Ae.forEach(({
      delay: delay,
      feedback: feedback
    }, it) => {
      delay.delayTime.value = l.blowoffEchoTime * (it ? 1.45 : 1);
      feedback.gain.value = l.blowoffEchoFeedback;
    });
    x.forEach((qe, st) => {
      qe.gain.value = l[`eq${VE[st]}`];
      qe.Q.value = l.eqQ;
    });
    r && m.port.postMessage({
      type: "tune",
      params: Object.fromEntries(yL.map(qe => [qe, l[qe]]))
    });
    tt();
  }
  dt();
  const Lt = subscribeAudioState(({
    isMusicPlaying: isMusicPlaying,
    audioVolume: audioVolume
  }) => {
    me = isMusicPlaying;
    Ne = audioVolume;
    me && n.state !== "running" && n.resume().catch(() => {});
    tt();
  });
  let mt = 0,
    hs = false;
  const ge = {
      rocket: [.85, .9],
      good: [.75, .8],
      spin: [1, 1.4],
      bog: [.35, .4]
    },
    Le = [.95, 1];
  let Oe = 0,
    et = .5,
    lt = "off";
  function Et([qe, st]) {
    qe <= Oe || (Oe = qe, et = st);
  }
  function Gt(qe) {
    if (!!qe === hs) return;
    hs = !!qe;
    const st = n.currentTime;
    f.gain.setTargetAtTime(hs ? 1 : 0, st, .12);
    p.gain.setTargetAtTime(hs ? 0 : 1, st, .12);
  }
  function es(qe, st, it = 1 / 60, Mt = {}) {
    if (Mt.inCar !== undefined && Gt(Mt.inCar), !me) return;
    const Pe = n.currentTime,
      Pt = na(qe.soundLoad ?? qe.load ?? qe.throttle);
    _.setTargetAtTime(qe.rpm, Pe, .012);
    w.setTargetAtTime(Pt, Pe, .03);
    S.setTargetAtTime(qe.throttle, Pe, .02);
    b.gain.setTargetAtTime((l.engineGain + Pt * l.engineLoadGain) * y, Pe, .05);
    const ce = Math.abs(qe.speed),
      ke = qe.brake ?? 0,
      Ie = qe.absActive ? 1 : 0;
    let pt = 0;
    for (const vs of st) pt = Math.max(pt, vs.skid ?? 0);
    pt = Math.max(pt, Ie * ke * na(ce / 20) * .55);
    const kt = qe.launch ?? "off";
    kt === "launch" && lt !== "launch" && Et(ge[qe.launchGrade] ?? ge.good);
    lt = kt;
    const ht = qe.nitro ?? 0;
    ht && !j && Et(Le);
    Oe *= Math.exp(-it / et);
    pt = Math.max(pt, Oe);
    mt += (pt - mt) * Math.min(1, it * 14);
    const ts = Math.pow(na(mt), 1.3);
    E.gain.setTargetAtTime(ts * l.squealGain, Pe, .04);
    const yt = ce > 1.5 ? ke * na(ce / 22) : 0,
      Tt = 1 - .65 * na(ts / .45);
    I.gain.setTargetAtTime(yt * (.3 + Ie * .25) * Tt * l.scrubGain, Pe, .035);
    R.frequency.setTargetAtTime(850 + Math.min(ce, 50) * 16, Pe, .08);
    F.gain.setTargetAtTime(Ie * .5, Pe, .03);
    const js = ke > .25 && ce > .4 && ce < 6 ? (1 - ce / 6) * ke : 0;
    G.gain.setTargetAtTime(js * l.padGain, Pe, .06);
    v.frequency.setTargetAtTime(760 + ts * 520 + Math.min(ce, 40) * 4, Pe, .05);
    M == null || M.playbackRate.setTargetAtTime(.88 + na(ce / 30) * .14 + ts * .04, Pe, .08);
    ht && !j ? K() : !ht && j && de();
    j = !!ht;
    Y.gain.setTargetAtTime(ht * .22, Pe, ht ? .05 : .25);
    z.frequency.setTargetAtTime(1800 + Math.min(ce, 80) * 22, Pe, .1);
    const Cs = te.profile;
    if (Cs) {
      const vs = qe.throttle,
        er = na((qe.rpm - V[0]) / (V[1] - V[0])),
        zt = ht ? 1 : na((er - .3) / .35) * vs ** 1.5;
      te.spin += (zt - te.spin) * Math.min(1, it / (zt > te.spin ? Cs.spool ?? .5 : .9));
      te.cooldown -= it;
      vs > .6 ? (te.held += it, te.hush = 0) : vs < .2 && (te.held > wde && te.spin > Tde && te.cooldown <= 0 && (oe(te.spin), te.cooldown = .4, Cs.spinLevel > 0 && (te.hush = (Cs.length ?? .6) * 2.2)), te.held = 0);
      const Vt = Cs.whistle;
      if (Vt) {
        const Ds = Vt.follows === "rpm",
          $n = Ds ? er : te.spin,
          bo = Vt.from + (Vt.to - Vt.from) * $n;
        Fe.frequency.setTargetAtTime(bo, Pe, .04);
        Te.frequency.setTargetAtTime(bo, Pe, .04);
        const fr = Ds ? $n * (.3 + .7 * Pt) : te.spin ** 2;
        te.hush -= it;
        const Gr = (ht ? .3 : 1) * (te.hush > 0 ? 0 : 1);
        Re.gain.setTargetAtTime(fr * (Vt.level ?? 1) * l.whistleGain * Gr, Pe, te.hush > 0 ? .03 : .06);
      }
    }
    ne.gain.setTargetAtTime(Math.min(1, ce / 45) * l.roadGain, Pe, .1);
    ae.frequency.setTargetAtTime(220 + ce * 6, Pe, .1);
    le.gain.setTargetAtTime(Math.min(1, (ce / 75) ** 2) * l.windGain, Pe, .1);
    re.frequency.setTargetAtTime(500 + ce * 12, Pe, .1);
  }
  function Fs(qe) {
    if (!me) return;
    const st = na(qe / 25e4),
      it = n.currentTime,
      Mt = n.createBufferSource();
    Mt.buffer = T;
    const Pe = n.createBiquadFilter();
    Pe.type = "lowpass";
    Pe.frequency.value = 260 + st * 900;
    const Pt = n.createBiquadFilter();
    Pt.type = "bandpass";
    Pt.frequency.value = 1800 + Math.random() * 900;
    Pt.Q.value = 12;
    const ce = n.createGain();
    ce.gain.setValueAtTime(1e-4, it);
    ce.gain.exponentialRampToValueAtTime(.4 + st * 1.4, it + .008);
    ce.gain.exponentialRampToValueAtTime(1e-4, it + .35 + st * .4);
    Mt.connect(Pe).connect(ce);
    Mt.connect(Pt).connect(ce);
    ce.connect(c);
    Mt.start(it, Math.random());
    Mt.stop(it + .9);
  }
  function In({
    strength = 1,
    main = true
  } = {}) {
    const it = main ? ye.bang : ye.crackle;
    if (!me || !it.length) return;
    const Mt = na(strength),
      Pe = n.createBufferSource();
    Pe.buffer = it[Math.floor(Math.random() * it.length)];
    Pe.playbackRate.value = .92 + Math.random() * .16;
    const Pt = n.createGain();
    Pt.gain.value = main ? .6 + .4 * Mt : .5 + .5 * Mt;
    const ce = n.createStereoPanner();
    ce.pan.value = (Math.random() - .5) * (main ? .3 : .7);
    Pe.connect(Pt).connect(ce).connect(Se);
    Pe.start();
    Pe.onended = () => ce.disconnect();
  }
  return {
    update: es,
    impact: Fs,
    backfire: In,
    blowoff: oe,
    setInCar: Gt,
    setAcoustics(qe) {
      me && (h == null || h.set(qe));
    },
    speaker: xe,
    async setEngine({
      url = TL,
      rpmRange: st = [900, 7800],
      tune = {},
      turbo = null
    } = {}) {
      if (a = {
        ...tune
      }, Object.assign(l, o, a), V = st, q(turbo), !r) {
        dt();
        return;
      }
      let Pe = A.get(url);
      Pe || (Pe = await vL(n, url).catch(ce => (console.warn(`[drive-audio] ${url} unavailable, keeping ${g}:`, ce), null)), Pe && A.set(url, Pe));
      const Pt = n.currentTime;
      b.gain.cancelScheduledValues(Pt);
      b.gain.setTargetAtTime(0, Pt, .02);
      Pe ? (g = url, m.port.postMessage({
        ...Pe,
        rpmRange: st,
        tune: l
      })) : m.port.postMessage({
        type: "tune",
        params: Object.fromEntries(yL.map(ce => [ce, l[ce]]))
      });
      dt();
    },
    tuning: {
      values: l,
      defaults: i0,
      sampled: !!r,
      set(qe, st) {
        !(qe in l) || !Number.isFinite(st) || (l[qe] = st, o[qe] = st, dt(), Gue(o));
      },
      reset() {
        Object.assign(o, i0);
        Object.assign(l, o, a);
        Vue();
        dt();
      },
      changes() {
        return Object.fromEntries(Object.entries(l).filter(([qe, st]) => st !== i0[qe]));
      },
      testBlowoff: () => oe(1)
    },
    get volume() {
      return ze;
    },
    setVolume(qe) {
      ze = Math.min(1, Math.max(0, qe));
      try {
        localStorage.setItem(HE, String(ze));
      } catch {}
      tt();
    },
    setPaused(qe) {
      ie = !!qe;
      ie && (de(.05), j = false, Oe = 0, te.spin = 0, te.held = 0);
      tt();
    },
    dispose() {
      var qe;
      Lt();
      (qe = xe.disconnect) == null || qe.call(xe);
      car.remove(xe);
      de(.02);
      He++;
      for (const st of [C, X, se, B, L, O, H, P]) st.stop();
      Fe.stop();
      je.stop();
      m.disconnect();
    }
  };
}
export const Mde = "/audio/radio/playlist.json";
export const MG = "trapnest-neon:radio";
export const Cde = 1.6;
export function Bde() {
  try {
    return JSON.parse(localStorage.getItem(MG) ?? "{}") ?? {};
  } catch {
    return {};
  }
}
export function Cf(i) {
  try {
    localStorage.setItem(MG, JSON.stringify(i));
  } catch {}
}
