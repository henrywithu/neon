// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { loadVehicle } from "../../world/car/loadCar.ts";
import { getVehicleDefinition, vehicleCatalog } from "./catalog.ts";
import { LG } from "../../world/car/lighting.ts";
export function createFleet({
  renderer: renderer,
  world: world,
  drive: drive,
  progress = null,
  lightCar = null,
  reflectCar = null
}) {
  const o = world.car,
    a = new Map([[world.carDef.id, world.carModel]]),
    l = new Map();
  let c = null;
  function u(m) {
    if (a.has(m)) return Promise.resolve(a.get(m));
    if (!l.has(m)) {
      const A = loadVehicle(renderer, getVehicleDefinition(m), {
        holder: o
      }).then(g => (lightCar == null || lightCar(g.model), reflectCar == null || reflectCar(g.model), g.lights ?? (g.lights = LG({
        root: o,
        materialsRoot: g.model
      })), a.set(m, g), g)).catch(error => { l.delete(m); throw error; });
      l.set(m, A);
    }
    return l.get(m);
  }
  function d() {
    for (const m of a.values()) if (m.model.parent === o) return m;
    return null;
  }
  function h(m) {
    var b, x, y, _;
    const A = a.get(m),
      g = d();
    return !A || A === g ? A ?? g : (g && o.remove(g.model), o.add(A.model), o.updateMatrixWorld(true), (_ = (x = (b = world.cityApi) == null ? undefined : b.lightPools) == null ? undefined : x.setUnderglow) == null || _.call(x, ((y = A.neon) == null ? undefined : y.underglow) ?? null), A);
  }
  function f(m) {
    var A;
    (A = c == null ? undefined : c.setEngine) == null || A.call(c, m.engine);
  }
  async function p(m) {
    var g, b, x;
    const A = await u(m);
    drive.car !== A && (drive.setCar(A), world.carDef = A.def, world.carModel = A, world.carSurfaceRain = A.surfaceRain, world.carProxy = A.proxy, (g = world.fitCarWalkCollider) == null || g.call(world, A.model), (x = (b = world.smoke) == null ? undefined : b.setExhaustPositions) == null || x.call(b, A.def.tailpipes), f(A.def));
    h(m);
    progress == null || progress.setCar(m);
    return A;
  }
  return {
    cars: vehicleCatalog,
    load: u,
    loadAll: () => Promise.all(vehicleCatalog.map(m => u(m.id))),
    get: m => a.get(m) ?? null,
    show: h,
    shown: d,
    commit: p,
    get current() {
      return drive.car.def;
    },
    setAudio(m) {
      c = m ?? null;
      f(drive.car.def);
    }
  };
}
