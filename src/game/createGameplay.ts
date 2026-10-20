// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createNoticeQueue } from "../ui/core/noticeQueue.ts";
import { createGlassTurn } from "../world/city/glassTurn.ts";
import { FEATURES } from "../world/createWorld.ts";
import { performanceProfile } from "../platform/performanceProfile.ts";
import { createProgressStore } from "./progress/store.ts";
import { mm, sigilDefinitions } from "./story/definitions.ts";
import { missionDefinitions } from "./missions/definitions.ts";
import { Rme, createHornAudio } from "../audio/horn.ts";
import { createMissions } from "./missions/createMissions.ts";
import { dl, Mu } from "../world/city/instanceStorage.ts";
import { createSigilToast } from "../ui/story/sigilToast.ts";
import { createSigils } from "./sigils/createSigils.ts";
import { getVehicleDefinition } from "./vehicles/catalog.ts";
import { Cme, createInbox } from "./story/createInbox.ts";
import { createStory } from "./story/createStory.ts";
import { isTouchDevice } from "../platform/deviceLayout.ts";
export async function createGameplay({
  scene: scene,
  renderer: renderer,
  camera: camera,
  world: world,
  drive: drive,
  voice = null,
  isOnFoot = () => false
}) {
  var R, I, k, L, F, O, H, W, P;
  const a = ((R = world.cityApi) == null ? undefined : R.kind) === "metro" ? world.cityApi : null;
  if (!a || !drive || !FEATURES.missions || performanceProfile.missions === false) return null;
  const notices = createNoticeQueue();
  const l = a.map.groundY,
    c = createProgressStore({
      missionIds: mm.map(z => z.id),
      raceIds: missionDefinitions.map(z => z.id),
      sigilIds: sigilDefinitions.map(z => z.id)
    });
  let u = null;
  const d = Object.fromEntries(Rme.map(z => [z, (...Y) => {
    var G;
    return (G = u == null ? undefined : u[z]) == null ? undefined : G.call(u, ...Y);
  }]));
  let h = null;
  const f = () => {
      var z;
      return (z = h == null ? undefined : h.type) == null ? undefined : z.call(h);
    },
    p = createMissions({
      scene: scene,
      drive: drive,
      metro: a,
      camera: camera,
      progress: c,
      sfx: d,
      typeSound: f,
      voice: voice,
      layer: dl,
      viewLayer: Mu,
      groundY: l
    }),
    {
      RAPIER: m,
      world: A
    } = drive.physics,
    g = new m.Ray({
      x: 0,
      y: 0,
      z: 0
    }, {
      x: 0,
      y: -1,
      z: 0
    }),
    b = (z, Y) => {
      g.origin.x = z;
      g.origin.y = l + 30;
      g.origin.z = Y;
      const G = A.castRay(g, 60, true, m.QueryFilterFlags.EXCLUDE_DYNAMIC);
      return G ? l + 30 - G.timeOfImpact : null;
    },
    x = createSigilToast({
      total: sigilDefinitions.length,
      typeSound: f,
      voice: voice
    }),
    y = await createSigils({
      renderer: renderer,
      scene: scene,
      camera: camera,
      map: a.map,
      boxes: [...a.collectColliders(), ...(((k = (I = a.highways) == null ? undefined : I.pillarColliders) == null ? undefined : k.call(I)) ?? []), ...(((F = (L = a.highways) == null ? undefined : L.rampColliders) == null ? undefined : F.call(L)) ?? [])],
      groundY: l,
      groundAt: b,
      progress: c,
      layer: dl,
      viewLayer: Mu,
      particles: performanceProfile.sigilParticles ?? 700,
      sfx: d,
      isOnFoot: isOnFoot,
      carPickup: () => {
        var X, ae, ne, se, re;
        if (!drive.isActive()) return null;
        const z = (se = (ne = (ae = (X = drive.car) == null ? undefined : X.def) == null ? undefined : ae.config) == null ? undefined : ne.chassisColliders) == null ? undefined : se[0];
        if (!z) return null;
        const Y = drive.playerPose(),
          G = z.radius ?? 0;
        return {
          ...Y,
          halfWidth: z.half[0] + G,
          halfLength: z.half[2] + G,
          offsetZ: ((re = z.offset) == null ? undefined : re[2]) ?? 0
        };
      },
      onCollect: z => { const count = c.sigilsFound(); notices.enqueue(`sigil:${z.def.id}`, "reward", () => x.showCollected(z.def, count)); }
    }).catch(z => (console.warn("[gameplay] sigils unavailable:", z), null)),
    _ = document.createElement("div");
  _.className = "garage-unlock";
  _.innerHTML = '<p></p><h2></h2><p class="garage-unlock__sub"></p>';
  document.body.appendChild(_);
  const [w, S] = _.querySelectorAll("p");
  let T = null;
  c.subscribe(event => {
    if (event.type !== "allCars" && !event.rides?.length) return;
    notices.enqueue(`ride:${event.rides?.[0] || "all"}`, "reward", () => {
      const all = event.type === "allCars";
      w.textContent = all ? "EVERY RIDE UNLOCKED" : "NEW RIDE UNLOCKED";
      _.querySelector("h2").textContent = all ? "THE GARAGE IS YOURS" : getVehicleDefinition(event.rides[0]).name;
      S.textContent = "OPEN THE GARAGE TO DRIVE";
      _.classList.add("is-visible"); d.unlock(); clearTimeout(T);
      T = setTimeout(() => _.classList.remove("is-visible"), 5000);
    });
  });
  Cme(() => c.unlockAllCars());
  const firstFare = p.missions.find(mission => mission.def.id === "first-fare");
  const glassTurn = createGlassTurn({ scene, destination: firstFare.stops.at(-1), groundY: l, progress: c, layer: dl });
  const v = createStory({
      progress: c,
      voice: voice,
      isCalm: () => Math.abs(drive.vehicle.telemetry.speedKmh) < 4 && notices.pending === 0 && p.phase === "idle" && !drive.isPaused() && !x.busy && !_.classList.contains("is-visible") && !(E != null && E.busy)
    }),
    E = createInbox({
      missions: p,
      sigils: y,
      progress: c,
      drive: drive,
      sfx: d,
      voice: voice,
      canShow: () => p.phase === "idle" && !drive.isPaused() && !v.isOpen,
      canRing: () => Math.abs(drive.vehicle.telemetry.speedKmh) < 4 && !x.busy && !_.classList.contains("is-visible")
    }),
    C = () => [glassTurn.marker(), ...p.mapMarkers(), ...((y == null ? undefined : y.mapMarkers()) ?? [])];
  (H = (O = drive.minimap) == null ? undefined : O.setMarkerSource) == null || H.call(O, C);
  (P = (W = drive.cityMap) == null ? undefined : W.setMarkerSource) == null || P.call(W, C);
  const M = [];
  function B(z) {
    var G, X;
    const Y = isOnFoot();
    if (p.update(), y == null || y.update(z), y) {
      const ae = drive.playerPose();
      x.update(z, y.nearest(150, ae), ae, Y);
    }
    M.length = 0;
    M.push(...p.lightPools());
    y && M.push(...y.lightPools());
    (X = (G = a.lightPools) == null ? undefined : G.setMarkers) == null || X.call(G, M);
    v.update(z);
    E == null || E.update(z);
    notices.update(z, { stopped: Math.abs(drive.vehicle.telemetry.speedKmh) < 4 && p.phase === "idle", busy: drive.isPaused() || v.isOpen || x.busy || _.classList.contains("is-visible") || !!E?.busy });
  }
  return {
    glassTurn,
    progress: c,
    missions: p,
    sigils: y,
    story: v,
    inbox: E,
    update: B,
    attachUi({
      uiSfx = null,
      setModal = null,
      setMenuOpen = null,
      isBusy = null
    } = {}) {
      h = uiSfx;
      v.attachUi({
        uiSfx: uiSfx,
        setModal: setModal,
        isBusy: isBusy
      });
      E == null || E.attachUi({
        uiSfx: uiSfx,
        setMenuOpen: setMenuOpen,
        isBusy: isBusy
      });
    },
    mapMarkers: C,
    locateMission(z) {
      const Y = p.missions.find(G => G.def.id === z);
      Y && drive.setWaypoint({
        x: Y.start.x,
        z: Y.start.z
      });
    },
    warmup: () => (y == null ? undefined : y.warmup()) ?? null,
    setAudioContext(z) {
      !u && z && (u = createHornAudio({
        context: z
      }));
    }
  };
}
