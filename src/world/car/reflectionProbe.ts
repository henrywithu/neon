// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { TempNode, Vector3, CubeRenderTarget, HalfFloatType, LinearMipmapLinearFilter, LinearFilter, CubeCamera } from "three/webgpu";
import { reflectVector, float, log2, cubeTexture, nodeObject, mrt, output } from "three/tsl";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { QN } from "../city/instanceStorage.ts";
export class _0e extends TempNode {
  static get type() {
    return "CubeMipEnvironmentNode";
  }
  constructor(e, t) {
    super("vec3");
    this.texture = e;
    this.size = t;
  }
  setup(e) {
    const {
        getUV: t,
        getTextureLevel: s
      } = e.context,
      n = t ? t(this, e) : reflectVector,
      r = s ? s(this, e) : float(0),
      o = this.size * 2 / Math.PI,
      a = log2(r.mul(r).max(1e-4).mul(o)).clamp(0, Math.log2(this.size));
    return cubeTexture(this.texture, n, a).rgb;
  }
}
export const w0e = (i, e) => nodeObject(new _0e(i, e));
export const fF = new Vector3();
export const mv = new Vector3();
export function createReflectionProbe({
  renderer: renderer,
  scene: scene,
  car: car,
  include = [],
  layers = [],
  modeLayers = {},
  beforeRender = null,
  size = performanceProfile.carReflectionProbeSize,
  mode = performanceProfile.carReflectionProbeMode,
  facesPerFrame = performanceProfile.carReflectionProbeFacesPerFrame,
  frameSkip = performanceProfile.carReflectionProbeFrameSkip,
  fastFrameSkip = performanceProfile.carReflectionProbeFastFrameSkip,
  fastSpeed = 90,
  height = .7,
  near = .3,
  far = 600,
  intensity = 2.5
} = {}) {
  const g = new CubeRenderTarget(size, {
      type: HalfFloatType,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      magFilter: LinearFilter,
      depthBuffer: true
    }),
    b = g.texture;
  b.name = "output";
  const x = mrt({
      output: output
    }),
    y = w0e(b, size),
    _ = new CubeCamera(near, far, g);
  _.name = "car-reflection-probe";
  const w = _.children;
  for (const ne of include) ne == null || ne.layers.enable(QN);
  function S(ne) {
    mode = ne;
    for (const se of w) {
      se.layers.set(QN);
      for (const re of [...layers, ...(modeLayers[mode] ?? [])]) se.layers.enable(re);
    }
  }
  S(mode);
  const T = new Map(),
    v = new Set();
  let E = intensity,
    C = true,
    M = 0,
    B = 0,
    R = 0;
  const I = new Vector3();
  let k = -1;
  function L() {
    _.coordinateSystem !== renderer.coordinateSystem && (_.coordinateSystem = renderer.coordinateSystem, _.updateCoordinateSystem());
  }
  function F() {
    car.updateMatrixWorld();
    fF.set(0, height, 0).applyMatrix4(car.matrixWorld);
    _.position.copy(fF);
    _.updateMatrixWorld(true);
  }
  function O(ne) {
    var J, Q, j;
    const se = [car, ...v].filter(de => de.visible);
    for (const de of se) de.visible = false;
    const re = beforeRender == null ? undefined : beforeRender(),
      le = renderer.getRenderTarget(),
      we = renderer.getActiveCubeFace(),
      Se = renderer.getActiveMipmapLevel(),
      ye = ((J = renderer.getMRT) == null ? undefined : J.call(renderer)) ?? null,
      U = renderer.autoClear;
    (Q = renderer.setMRT) == null || Q.call(renderer, x);
    renderer.autoClear = true;
    try {
      ne();
    } finally {
      renderer.setRenderTarget(le, we, Se);
      (j = renderer.setMRT) == null || j.call(renderer, ye);
      renderer.autoClear = U;
      re == null || re();
      for (const de of se) de.visible = true;
    }
  }
  function H(ne) {
    b.generateMipmaps = ne === 5;
    renderer.setRenderTarget(g, ne);
    renderer.render(scene, w[ne]);
    b.generateMipmaps = true;
  }
  function W(ne) {
    ne.traverse(se => {
      if (!se.isMesh) return;
      const re = Array.isArray(se.material) ? se.material : [se.material];
      for (const le of re) !(le != null && le.isMeshStandardNodeMaterial || le != null && le.isMeshStandardMaterial) || T.has(le) || (T.set(le, le.envMapIntensity ?? 1), le.envMap = b, le.envNode = y, le.envMapIntensity = T.get(le) * E, le.needsUpdate = true);
    });
  }
  function P(ne) {
    E = ne;
    for (const [se, re] of T) se.envMapIntensity = re * E;
  }
  function z() {
    const ne = performance.now();
    car.getWorldPosition(mv);
    const se = (ne - k) / 1e3;
    if (k >= 0 && se > 0) {
      const re = Math.min(400, mv.distanceTo(I) / se * 3.6);
      R += (re - R) * .15;
    }
    I.copy(mv);
    k = ne;
  }
  function Y() {
    const ne = Math.min(1, R / fastSpeed);
    return Math.max(1, Math.round(frameSkip + (fastFrameSkip - frameSkip) * ne));
  }
  function G() {
    C && (z(), !(--B > 0) && (B = Y(), L(), O(() => {
      for (let ne = Math.max(1, facesPerFrame); ne > 0; ne--) F(), H(M), M = (M + 1) % 6;
    })));
  }
  function X() {
    L();
    F();
    O(() => {
      for (let ne = 0; ne < 6; ne++) H(ne);
    });
    M = 0;
  }
  function ae() {
    L();
    F();
    return w.map(ne => ({
      camera: ne,
      renderTarget: g,
      mrt: x,
      hide: [car, ...v]
    }));
  }
  return {
    envMap: b,
    envNode: y,
    cubeTarget: g,
    cubeCamera: _,
    apply: W,
    update: G,
    renderAll: X,
    views: ae,
    setMode: S,
    setIntensity: P,
    hide(...ne) {
      for (const se of ne) se && v.add(se);
    },
    get intensity() {
      return E;
    },
    get mode() {
      return mode;
    },
    get enabled() {
      return C;
    },
    set enabled(ne) {
      C = !!ne;
    },
    get facesPerFrame() {
      return facesPerFrame;
    },
    set facesPerFrame(ne) {
      facesPerFrame = Math.max(1, Math.round(ne));
    },
    get frameSkip() {
      return frameSkip;
    },
    set frameSkip(ne) {
      frameSkip = Math.max(1, Math.round(ne));
    },
    get fastFrameSkip() {
      return fastFrameSkip;
    },
    set fastFrameSkip(ne) {
      fastFrameSkip = Math.max(1, Math.round(ne));
    },
    get skip() {
      return Y();
    },
    dispose() {
      g.dispose();
    }
  };
}
