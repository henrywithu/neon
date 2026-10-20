// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { uniform, Fn, floor, vec2, Loop, int, float, fract, length, clamp, cos, sin, normalize, sqrt, max, dot, vec3, If } from "three/tsl";
import { $f, $ie, r3, Wie } from "../world/ground/water.ts";
export function createRainRipples({
  uTime: uTime,
  uRippleSpeed = uniform(3),
  uVolume = uniform(1)
}) {
  return Fn(([n]) => {
    const r = floor(n),
      o = uTime.mul(uRippleSpeed),
      a = vec2(0).toVar();
    Loop({
      start: int(-$f),
      end: int($f),
      name: "i",
      condition: "<="
    }, ({
      i: i
    }) => {
      Loop({
        start: int(-$f),
        end: int($f),
        name: "j",
        condition: "<="
      }, ({
        j: j
      }) => {
        const d = r.add(vec2(i, j)),
          h = d,
          f = d.add($ie(h)),
          p = float(.3).mul(o).add(r3(h)),
          m = fract(p),
          A = f.sub(n),
          g = length(A).sub(float($f + 1).mul(m));
        If(g.greaterThan(-.6).and(g.lessThan(0)), () => {
          const b = floor(p);
          If(r3(h.add(b.mul(17.13))).lessThanEqual(uVolume), () => {
            const x = clamp(g.add(.6).div(.3), 0, 1),
              y = clamp(g.div(-.3), 0, 1),
              _ = x.mul(x).mul(float(3).sub(x.mul(2))),
              w = y.mul(y).mul(float(3).sub(y.mul(2))),
              S = x.mul(float(1).sub(x)).mul(6 / .3),
              T = y.mul(float(1).sub(y)).mul(-6 / .3),
              v = g.mul(31),
              E = cos(v).mul(31).mul(_.mul(w)).add(sin(v).mul(S.mul(w).add(_.mul(T)))),
              C = float(1).sub(m).mul(float(1).sub(m));
            a.addAssign(normalize(A).mul(E.mul(C)).mul(.5));
          });
        });
      });
    });
    a.divAssign(float(Wie));
    const l = sqrt(max(float(1).sub(dot(a, a)), float(0)));
    return vec3(a, l);
  });
}
export const x1 = 2;
export const jie = "/textures/water-splash.webp";
export const o3 = 5e3;
export const df = 5;
export const Yie = 6;
export const Xie = {
  width: 60,
  height: 60
};
export const Jie = .15;
export const Zie = .45;
export const ere = .05;
export const tre = .7;
export const sre = .07;
export const nre = .1;
export const ire = 1.4;
export const rre = 1;
export const a3 = .13;
export const ore = .04;
export const l3 = 1.1;
export const are = 60;
export const lre = 2.2;
export const cre = 2.8;
export const ure = .4;
export const dre = 30 / 3.6;
