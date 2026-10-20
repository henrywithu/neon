// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isGameInputBlocked } from "../ui/core/inputBoundary.ts";
import { initialCameraPose, getCameraFov, cameraParameters } from "../bootstrap/createCamera.ts";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Vector3, Quaternion } from "three/webgpu";
import { createWalkControls, Dhe, Phe } from "../controls/createWalkControls.ts";
export function createCameraDirector({
  camera: camera,
  renderer: renderer,
  world: world,
  getFinishedIntro: getFinishedIntro,
  onWalkModeChange: onWalkModeChange,
  onDriveModeChange = null
}) {
  var M, B;
  const o = {
      position: [...initialCameraPose.position],
      target: [...initialCameraPose.target]
    },
    a = new OrbitControls(camera, renderer.domElement);
  a.target.set(...o.target);
  a.enablePan = true;
  a.enableDamping = true;
  a.dampingFactor = .08;
  a.minDistance = .1;
  a.maxDistance = 1 / 0;
  a.minPolarAngle = 0;
  a.maxPolarAngle = Math.PI;
  a.minAzimuthAngle = -1 / 0;
  a.maxAzimuthAngle = 1 / 0;
  a.update();
  const l = new Vector3(),
    c = {
      orbitEnabled: false
    };
  let u = null,
    d = null,
    h = null,
    f = "walk";
  const p = 4.5;
  world.ground && (world.city || (M = world.colliders) != null && M.length) && (u = createWalkControls({
    camera: camera,
    domElement: renderer.domElement,
    model: world.city,
    colliders: world.colliders,
    ground: ((B = world.ground) == null ? undefined : B.mesh) ?? null,
    baseFov: getCameraFov(),
    settings: {
      moveSpeed: 3,
      sprintMultiplier: 3,
      eyeHeight: cameraParameters.walkEyeHeight,
      acceleration: cameraParameters.walkAcceleration,
      deceleration: cameraParameters.walkDeceleration,
      walkFovBoost: cameraParameters.walkFovBoost,
      sprintFovBoost: cameraParameters.sprintFovBoost,
      walkFovBlendSpeed: cameraParameters.walkFovBlendSpeed,
      sprintFovBlendSpeed: cameraParameters.sprintFovBlendSpeed,
      playerRadius: .55
    }
  }));
  function m(R) {
    const I = R === "drive" && !!h,
      k = R === "walk";
    f = I ? "drive" : k ? "walk" : "orbit";
    c.orbitEnabled = !k && !I;
    u == null || u.setActive(k);
    h == null || h.setActive(I);
    a.enabled = !k && !I && (getFinishedIntro == null ? undefined : getFinishedIntro());
    onWalkModeChange == null || onWalkModeChange(k);
    onDriveModeChange == null || onDriveModeChange(I);
    !I && (k ? (u == null || u.setBaseFov(getCameraFov()), u == null || u.syncEulerFromCamera()) : (camera.getWorldDirection(l), a.target.copy(camera.position).add(l.multiplyScalar(Dhe)), a.update()));
  }
  function A() {
    camera.position.set(...o.position);
    a.target.set(...o.target);
    a.update();
    m("walk");
    u == null || u.snapCameraToGround();
  }
  function g({
    position: position,
    target: target
  }) {
    o.position = [...position];
    o.target = [...target];
  }
  function b() {
    camera.position.set(...o.position);
    a.target.set(...o.target);
    a.enabled = false;
    a.update();
    c.orbitEnabled = false;
    u == null || u.setActive(true);
    u == null || u.setBaseFov(getCameraFov());
    u == null || u.syncEulerFromCamera();
  }
  function x() {
    var L, F;
    if (!h) return;
    const R = h.getDoorPosition(),
      I = new Quaternion();
    (L = world.car) == null || L.getWorldQuaternion(I);
    const k = new Vector3(0, 0, 1).applyQuaternion(I);
    (F = world.syncCarWalkCollider) == null || F.call(world);
    camera.position.set(R.x, R.y + cameraParameters.walkEyeHeight + .3, R.z);
    camera.lookAt(camera.position.x + k.x, camera.position.y, camera.position.z + k.z);
    m("walk");
    u == null || u.snapCameraToGround();
  }
  function y() {
    return !!h && f === "walk" && !!(getFinishedIntro != null && getFinishedIntro()) && h.distanceTo(camera.position) <= p;
  }
  function _() {
    return !h || h.distanceTo(camera.position) > p ? false : (m("drive"), true);
  }
  const w = new Set(["KeyF", "KeyE", "Enter", "NumpadEnter"]);
  function S(R) {
    isGameInputBlocked() || !w.has(R.code) || R.repeat || Phe(R.target) || R.code.endsWith("Enter") && R.target instanceof HTMLElement && R.target.closest("button, a, [role='dialog']") || f === "walk" && getFinishedIntro != null && getFinishedIntro() && _();
  }
  window.addEventListener("keydown", S);
  function T(R) {
    h = R;
  }
  function v(R) {
    var I, k;
    h != null && h.isActive() || (u != null && u.isActive() ? getFinishedIntro != null && getFinishedIntro() && (u.update(R), (k = d == null ? undefined : d.update) == null || k.call(d, R, {
      moving: u.isMoving(),
      speed: ((I = u.getHorizontalSpeed) == null ? undefined : I.call(u)) ?? 0
    })) : a.enabled && a.update());
  }
  function E() {
    window.removeEventListener("keydown", S);
  }
  function C(R) {
    d = R;
  }
  return {
    controls: a,
    walkControls: u,
    cameraModeState: c,
    setFootstepAudio: C,
    setCameraMode: m,
    getCameraMode: () => f,
    attachDriveMode: T,
    enterVehicle: _,
    canEnterVehicle: y,
    exitVehicle: x,
    resetCameraPose: A,
    preparePreRevealPose: b,
    setStartPose: g,
    update: v,
    destroy: E
  };
}
export const US = {
  asphalt: {
    id: "asphalt",
    grip: 1,
    rolling: 1,
    noise: 0
  },
  concrete: {
    id: "concrete",
    grip: .97,
    rolling: 1.05,
    noise: .15
  },
  sidewalk: {
    id: "sidewalk",
    grip: .92,
    rolling: 1.1,
    noise: .3
  },
  curb: {
    id: "curb",
    grip: .88,
    rolling: 1.2,
    noise: .6
  },
  metal: {
    id: "metal",
    grip: .75,
    rolling: 1,
    noise: .4
  },
  puddle: {
    id: "puddle",
    grip: .7,
    rolling: 1.3,
    noise: .2
  },
  dirt: {
    id: "dirt",
    grip: .65,
    rolling: 1.6,
    noise: .5
  }
};
