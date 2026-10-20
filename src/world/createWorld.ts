// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createMetro, Xre } from "./city/createMetro.ts";
import { loadAlley } from "./city/loadAlley.ts";
import { performanceProfile } from "../platform/performanceProfile.ts";
import { loadBillboards } from "./billboards/loadBillboards.ts";
import { getSavedVehicle } from "../game/vehicles/catalog.ts";
import { loadPlayerCar } from "./car/loadCar.ts";
import { loadEnvironment } from "./environment.ts";
import { buildObjectBvh } from "./bvh.ts";
import { addStaticObject } from "./scene.ts";
import { applyBillboardMaterials } from "./billboards/billboardMaterials.ts";
import { B0, dl, Mu, rA } from "./city/instanceStorage.ts";
import { createGround } from "./ground/createGround.ts";
import { createSmoke } from "./effects/smoke.ts";
import { createFlyingPlanes } from "./effects/flyingPlanes.ts";
import { createCloudSky } from "./sky/cloudSky.ts";
import { Color } from "three/webgpu";
import { createCollisionHeight } from "./weather/createCollisionHeight.ts";
import { createCollisionRain } from "./weather/createCollisionRain.ts";
export const dg = typeof location < "u" ? new URLSearchParams(location.search) : new URLSearchParams();
export const FEATURES = {
  cityMode: dg.has("alley") ? "alley" : "metro",
  intro: !dg.has("nointro"),
  walkUi: true,
  audio: !dg.has("noaudio"),
  missions: !dg.has("nomissions"),
  multiplayer: !dg.has("nomultiplayer")
};
export function Soe({
  city: city,
  boundsCollider: boundsCollider,
  carCollider: carCollider,
  extra = []
}) {
  const n = [...extra];
  city && n.push(city);
  boundsCollider && n.push(boundsCollider);
  carCollider && n.push(carCollider);
  return n;
}
export async function createWorld({
  scene: scene,
  renderer: renderer,
  camera = null,
  loaderOverlay: loaderOverlay,
  requestShadowMapUpdate: requestShadowMapUpdate
}) {
  var M, B, R, I, k;
  loaderOverlay.setProgress(.35);
  loaderOverlay.setStatus("STREAMING MESHES");
  const r = [],
    o = FEATURES.cityMode === "metro";
  r.push(o ? createMetro({
    scene: scene,
    renderer: renderer
  }).then(L => ({
    city: null,
    boundsCollider: null,
    cityApi: L
  })) : loadAlley(renderer));
  r.push(performanceProfile.billboardsEnabled && !o ? loadBillboards(renderer) : Promise.resolve(null));
  const a = getSavedVehicle();
  r.push(loadPlayerCar(renderer, a));
  r.push(loadEnvironment());
  const [l, c, u, d] = await Promise.all(r),
    h = (l == null ? undefined : l.city) ?? null,
    f = (l == null ? undefined : l.cityApi) ?? null,
    p = (l == null ? undefined : l.boundsCollider) ?? null,
    m = f ? Xre([...f.collectColliders(), ...(((M = f.highways) == null ? undefined : M.pillarColliders()) ?? []), ...(((R = (B = f.highways) == null ? undefined : B.rampColliders) == null ? undefined : R.call(B)) ?? [])]) : null,
    A = ((I = f == null ? undefined : f.highways) == null ? undefined : I.deckMesh) ?? null;
  A && buildObjectBvh(A);
  const g = (u == null ? undefined : u.car) ?? null,
    b = (u == null ? undefined : u.collider) ?? null,
    x = (u == null ? undefined : u.surfaceRain) ?? null,
    y = (u == null ? undefined : u.rig) ?? null;
  loaderOverlay.setProgress(.7);
  loaderOverlay.setStatus("WIRING WORLD");
  h && addStaticObject(scene, h);
  p && addStaticObject(scene, p);
  c && (addStaticObject(scene, c), c.userData.billboardMaterials = applyBillboardMaterials(c, c.userData.adAtlas));
  g && (y || g.traverse(L => L.layers.enable(B0)), y ? scene.add(g) : addStaticObject(scene, g));
  b && (scene.add(b), requestShadowMapUpdate == null || requestShadowMapUpdate("quadra-car"));
  const _ = createGround(scene, f != null && f.landuse ? {
    planeSize: 3200,
    landuse: f.landuse,
    lightPools: f.lightPools,
    y: f.map.groundY,
    reflectionLayers: [dl, B0],
    fogNear: 31,
    fogFar: 110,
    roughnessScale: .55,
    wetnessPower: 4,
    reflectionBlur: 1,
    reflectionStrength: .075,
    reflectionBloom: .8,
    reflectionHighlight: 8,
    normalWarp: .061,
    rippleStrength: .055,
    rippleNormalStrength: 0
  } : undefined);
  (k = f == null ? undefined : f.lightPools) == null || k.setCar(g);
  o && camera && (camera.near = performanceProfile.cameraNear, camera.far = performanceProfile.cameraFar, camera.updateProjectionMatrix(), camera.layers.enable(Mu), camera.layers.enable(dl));
  let w = null;
  g && (w = await createSmoke({
    scene: scene,
    car: g,
    ambient: !o,
    exhaust: y ? a.tailpipes : undefined,
    exhaustScale: y ? 3.6 : undefined
  }));
  let S = null;
  S = await createFlyingPlanes({
    scene: scene,
    renderer: renderer
  });
  let T = null;
  T = await createCloudSky(scene, {
    radius: 135,
    verticalOffset: -33.5
  });
  T.updateFromSun({
    night: 1,
    skyTop: new Color(657432),
    skyBottom: new Color(1844280)
  });
  o && (T.setRadius(44), T.setVerticalOffset(-40), T.setSpeed(1.8), T.setCloudDensity(.53), T.setNoiseScale(19), T.setDistortionStrength(1.25), T.setDetailAmount(.85), T.setSmoothness(1), T.setContrast(1.25), T.setOpacity(.38), T.setDensityStrength(.56), T.setWindX(.35), T.setWindY(-.15));
  let v = null,
    E = null;
  v = createCollisionHeight({
    scene: scene,
    renderer: renderer
  });
  f != null && f.proxies && v.collision.camera.layers.enable(rA);
  E = await createCollisionRain({
    scene: scene,
    renderer: renderer,
    collisionHeight: v,
    camera: camera
  });
  m && scene.add(m);
  const C = Soe({
    city: m ?? h,
    boundsCollider: p,
    carCollider: b,
    extra: A ? [A] : []
  });
  return {
    city: h,
    cityApi: f,
    metroMode: o,
    cityCollisionProxy: m,
    boundsCollider: p,
    billboards: c,
    car: g,
    carProxy: (u == null ? undefined : u.proxy) ?? null,
    carRig: y,
    carDef: a,
    carModel: (u == null ? undefined : u.prepared) ?? null,
    carCollider: b,
    syncCarWalkCollider: (u == null ? undefined : u.syncWalkCollider) ?? null,
    fitCarWalkCollider: (u == null ? undefined : u.fitWalkCollider) ?? null,
    carSurfaceRain: x,
    envTexture: d,
    ground: _,
    collisionHeight: v,
    rain: E,
    smoke: w,
    planes: S,
    sky: T,
    colliders: C,
    primaryPlaneAnchor: (S == null ? undefined : S.primaryAnchor) ?? null
  };
}
