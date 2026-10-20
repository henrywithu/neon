// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import BloomNode from "three/addons/tsl/display/BloomNode.js";
import { nodeObject, convertToTexture } from "three/tsl";
import SMAANode from "three/addons/tsl/display/SMAANode.js";
import GTAONode from "three/addons/tsl/display/GTAONode.js";
import DenoiseNode from "three/addons/tsl/display/DenoiseNode.js";
import FXAANode from "three/addons/tsl/display/FXAANode.js";
export function createLightingController({
  sceneResult: sceneResult,
  envMapBaseIntensity: envMapBaseIntensity,
  requestShadowMapUpdate: requestShadowMapUpdate
}) {
  function s() {
    sceneResult.scene.environmentIntensity = envMapBaseIntensity.value;
  }
  function n() {
    sceneResult.applySun();
    s();
    requestShadowMapUpdate == null || requestShadowMapUpdate("lighting");
  }
  return {
    syncEnvironmentIntensity: s,
    syncLighting: n
  };
}
export const Noe = (i, e, t, s) => new BloomNode(nodeObject(i), e, t, s);
export const oz = i => new SMAANode(convertToTexture(i));
export const Goe = (i, e, t) => new GTAONode(nodeObject(i), nodeObject(e), t);
export const Woe = (i, e, t, s) => new DenoiseNode(convertToTexture(i), nodeObject(e), nodeObject(t), s);
export const Koe = i => new FXAANode(convertToTexture(i));
