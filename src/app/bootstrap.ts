// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createFirstDrive } from "../game/drive/firstDrive.ts";
import { observeViewport } from "../platform/viewport.ts";
import { setStartupStage } from "../runtime/recovery.ts";
import { applyDevicePerformanceDefaults, performanceProfile, applyPerformanceProfileToPipeline } from "../platform/performanceProfile.ts";
import { syncDeviceLayout, onDeviceLayoutChange } from "../platform/deviceLayout.ts";
import { createCamera, createCameraLayout, cameraParameters } from "../bootstrap/createCamera.ts";
import { createScene } from "../world/scene.ts";
import { createRenderer, createShadowUpdateController, resizeRenderer } from "../bootstrap/createRenderer.ts";
import { createWorld, FEATURES } from "../world/createWorld.ts";
import { createLightingController } from "../world/lighting.ts";
import { createMetroLighting } from "../world/car/followLighting.ts";
import { createReflectionProbe } from "../world/car/reflectionProbe.ts";
import { dl, B0, rA, A1 } from "../world/city/instanceStorage.ts";
import { applyEnvironment } from "../world/environment.ts";
import { MathUtils, AudioContext } from "three/webgpu";
import { createPostprocessing } from "../post/postprocessing.ts";
import { getLookPreference, isDevelopmentMode } from "../platform/userPreferences.ts";
import { lookPresets } from "../post/cyberpunkLook.ts";
import { Ap } from "../shaders/post/edgeChromaticAberration.ts";
import { createAdaptiveDpr } from "../platform/adaptiveDpr.ts";
import { createPerformanceMonitor, createInspectorSession, k0e, createDevApi, createPerformanceProfiler, E0e } from "../debug/performance.ts";
import { createCameraDirector } from "../runtime/createCameraDirector.ts";
import { createDriveMode } from "../game/drive/createDriveMode.ts";
import { isMultiplayerEnabled, normalizeRoomId } from "../multiplayer/protocol.ts";
import { Nme } from "../game/progress/tutorialStore.ts";
import { createVoice } from "../audio/voice/createVoice.ts";
import { createGameplay } from "../game/createGameplay.ts";
import { createFleet } from "../game/vehicles/createFleet.ts";
import { createAppShell } from "./createAppShell.ts";
import { wce } from "../ui/core/icons.ts";
import { createGarageAudio } from "../audio/garage.ts";
import { createIntroFlow } from "../intro/createIntroFlow.ts";
import { createRenderLoop } from "../runtime/createRenderLoop.ts";
import { createGarage } from "../game/garage/createGarage.ts";
import { createMultiplayer } from "../multiplayer/createMultiplayer.ts";
import { warmupWorld } from "../runtime/warmup.ts";
export async function bootstrapExperience(loader) {
  var P, z, Y, G, X, ae, ne, se, re, le, we, Se, ye, U, J, Q, j, de, K;
  applyDevicePerformanceDefaults();
  syncDeviceLayout();
  loader.setProgress(.03);
  loader.setStatus("Preparing the city");
  const camera = createCamera(),
    sceneResult = createScene(),
    {
      scene: scene,
      sunLight: sunLight
    } = sceneResult;
  loader.setProgress(.1);
  loader.setStatus("Connecting to graphics");
  const {
    renderer: renderer
  } = await createRenderer();
  loader.setProgress(.2);
  loader.setStatus("Preparing the city");
  const {
      requestShadowMapUpdate: requestShadowMapUpdate
    } = createShadowUpdateController({
      renderer: renderer,
      getSunLight: () => sunLight
    }),
    world = await (setStartupStage("asset"), createWorld({
      scene: scene,
      renderer: renderer,
      camera: camera,
      loaderOverlay: loader,
      requestShadowMapUpdate: requestShadowMapUpdate
    })),
    environmentIntensity = {
      value: .08
    },
    lighting = createLightingController({
      sceneResult: sceneResult,
      envMapBaseIntensity: environmentIntensity,
      requestShadowMapUpdate: requestShadowMapUpdate
    });
  if (lighting.syncLighting(), requestShadowMapUpdate("init"), world.metroMode && (world.metroLighting = createMetroLighting({
    sceneResult: sceneResult,
    renderer: renderer,
    camera: camera,
    car: world.car,
    syncLighting: lighting.syncLighting
  }), world.followShadow = world.metroLighting.followShadow, performanceProfile.carReflectionProbe && world.car)) {
    const V = world.ground;
    world.carReflectionProbe = createReflectionProbe({
      renderer: renderer,
      scene: scene,
      car: world.car,
      include: [V == null ? undefined : V.mesh, (P = world.sky) == null ? undefined : P.mesh],
      layers: [dl, B0],
      modeLayers: {
        lights: [rA],
        city: [A1],
        full: [0]
      },
      beforeRender: V ? () => {
        const te = V.uniforms.reflectionEnabled.value > .5;
        te && V.setReflectionEnabled(false);
        return () => te && V.setReflectionEnabled(true);
      } : null
    });
    world.carReflectionProbe.apply(world.car);
  }
  loader.setProgress(.8);
  applyEnvironment(scene, renderer, world.envTexture, {
    intensity: environmentIntensity.value
  });
  scene.environmentRotation.set(0, MathUtils.degToRad(70), MathUtils.degToRad(51));
  loader.setProgress(.85);
  loader.setStatus("Setting the night light");
  setStartupStage("shader");
  const pipeline = createPostprocessing(renderer, scene, camera, {
      rain: world.rain,
      smoke: world.smoke
    }),
    post = pipeline.post,
    savedLook = getLookPreference(),
    lookPreset = savedLook && lookPresets[savedLook] ? savedLook : Ap;
  pipeline.applyLookPreset(lookPreset, {
    bloomPass: pipeline.bloomPass
  });
  world.metroMode && (pipeline.look.uniforms.fogDistanceScale.value = performanceProfile.fogDistanceScale, (z = pipeline.bloomPass) != null && z.threshold && (pipeline.bloomPass.threshold.value = .4, pipeline.bloomPass.smoothWidth.value = .4));
  const adaptiveDpr = createAdaptiveDpr({
    renderer: renderer,
    pipeline: pipeline,
    onStepDown: (V, te) => {
      var fe, Ce, Ue, Ae, Be, He, at, Re, Fe;
      applyPerformanceProfileToPipeline(pipeline);
      (fe = pipeline.lensRain) == null || fe.setEnabled(te.lensRain);
      (Ue = (Ce = world.ground) == null ? undefined : Ce.setReflectionMode) == null || Ue.call(Ce, te.groundReflectionMode);
      te.billboardsEnabled || ((at = (He = (Be = (Ae = world.billboards) == null ? undefined : Ae.userData) == null ? undefined : Be.billboardMaterials) == null ? undefined : He.billboard) == null || at.disable(), (Fe = (Re = world.cityApi) == null ? undefined : Re.screens) == null || Fe.disable());
    }
  });
  adaptiveDpr.onResize();
  const adaptiveGate = {
      allow: false
    },
    performanceTools = createPerformanceMonitor({
      pipeline: pipeline,
      ground: world.ground,
      adaptiveDpr: adaptiveDpr,
      getAllowAdaptiveSample: () => adaptiveGate.allow
    }),
    modeCallback = {
      onChange: null
    },
    uiBridge = {
      isFinishedIntro: () => false,
      isPanelOpen: () => false
    },
    cameraDirector = createCameraDirector({
      camera: camera,
      renderer: renderer,
      world: world,
      getFinishedIntro: () => {
        var V;
        return ((V = app == null ? undefined : app.isFinishedIntro) == null ? undefined : V.call(app)) ?? false;
      },
      onWalkModeChange: V => {
        var te;
        return (te = modeCallback.onChange) == null ? undefined : te.call(modeCallback, V);
      }
    });
  let drive = null;
  if (world.carRig) {
    loader.setStatus("Preparing your car");
    drive = await createDriveMode({
      camera: camera,
      renderer: renderer,
      world: world,
      baseFov: performanceProfile.driveBaseFov,
      spawnBack: isMultiplayerEnabled() && normalizeRoomId(new URLSearchParams(location.search).get("room")) ? 8 : 0,
      onExitVehicle: () => cameraDirector.exitVehicle(),
      canOpenMap: () => uiBridge.isFinishedIntro(),
      canOpenMapWithEscape: () => !uiBridge.isPanelOpen(),
      onMapToggle: V => {
        var te;
        return (te = uiBridge.onMenuToggle) == null ? undefined : te.call(uiBridge, V);
      },
      lensRain: pipeline.lensRain,
      onTeleport: ({
        inCar: inCar
      }) => {
        inCar || cameraDirector.exitVehicle();
      },
      speedBlur: pipeline.speedBlur
    });
    cameraDirector.attachDriveMode(drive);
    (G = world.carReflectionProbe) == null || G.hide(...(((Y = drive.exhaustFlames) == null ? undefined : Y.objects) ?? []));
    for (const V of ((X = drive.traffic) == null ? undefined : X.meshes) ?? []) V.layers.enable(A1);
    if (world.metroMode) {
      const {
          position: [V, te, fe],
          yaw: Ce
        } = drive.spawn,
        Ue = Math.sin(Ce),
        Ae = Math.cos(Ce),
        Be = 6.3,
        He = -3.2;
      cameraDirector.setStartPose({
        position: [V - Ue * Be + Ae * He, te + 1.55, fe - Ae * Be - Ue * He],
        target: [V + Ue * 2, te + .9, fe + Ae * 2]
      });
    }
  }
  const tutorialStore = drive ? Nme() : null,
    voice = FEATURES.audio ? createVoice({
      context: AudioContext.getContext()
    }) : null;
  let gameplay = null;
  drive && world.metroMode && (loader.setStatus("Finding your first destination"), gameplay = await createGameplay({
    scene: scene,
    renderer: renderer,
    camera: camera,
    world: world,
    drive: drive,
    voice: voice,
    isOnFoot: () => uiBridge.isFinishedIntro() && cameraDirector.getCameraMode() === "walk"
  }));
  const fleet = drive && world.carModel ? createFleet({
    renderer: renderer,
    world: world,
    drive: drive,
    progress: (gameplay == null ? undefined : gameplay.progress) ?? null,
    lightCar: ((ae = world.metroLighting) == null ? undefined : ae.lightCar) ?? null,
    reflectCar: ((ne = world.carReflectionProbe) == null ? undefined : ne.apply) ?? null
  }) : null;
  let garage = null,
    multiplayer = null;
  const cameraLayout = createCameraLayout({
      camera: camera,
      getWalkControls: () => cameraDirector.walkControls
    }),
    inspectorSession = createInspectorSession({
      renderer: renderer,
      pipeline: pipeline,
      sceneResult: sceneResult,
      world: world,
      cameraDirector: cameraDirector,
      cameraParams: cameraParameters,
      applyCameraFovForLayout: cameraLayout.applyCameraFovForLayout,
      syncWalkEyeHeight: cameraLayout.syncWalkEyeHeight,
      syncLighting: lighting.syncLighting,
      syncEnvironmentIntensity: lighting.syncEnvironmentIntensity,
      envMapBaseIntensity: environmentIntensity,
      requestShadowMapUpdate: requestShadowMapUpdate,
      adaptiveDpr: adaptiveDpr
    });
  drive != null && drive.exhaustFlames && inspectorSession.registerPanel("backfire", V => k0e(V, drive.exhaustFlames));
  const app = createAppShell({
    voice: voice,
    renderer: renderer,
    camera: camera,
    cameraDirector: cameraDirector,
    world: world,
    pipeline: pipeline,
    inspectorSession: inspectorSession,
    syncLighting: lighting.syncLighting,
    startMode: drive ? "drive" : "walk",
    onRadioToggle: V => {
      var te;
      return (te = drive == null ? undefined : drive.setMenuPaused) == null ? undefined : te.call(drive, V);
    },
    gameplay: gameplay,
    isCarRolling: drive ? () => cameraDirector.getCameraMode() === "drive" && Math.abs(drive.vehicle.telemetry.speedKmh) > 4 : null,
    drive: drive,
    tutorialStore: tutorialStore,
    onResetGame: drive ? () => {
      gameplay == null || gameplay.progress.reset();
      tutorialStore.reset();
      wce();
      window.location.reload();
    } : null,
    getSteppedQuality: adaptiveDpr.getSteppedQuality,
    onOpenGarage: fleet && gameplay && world.metroMode ? () => garage == null ? undefined : garage.open() : null,
    onOpenMultiplayer: drive != null && drive.traffic && world.metroMode && isMultiplayerEnabled() ? () => multiplayer == null ? undefined : multiplayer.door() : null,
    onOpenFriends: () => multiplayer == null ? undefined : multiplayer.togglePanel()
  });
  const firstDrive = gameplay ? createFirstDrive({ drive, missions: gameplay.missions, progress: gameplay.progress, store: tutorialStore, onGarage: () => garage?.open(), voice }) : null;
  if (gameplay) gameplay.firstDrive = firstDrive;
  modeCallback.onChange = app.onWalkModeChange;
  gameplay == null || gameplay.attachUi({
    uiSfx: app.uiSfx,
    setModal: V => app.setMenuOpen("story", V),
    setMenuOpen: (V, te) => app.setMenuOpen(V, te),
    isBusy: () => !app.isFinishedIntro() || app.uiState.openedPanel != null
  });
  uiBridge.isFinishedIntro = () => app.isFinishedIntro();
  uiBridge.isPanelOpen = () => app.uiState.openedPanel != null;
  uiBridge.onMenuToggle = V => {
    var te;
    return (te = app.uiSfx) == null ? undefined : te[V ? "open" : "close"]();
  };
  drive == null || drive.onDriftEvent(V => {
    var te;
    V.type === "bank" && V.points >= 500 && ((te = app.uiSfx) == null || te.play("celebrate"));
  });
  app.uiState.subscribe(({
    uiVisible: uiVisible
  }) => {
    var te;
    return (te = drive == null ? undefined : drive.setUiAwake) == null ? undefined : te.call(drive, uiVisible);
  });
  const devApi = createDevApi({
    scene: scene,
    world: world,
    camera: camera,
    controls: cameraDirector.controls
  });
  devApi && Object.assign(devApi, {
    world: world,
    camera: camera,
    renderer: renderer,
    pipeline: pipeline,
    cameraDirector: cameraDirector,
    drive: drive,
    gameplay: gameplay,
    adaptiveDpr: adaptiveDpr,
    fleet: fleet,
    voice: voice
  });
  devApi && (devApi.tutorial = app.driveTutorial);
  const {
    carEngineAudio: carEngineAudio,
    planeEngineAudio: planeEngineAudio,
    wetFootstepAudio: wetFootstepAudio,
    driveAudio: driveAudio
  } = await app.initAudio();
  drive == null || drive.setAudio(driveAudio);
  fleet == null || fleet.setAudio(driveAudio);
  gameplay == null || gameplay.setAudioContext(AudioContext.getContext());
  const hornAudio = FEATURES.audio ? createGarageAudio({
    context: AudioContext.getContext()
  }) : null;
  drive == null || drive.setHornAudio(hornAudio);
  devApi && (devApi.horns = hornAudio);
  cameraDirector.setFootstepAudio(wetFootstepAudio);
  app.bindIdleListeners();
  app.bindOrbitIdleListeners(cameraDirector.controls);
  cameraDirector.preparePreRevealPose();
  const introFlow = createIntroFlow({
      pipeline: pipeline,
      renderer: renderer,
      loaderOverlay: loader,
      beforeReveal: firstDrive ? options => firstDrive.welcome(options) : null,
      onSettled: () => {
        adaptiveGate.allow = true;
      },
      revealAppUi: () => {
        app.revealAppUi();
        firstDrive?.begin();
        adaptiveGate.allow = true;
      },
      world: world
    }),
    renderLoop = createRenderLoop({
      camera: camera,
      cameraDirector: cameraDirector,
      drive: drive,
      world: world,
      pipeline: pipeline,
      post: post,
      performanceTools: performanceTools,
      renderer: renderer,
      getRainGlassIntro: introFlow.getRainGlassIntro,
      getIntroActive: introFlow.isIntroActive,
      onFrame: V => {
        app.updateHud(V);
        firstDrive?.update();
        gameplay == null || gameplay.update(V);
        garage == null || garage.update(V);
        multiplayer == null || multiplayer.update(V);
      }
    });
  if (fleet && gameplay && world.metroMode) {
    garage = createGarage({
      renderer: renderer,
      scene: scene,
      camera: camera,
      pipeline: pipeline,
      world: world,
      drive: drive,
      fleet: fleet,
      progress: gameplay.progress,
      cameraDirector: cameraDirector,
      renderLoop: renderLoop,
      state: app.uiState,
      onToggle: te => {
        app.setMenuOpen("garage", te);
        adaptiveGate.allow = !te;
      },
      canOpen: () => app.isFinishedIntro() && !drive.isMissionActive()
    });
    const V = () => [...gameplay.mapMarkers(), garage.mapMarker];
    (re = (se = drive.minimap) == null ? undefined : se.setMarkerSource) == null || re.call(se, V);
    (we = (le = drive.cityMap) == null ? undefined : le.setMarkerSource) == null || we.call(le, V);
    devApi && (devApi.garage = garage);
  }
  if (drive != null && drive.traffic && world.metroMode && app.header && (multiplayer = createMultiplayer({
    drive: drive,
    scene: scene,
    camera: camera,
    fleet: fleet,
    lightPools: ((Se = world.cityApi) == null ? undefined : Se.lightPools) ?? null,
    uiState: app.uiState,
    missions: (gameplay == null ? undefined : gameplay.missions) ?? null,
    progress: (gameplay == null ? undefined : gameplay.progress) ?? null,
    isUiReady: () => app.isFinishedIntro(),
    onMenu: V => app.setMenuOpen("lobby", V),
    canOpenLobby: () => {
      var V, te;
      return !(garage != null && garage.isOpen) && !((te = (V = app.driveControlsHelp) == null ? undefined : V.isOpen) != null && te.call(V));
    },
    onChange: V => {
      var te, fe;
      return (fe = (te = app.header).setInviteState) == null ? undefined : fe.call(te, V);
    }
  }), multiplayer)) {
    multiplayer.setHornAudio(hornAudio);
    (ye = gameplay == null ? undefined : gameplay.inbox) == null || ye.setInvite(() => multiplayer.door());
    (U = app.driveTutorial) == null || U.setTogether(() => multiplayer.tipState());
    (J = world.carReflectionProbe) == null || J.hide(...multiplayer.ghostObjects);
    const V = () => [...((gameplay == null ? undefined : gameplay.mapMarkers()) ?? []), ...(garage ? [garage.mapMarker] : [])],
      te = () => [...V(), ...multiplayer.mapMarkers()];
    (j = (Q = drive.minimap) == null ? undefined : Q.setMarkerSource) == null || j.call(Q, te);
    (K = (de = drive.cityMap) == null ? undefined : de.setMarkerSource) == null || K.call(de, te);
    devApi && (devApi.multiplayer = multiplayer);
  }
  devApi != null && devApi.perf && (devApi.renderLoop = renderLoop, devApi.perf.profile = createPerformanceProfiler({
    renderer: renderer,
    renderLoop: renderLoop,
    world: world,
    pipeline: pipeline,
    drive: drive,
    cameraDirector: cameraDirector
  }).profile);
  await warmupWorld({
    loaderOverlay: loader,
    syncLighting: lighting.syncLighting,
    requestShadowMapUpdate: requestShadowMapUpdate,
    renderer: renderer,
    scene: scene,
    pipeline: pipeline,
    camera: camera,
    world: world,
    post: post,
    prepareCompile: () => {
      const V = gameplay == null ? undefined : gameplay.warmup(),
        te = multiplayer == null ? undefined : multiplayer.warmup(),
        fe = performanceProfile.warmFirstUseEffects ? E0e(scene) : null;
      return () => {
        V == null || V();
        te == null || te();
        fe == null || fe();
      };
    }
  });
  if (new URLSearchParams(location.search).has('debug')) {
    Object.defineProperty(window, '__neon', {
      configurable: true,
      value: {
        renderer,
        camera,
        scene,
        world,
        drive,
        gameplay,
        garage,
        multiplayer,
        pipeline,
        app,
        cameraDirector,
        renderLoop
      }
    });
  }
  renderLoop.startLoop();
  observeViewport(() => {
    syncDeviceLayout();
    cameraLayout.onWindowResizeAspect();
    resizeRenderer(renderer, pipeline, adaptiveDpr);
    requestShadowMapUpdate("resize");
  });
  onDeviceLayoutChange(() => {
    syncDeviceLayout();
    cameraLayout.applyCameraFovForLayout();
  });
  await introFlow.run();
  // Other rigs load on demand in the garage, outside the first-play transfer.
  inspectorSession.bootstrapInspector(app.settingsPanel);
  isDevelopmentMode() && inspectorSession.revealInspector();
  return {
    renderer,
    camera,
    scene,
    world,
    drive,
    gameplay,
    garage,
    multiplayer,
    pipeline,
    app,
    cameraDirector,
    renderLoop
  };
}
