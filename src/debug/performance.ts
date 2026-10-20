// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { getStaticPixelRatio, applyPerformanceProfileToPipeline, performanceProfile } from "../platform/performanceProfile.ts";
import { setDevelopmentMode, isDevelopmentMode } from "../platform/userPreferences.ts";
import { G_, UL, zL, Kde } from "../bootstrap/createRenderer.ts";
import { Vector2 } from "three/webgpu";
import { YU } from "../game/vehicles/configurations.ts";
export const v0e = new Set(["tire-spray", "skid-marks", "exhaust-flames", "exhaust-sparks", "city:traffic-lod0", "city:traffic-lod1"]);
export function E0e(i) {
  const e = [];
  i.traverse(t => {
    t.isMesh && v0e.has(t.name) && e.push({
      object: t,
      visible: t.visible,
      frustumCulled: t.frustumCulled,
      count: t.isInstancedMesh ? t.count : null
    });
  });
  for (const {
    object: t
  } of e) t.visible = true, t.frustumCulled = false, t.isInstancedMesh && t.count === 0 && (t.count = 1);
  return () => {
    for (const {
      object: t,
      visible: s,
      frustumCulled: n,
      count: r
    } of e) t.visible = s, t.frustumCulled = n, r !== null && (t.count = r);
  };
}
export function createPerformanceMonitor({
  pipeline: pipeline,
  ground: ground,
  adaptiveDpr = null,
  getAllowAdaptiveSample = null
}) {
  let n = 0,
    r = 0,
    o = performance.now();
  const a = {
    fps: 0,
    dpr: 0
  };
  function l() {
    var p, m;
    r += 1;
    const f = performance.now();
    f - o >= 1e3 && (n = r, a.fps = r, a.dpr = ((p = adaptiveDpr == null ? undefined : adaptiveDpr.getDPR) == null ? undefined : p.call(adaptiveDpr)) ?? c(), ((getAllowAdaptiveSample == null ? undefined : getAllowAdaptiveSample()) ?? true) && ((m = adaptiveDpr == null ? undefined : adaptiveDpr.onFpsSample) == null || m.call(adaptiveDpr, n)), r = 0, o = f);
  }
  function c() {
    return getStaticPixelRatio();
  }
  function u() {
    var f;
    applyPerformanceProfileToPipeline(pipeline);
    (f = ground == null ? undefined : ground.setReflectionEnabled) == null || f.call(ground, performanceProfile.groundReflection);
  }
  function d(f, p) {
    return f in performanceProfile ? (performanceProfile[f] = p, f === "adaptiveDpr" && adaptiveDpr ? adaptiveDpr.setEnabled(!!p) : f === "maxPixelRatio" && adaptiveDpr ? adaptiveDpr.onResize() : u(), performanceProfile) : (console.warn(`[perf] Unknown flag: ${f}`), performanceProfile);
  }
  const h = {
    profile: performanceProfile,
    stats: a,
    getFps: () => n,
    sampleFps: l,
    set: d,
    setGroundReflection(f) {
      return d("groundReflection", !!f);
    },
    setBloom(f) {
      return d("bloom", !!f);
    },
    setSmaa(f) {
      return d("smaa", !!f);
    },
    setAo(f) {
      return d("ao", !!f);
    },
    setCarSurfaceRain(f) {
      return d("carSurfaceRain", !!f);
    },
    setFsr(f, p = performanceProfile.renderScale) {
      performanceProfile.renderScale = p;
      return d("fsr", !!f);
    },
    setAdaptiveDpr(f) {
      return d("adaptiveDpr", !!f);
    },
    getAdaptiveDpr: () => {
      var f;
      return ((f = adaptiveDpr == null ? undefined : adaptiveDpr.getDPR) == null ? undefined : f.call(adaptiveDpr)) ?? getStaticPixelRatio();
    },
    printHelp() {
      console.info(["[perf] Toggle flags: __app.perf.set('groundReflection', false)", "  groundReflection, bloom, smaa, ao, carSurfaceRain, adaptiveDpr", "  fsr (true on desktop), renderScale (0.85), fsrSharpness (0.2) — or setFsr(true, 0.85)", "  upscaleFilter ('catmull' | 'easu'), aaFilter ('smaa' | 'fxaa'); bloomMode at boot: ?bloom=unreal", "  maxPixelRatio (1.5), groundResolutionScale (0.25), groundReflectionFrameSkip (2)", "  carSurfaceRainFadeStart (3.5), carSurfaceRainFadeEnd (5.5)", "  bloomResolutionScale (0.7; mobile 0.5)", "  aoResolutionScale (0.5), aoSamples (6), aoRadius (0.4), aoScale (1.7)", "  smokeEnabled (true), exhaustCount (50), ambientCount (40)", "  planeEnabled (true), billboardsEnabled (true)", "  __app.perf.getFps() / getAdaptiveDpr()", "  Inspector: Settings → Development Mode → Post-processing → Performance"].join(`
`));
    }
  };
  u();
  return {
    perfApi: h,
    perfStats: a,
    sampleFps: l,
    shouldUpdateGroundReflection() {
      return performanceProfile.groundReflection;
    },
    shouldUpdateCarSurfaceRain() {
      return performanceProfile.carSurfaceRain;
    },
    ground: ground
  };
}
export function C0e(i, e) {
  var o, a, l, c, u, d, h, f, p, m;
  const t = i.createParameters("City lights"),
    s = [[(o = e.uniforms) == null ? undefined : o.signGlow, "signs (neon / text)", 0, 6, .05], [(a = e.uniforms) == null ? undefined : a.neonGlow, "tower neon", 0, 3, .05], [(l = e.uniforms) == null ? undefined : l.screenGlow, "LED screens", 0, 3, .05], [(c = e.uniforms) == null ? undefined : c.roomGlow, "lit rooms / curtain walls", 0, 2, .01], [(u = e.uniforms) == null ? undefined : u.windowGlow, "window glass", 0, 3, .05], [(h = (d = e.screens) == null ? undefined : d.uniforms) == null ? undefined : h.gain, "ad screens", 0, 4, .05], [(f = e.lightPools) == null ? undefined : f.intensity, "street light pools", 0, 3, .05]],
    n = {};
  for (const [A, g, b, x, y] of s) A && (n[g] = A, t.add(A, "value", b, x, y).name(g));
  const r = {
    note: "tweak — copy to bake"
  };
  t.add({
    "copy values": async () => {
      const A = JSON.stringify(Object.fromEntries(Object.entries(n).map(([g, b]) => [g, +b.value.toFixed(3)])), null, 2);
      console.info(`[city lights]
` + A);
      try {
        await navigator.clipboard.writeText(A);
        r.note = "copied to clipboard ✓";
      } catch {
        r.note = "see the console (clipboard blocked)";
      }
    }
  }, "copy values");
  (m = (p = t.add(r, "note")).listen) == null || m.call(p);
  return t;
}
export function createInspectorSession({
  renderer: renderer,
  pipeline: pipeline,
  sceneResult: sceneResult,
  world: world,
  cameraDirector: cameraDirector,
  cameraParams: cameraParams,
  applyCameraFovForLayout: applyCameraFovForLayout,
  syncWalkEyeHeight: syncWalkEyeHeight,
  syncLighting: syncLighting,
  syncEnvironmentIntensity: syncEnvironmentIntensity,
  envMapBaseIntensity: envMapBaseIntensity,
  requestShadowMapUpdate: requestShadowMapUpdate,
  adaptiveDpr = null
}) {
  var y;
  const f = new Map();
  function p(_, w) {
    f.set(_, w);
  }
  (y = world.cityApi) != null && y.uniforms && p("city-lights", _ => C0e(_, world.cityApi));
  function m() {
    return null;
  }
  function A() {}
  function g(_, w) {
    {
      setDevelopmentMode(false);
      w == null || w.syncDevelopmentMode(false);
      return;
    }
  }
  function b(_) {
    if (G_(renderer), isDevelopmentMode()) {
      const w = m();
      UL(renderer, w);
      zL(w);
      return;
    }
    Kde(renderer);
  }
  function x() {
    if (!isDevelopmentMode()) return;
    const _ = m();
    renderer.inspector !== _ && UL(renderer, _);
    zL(_);
  }
  return {
    registerPanel: p,
    ensureInspectorSetup: A,
    applyDevelopmentMode: g,
    bootstrapInspector: b,
    revealInspector: x
  };
}
export const R0e = {
  frameMs: [[10, 5], [12.5, 4.5], [14.3, 4], [16.7, 3.5], [20, 3], [25, 2], [33, 1]],
  gpuBusyMs: [[8, 5], [10, 4.5], [12.5, 4], [14.3, 3.5], [16.7, 3], [22, 2], [30, 1]],
  cpuMs: [[4, 5], [5, 4.5], [6, 4], [7, 3.5], [8.3, 3], [12, 2], [16, 1]],
  drawCalls: [[200, 5], [300, 4.5], [400, 4], [500, 3.5], [600, 3], [900, 2], [1200, 1]],
  p99Ms: [[10, 5], [12.5, 4.5], [14.3, 4], [16.7, 3.5], [20, 3], [25, 2], [33, 1]]
};
export function I0e(i, e) {
  if (!(e > i[0][0])) return i[0][1];
  for (let t = 1; t < i.length; t++) {
    const [s, n] = i[t];
    if (e <= s) {
      const [r, o] = i[t - 1];
      return o + (e - r) / (s - r) * (n - o);
    }
  }
  return i[i.length - 1][1];
}
export function createPerformanceProfiler({
  renderer: renderer,
  renderLoop: renderLoop,
  world: world,
  pipeline: pipeline,
  drive: drive,
  cameraDirector: cameraDirector
}) {
  const o = new Map();
  function a(A) {
    var S, T;
    const g = A.renderTarget,
      b = `${A.width}x${A.height}`;
    if (!g) return `canvas ${b}`;
    const x = g.textures ?? (g.texture ? [g.texture] : []),
      y = x.map(v => v == null ? undefined : v.name).filter(Boolean);
    let _ = y.length ? [...new Set(y)].join("+") : g.name || "";
    _ || (_ = A.depthTexture && !x.length ? "depth" : "rt");
    const w = [];
    (S = A.camera) != null && S.isOrthographicCamera && w.push("ortho");
    A.mrt && w.push("mrt");
    A.activeMipmapLevel && w.push(`mip${A.activeMipmapLevel}`);
    (T = x[0]) != null && T.isCubeTexture && w.push("cube");
    return `${_} ${b}${w.length ? ` (${w.join(",")})` : ""}`;
  }
  function l(A, g, b, x, y) {
    const _ = A == null ? undefined : A[g];
    typeof _ == "function" && (A[g] = function (...S) {
      const T = performance.now();
      try {
        return _.apply(this, S);
      } finally {
        x[b] = (x[b] ?? 0) + performance.now() - T;
      }
    }, y.push(() => {
      A[g] = _;
    }));
  }
  async function c(A, g) {
    var T;
    const b = (T = renderer.backend.timestampQueryPool) == null ? undefined : T[A];
    if (!(b != null && b.resultBuffer) || b.currentQueryIndex === 0) return [];
    const x = new Map(b.queryOffsets),
      y = b.resultBuffer,
      _ = y.getMappedRange;
    let w = null;
    y.getMappedRange = function (...E) {
      const C = _.apply(this, E);
      w = new BigUint64Array(C.slice(0));
      return C;
    };
    try {
      await renderer.resolveTimestampsAsync(A);
    } finally {
      y.getMappedRange = _;
    }
    if (!w) return [];
    const S = [];
    for (const [v, E] of x) {
      const C = /^([rc]):(\d+):(\d+):f(\d+)$/.exec(v);
      if (!C || Number(C[4]) !== g) continue;
      const M = w[E],
        B = w[E + 1];
      if (!M || !B || B < M) continue;
      const R = `${C[1]}${C[2].padStart(2, "0")} ${o.get(v) ?? `context ${C[3]}`}`;
      S.push({
        label: R,
        start: M,
        end: B
      });
    }
    return S;
  }
  function u(A, g) {
    if (!A.length) return 0;
    A.sort((y, _) => y.end < _.end ? -1 : y.end > _.end ? 1 : 0);
    let b = 0n,
      x = 0n;
    for (const {
      label: y,
      start: _,
      end: w
    } of A) {
      const S = _ > x ? _ : x,
        T = w > S ? w - S : 0n;
      b += T;
      x = w;
      g[y] = (g[y] ?? 0) + Number(T) / 1e6;
    }
    return Number(b) / 1e6;
  }
  const d = new MessageChannel(),
    h = () => new Promise(A => {
      d.port1.onmessage = A;
      d.port2.postMessage(0);
    });
  function f() {
    var g;
    const A = (g = renderer._nodes) == null ? undefined : g.nodeFrame;
    A ? (A.update(), renderer.info.frame = A.frameId) : renderer.info.frame++;
    renderLoop.renderFrame();
  }
  async function p(A) {
    var w;
    const g = (w = renderer.backend.device) == null ? undefined : w.queue;
    await (g == null ? undefined : g.onSubmittedWorkDone());
    const b = [];
    let x = 0,
      y = 0;
    const _ = performance.now();
    for (let S = 0; S < A; S++) {
      renderer.info.reset();
      const T = performance.now();
      f();
      b.push(performance.now() - T);
      x += renderer.info.render.drawCalls ?? renderer.info.render.calls ?? 0;
      y += renderer.info.render.triangles ?? 0;
      await h();
    }
    await (g == null ? undefined : g.onSubmittedWorkDone());
    return {
      frameMs: (performance.now() - _) / A,
      cpuMs: b,
      drawCalls: x / A,
      triangles: y / A
    };
  }
  async function m({
    frames = 120,
    warmup = 20,
    log = true
  } = {}) {
    var J;
    const x = renderer.backend,
      y = ((J = renderer.hasFeature) == null ? undefined : J.call(renderer, "timestamp-query")) === true,
      _ = x.trackTimestamp,
      w = [],
      S = {},
      T = {},
      v = [],
      E = Q => a(Q),
      C = x.beginRender;
    x.beginRender = function (j) {
      var V;
      const de = (V = this.getTimestampUID) == null ? undefined : V.call(this, j),
        K = E(j);
      de && o.set(de, K);
      v.push({
        label: K,
        t: performance.now(),
        nested: 0
      });
      return C.call(this, j);
    };
    w.push(() => {
      x.beginRender = C;
    });
    const M = x.finishRender;
    x.finishRender = function (j) {
      const de = M.call(this, j),
        K = v.pop();
      if (K) {
        const V = performance.now() - K.t;
        S[K.label] = (S[K.label] ?? 0) + V - K.nested;
        v.length && (v[v.length - 1].nested += V);
      }
      return de;
    };
    w.push(() => {
      x.finishRender = M;
    });
    const B = x.draw;
    x.draw = function (j, de) {
      const K = v[v.length - 1];
      K && (T[K.label] = (T[K.label] ?? 0) + 1);
      return B.call(this, j, de);
    };
    w.push(() => {
      x.draw = B;
    });
    const R = x.beginCompute;
    x.beginCompute = function (j) {
      var K;
      const de = (K = this.getTimestampUID) == null ? undefined : K.call(this, j);
      de && o.set(de, `compute ${j.name || ""}`.trim());
      return R.call(this, j);
    };
    w.push(() => {
      x.beginCompute = R;
    });
    const I = {};
    l(drive, "update", "drive (physics, traffic, car, HUD)", I, w);
    l(cameraDirector, "update", "camera director", I, w);
    l(world.collisionHeight, "update", "rain height map", I, w);
    l(world.rain, "update", "rain", I, w);
    l(world.sky, "update", "sky", I, w);
    l(world.ground, "update", "ground", I, w);
    l(world.ground, "updateReflection", "ground mirror (encode)", I, w);
    l(world.carReflectionProbe, "update", "car reflection probe (encode)", I, w);
    l(world.cityApi, "update", "city (LOD, pools, screens)", I, w);
    l(world.followShadow, "update", "follow shadow (encode)", I, w);
    l(pipeline.post, "render", "post.render (encode all passes)", I, w);
    renderer.setAnimationLoop(null);
    const k = renderer.info.autoReset;
    renderer.info.autoReset = false;
    const L = {},
      F = [];
    let O = 0,
      H = null;
    const W = () => {
      for (const Q of Object.keys(I)) delete I[Q];
      for (const Q of Object.keys(S)) delete S[Q];
      for (const Q of Object.keys(T)) delete T[Q];
    };
    try {
      x.trackTimestamp = false;
      await p(warmup);
      W();
      H = await p(frames);
      H.cpu = {
        ...I
      };
      H.passCpu = {
        ...S
      };
      H.passDraws = {
        ...T
      };
      x.trackTimestamp = y;
      for (let Q = 0; y && Q < warmup + frames; Q++) {
        renderer.info.reset();
        f();
        const j = renderer.info.frame,
          de = [...(await c("render", j)), ...(await c("compute", j))];
        if (Q < warmup) {
          o.clear();
          continue;
        }
        O++;
        F.push(u(de, L));
      }
    } finally {
      for (const Q of w.reverse()) Q();
      renderer.info.autoReset = k;
      x.trackTimestamp = _;
      renderLoop.startLoop();
    }
    const P = Q => Q.reduce((j, de) => j + de, 0) / Math.max(1, Q.length),
      z = (Q, j) => {
        const de = [...Q].sort((K, V) => K - V);
        return de[Math.min(de.length - 1, Math.floor(j / 100 * de.length))] ?? 0;
      },
      Y = Q => Math.round(Q * 1e3) / 1e3,
      G = renderer.getDrawingBufferSize(new Vector2()),
      {
        frameMs: X,
        cpuMs: ae
      } = H,
      ne = P(F),
      se = P(ae),
      re = Math.round(H.drawCalls),
      le = Math.max(F.length ? z(F, 99) : 0, z(ae, 99)),
      we = Q => Y(Q / frames),
      Se = Q => Y(Q / Math.max(1, O)),
      ye = (Q, j) => Math.round(I0e(R0e[Q], j) * 10) / 10,
      U = {
        frames: frames,
        drawingBuffer: `${G.x}x${G.y}`,
        pixelRatio: renderer.getPixelRatio(),
        frameMs: Y(X),
        fps: Math.round(1e3 / Math.max(X, .001)),
        gpuTimestamps: y,
        gpuBusyMs: Y(ne),
        gpuBusyP95Ms: Y(z(F, 95)),
        cpuFrameMs: Y(se),
        cpuFrameP95Ms: Y(z(ae, 95)),
        drawCalls: re,
        triangles: Math.round(H.triangles),
        p99Ms: Y(le),
        scores: {
          frame: ye("frameMs", X),
          ...(y ? {
            gpu: ye("gpuBusyMs", ne)
          } : {}),
          cpu: ye("cpuMs", se),
          drawCalls: ye("drawCalls", re),
          p99: ye("p99Ms", le)
        },
        gpu: Object.fromEntries(Object.entries(L).map(([Q, j]) => [Q, Se(j)]).sort((Q, j) => j[1] - Q[1])),
        cpu: Object.fromEntries(Object.entries(H.cpu).map(([Q, j]) => [Q, we(j)]).sort((Q, j) => j[1] - Q[1])),
        passes: Object.fromEntries(Object.entries(H.passCpu).map(([Q, j]) => [Q, {
          cpuMs: we(j),
          draws: Math.round((H.passDraws[Q] ?? 0) / frames)
        }]).sort((Q, j) => j[1].cpuMs - Q[1].cpuMs))
      };
    log && (console.info(`[perf] ${U.drawingBuffer} · ${U.frameMs} ms/frame (${U.fps} fps) · GPU busy ${U.gpuBusyMs} ms (p95 ${U.gpuBusyP95Ms}) · CPU ${U.cpuFrameMs} ms (p95 ${U.cpuFrameP95Ms}) · ${U.drawCalls} draws · ${U.triangles} tris`), console.table(U.scores), console.table(U.gpu), console.table(U.cpu), console.table(U.passes));
    return U;
  }
  return {
    profile: m
  };
}
export const L0e = [["size", "flame thickness", .3, 3, .05], ["length", "jet length (speed)", .3, 3, .05], ["life", "flame life", .3, 3, .05], ["duration", "jet duration", .3, 3, .05], ["turbulence", "licks (torn edge)", 0, 2, .01], ["stretch", "lick stretch", 0, 3, .05], ["rise", "rise (hot gas)", 0, 3, .05], ["glow", "glow", 0, 2, .01], ["core", "white-hot core", 0, 1.6, .01], ["blue", "blue at the pipe", 0, 1, .01], ["violet", "violet shots (share)", 0, 1, .01], ["sparks", "sparks", 0, 4, .05], ["flash", "street flash", 0, 3, .05], ["nitro", "nitro jet (0 = off)", 0, 1, .01]];
export function k0e(i, e) {
  var c, u, d, h, f, p;
  const t = i.createParameters("Backfire"),
    s = e.params;
  (u = (c = t.add(s, "enabled").name("enabled (shifts + nitro)")).listen) == null || u.call(c);
  const n = {
    strength: 1,
    crackles: true,
    auto: false,
    nitro: false
  };
  let r = null;
  const o = () => e.burst({
    strength: n.strength,
    pops: n.crackles,
    force: true
  });
  t.add({
    "fire!": o
  }, "fire!");
  t.add(n, "auto").name("auto fire (every 1.5 s)").onChange(m => {
    clearInterval(r);
    r = m ? setInterval(o, 1500) : null;
  });
  t.add(n, "strength", .2, 1, .01).name("test strength");
  t.add(n, "crackles").name("test crackles");
  t.add(n, "nitro").name("hold nitro jet (test)").onChange(m => e.setNitro(m, {
    force: true
  }));
  const a = t.addFolder("Look");
  for (const [m, A, g, b, x] of L0e) (h = (d = a.add(s, m, g, b, x).name(A)).listen) == null || h.call(d);
  const l = {
    note: "fire, tweak — copy to bake"
  };
  t.add({
    "copy values": async () => {
      const m = Object.fromEntries(Object.entries(s).map(([g, b]) => [g, typeof b == "number" ? +b.toFixed(3) : b])),
        A = JSON.stringify(m, null, 2);
      console.info(`[backfire]
` + A);
      try {
        await navigator.clipboard.writeText(A);
        l.note = "copied to clipboard ✓";
      } catch {
        l.note = "see the console (clipboard blocked)";
      }
    }
  }, "copy values");
  t.add({
    "reset to defaults": () => {
      Object.assign(s, YU);
      l.note = "defaults restored";
    }
  }, "reset to defaults");
  (p = (f = t.add(l, "note")).listen) == null || p.call(f);
  return t;
}
export function createDevApi({
  scene: scene,
  world: world,
  camera: camera,
  controls: controls
}) {
  return null;
}
