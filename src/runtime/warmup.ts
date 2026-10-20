// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
function collectHeightPassHideObjects({
  rain: rain,
  smoke: smoke,
  planes: planes,
  sky: sky,
  cityApi: cityApi,
  carProxy: carProxy
} = {}) {
  const o = [];
  if (carProxy && o.push(...carProxy.meshes), cityApi != null && cityApi.proxies && cityApi.root && o.push(cityApi.root), rain != null && rain.group && o.push(rain.group), sky != null && sky.mesh && o.push(sky.mesh), planes != null && planes.group && o.push(planes.group), smoke != null && smoke.emitters) for (const a of smoke.emitters) a != null && a.mesh && o.push(a.mesh);
  return o;
}
export { collectHeightPassHideObjects };
export async function G0(i, {
  scene: scene,
  camera: camera,
  renderTarget = null,
  mrt = null,
  hide = []
}) {
  const o = [],
    a = i._pipelines,
    l = a.getForRender;
  a.getForRender = function (f, p = null) {
    return l.call(this, f, p === null ? null : o);
  };
  const c = i.getRenderTarget(),
    u = i.getMRT(),
    d = hide.filter(f => f == null ? undefined : f.visible);
  for (const f of d) f.visible = false;
  const h = [];
  scene.traverse(f => {
    f.frustumCulled && h.push(f);
  });
  for (const f of h) f.frustumCulled = false;
  i.setRenderTarget(renderTarget);
  i.setMRT(mrt);
  try {
    await i.compileAsync(scene, camera);
  } finally {
    a.getForRender = l;
    i.setRenderTarget(c);
    i.setMRT(u);
    for (const f of d) f.visible = true;
    for (const f of h) f.frustumCulled = true;
  }
  await Promise.all(o);
}
export async function n0e(i, e) {
  const t = [],
    s = i._pipelines,
    n = i.backend,
    r = s.getForRender;
  s.getForRender = function (o) {
    return r.call(this, o, t);
  };
  n.draw = () => {};
  try {
    e();
  } finally {
    s.getForRender = r;
    delete n.draw;
  }
  await Promise.all(t);
}
export function WG(i, e) {
  const t = e.scenePass;
  return t ? (t.renderTarget.texture.type = i.getOutputBufferType(), {
    renderTarget: t.renderTarget,
    mrt: t.getMRT()
  }) : {};
}
export function i0e({
  world: world,
  pipeline: pipeline,
  post: post,
  renderer: renderer,
  camera: camera,
  frames: frames,
  includeReflection: includeReflection
}) {
  var a, l, c, u, d, h, f, p, m, A;
  for (let g = 0; g < frames; g += 1) {
    (a = world.collisionHeight) == null || a.update({
      camera: camera,
      hideObjects: collectHeightPassHideObjects(world),
      warm: true
    });
    (l = world.rain) == null || l.update(1 / 60, camera);
    (u = (c = world.ground) == null ? undefined : c.update) == null || u.call(c, 1 / 60);
    const b = ((h = (d = world.rain) == null ? undefined : d.params) == null ? undefined : h.enabled) ?? false;
    (p = (f = world.ground) == null ? undefined : f.setRippleAmount) == null || p.call(f, b ? 1 : 0);
    ((m = world.carSurfaceRain) == null ? undefined : m.syncProximity({
      camera: camera,
      carRoot: world.car,
      rainEnabled: b
    })) && world.carSurfaceRain.update(1 / 60);
    (A = pipeline.syncCameras) == null || A.call(pipeline, camera);
    post.render();
  }
}
export async function warmupWorld({
  loaderOverlay: loaderOverlay,
  syncLighting: syncLighting,
  requestShadowMapUpdate: requestShadowMapUpdate,
  renderer: renderer,
  scene: scene,
  pipeline: pipeline,
  camera: camera,
  world: world,
  post: post,
  prepareCompile = null
}) {
  var f, p, m, A;
  loaderOverlay.setProgress(.88);
  loaderOverlay.setStatus("Setting the night light");
  syncLighting();
  requestShadowMapUpdate == null || requestShadowMapUpdate("startup-lighting");
  const u = pipeline.beautyCamera ?? camera;
  loaderOverlay.setProgress(1);
  loaderOverlay.setStatus("Almost ready");
  (p = (f = world.ground) == null ? undefined : f.syncReflectionSize) == null || p.call(f, renderer);
  const d = () => {
      var g, b;
      (g = world.carReflectionProbe) == null || g.renderAll();
      i0e({
        world: world,
        pipeline: pipeline,
        post: post,
        renderer: renderer,
        camera: camera,
        frames: 1,
        includeReflection: false
      });
      (b = pipeline.warmOutputVariants) == null || b.call(pipeline);
    },
    h = prepareCompile == null ? undefined : prepareCompile();
  try {
    await G0(renderer, {
      scene: scene,
      camera: u,
      ...WG(renderer, pipeline)
    });
    const g = (A = (m = world.ground) == null ? undefined : m.reflectionView) == null ? undefined : A.call(m, renderer, camera);
    g && (await G0(renderer, {
      scene: scene,
      ...g
    }));
    await n0e(renderer, d);
  } finally {
    h == null || h();
  }
  requestShadowMapUpdate == null || requestShadowMapUpdate("startup-lighting");
  d();
}
export async function o0e({
  renderer: renderer,
  scene: scene,
  pipeline: pipeline,
  camera: camera,
  world: world
}) {
  var a, l;
  const r = pipeline.beautyCamera ?? camera;
  await G0(renderer, {
    scene: scene,
    camera: r,
    ...WG(renderer, pipeline)
  });
  const o = (l = (a = world.ground) == null ? undefined : a.reflectionView) == null ? undefined : l.call(a, renderer, camera);
  o && (await G0(renderer, {
    scene: scene,
    ...o
  }));
  await a0e(renderer, scene, world);
}
export async function a0e(i, e, t) {
  var s, n;
  for (const r of ((n = (s = t.carReflectionProbe) == null ? undefined : s.views) == null ? undefined : n.call(s)) ?? []) await G0(i, {
    scene: e,
    ...r
  });
}
export const rF = 600;
export const oF = 850;
export const aF = 260;
export const lF = 380;
export const cF = i => new Promise(e => setTimeout(e, i));
