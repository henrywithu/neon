// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { vo, Zme, Cb, tge, sge, ege, Vk } from "./roster.ts";
export function createNameTags({
  camera: camera
}) {
  const e = document.createElement("div");
  e.className = "mp-tags";
  document.body.appendChild(e);
  const t = new Map(),
    s = new Map();
  function n(u) {
    let d = t.get(u.id);
    if (!d) {
      const h = document.createElement("div");
      h.className = "mp-tag";
      h.style.setProperty("--c", u.color.css);
      const f = document.createElement("b"),
        p = document.createElement("span"),
        m = document.createElement("div");
      m.className = "mp-tag__say";
      h.append(f, p, m);
      e.appendChild(h);
      d = {
        el: h,
        name: f,
        distance: p,
        say: m,
        sayTimer: 0,
        nameText: "",
        distanceText: "",
        shown: false,
        away: false
      };
      t.set(u.id, d);
    }
    return d;
  }
  function r(u) {
    u.shown && (u.shown = false, u.el.classList.remove("is-shown"), u.el.style.opacity = "0");
  }
  function o(u) {
    camera.updateMatrixWorld();
    const d = window.innerWidth,
      h = window.innerHeight,
      f = new Set();
    for (const p of u) {
      f.add(p.id);
      const m = n(p);
      vo.set(p.x, p.y + Zme, p.z);
      Cb.copy(vo).applyMatrix4(camera.matrixWorldInverse);
      const A = vo.distanceTo(camera.position);
      if (Cb.z > -.5 || A > tge) {
        r(m);
        continue;
      }
      vo.project(camera);
      const g = (vo.x * .5 + .5) * d,
        b = (-vo.y * .5 + .5) * h;
      if (g < -120 || g > d + 120 || b < -40 || b > h + 40) {
        r(m);
        continue;
      }
      p.name !== m.nameText && (m.nameText = p.name, m.name.textContent = p.name);
      const x = p.age > sge;
      x !== m.away && (m.away = x, m.el.classList.toggle("is-away", x));
      const y = x ? "AWAY" : `${Math.round(A / 5) * 5} M`;
      y !== m.distanceText && (m.distanceText = y, m.distance.textContent = y);
      m.shown || (m.shown = true, m.el.classList.add("is-shown"));
      m.el.style.opacity = String(Math.max(.4, Math.min(1, 1.1 - (A - ege) / 900)));
      m.el.style.transform = `translate3d(${g.toFixed(1)}px, ${b.toFixed(1)}px, 0) translate(-50%, calc(-100% - 8px))`;
    }
    for (const [p, m] of t) f.has(p) || (c(m), t.delete(p));
  }
  function a(u, d, h) {
    camera.updateMatrixWorld();
    const f = window.innerWidth,
      p = window.innerHeight,
      m = new Set();
    for (const A of u) {
      m.add(A.key);
      let g = s.get(A.key);
      if (!g) {
        const T = document.createElement("div");
        T.className = "mp-ping";
        T.style.setProperty("--c", A.color);
        const v = document.createElement("b");
        v.textContent = `PING · ${A.name}`;
        const E = document.createElement("span");
        T.append(v, E);
        e.appendChild(T);
        g = {
          el: T,
          name: v,
          distance: E,
          distanceText: "",
          shown: false
        };
        s.set(A.key, g);
      }
      vo.set(A.x, d + 8, A.z);
      Cb.copy(vo).applyMatrix4(camera.matrixWorldInverse);
      const b = vo.distanceTo(camera.position);
      vo.project(camera);
      const x = (vo.x * .5 + .5) * f,
        y = (-vo.y * .5 + .5) * p;
      Vk.set(A.x, d, A.z).project(camera);
      const _ = Math.max(10, Math.min(420, (-Vk.y * .5 + .5) * p - y - 24));
      if (Cb.z > -.5 || x < -120 || x > f + 120 || y < -40 || y > p + 40) {
        g.shown && (g.shown = false, g.el.classList.remove("is-shown"), g.el.style.opacity = "0");
        continue;
      }
      const S = `${Math.round(b / 10) * 10} M`;
      S !== g.distanceText && (g.distanceText = S, g.distance.textContent = S);
      g.shown || (g.shown = true, g.el.classList.add("is-shown"));
      g.el.style.opacity = String(Math.max(0, Math.min(1, (A.expires - h) / 4e3)));
      g.el.style.setProperty("--stem", `${_.toFixed(0)}px`);
      g.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, calc(-100% - 24px))`;
    }
    for (const [A, g] of s) m.has(A) || (g.el.remove(), s.delete(A));
  }
  function l(u, d, h = 4200) {
    const f = t.get(u);
    f && (f.say.textContent = d, f.el.classList.add("is-saying"), clearTimeout(f.sayTimer), f.sayTimer = setTimeout(() => f.el.classList.remove("is-saying"), h));
  }
  function c(u) {
    clearTimeout(u.sayTimer);
    u.el.remove();
  }
  return {
    update: o,
    updatePings: a,
    say: l,
    clear() {
      for (const u of t.values()) c(u);
      t.clear();
      for (const u of s.values()) u.el.remove();
      s.clear();
    },
    dispose() {
      for (const u of t.values()) clearTimeout(u.sayTimer);
      e.remove();
      t.clear();
    }
  };
}
