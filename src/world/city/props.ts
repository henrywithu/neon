// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createInstancedPlacements } from "./instancedPlacements.ts";
import { lie } from "../car/carProxies.ts";
import { Ore } from "./lamps.ts";
export function createCityProps({
  assets: assets,
  placements: placements,
  material: material,
  groundY: groundY,
  drawDistance = 240,
  occlusion = null
}) {
  const o = createInstancedPlacements({
    name: "city:props",
    assets: assets,
    placements: placements,
    material: material,
    groundY: groundY,
    lodDistances: [22, 70],
    maxDistance: drawDistance,
    cellSize: 96,
    seedOffset: 2e5,
    occlusion: occlusion
  });
  lie(o.root);
  const a = placements.length / 5,
    l = c => Ore[assets[placements[c * 5]].name] ?? null;
  return {
    root: o.root,
    layer: o,
    assets: assets,
    placements: placements,
    count: a,
    physicsOf: l,
    update: (c, u) => o.update(c, u),
    staticColliders() {
      var u;
      const c = [];
      for (let d = 0; d < a; d++) {
        if (!((u = l(d)) != null && u.static)) continue;
        const h = assets[placements[d * 5]],
          f = placements[d * 5 + 4];
        c.push([placements[d * 5 + 1], groundY + h.height * f / 2, placements[d * 5 + 2], h.width * f / 2, h.height * f / 2, h.depth * f / 2, placements[d * 5 + 3]]);
      }
      return c;
    },
    dispose: () => o.dispose()
  };
}
export const XT = 12;
