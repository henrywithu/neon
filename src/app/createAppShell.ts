// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isSavingAvailable } from "../platform/saveStatus.ts";
import { markUsableDrive } from "../debug/sessionRecord.ts";
import { createPause } from "../ui/chrome/pause.ts";
import { aG, PE, Z2 } from "../ui/core/phosphorIcons.ts";
import { createAppUiState } from "../ui/core/state.ts";
import { FEATURES } from "../world/createWorld.ts";
import { createSpatialAudio, Pde, zde } from "../audio/spatialAudio.ts";
import { subscribeAudioState } from "../audio/audioState.ts";
import { Zde, resizeRendererAndPipeline, ehe, the } from "../bootstrap/createRenderer.ts";
import { createHeader } from "../ui/chrome/createHeader.ts";
import { Jue, Xue, ede } from "../ui/walk/virtualJoystick.ts";
import { createWalkHelp, createControlsHelp } from "../ui/walk/controlsHelp.ts";
import { isMultiplayerEnabled } from "../multiplayer/protocol.ts";
import { createWalkPrompt } from "../ui/walk/prompts.ts";
import { Kue } from "../ui/walk/moveHint.ts";
import { createDriveTutorial, Oue } from "../ui/drive/tutorial.ts";
import { createAchievementsPanel } from "../ui/achievements/createAchievementsPanel.ts";
import { performanceProfile, C0, kU, PU, getStaticPixelRatio, DU, OU } from "../platform/performanceProfile.ts";
import { getQualityPreference, isDevelopmentMode, setLookPreference, setQualityPreference, setResolutionPreference, one, resetPreferences } from "../platform/userPreferences.ts";
import { createSettingsPanel } from "../ui/chrome/createSettingsPanel.ts";
import { Ap } from "../shaders/post/edgeChromaticAberration.ts";
import { createAudioButton } from "../ui/chrome/audioButton.ts";
import { createRadio } from "../audio/radio/createRadio.ts";
import { createRadioPanel } from "../ui/radio/createRadioPanel.ts";
import { AudioContext } from "three/webgpu";
import { createCarEngineAudio } from "../audio/engine/createCarEngineAudio.ts";
import { que } from "../audio/engine/settings.ts";
import { createVisibilityCoordinator, Fce } from "../ui/chrome/visibility.ts";
import { isTouchDevice } from "../platform/deviceLayout.ts";
import { createAboutPanel } from "../ui/chrome/createAboutPanel.ts";
export const she = [aG, PE, PE, Z2];
export function createAppShell({
  renderer: renderer,
  camera: camera,
  cameraDirector: cameraDirector,
  world: world,
  pipeline: pipeline,
  inspectorSession: inspectorSession,
  syncLighting: syncLighting,
  startMode = "walk",
  onRadioToggle = null,
  gameplay = null,
  isCarRolling = null,
  drive = null,
  tutorialStore = null,
  onResetGame = null,
  getSteppedQuality = null,
  onOpenGarage = null,
  onOpenMultiplayer = null,
  onOpenFriends = null,
  voice = null
}) {
  var fe, Ce, Ue;
  const x = createAppUiState(),
    y = FEATURES.audio ? createSpatialAudio() : null;
  subscribeAudioState(({
    isMusicPlaying: isMusicPlaying
  }) => y == null ? undefined : y.setVolume(isMusicPlaying ? 1 : 0));
  let _ = null;
  voice == null || voice.onSpeaking(Ae => _ == null ? undefined : _.setDuck(Ae ? Zde : 1));
  let w = null;
  x.subscribe(({
    openedPanel: openedPanel
  }) => {
    openedPanel !== w && (openedPanel ? y == null || y.open() : y == null || y.close(), w = openedPanel);
  });
  let saveWarningShown = false;
  let S = false;
  const T = {
      radio: false,
      controls: false,
      achievements: false,
      garage: false,
      story: false
    },
    v = () => onRadioToggle == null ? undefined : onRadioToggle(Object.values(T).some(Boolean));
  let E = null,
    C = null;
  let pause = null;
  const M = createHeader({
    state: x,
    onFirstJob: () => gameplay?.firstDrive?.start(),
    onOpenHelp: () => { W.setDriving(true); W.open(); },
    onPause: () => pause?.open(),
    onOpenMap: () => drive?.cityMap?.open(),
    onOpenSettings: () => C == null ? undefined : C.open(),
    onOpenRadio: () => ye == null ? undefined : ye.toggle(),
    onOpenAchievements: gameplay ? () => E == null ? undefined : E.toggle() : null,
    onOpenGarage: onOpenGarage,
    onOpenMultiplayer: onOpenMultiplayer,
    onOpenFriends: onOpenFriends,
    onOpenMessages: gameplay != null && gameplay.inbox ? () => gameplay.inbox.open() : null
  });
  (fe = gameplay == null ? undefined : gameplay.inbox) == null || fe.subscribe(({
    unread: unread
  }) => M == null ? undefined : M.setMessageCount(unread));
  const B = createAboutPanel({
      state: x
    }),
    R = Jue(cameraDirector.walkControls);
  let I = null,
    k = null,
    L = null,
    F = null;
  R && (I = createWalkHelp({
    state: x,
    domElement: renderer.domElement,
    together: isMultiplayerEnabled()
  }), k = createWalkPrompt({
    domElement: renderer.domElement,
    walkControls: R,
    state: x
  }), L = Kue({
    walkControls: R,
    state: x
  }), F = Xue({
    walkControls: R,
    state: x
  }), (Ce = M == null ? undefined : M.bindWalkControls) == null || Ce.call(M, cameraDirector.walkControls));
  isCarRolling && ((Ue = M == null ? undefined : M.bindDriveMotion) == null || Ue.call(M, isCarRolling));
  const O = drive && tutorialStore && FEATURES.walkUi ? createDriveTutorial({
      state: x,
      drive: drive,
      store: tutorialStore
    }) : null,
    H = gameplay ? createAchievementsPanel({
      state: x,
      progress: gameplay.progress,
      getTimeLimit: Ae => gameplay.missions.timeLimit(Ae),
      onLocate: Ae => gameplay.locateMission(Ae),
      onOpenGarage: onOpenGarage,
      onToggle: Ae => {
        T.achievements = Ae;
        v();
      },
      canOpen: () => S,
      domElement: renderer.domElement
    }) : null;
  E = H;
  const W = cameraDirector.canEnterVehicle || startMode === "drive" ? createControlsHelp({
      state: x,
      domElement: renderer.domElement,
      missions: !!gameplay,
      messages: !!(gameplay != null && gameplay.inbox),
      together: isMultiplayerEnabled(),
      onToggle: Ae => {
        T.controls = Ae;
        v();
      }
    }) : null,
    P = cameraDirector.canEnterVehicle ? Oue({
      onEnter: () => cameraDirector.enterVehicle()
    }) : null,
    z = performanceProfile.quality,
    Y = () => {
      const Ae = getQualityPreference();
      return C0.includes(Ae) ? Ae : kU;
    },
    G = z ? [] : PU().map((Ae, Be) => ({
      id: String(Ae),
      label: `${Ae}×`,
      icon: she[Be] ?? Z2
    })),
    X = performanceProfile.carReflectionProbe,
    ae = Ae => {
      performanceProfile.maxPixelRatio = Ae;
      resizeRendererAndPipeline(renderer, pipeline, getStaticPixelRatio());
    },
    ne = createSettingsPanel({
      state: x,
      onOpenAbout: () => x.openPanel("about"),
      lookOptions: ehe,
      defaultLookPreset: Ap,
      showDevelopmentMode: false,
      getDevelopmentMode: isDevelopmentMode,
      onDevelopmentModeChange: Ae => inspectorSession.applyDevelopmentMode(Ae, C),
      getCurrentLookPreset: () => pipeline.look.getCurrentPresetId(),
      onLookPresetChange: Ae => {
        pipeline.applyLookPreset(Ae);
        setLookPreference(Ae);
      },
      qualityOptions: z ? the : [],
      getQuality: () => ({
        chosen: Y(),
        running: z,
        stepped: (getSteppedQuality == null ? undefined : getSteppedQuality()) ?? null
      }),
      onQualityChange: Ae => setQualityPreference(Ae),
      resolutionOptions: G,
      getResolution: () => performanceProfile.maxPixelRatio,
      onResolutionChange: Ae => {
        const Be = Number.parseFloat(Ae);
        setResolutionPreference(Be);
        ae(Be);
      },
      getCarReflections: z ? () => null : () => ({
        chosen: DU(),
        running: X
      }),
      onCarReflectionsChange: Ae => one(Ae),
      voice: voice,
      onResetGame: onResetGame,
      onRestart: () => {
        resetPreferences();
        voice == null || voice.setEnabled(true);
        C == null || C.syncQuality();
        G.length && (ae(OU()), C == null || C.syncResolution());
        C == null || C.syncCarReflections();
        inspectorSession.applyDevelopmentMode(false, C);
        pipeline.applyLookPreset(Ap);
        C == null || C.syncLookPreset(Ap);
        syncLighting == null || syncLighting();
      }
    });
  window.addEventListener("neon:preferences", () => pipeline.applyLookPreset(pipeline.look.getCurrentPresetId()));
  C = ne;
  pause = createPause({ onHelp: () => { W.setDriving(true); W.open(); }, onMap: () => drive?.cityMap?.open(), onSettings: () => { x.openPanel("settings"); ne.open(); } });
  let se = null,
    re = null,
    le = null,
    we = null,
    Se = null,
    ye = null;
  FEATURES.audio && (se = createAudioButton({
    showButton: false
  }), se.setVisible(false));
  async function U(Ae) {
    try {
      const Be = await createRadio({
        context: Ae
      });
      if (!Be.tracks.length) return;
      _ = Be;
      ye = createRadioPanel({
        radio: Be,
        voice: voice,
        onToggle: He => {
          T.radio = He;
          v();
          y == null || y[He ? "open" : "close"]();
        },
        getCarAudio: () => le
      });
    } catch (Be) {
      console.warn("[audio] radio unavailable:", Be);
    }
  }
  async function J() {
    var Be;
    if (FEATURES.audio && U(AudioContext.getContext()), !FEATURES.audio || !world.car) return {
      carEngineAudio: null,
      planeEngineAudio: null,
      wetFootstepAudio: null,
      driveAudio: null
    };
    const Ae = !!world.carRig;
    re = await ede({
      camera: camera,
      car: world.car,
      silent: Ae
    });
    le = Ae ? await createCarEngineAudio({
      listener: re.listener,
      car: world.car
    }).catch(He => (console.warn("[audio] drive audio unavailable:", He), null)) : null;
    le != null && le.tuning && ((Be = inspectorSession == null ? undefined : inspectorSession.registerPanel) == null || Be.call(inspectorSession, "engine-sound", He => que(He, le.tuning)));
    we = await Pde({
      listener: re.listener,
      plane: world.primaryPlaneAnchor
    });
    Se = await zde({
      listener: re.listener
    });
    return {
      carEngineAudio: re,
      planeEngineAudio: we,
      wetFootstepAudio: Se,
      driveAudio: le
    };
  }
  const Q = createVisibilityCoordinator({
      state: x,
      header: M,
      audioButton: se,
      walkControlsHint: I,
      virtualJoystick: F,
      isAppReady: () => S
    }),
    j = Fce({
      state: x,
      activityTarget: document,
      isPlaying: () => S && cameraDirector.getCameraMode() !== "orbit",
      isLookingAround: () => cameraDirector.getCameraMode() === "walk" && !!document.pointerLockElement,
      onActivity: isTouchDevice() ? null : () => {
        var Ae;
        return (Ae = M == null ? undefined : M.setPointerAwake) == null ? undefined : Ae.call(M, true);
      },
      onIdle: () => {
        var Ae;
        return (Ae = M == null ? undefined : M.setPointerAwake) == null ? undefined : Ae.call(M, false);
      }
    });
  function de() {
    j && (renderer.domElement.addEventListener("pointerdown", j.resetTimer), renderer.domElement.addEventListener("touchstart", j.resetTimer, {
      passive: true
    }));
  }
  function K(Ae) {
    j && (Ae.addEventListener("start", () => {
      var Be;
      !S || (Be = cameraDirector.walkControls) != null && Be.isActive() || j.resetTimer();
    }), Ae.addEventListener("change", () => {
      var Be;
      !S || (Be = cameraDirector.walkControls) != null && Be.isActive() || j.resetTimer();
    }));
  }
  function V() {
    var Ae;
    S = true;
    x.showAllUi();
    j?.start();
    markUsableDrive();
    Q == null || Q.refresh();
    M == null || M.show();
    se == null || se.setVisible(true);
    cameraDirector.setCameraMode(startMode);
    (Ae = inspectorSession.revealInspector) == null || Ae.call(inspectorSession);
  }
  function te(Ae) {
    const Be = Ae && S,
      He = S && cameraDirector.getCameraMode() === "drive";
    W == null || W.setDriving(He);
    O == null || O.setEnabled(He);
    I == null || I.setVisible(Be);
    F == null || F.setVisible(Be);
    F == null || F.setEnabled(Be);
    k == null || k.setEnabled(Be);
    L == null || L.setEnabled(Be);
  }
  return {
    pause,
    uiState: x,
    setMenuOpen(Ae, Be) {
      T[Ae] = !!Be;
      v();
    },
    uiSfx: y,
    header: M,
    settingsPanel: ne,
    aboutPanel: B,
    audioButton: se,
    walkControlsHint: I,
    driveControlsHelp: W,
    achievements: H,
    walkPrompt: k,
    driveTutorial: O,
    moveHint: L,
    virtualJoystick: F,
    uiIdleManager: j,
    uiVisibilityCoordinator: Q,
    initAudio: J,
    bindIdleListeners: de,
    bindOrbitIdleListeners: K,
    revealAppUi: V,
    onWalkModeChange: te,
    isFinishedIntro: () => S,
    updateHud: Ae => {
      var Be;
      if (S && !isSavingAvailable() && !saveWarningShown && !isCarRolling?.()) { drive?.hud?.flash("Local saving unavailable · progress lasts this visit", 8000); saveWarningShown = true; }
      if (gameplay?.glassTurn && drive) se?.setDistrictMix(gameplay.glassTurn.proximity(drive.playerPose()));
      (Be = M == null ? undefined : M.updateHud) == null || Be.call(M, Ae);
      P == null || P.setVisible(cameraDirector.canEnterVehicle());
    }
  };
}
