// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { RenderTarget, UnsignedByteType, LinearMipmapLinearFilter, LinearFilter, MeshBasicNodeMaterial, FrontSide, Scene, Mesh, OrthographicCamera, Box3, Vector3, Color, Matrix4, Quaternion, BufferGeometry, Float32BufferAttribute, InstancedBufferAttribute, MeshStandardNodeMaterial, AdditiveBlending, InstancedMesh } from "three/webgpu";
import { attribute, texture, vec2, vec4, select, float, frontFacing, int, vec3, uv } from "three/tsl";
import { gl } from "./instanceStorage.ts";
export function createSignLighting({
  renderer: renderer,
  assets: assets,
  paletteTex: paletteTex,
  paletteCount: paletteCount,
  signLight: signLight,
  neonToSignGlow: neonToSignGlow,
  capacity: capacity,
  tileSize = 256
}) {
  const c = assets.length * 3,
    u = new RenderTarget(tileSize, tileSize, {
      depth: c,
      depthBuffer: true,
      type: UnsignedByteType
    });
  u.texture.name = "SignImpostorAtlas";
  u.texture.minFilter = LinearMipmapLinearFilter;
  u.texture.magFilter = LinearFilter;
  u.texture.generateMipmaps = false;
  const d = attribute("matid", "float"),
    h = texture(paletteTex, vec2(d.add(.5).div(paletteCount), 1.5 / 3)),
    f = h.w,
    p = new MeshBasicNodeMaterial({
      side: FrontSide
    });
  p.name = "sign-impostor-bake";
  p.colorNode = vec4(h.xyz.mul(select(f.greaterThan(1.5).and(f.lessThan(2.5)), neonToSignGlow, float(1))), 1);
  const m = new Scene(),
    A = new Mesh(undefined, p);
  A.frustumCulled = false;
  m.add(A);
  const g = new OrthographicCamera(),
    b = [],
    x = new Box3(),
    y = new Vector3(),
    _ = new Vector3(),
    w = renderer.getRenderTarget(),
    S = renderer.getClearColor(new Color()),
    T = renderer.getClearAlpha();
  renderer.setClearColor(0, 0);
  const v = X => X.geometries[Math.min(1, X.geometries.length - 1)];
  assets.forEach((X, ae) => {
    const ne = v(X);
    ne.computeBoundingBox();
    x.copy(ne.boundingBox);
    x.getSize(y).max(new Vector3(.05, .05, .05));
    x.getCenter(_);
    b.push(new Matrix4().compose(x.min, new Quaternion(), y));
    A.geometry = ne;
    for (let se = 0; se < 3; se++) {
      const re = se === 0 ? "z" : "x",
        le = se === 2 ? -1 : 1,
        we = (se === 0 ? y.x : y.z) / 2;
      g.left = -we;
      g.right = we;
      g.top = y.y / 2;
      g.bottom = -y.y / 2;
      g.near = .01;
      g.far = y[re] + .02;
      g.position.copy(_);
      g.position[re] = (le > 0 ? x.max[re] : x.min[re]) + le * .01;
      g.up.set(0, 1, 0);
      const Se = _.clone();
      Se[re] -= le * 1e6;
      g.lookAt(Se);
      g.updateProjectionMatrix();
      g.updateMatrixWorld(true);
      ae === assets.length - 1 && se === 2 && (u.texture.generateMipmaps = true);
      renderer.setRenderTarget(u, ae * 3 + se);
      renderer.render(m, g);
    }
  });
  for (const X of assets) v(X).dispose();
  renderer.setRenderTarget(w);
  renderer.setClearColor(S, T);
  p.dispose();
  const E = new BufferGeometry(),
    C = [0, 0, .5, 1, 0, .5, 1, 1, .5, 0, 1, .5, .5, 0, 1, .5, 0, 0, .5, 1, 0, .5, 1, 1],
    M = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
    B = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
  E.setAttribute("position", new Float32BufferAttribute(C, 3));
  E.setAttribute("normal", new Float32BufferAttribute(B, 3));
  E.setAttribute("uv", new Float32BufferAttribute(M, 2));
  E.setAttribute("impView", new Float32BufferAttribute([0, 0, 0, 0, 1, 1, 1, 1], 1));
  E.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
  const R = new Float32Array(capacity),
    I = new Float32Array(capacity),
    k = new InstancedBufferAttribute(R, 1),
    L = new InstancedBufferAttribute(I, 1);
  E.setAttribute("impAsset", k);
  E.setAttribute("seed", L);
  const F = attribute("impView", "float").greaterThan(.5),
    O = F.and(frontFacing.not()),
    H = select(F, select(frontFacing, float(1), float(2)), float(0)),
    W = attribute("impAsset", "float").mul(3).add(H),
    P = vec2(select(O, float(1).sub(uv().x), uv().x), float(1).sub(uv().y)),
    z = texture(u.texture, P).depth(int(W.add(.5))),
    Y = new MeshStandardNodeMaterial({
      side: AdditiveBlending,
      roughness: .5,
      metalness: 0
    });
  Y.name = "sign-impostors";
  Y.colorNode = vec3(.05);
  Y.opacityNode = z.a;
  Y.alphaTest = .3;
  Y.emissiveNode = z.rgb.mul(signLight(attribute("seed", "float")));
  const G = gl(new InstancedMesh(E, Y, Math.max(1, capacity)));
  G.name = "city:sign-impostors";
  G.frustumCulled = false;
  G.count = 0;
  G.castShadow = false;
  G.receiveShadow = false;
  return {
    mesh: G,
    atlas: u,
    boxMatrices: b,
    assetOf: R,
    seeds: I,
    commit(X) {
      if (G.count = X, G.visible = X > 0, X !== 0) for (const ae of [G.instanceMatrix, k, L]) ae.clearUpdateRanges(), ae.addUpdateRange(0, X * ae.itemSize), ae.needsUpdate = true;
    },
    dispose() {
      u.dispose();
      E.dispose();
      Y.dispose();
    }
  };
}
export const w3 = new Matrix4();
export const tS = new Matrix4();
export const Ka = new Vector3();
export const qre = [[[1, 3, 7, 5], 0, 1], [[0, 4, 6, 2], 0, -1], [[2, 6, 7, 3], 1, 1], [[0, 1, 5, 4], 1, -1], [[4, 5, 7, 6], 2, 1], [[0, 2, 3, 1], 2, -1]];
