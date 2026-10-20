// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, OrthographicCamera, RenderTarget, HalfFloatType, NearestFilter, MeshBasicNodeMaterial } from "three/webgpu";
import { vec4, positionWorld, uniform, float, vec2 } from "three/tsl";
import { performanceProfile } from "../../platform/performanceProfile.ts";
export class CollisionHeight {
  constructor({
    width: width,
    height: height,
    depth: depth,
    resolution: resolution
  }) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position = new Vector3();
    const r = width / 2,
      o = height / 2;
    this.camera = new OrthographicCamera(-r, r, o, -o, .1, depth);
    this.renderTarget = new RenderTarget(resolution, resolution);
    this.renderTarget.texture.type = HalfFloatType;
    this.renderTarget.texture.magFilter = NearestFilter;
    this.renderTarget.texture.minFilter = NearestFilter;
    this.renderTarget.texture.generateMipmaps = false;
    this.material = new MeshBasicNodeMaterial();
    this.material.outputNode = vec4(positionWorld, 1);
    this._positionNode = uniform(this.position);
    this._frameCounter = 0;
  }
  getPosition(e) {
    const t = float(this.width),
      s = float(this.height),
      n = e.x.mul(t).add(this._positionNode.x.sub(t.div(2))),
      r = e.y.mul(s).add(this._positionNode.z.sub(s.div(2)));
    return vec2(n, r);
  }
  getUV(e) {
    const t = float(this.width / 2),
      s = float(this.height / 2),
      n = e.x.sub(this._positionNode.x).add(t).div(float(this.width)),
      r = e.z.sub(this._positionNode.z).add(s).div(float(this.height));
    return vec2(n, r);
  }
  dispose() {
    this.renderTarget.dispose();
    this.material.dispose();
  }
}
export function createCollisionHeight({
  scene: scene,
  renderer: renderer,
  width = 100,
  height = 100,
  depth = 80,
  resolution = performanceProfile.collisionRainResolution,
  cameraHeight = 50
} = {}) {
  const a = new CollisionHeight({
    width: width,
    height: height,
    depth: depth,
    resolution: resolution
  });
  let l = -1;
  function c({
    camera: camera,
    hideObjects = [],
    warm = false
  } = {}) {
    var b, x, y;
    if (!camera) return;
    if (!warm) {
      l += 1;
      const _ = Math.max(1, performanceProfile.collisionRainFrameSkip ?? 1);
      if (l % _ !== 0) return;
    }
    a.position.set(camera.position.x, cameraHeight, camera.position.z);
    a.camera.position.set(a.position.x, a.position.y, a.position.z);
    a.camera.lookAt(a.position.x, 0, a.position.z);
    a.camera.updateMatrixWorld(true);
    const p = hideObjects.filter(Boolean).map(_ => ({
      object: _,
      visible: _.visible
    }));
    for (const {
      object: _
    } of p) _.visible = false;
    const m = renderer.getRenderTarget(),
      A = ((b = renderer.getMRT) == null ? undefined : b.call(renderer)) ?? null,
      g = scene.overrideMaterial;
    scene.overrideMaterial = a.material;
    (x = renderer.setMRT) == null || x.call(renderer, null);
    renderer.setRenderTarget(a.renderTarget);
    renderer.render(scene, a.camera);
    (y = renderer.setMRT) == null || y.call(renderer, A);
    renderer.setRenderTarget(m);
    scene.overrideMaterial = g;
    for (const {
      object: _,
      visible: w
    } of p) _.visible = w;
  }
  function u() {
    a.dispose();
  }
  return {
    collision: a,
    renderTarget: a.renderTarget,
    getUV: d => a.getUV(d),
    getPosition: d => a.getPosition(d),
    update: c,
    dispose: u
  };
}
export const iz = "/textures/smoke.png";
