// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { REVISION, InspectorBase, WebGPURenderer, PCFShadowMap, ACESFilmicToneMapping } from "three/webgpu";
import { measureViewport } from "../platform/viewport.ts";
import { setStartupStage, showRecovery } from "../runtime/recovery.ts";
import { isSafari } from "../platform/deviceLayout.ts";
import { getStaticPixelRatio, performanceProfile } from "../platform/performanceProfile.ts";
import { installCanonicalShaderNames } from "./canonicalShaders.ts";
import { aie } from "../world/city/instanceStorage.ts";
import { lookPresets } from "../post/cyberpunkLook.ts";
import { Zle, ece, tce, sce, nce, ice, aG, PE, Z2 } from "../ui/core/phosphorIcons.ts";
export function Qde(i) {
  var o;
  const e = (o = i == null ? undefined : i.backend) == null ? undefined : o.device;
  if (!e || !new URLSearchParams(window.location.search).has("pipelines")) return;
  let t = false;
  const s = () => `[pipe] ${Math.round(performance.now())} ms`,
    n = (a, l) => {
      var u;
      const c = (u = e[a]) == null ? undefined : u.bind(e);
      c && (e[a] = (d, ...h) => (t && console.info(`${s()}  ${a.replace("create", "")}  ${l(d)}`), c(d, ...h)));
    };
  n("createRenderPipeline", a => (a == null ? undefined : a.label) ?? "");
  n("createRenderPipelineAsync", a => (a == null ? undefined : a.label) ?? "");
  n("createComputePipeline", a => (a == null ? undefined : a.label) ?? "");
  n("createComputePipelineAsync", a => (a == null ? undefined : a.label) ?? "");
  n("createShaderModule", a => {
    var l;
    return `${(a == null ? undefined : a.label) ?? ""} ${(((l = a == null ? undefined : a.code) == null ? undefined : l.length) ?? 0) / 1e3 | 0} KB`;
  });
  const r = () => {
    if (document.getElementById("app-loader")) {
      requestAnimationFrame(r);
      return;
    }
    t = true;
    console.info(`${s()}  --- loader done`);
  };
  r();
  window.addEventListener("pointerdown", a => {
    var l, c;
    (c = (l = a.target) == null ? undefined : l.closest) != null && c.call(l, ".intro-button") && console.info(`${s()}  --- ENTER pressed`);
  }, true);
  e.lost.then(a => console.info(`${s()}  --- device lost (${a.reason})`));
}
export function qde(i, e) {
  const t = JSON.parse(localStorage.getItem("threejs-inspector") || "{}");
  delete t[i];
  t.settings = t.settings || {};
  t.settings.url = t.settings.url || location.href;
  t.settings.storage = t.settings.storage || "url";
  t.version = REVISION;
  localStorage.setItem("threejs-inspector", JSON.stringify(t));
}
export function Hde() {
  try {
    qde("layout", null);
  } catch {}
}
export function Wde(i) {
  var e;
  return ((e = i == null ? undefined : i.hasFeature) == null ? undefined : e.call(i, "timestamp-query")) === true && !isSafari();
}
export function G_(i) {
  i != null && i.backend && (i.backend.trackTimestamp = false);
}
export function $de(i, e) {
  i != null && i.backend && (i.backend.trackTimestamp = !!e && Wde(i));
}
export function UL(i, e) {
  var t, s;
  !i || !e || (i.inspector = e, (t = e.init) == null || t.call(e), G_(i), Promise.resolve((s = i.init) == null ? undefined : s.call(i)).then(() => {
    $de(i, true);
  }));
}
export function Kde(i) {
  i && (i.inspector = new InspectorBase(), G_(i));
}
export function zL(i) {
  if (!i) return;
  i.domElement.hidden = false;
  const e = i.parameters.builtinButton;
  e && !e.classList.contains("active") && e.click();
}
export async function jde() {
  if (!navigator.gpu) return {};
  const i = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
    featureLevel: "compatibility"
  });
  if (!i) return {};
  const e = 64,
    t = i.limits.maxColorAttachmentBytesPerSample;
  return t >= e ? {
    maxColorAttachmentBytesPerSample: e
  } : t > 32 ? {
    maxColorAttachmentBytesPerSample: t
  } : {};
}
async function createRenderer() {
  var s;
  setStartupStage("capability");
  const diagnosticWebgl = new URLSearchParams(location.search).get("backend") === "webgl";
  if (!navigator.gpu && !diagnosticWebgl) throw new Error("WebGPU is unavailable in this browser or context.");
  const i = await jde(),
    e = new WebGPURenderer({
      forceWebGL: new URLSearchParams(location.search).get("backend") === "webgl",
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      requiredLimits: i
    });
  e.setPixelRatio(getStaticPixelRatio());
  const viewport = measureViewport();
  e.setSize(viewport.width, viewport.height, false);
  e.shadowMap.enabled = true;
  e.shadowMap.type = PCFShadowMap;
  e.shadowMap.autoUpdate = false;
  e.toneMapping = ACESFilmicToneMapping;
  Hde();
  e.domElement.style.opacity = "0";
  e.domElement.style.zIndex = "14";
  e.domElement.style.transition = "opacity 220ms ease";
  document.body.appendChild(e.domElement);
  await e.init();
  if (!diagnosticWebgl && !e.backend.isWebGPUBackend) throw new Error("No supported WebGPU adapter is available.");
  e.domElement.addEventListener("webglcontextlost", event => { event.preventDefault(); e.setAnimationLoop(null); showRecovery("Graphics context lost", "device"); });
  performanceProfile.canonicalShaders && e.backend.isWebGPUBackend && installCanonicalShaderNames(e);
  const t = e.backend.device;
  (s = t == null ? undefined : t.lost) == null || s.then(n => {
    e.setAnimationLoop(null);
    showRecovery(n.message || n.reason, "device");
  });
  Qde(e);
  G_(e);
  aie(e);
  return {
    renderer: e,
    inspector: null
  };
}
export { createRenderer };
function createShadowUpdateController({
  renderer: renderer,
  getSunLight: getSunLight
}) {
  function t() {
    const s = getSunLight == null ? undefined : getSunLight();
    !s || !renderer || (s.shadow.needsUpdate = true, renderer.shadowMap.needsUpdate = true);
  }
  return {
    requestShadowMapUpdate: t
  };
}
export { createShadowUpdateController };
function resizeRendererAndPipeline(i, e, t) {
  var r;
  const { width: s, height: n } = measureViewport();
  i.setPixelRatio(t);
  i.setSize(s, n, false);
  (r = e == null ? undefined : e.resizePostProcessing) == null || r.call(e, s, n);
}
export { resizeRendererAndPipeline };
function resizeRenderer(i, e, t = null) {
  if (t) {
    t.onResize();
    return;
  }
  resizeRendererAndPipeline(i, e, getStaticPixelRatio());
}
export { resizeRenderer };
export const Zde = .35;
export const ehe = [{
  id: "neutral",
  label: lookPresets.neutral.label,
  icon: Zle
}, {
  id: "neonNoir",
  label: lookPresets.neonNoir.label,
  icon: ece
}, {
  id: "magentaRain",
  label: lookPresets.magentaRain.label,
  icon: tce
}, {
  id: "tealDusk",
  label: lookPresets.tealDusk.label,
  icon: sce
}, {
  id: "silentHill",
  label: lookPresets.silentHill.label,
  icon: nce
}, {
  id: "sinCity",
  label: lookPresets.sinCity.label,
  icon: ice
}];
export const the = [{
  id: "low",
  label: "Low",
  icon: aG
}, {
  id: "medium",
  label: "Medium",
  icon: PE
}, {
  id: "ultra",
  label: "Ultra",
  icon: Z2
}];
