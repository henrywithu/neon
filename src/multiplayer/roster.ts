// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { vehicleFlags } from "./protocol.ts";
import { jme, Kme } from "./rooms.ts";
import { Vector3 } from "three/webgpu";
export const Gk = [{
  css: "#26d0ff"
}];
export function Yme(i) {
  let e = 0;
  for (let t = 0; t < i.length; t++) e = e * 31 + i.charCodeAt(t) >>> 0;
  return Gk[e % Gk.length];
}
export const Xme = {
  delay: 130,
  extrapolate: 250,
  teleport: 35,
  keep: 24,
  offsetWindow: 3e3,
  offsetSlew: .5,
  offsetSnap: 100
};
export function createRoster(i = {}) {
  const e = {
      ...Xme,
      ...i
    },
    t = new Map(),
    s = [];
  function n(d, {
    name = "PLAYER",
    car = ""
  } = {}) {
    let p = t.get(d);
    if (p) p.name = name, p.car = car, p.out.name = name, p.out.car = car;else {
      const m = Yme(d);
      p = {
        id: d,
        name: name,
        car: car,
        color: m,
        snaps: [],
        offset: null,
        arrivals: [],
        lastRx: 0,
        lastAt: null,
        spin: 0,
        roll: 0,
        out: {
          id: d,
          name: name,
          car: car,
          color: m,
          x: 0,
          y: 0,
          z: 0,
          qx: 0,
          qy: 0,
          qz: 0,
          qw: 1,
          vx: 0,
          vy: 0,
          vz: 0,
          flags: 0,
          yaw: 0,
          speed: 0,
          braking: 0,
          nitro: 0,
          drift: 0,
          horn: 0,
          lights: 0,
          onFoot: 0,
          spin: 0,
          roll: 0,
          age: 0
        }
      };
      t.set(d, p);
    }
    return p;
  }
  function r(d, h, f) {
    const p = d.arrivals;
    p.push(f, h);
    let m = 0;
    for (; m < p.length && f - p[m] > e.offsetWindow;) m += 2;
    m && p.splice(0, m);
    let A = 1 / 0;
    for (let g = 1; g < p.length; g += 2) p[g] < A && (A = p[g]);
    d.offset === null || Math.abs(A - d.offset) > e.offsetSnap ? d.offset = A : d.offset += Math.max(-e.offsetSlew, Math.min(e.offsetSlew, A - d.offset));
  }
  function o(d, h, f) {
    const p = t.get(d) ?? n(d);
    r(p, f - h.t, f);
    p.lastRx = f;
    const m = p.snaps,
      A = m[m.length - 1];
    if (A) {
      if (h.t <= A.t) return;
      Math.hypot(h.x - A.x, h.z - A.z) > e.teleport && (m.length = 0);
    }
    m.push(h);
    m.length > e.keep && m.shift();
  }
  function a(d) {
    d.yaw = Math.atan2(2 * (d.qw * d.qy + d.qx * d.qz), 1 - 2 * (d.qy * d.qy + d.qx * d.qx));
    const h = 2 * (d.qx * d.qz + d.qw * d.qy),
      f = 2 * (d.qy * d.qz - d.qw * d.qx),
      p = 1 - 2 * (d.qx * d.qx + d.qy * d.qy);
    d.speed = d.vx * h + d.vy * f + d.vz * p;
    d.braking = d.flags & vehicleFlags.BRAKE ? 1 : 0;
    d.nitro = d.flags & vehicleFlags.NITRO ? 1 : 0;
    d.drift = d.flags & vehicleFlags.DRIFT ? 1 : 0;
    d.horn = d.flags & vehicleFlags.HORN ? 1 : 0;
    d.lights = d.flags & vehicleFlags.LIGHTS ? 1 : 0;
    d.onFoot = d.flags & vehicleFlags.ON_FOOT ? 1 : 0;
  }
  function l(d, h) {
    d.x = h.x;
    d.y = h.y;
    d.z = h.z;
    d.qx = h.qx;
    d.qy = h.qy;
    d.qz = h.qz;
    d.qw = h.qw;
    d.vx = h.vx;
    d.vy = h.vy;
    d.vz = h.vz;
    d.flags = h.flags;
  }
  function c(d, h, f) {
    const p = d.snaps,
      m = p.length;
    if (m === 1 || h <= p[0].t) l(f, p[0]);else if (h >= p[m - 1].t) {
      const A = p[m - 1],
        g = Math.min(h - A.t, e.extrapolate) / 1e3;
      l(f, A);
      f.x += A.vx * g;
      f.y += A.vy * g;
      f.z += A.vz * g;
    } else {
      let A = m - 2;
      for (; A > 0 && p[A].t > h;) A--;
      const g = p[A],
        b = p[A + 1],
        x = (b.t - g.t) / 1e3,
        y = (h - g.t) / (b.t - g.t),
        _ = y * y,
        w = _ * y,
        S = 2 * w - 3 * _ + 1,
        T = w - 2 * _ + y,
        v = -2 * w + 3 * _,
        E = w - _;
      f.x = S * g.x + T * x * g.vx + v * b.x + E * x * b.vx;
      f.y = S * g.y + T * x * g.vy + v * b.y + E * x * b.vy;
      f.z = S * g.z + T * x * g.vz + v * b.z + E * x * b.vz;
      let C = g.qx * b.qx + g.qy * b.qy + g.qz * b.qz + g.qw * b.qw;
      const M = C < 0 ? -1 : 1;
      C *= M;
      let B = 1 - y,
        R = y * M;
      if (C < .9995) {
        const k = Math.acos(C),
          L = Math.sin(k);
        B = Math.sin((1 - y) * k) / L;
        R = Math.sin(y * k) / L * M;
      }
      f.qx = B * g.qx + R * b.qx;
      f.qy = B * g.qy + R * b.qy;
      f.qz = B * g.qz + R * b.qz;
      f.qw = B * g.qw + R * b.qw;
      const I = 1 / Math.hypot(f.qx, f.qy, f.qz, f.qw);
      f.qx *= I;
      f.qy *= I;
      f.qz *= I;
      f.qw *= I;
      f.vx = g.vx + (b.vx - g.vx) * y;
      f.vy = g.vy + (b.vy - g.vy) * y;
      f.vz = g.vz + (b.vz - g.vz) * y;
      f.flags = y < .5 ? g.flags : b.flags;
    }
    a(f);
  }
  function u(d) {
    s.length = 0;
    for (const h of t.values()) {
      if (!h.snaps.length) continue;
      const f = h.out;
      c(h, d - h.offset - e.delay, f);
      const p = h.lastAt === null ? 0 : Math.min(.1, (d - h.lastAt) / 1e3);
      h.lastAt = d;
      h.spin = (h.spin + f.speed / jme * p) % Kme;
      h.roll += f.speed * p;
      f.spin = h.spin;
      f.roll = h.roll;
      f.age = d - h.lastRx;
      s.push(f);
    }
    return s;
  }
  return {
    add: n,
    ingest: o,
    sample: u,
    remove: d => t.delete(d),
    clear: () => t.clear(),
    has: d => t.has(d),
    get: d => {
      var h;
      return ((h = t.get(d)) == null ? undefined : h.out) ?? null;
    },
    get size() {
      return t.size;
    },
    configure: d => Object.assign(e, d),
    config: e,
    stats() {
      return [...t.values()].map(d => ({
        id: d.id,
        snaps: d.snaps.length,
        offset: d.offset,
        age: d.out.age
      }));
    }
  };
}
export const vo = new Vector3();
export const Cb = new Vector3();
export const Vk = new Vector3();
export const Zme = 2.4;
export const ege = 150;
export const tge = 1200;
export const sge = 3e3;
