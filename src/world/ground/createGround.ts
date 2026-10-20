// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { loadSurfaceTexture } from "../loaders/surfaceTextures.ts";
import { JU, ZU, ez, HT, hf, KT, cg, lg, WT, u3, $T, ff, Wa, ug } from "../weather/createCollisionRain.ts";
import { RenderTarget, HalfFloatType, LinearMipmapLinearFilter, LinearFilter, PerspectiveCamera, Vector2, MeshStandardNodeMaterial, Mesh, PlaneGeometry, WebGPUCoordinateSystem } from "three/webgpu";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { uniform, positionWorld, vec2, texture, cameraPosition, float, smoothstep, Fn, vec3, vec4, screenUV, textureBicubic, maxMipLevel, max, normalMap, mix, select, step, fract, min, rangeFogFactor, mrt, output, If } from "three/tsl";
import { createRainRipples, x1 } from "../../shaders/rainRipples.ts";
export function createGround(i, {
  size = 400,
  planeSize = size,
  landuse = null,
  lightPools = null,
  y: r = -5.4,
  uvRepeat = 14.9,
  fogNear = 0,
  fogFar = 51,
  roughnessScale = .55,
  reflectionStrength = .08,
  reflectionBloom = landuse ? 3 : 1,
  reflectionHighlight = landuse ? 8 : 0,
  rippleCleanup = !!landuse,
  rippleFadeNear = 8,
  rippleFadeFar = 30,
  rippleVolume = landuse ? .5 : 1,
  normalWarp = .035,
  rippleAmount = 1,
  rippleScale = 4.83,
  rippleSpeed = 3,
  rippleStrength = .08,
  rippleNormalStrength = .015,
  reflectionLayers = [],
  roughReflection = !!landuse,
  wetnessPower = 4,
  sidewalkWetness = 1,
  reflectionBlur = 1
} = {}) {
  const M = loadSurfaceTexture(JU, {
      srgb: true
    }),
    B = loadSurfaceTexture(ZU),
    R = loadSurfaceTexture(ez),
    I = new RenderTarget(1, 1, {
      type: HalfFloatType,
      depthBuffer: true
    });
  I.texture.name = "GroundPlanarReflection";
  I.texture.minFilter = roughReflection ? LinearMipmapLinearFilter : LinearFilter;
  I.texture.magFilter = LinearFilter;
  I.texture.generateMipmaps = roughReflection;
  const k = new PerspectiveCamera();
  for (const ge of reflectionLayers) k.layers.enable(ge);
  performanceProfile.groundReflectionMode === "lights" && reflectionLayers.length && k.layers.disable(0);
  const L = uniform(uvRepeat),
    F = uniform(roughnessScale),
    O = uniform(reflectionStrength),
    H = uniform(performanceProfile.groundReflection ? 1 : 0),
    W = uniform(reflectionBloom),
    P = uniform(reflectionHighlight),
    z = uniform(wetnessPower),
    Y = uniform(sidewalkWetness),
    G = uniform(reflectionBlur),
    X = uniform(normalWarp),
    ae = uniform(fogNear),
    ne = uniform(fogFar),
    se = uniform(0),
    re = uniform(rippleAmount),
    le = uniform(rippleScale),
    we = uniform(rippleSpeed),
    Se = uniform(rippleStrength),
    ye = uniform(rippleNormalStrength),
    U = uniform(rippleVolume),
    J = uniform(0),
    Q = uniform(new Vector2()),
    j = uniform(16),
    de = createRainRipples({
      uTime: se,
      uRippleSpeed: we,
      uVolume: U
    }),
    K = positionWorld.xz.mul(L.div(size)).mul(vec2(1, -1)),
    V = texture(B, K).r,
    te = texture(M, K),
    fe = texture(R, K),
    Ce = positionWorld.sub(cameraPosition).length(),
    Ue = float(1).sub(smoothstep(rippleFadeNear, rippleFadeFar, Ce)),
    Ae = rippleCleanup ? Fn(() => {
      const ge = vec3(0, 0, 1).toVar();
      If(Ce.lessThan(rippleFadeFar).and(re.greaterThan(0)), () => {
        ge.assign(de(positionWorld.xz.mul(le)));
      });
      return ge;
    })() : de(positionWorld.xz.mul(le)),
    Be = Ae.xy.mul(re).mul(Se).mul(rippleCleanup ? Ue.mul(V.oneMinus()) : float(1)),
    He = Ae.xy.mul(re).mul(ye).mul(rippleCleanup ? Ue : float(1)),
    at = vec4(fe.xy.add(He), fe.zw),
    Re = fe.xy.mul(2).sub(1).mul(X),
    Fe = screenUV.flipX().add(Re).add(Be),
    Je = texture(I.texture, Fe);
  function je(ge) {
    if (!performanceProfile.groundReflection) return vec3(0);
    let Le = Je.rgb;
    if (roughReflection) {
      const et = ge.clamp(0, 1).mul(G);
      Le = performanceProfile.groundReflectionBicubic ? textureBicubic(Je, et).rgb : Je.level(et.mul(maxMipLevel(Je))).rgb;
    }
    const Oe = max(Le.r, max(Le.g, Le.b));
    return Le.mul(float(1).add(P.mul(smoothstep(.4, 1.6, Oe))));
  }
  function Te(ge) {
    return roughReflection ? ge.oneMinus().clamp(0, 1).pow(z) : ge.oneMinus();
  }
  const ue = new MeshStandardNodeMaterial();
  if (ue.transparent = true, ue.depthWrite = true, ue.metalness = 0, ue.normalNode = normalMap(at), landuse) {
    const {
        bounds: ge,
        span: Le,
        roadRange: Oe,
        landRange: et
      } = landuse,
      lt = vec2(positionWorld.x.sub(ge.minX).div(Le), positionWorld.z.sub(ge.minZ).div(Le)),
      Et = texture(landuse.texture, lt),
      Gt = Et.r.mul(255).sub(128).div(127).mul(Oe),
      es = Et.g.mul(255).sub(128).div(127).mul(et),
      Fs = smoothstep(-.3, .3, Gt),
      In = positionWorld.xz.sub(Q),
      qe = J.mul(smoothstep(j, j.mul(.7), In.length())),
      st = mix(max(smoothstep(-.5, .5, es), Fs), qe, J),
      it = Et.b.mul(255),
      Mt = select(it.lessThan(127.5), it.div(127), float(0)).mul(Fs.oneMinus()).mul(qe.oneMinus()),
      Pe = select(it.greaterThan(127.5), it.sub(128).div(127), float(0)).mul(Fs.oneMinus()),
      Pt = te.r.mul(.3).add(te.g.mul(.59)).add(te.b.mul(.11)),
      ce = step(.06, fract(positionWorld.x.mul(.5))).mul(step(.06, fract(positionWorld.z.mul(.5)))),
      ke = vec3(.013, .0135, .015).mul(Pt.mul(1.6).add(.55)).mul(ce.mul(.25).add(.75)),
      Ie = vec3(.006, .012, .007).mul(Pt.mul(1.4).add(.6)),
      pt = vec3(.019, .018, .02).mul(Pt.mul(1.6).add(.5)),
      kt = smoothstep(-.45, -.3, Gt).mul(smoothstep(.02, -.08, Gt)).mul(Mt.oneMinus()),
      ht = smoothstep(.35, .5, Gt).mul(smoothstep(.85, .7, Gt)).mul(Fs),
      ts = mix(te.rgb, vec3(.2, .2, .19), ht.mul(.4)),
      yt = mix(mix(mix(ke, pt, Pe), Ie, Mt), vec3(.03, .03, .033), kt),
      Tt = fract(In.div(2)),
      js = min(min(Tt.x, Tt.y), min(Tt.x.oneMinus(), Tt.y.oneMinus())),
      Cs = smoothstep(.012, 0, js),
      vs = mix(vec3(.011, .011, .013), vec3(.003), Cs),
      er = mix(V.mul(.08).add(.035), float(.65), Cs),
      zt = mix(mix(yt, ts, Fs), vs, qe),
      Vt = V.mul(F),
      Ds = mix(float(.62), float(.52), Pe),
      $n = Vt.mul(1.15).add(.04).min(1),
      bo = mix(mix(Ds, $n, Y), float(.92), Mt),
      fr = mix(mix(bo, Vt, Fs), er, qe);
    ue.roughnessNode = fr;
    const Gr = rangeFogFactor(ae, ne).oneMinus();
    ue.colorNode = vec4(zt, st.mul(Gr));
    ue.alphaTest = .04;
    const Am = je(fr).mul(Te(fr)).mul(mix(mix(float(.35), float(1), Y), float(1), max(Fs, qe))).mul(Mt.oneMinus()).mul(O).mul(H),
      lA = lightPools ? texture(lightPools.texture, lightPools.uvNode(positionWorld.xz)).rgb.mul(lightPools.intensity).mul(zt.mul(2.4).add(fr.oneMinus().mul(.07))).mul(mix(float(1), float(.5), Mt)).mul(mix(float(.4), float(1), max(Fs, qe))) : vec3(0);
    ue.emissiveNode = Am.mul(Gr).mul(st);
    ue.mrtNode = mrt({
      emissive: vec4(Am.mul(Gr).mul(st).mul(W), output.a)
    });
    lightPools && (ue.outputNode = vec4(output.rgb.add(lA.mul(Gr).mul(st)), output.a));
  } else {
    ue.roughnessNode = V.mul(F);
    ue.colorNode = Fn(() => {
      const Le = rangeFogFactor(ae, ne).oneMinus();
      return vec4(te.rgb, Le);
    })();
    const ge = Fn(() => {
      const Le = Te(V),
        Oe = rangeFogFactor(ae, ne).oneMinus();
      return je(V.mul(F)).mul(Le).mul(O).mul(H).mul(Oe);
    })();
    ue.emissiveNode = ge;
    ue.mrtNode = mrt({
      emissive: vec4(ge.mul(W), output.a)
    });
  }
  const $ = new Mesh(new PlaneGeometry(planeSize, planeSize), ue);
  $.name = "ReflectiveGround";
  $.rotation.x = -Math.PI / 2;
  $.position.y = r;
  $.receiveShadow = true;
  i.add($);
  function q(ge, Le = null) {
    se.value += ge;
    se.needsUpdate = true;
    Le && ($.position.x = Le.position.x, $.position.z = Le.position.z, $.updateMatrixWorld());
  }
  function oe(ge) {
    re.value = ge;
    re.needsUpdate = true;
  }
  function xe(ge) {
    le.value = ge;
    le.needsUpdate = true;
  }
  function me(ge) {
    we.value = ge;
    we.needsUpdate = true;
  }
  let ie = 0;
  function Ne(ge) {
    ge.getDrawingBufferSize(HT);
    const Le = Math.max(1, Math.round(HT.width * performanceProfile.groundResolutionScale)),
      Oe = Math.max(1, Math.round(HT.height * performanceProfile.groundResolutionScale));
    (I.width !== Le || I.height !== Oe) && I.setSize(Le, Oe);
  }
  function ze(ge) {
    H.value = ge ? 1 : 0;
    H.needsUpdate = true;
  }
  function tt(ge) {
    ze(ge !== "off");
    reflectionLayers.length && (ge === "lights" ? k.layers.disable(0) : k.layers.enable(0));
  }
  function dt(ge, Le) {
    Ne(ge);
    hf.setFromMatrixPosition($.matrixWorld);
    KT.setFromMatrixPosition(Le.matrixWorld);
    cg.extractRotation($.matrixWorld);
    lg.set(0, 0, 1).applyMatrix4(cg);
    WT.subVectors(hf, KT);
    WT.reflect(lg).negate().add(hf);
    cg.extractRotation(Le.matrixWorld);
    u3.set(0, 0, -1).applyMatrix4(cg).add(KT);
    $T.subVectors(hf, u3);
    $T.reflect(lg).negate().add(hf);
    k.coordinateSystem = Le.coordinateSystem;
    k.fov = Le.fov;
    k.aspect = Le.aspect;
    k.near = Le.near;
    k.far = Le.far;
    k.position.copy(WT);
    k.up.set(0, 1, 0).applyMatrix4(cg).reflect(lg);
    k.lookAt($T);
    k.updateMatrixWorld(true);
    k.layers.disable(x1);
    k.projectionMatrix.copy(Le.projectionMatrix);
    ff.setFromNormalAndCoplanarPoint(lg, hf);
    ff.applyMatrix4(k.matrixWorldInverse);
    Wa.set(ff.normal.x, ff.normal.y, ff.normal.z, ff.constant);
    const Oe = k.projectionMatrix;
    ug.x = (Math.sign(Wa.x) + Oe.elements[8]) / Oe.elements[0];
    ug.y = (Math.sign(Wa.y) + Oe.elements[9]) / Oe.elements[5];
    ug.z = -1;
    ug.w = (1 + Oe.elements[10]) / Oe.elements[14];
    Wa.multiplyScalar(1 / Wa.dot(ug));
    Oe.elements[2] = Wa.x;
    Oe.elements[6] = Wa.y;
    Oe.elements[10] = ge.coordinateSystem === WebGPUCoordinateSystem ? Wa.z : Wa.z + 1;
    Oe.elements[14] = Wa.w;
  }
  function Lt(ge, Le) {
    return H.value < .5 ? null : (dt(ge, Le), {
      camera: k,
      renderTarget: I,
      mrt: null,
      hide: [$]
    });
  }
  function mt(ge, Le) {
    var es, Fs, In;
    if (H.value < .5) return;
    const Oe = Math.max(1, performanceProfile.groundReflectionFrameSkip);
    if (ie += 1, ie % Oe !== 0) return;
    dt(ge, Le);
    const et = $.visible;
    $.visible = false;
    const lt = ge.getRenderTarget(),
      Et = ((es = ge.getMRT) == null ? undefined : es.call(ge)) ?? null,
      Gt = ge.autoClear;
    (Fs = ge.setMRT) == null || Fs.call(ge, null);
    ge.setRenderTarget(I);
    ge.autoClear = true;
    ge.render(i, k);
    (In = ge.setMRT) == null || In.call(ge, Et);
    ge.setRenderTarget(lt);
    ge.autoClear = Gt;
    $.visible = et;
  }
  function hs() {
    i.remove($);
    $.geometry.dispose();
    ue.dispose();
    I.dispose();
    M.dispose();
    B.dispose();
    R.dispose();
  }
  return {
    mesh: $,
    material: ue,
    renderTarget: I,
    uniforms: {
      uvRepeat: L,
      roughnessScale: F,
      reflectionStrength: O,
      reflectionEnabled: H,
      reflectionBloom: W,
      reflectionHighlight: P,
      wetnessPower: roughReflection ? z : null,
      sidewalkWetness: landuse ? Y : null,
      reflectionBlur: roughReflection ? G : null,
      garage: J,
      garageCenter: Q,
      garageRadius: j,
      normalWarp: X,
      fogNear: ae,
      fogFar: ne,
      rippleAmount: re,
      rippleScale: le,
      rippleSpeed: we,
      rippleStrength: Se,
      rippleVolume: U,
      rippleNormalStrength: ye
    },
    update: q,
    setRippleAmount: oe,
    setRippleScale: xe,
    setRippleSpeed: me,
    setReflectionEnabled: ze,
    setReflectionMode: tt,
    syncReflectionSize: Ne,
    updateReflection: mt,
    reflectionView: Lt,
    dispose: hs
  };
}
