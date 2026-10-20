// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { getStaticPixelRatio, performanceProfile, gne, mne, fne } from "./performanceProfile.ts";
import { resizeRendererAndPipeline } from "../bootstrap/createRenderer.ts";
export function createAdaptiveDpr({
  renderer: renderer,
  pipeline: pipeline,
  targetFps = 50,
  fpsConfirmWindows = 2,
  settleWindows = 3,
  droppedDPR = .9,
  onStepDown = null
} = {}) {
  let a = getStaticPixelRatio(),
    l = 0,
    c = 0,
    u = false,
    d = null;
  function h() {
    return performanceProfile.adaptiveDpr ? Math.min(u ? droppedDPR : performanceProfile.maxPixelRatio, window.devicePixelRatio) : getStaticPixelRatio();
  }
  function f({
    force = false
  } = {}) {
    const x = h();
    return !(Math.abs(x - a) >= .01) && !force ? false : (a = x, resizeRendererAndPipeline(renderer, pipeline, x), true);
  }
  function p() {
    f({
      force: true
    });
  }
  function m() {
    const b = gne(performanceProfile.quality);
    if (!b) {
      u = true;
      performanceProfile.maxPixelRatio = Math.min(performanceProfile.maxPixelRatio, droppedDPR);
      f({
        force: true
      });
      return;
    }
    const x = mne(b);
    for (const y of fne) performanceProfile[y] = x[y];
    performanceProfile.quality = b;
    d = b;
    onStepDown == null || onStepDown(b, x);
    f({
      force: true
    });
  }
  function A(b) {
    if (!(!performanceProfile.adaptiveDpr || b <= 0 || u)) {
      if (c > 0) {
        c -= 1;
        return;
      }
      if (b < targetFps) {
        l += 1;
        l >= fpsConfirmWindows && (l = 0, c = settleWindows, m());
        return;
      }
      l = 0;
    }
  }
  function g(b) {
    performanceProfile.adaptiveDpr = !!b;
    f({
      force: true
    });
  }
  return {
    apply: f,
    onResize: p,
    onFpsSample: A,
    setEnabled: g,
    getDPR: () => a,
    isForcedLow: () => u,
    getSteppedQuality: () => d
  };
}
