// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Timer } from "three/webgpu";
import { collectHeightPassHideObjects } from "./warmup.ts";
export function createRenderLoop({
  camera: camera,
  cameraDirector: cameraDirector,
  drive = null,
  world: world,
  pipeline: pipeline,
  post: post,
  performanceTools: performanceTools,
  renderer: renderer,
  getRainGlassIntro: getRainGlassIntro,
  getIntroActive: getIntroActive,
  onFrame: onFrame
}) {
  const d = new Timer();
  function h() {
    var y, _, w, S, T, v, E, C, M, B, R, I, k, L, F, O, H, W, P, z;
    d.update();
    const A = d.getDelta();
    ((getIntroActive == null ? undefined : getIntroActive()) ?? false) || drive == null || drive.update(A);
    cameraDirector.update(A);
    onFrame == null || onFrame(A);
    (y = world.collisionHeight) == null || y.update({
      camera: camera,
      hideObjects: collectHeightPassHideObjects(world)
    });
    (_ = world.rain) == null || _.update(A, camera);
    ((getIntroActive == null ? undefined : getIntroActive()) ?? false) || (S = (w = world.planes) == null ? undefined : w.update) == null || S.call(w, A);
    (T = world.sky) == null || T.update(camera, d.getElapsed());
    (E = (v = world.ground) == null ? undefined : v.update) == null || E.call(v, A, camera);
    (M = (C = world.cityApi) == null ? undefined : C.update) == null || M.call(C, camera, A);
    const b = ((R = (B = world.rain) == null ? undefined : B.params) == null ? undefined : R.enabled) ?? false;
    (k = (I = world.ground) == null ? undefined : I.setRippleAmount) == null || k.call(I, b ? 1 : 0);
    ((L = world.carSurfaceRain) == null ? undefined : L.syncProximity({
      camera: camera,
      carRoot: world.car,
      rainEnabled: b
    })) && world.carSurfaceRain.update(A);
    performanceTools != null && performanceTools.shouldUpdateGroundReflection() && ((O = (F = world.ground) == null ? undefined : F.updateReflection) == null || O.call(F, renderer, camera));
    (H = world.carReflectionProbe) == null || H.update();
    (W = world.followShadow) == null || W.update();
    (P = pipeline.syncCameras) == null || P.call(pipeline, camera);
    (z = getRainGlassIntro == null ? undefined : getRainGlassIntro()) == null || z.update();
    post.render();
    performanceTools == null || performanceTools.sampleFps();
  }
  function f() {
    renderer.setAnimationLoop(h);
  }
  function p() {
    renderer.setAnimationLoop(null);
  }
  function m() {
    h();
  }
  return {
    renderFrame: h,
    startLoop: f,
    stopLoop: p,
    warmFrame: m
  };
}
