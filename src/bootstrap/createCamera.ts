import { PerspectiveCamera } from 'three/webgpu';
import { isMobileLayout } from '../platform/deviceLayout';
export const DESKTOP_FOV = 65;
export const MOBILE_FOV = 100;
export const cameraParameters = {
  fovDesktop: DESKTOP_FOV,
  fovMobile: MOBILE_FOV,
  walkEyeHeight: 1.55,
  walkAcceleration: 6,
  walkDeceleration: 10,
  walkFovBoost: 3,
  sprintFovBoost: 8,
  walkFovBlendSpeed: 5,
  sprintFovBlendSpeed: 4
};
export const initialCameraPose = {
  position: [-138.564, -3.95, 34.181] as [number, number, number],
  target: [-120, -3, 30] as [number, number, number]
};
export function getCameraFov(): number {
  return isMobileLayout() ? cameraParameters.fovMobile : cameraParameters.fovDesktop;
}
export function createCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(DESKTOP_FOV, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(...initialCameraPose.position);
  camera.fov = getCameraFov();
  camera.updateProjectionMatrix();
  return camera;
}
interface WalkCameraControls {
  isActive(): boolean;
  setBaseFov(value: number): void;
  setEyeHeight(value: number): void;
}
export function createCameraLayout({
  camera,
  getWalkControls
}: {
  camera: PerspectiveCamera;
  getWalkControls?: () => WalkCameraControls | null | undefined;
}) {
  function applyCameraFovForLayout(): void {
    const fov = getCameraFov();
    const controls = getWalkControls?.();
    if (controls?.isActive()) controls.setBaseFov(fov);else {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }
  return {
    applyCameraFovForLayout,
    syncWalkEyeHeight() {
      getWalkControls?.()?.setEyeHeight(cameraParameters.walkEyeHeight);
    },
    onWindowResizeAspect() {
      camera.aspect = innerWidth / innerHeight;
      applyCameraFovForLayout();
    }
  };
}
