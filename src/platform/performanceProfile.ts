// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { rne, getResolutionPreference, getQualityPreference } from "./userPreferences.ts";
import { isOlderIPhone, isMobileDevice, isSafari, isAppleMobile } from "./deviceLayout.ts";
export const performanceProfile = {
  canonicalShaders: true,
  introGlass: true,
  warmFirstUseEffects: false,
  shareSurfaceTextures: false,
  surfaceTextureMax: 0,
  modelTextureMax: 0,
  adaptiveDpr: true,
  maxPixelRatio: 1.5,
  carSurfaceRain: true,
  carSurfaceRainFadeStart: 3.5,
  carSurfaceRainFadeEnd: 5.5,
  carReflectionProbe: true,
  carReflectionProbeSize: 64,
  carReflectionProbeMode: "city",
  carReflectionProbeFacesPerFrame: 1,
  carReflectionProbeFrameSkip: 3,
  carReflectionProbeFastFrameSkip: 1,
  groundReflection: true,
  groundReflectionMode: "full",
  groundResolutionScale: .5,
  groundReflectionFrameSkip: 1,
  groundReflectionBicubic: true,
  bloom: true,
  bloomMode: "mip",
  bloomResolutionScale: .7,
  smaa: true,
  aaFilter: "smaa",
  fsr: true,
  renderScale: .85,
  upscaleFilter: "catmull",
  fsrSharpness: .2,
  bloomStrengthScale: 1,
  bloomStrengthFloor: 0,
  postLite: false,
  driveBaseFov: 62,
  driveCameraMode: "chase",
  ao: true,
  aoResolutionScale: .5,
  aoSamples: 16,
  aoRadius: 2,
  aoScale: 1.7,
  aoThickness: 1,
  aoDistanceExponent: 1,
  aoDistanceFallOff: 1,
  smokeEnabled: true,
  exhaustCount: 50,
  exhaustFlames: true,
  acoustics: true,
  ambientCount: 40,
  planeEnabled: true,
  billboardsEnabled: true,
  signImpostors: true,
  signImpostorTile: 256,
  lensRain: true,
  lensRainResolutionScale: .5,
  speedBlur: true,
  speedBlurSamples: 8,
  collisionRainResolution: 512,
  collisionRainFrameSkip: 2,
  collisionRainCount: 2750,
  rainSplashes: true,
  followShadowMapSize: 4096,
  followShadowExtent: 90,
  followShadowFrameSkip: 1,
  cameraNear: .15,
  cameraFar: 2800,
  fogDistanceScale: 9,
  cityLodScale: 1,
  cityDrawDistance: 1300,
  cityOcclusion: true,
  cityOcclusionResolution: [256, 128],
  trafficCars: 28,
  missions: true,
  sigilParticles: 700,
  quality: null
};
export const C0 = ["low", "medium", "ultra"];
export const kU = "ultra";
export const FU = {
  ultra: {},
  medium: {
    lensRain: false,
    maxPixelRatio: 1.25,
    followShadowMapSize: 2048,
    aoResolutionScale: .35,
    carReflectionProbeFrameSkip: 4,
    carReflectionProbeFastFrameSkip: 2
  },
  low: {
    maxPixelRatio: 1,
    fsr: false,
    groundReflectionMode: "lights",
    lensRain: false,
    ao: false,
    aaFilter: "fxaa",
    bloomResolutionScale: .5,
    speedBlurSamples: 5,
    carSurfaceRain: false,
    carReflectionProbe: false,
    followShadowMapSize: 2048,
    followShadowFrameSkip: 2,
    collisionRainResolution: 256,
    rainSplashes: false,
    billboardsEnabled: false,
    cityLodScale: .8,
    cityDrawDistance: 1e3,
    trafficCars: 20,
    exhaustCount: 30,
    ambientCount: 20,
    sigilParticles: 360
  }
};
export const une = [1, 1.25, 1.5, 2];
export function dne() {
  return 1.5;
}
export function hne() {
  return true;
}
export function DU() {
  return rne() ?? hne();
}
export function FN() {
  const i = new URLSearchParams(window.location.search).get("lite");
  return i === "1" || i !== "0" && isOlderIPhone();
}
export function PU() {
  return une.filter(i => i === 1 || i <= window.devicePixelRatio + .01);
}
export function OU() {
  const i = PU(),
    e = getResolutionPreference();
  if (i.includes(e)) return e;
  const t = dne();
  return i.includes(t) ? t : 1;
}
export const fne = ["maxPixelRatio", "fsr", "renderScale", "ao", "aoResolutionScale", "lensRain", "groundReflectionMode", "groundReflection", "aaFilter", "bloomResolutionScale", "billboardsEnabled"];
export const pne = {
  ...performanceProfile
};
export function mne(i) {
  const e = FU[i] ?? {},
    t = {
      ...pne,
      ...e
    };
  t.groundReflection = t.groundReflectionMode !== "off";
  return t;
}
export function gne(i) {
  const e = C0.indexOf(i);
  return e > 0 ? C0[e - 1] : null;
}
export function applyDevicePerformanceDefaults() {
  if (isMobileDevice()) bne();else {
    const r = yne();
    Object.assign(performanceProfile, FU[r]);
    performanceProfile.quality = r;
    isSafari() && (performanceProfile.adaptiveDpr = false);
  }
  const i = new URLSearchParams(window.location.search).get("reflect");
  (i === "full" || i === "lights" || i === "off") && (performanceProfile.groundReflectionMode = i);
  performanceProfile.groundReflection = performanceProfile.groundReflectionMode !== "off";
  const e = new URLSearchParams(window.location.search),
    t = e.get("probe");
  t === "off" ? performanceProfile.carReflectionProbe = false : (t === "lights" || t === "city" || t === "full") && (performanceProfile.carReflectionProbe = true, performanceProfile.carReflectionProbeMode = t);
  (e.get("warmfx") === "1" || e.get("warmfx") === "0") && (performanceProfile.warmFirstUseEffects = e.get("warmfx") === "1");
  (e.get("glass") === "1" || e.get("glass") === "0") && (performanceProfile.introGlass = e.get("glass") === "1");
  (e.get("canon") === "1" || e.get("canon") === "0") && (performanceProfile.canonicalShaders = e.get("canon") === "1");
  const s = Number.parseFloat(e.get("dpr"));
  s > 0 && s <= 3 && (performanceProfile.maxPixelRatio = s);
  (e.get("bloom") === "unreal" || e.get("bloom") === "mip") && (performanceProfile.bloomMode = e.get("bloom"));
  (e.get("aa") === "fxaa" || e.get("aa") === "smaa") && (performanceProfile.aaFilter = e.get("aa"));
  (e.get("upscale") === "easu" || e.get("upscale") === "catmull") && (performanceProfile.upscaleFilter = e.get("upscale"));
  const n = e.get("fsr");
  if (n === "off") performanceProfile.fsr = false;else if (n !== null) {
    const r = Number.parseFloat(n);
    performanceProfile.fsr = true;
    r > 0 && r <= 1 && (performanceProfile.renderScale = r);
  }
}
export function yne() {
  const i = new URLSearchParams(window.location.search).get("quality");
  if (C0.includes(i)) return i;
  const e = getQualityPreference();
  return C0.includes(e) ? e : kU;
}
export function bne() {
  performanceProfile.shareSurfaceTextures = true;
  isAppleMobile() && (performanceProfile.introGlass = false, performanceProfile.warmFirstUseEffects = true);
  performanceProfile.maxPixelRatio = OU();
  performanceProfile.fsr = false;
  performanceProfile.adaptiveDpr = false;
  performanceProfile.postLite = true;
  performanceProfile.ao = false;
  performanceProfile.smaa = true;
  performanceProfile.aaFilter = "fxaa";
  performanceProfile.lensRain = false;
  performanceProfile.speedBlur = true;
  performanceProfile.speedBlurSamples = 5;
  performanceProfile.bloomResolutionScale = .35;
  performanceProfile.bloomStrengthScale = .5;
  performanceProfile.bloomStrengthFloor = .65;
  performanceProfile.driveBaseFov = 72;
  performanceProfile.groundReflectionMode = FN() ? "off" : "lights";
  performanceProfile.groundResolutionScale = .35;
  performanceProfile.groundReflectionBicubic = false;
  performanceProfile.followShadowMapSize = 1024;
  performanceProfile.followShadowExtent = 70;
  performanceProfile.followShadowFrameSkip = 2;
  performanceProfile.collisionRainResolution = 256;
  performanceProfile.collisionRainCount = 1500;
  performanceProfile.rainSplashes = false;
  performanceProfile.carSurfaceRain = false;
  performanceProfile.carReflectionProbe = DU();
  performanceProfile.carReflectionProbeMode = "lights";
  performanceProfile.carReflectionProbeFrameSkip = 4;
  performanceProfile.carReflectionProbeFastFrameSkip = 2;
  performanceProfile.cameraNear = .25;
  performanceProfile.cameraFar = 700;
  performanceProfile.fogDistanceScale = 5;
  performanceProfile.billboardsEnabled = false;
  performanceProfile.cityLodScale = .55;
  performanceProfile.cityDrawDistance = 600;
  performanceProfile.trafficCars = 12;
  performanceProfile.sigilParticles = 360;
  performanceProfile.exhaustCount = 30;
  performanceProfile.acoustics = false;
  performanceProfile.ambientCount = 20;
  performanceProfile.signImpostorTile = 128;
  performanceProfile.cityOcclusionResolution = [160, 80];
  FN() && xne();
}
export function xne() {
  console.info("[perf] lite phone budget (older iPhone / ?lite=1)");
  performanceProfile.surfaceTextureMax = 1024;
  performanceProfile.modelTextureMax = 512;
  performanceProfile.bloomResolutionScale = .25;
  performanceProfile.speedBlurSamples = 3;
  performanceProfile.followShadowMapSize = 1024;
  performanceProfile.followShadowExtent = 55;
  performanceProfile.followShadowFrameSkip = 3;
  performanceProfile.collisionRainResolution = 128;
  performanceProfile.collisionRainFrameSkip = 3;
  performanceProfile.collisionRainCount = 900;
  performanceProfile.cameraFar = 550;
  performanceProfile.fogDistanceScale = 4;
  performanceProfile.cityLodScale = .45;
  performanceProfile.cityDrawDistance = 450;
  performanceProfile.cityOcclusionResolution = [128, 64];
  performanceProfile.trafficCars = 8;
  performanceProfile.planeEnabled = false;
  performanceProfile.exhaustCount = 0;
  performanceProfile.ambientCount = 10;
  performanceProfile.sigilParticles = 240;
  performanceProfile.driveBaseFov = 68;
}
export function getStaticPixelRatio() {
  return Math.min(window.devicePixelRatio, performanceProfile.maxPixelRatio);
}
export function applyPerformanceProfileToPipeline(i) {
  var s, n, r, o, a;
  if (!(i != null && i.perf)) return;
  const {
    perf: e,
    aoPass: t
  } = i;
  e.setBloomEnabled(performanceProfile.bloom);
  e.setBloomResolutionScale(performanceProfile.bloomResolutionScale);
  e.setSmaaEnabled(performanceProfile.smaa);
  (s = e.setUpscale) == null || s.call(e, {
    enabled: performanceProfile.fsr,
    scale: performanceProfile.renderScale,
    sharpness: performanceProfile.fsrSharpness,
    filter: performanceProfile.upscaleFilter
  });
  (n = e.setAaFilter) == null || n.call(e, performanceProfile.aaFilter);
  (r = e.setAoEnabled) == null || r.call(e, performanceProfile.ao);
  (o = e.setAoResolutionScale) == null || o.call(e, performanceProfile.aoResolutionScale);
  (a = e.setAoSamples) == null || a.call(e, performanceProfile.aoSamples);
  t && (t.radius.value = performanceProfile.aoRadius, t.scale.value = performanceProfile.aoScale, t.thickness.value = performanceProfile.aoThickness, t.distanceExponent.value = performanceProfile.aoDistanceExponent, t.distanceFallOff.value = performanceProfile.aoDistanceFallOff);
}
