// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Upe, Ope, Gpe, zpe, Vpe, Ppe, Dpe, Bk, Qpe } from "../../game/missions/checkpointBeacons.ts";
export function typewriter(i, e, {
  cps = 40,
  delay = 0,
  sound = null,
  onDone = null,
  voice = null
} = {}) {
  i.textContent = "";
  i.classList.add("typed");
  i.classList.remove("is-done", "is-instant");
  const a = document.createElement("span");
  a.className = "typed__reader";
  a.textContent = e;
  i.appendChild(a);
  const l = [];
  let c = delay;
  e.split(`
`).forEach((M, B) => {
    B && (i.appendChild(document.createElement("br")), c += Upe);
    M.split(" ").forEach((R, I) => {
      if (I && (i.appendChild(document.createTextNode(" ")), c += 1 / cps), !R) return;
      const k = document.createElement("span");
      k.className = "typed__word";
      k.setAttribute("aria-hidden", "true");
      const L = [...R];
      L.forEach((F, O) => {
        const H = document.createElement("span");
        H.className = "typed__ch";
        H.textContent = F;
        k.appendChild(H);
        l.push({
          span: H,
          at: c
        });
        const W = O < L.length - 1 && /[.\d]/.test(L[O + 1]);
        c += 1 / cps + (W ? 0 : Ope[F] ?? 0);
      });
      i.appendChild(k);
    });
  });
  let u = 1;
  if ((voice == null ? undefined : voice.duration) > 0 && l.length) {
    const M = Math.max(.001, l.at(-1).at - delay);
    u = Math.min(Gpe, Math.max(1, (voice.duration - zpe) / M));
    for (const B of l) B.at = delay + (B.at - delay) * u;
  }
  let d = 0;
  const h = voice && sound ? () => d++ % Vpe === 0 ? sound() : undefined : sound;
  let f = 0,
    p = 0,
    m = false,
    A = null,
    g = 0;
  const b = new Set();
  let x;
  const y = new Promise(M => {
      x = M;
    }),
    _ = performance.now();
  function w(M) {
    A == null || A.classList.remove("is-caret");
    A = M;
    A == null || A.classList.add("is-caret");
  }
  function S() {
    for (const M of b) M.classList.remove("is-glitch");
    b.clear();
  }
  function T(M) {
    if (!(M - g < Ppe)) {
      g = M;
      S();
      for (let B = f; B < Math.min(l.length, f + Dpe); B++) {
        const {
          span: R
        } = l[B];
        R.dataset.g = Bk[Math.floor(Math.random() * Bk.length)];
        R.classList.add("is-glitch");
        b.add(R);
      }
    }
  }
  function v(M) {
    const {
      span: B
    } = l[M];
    B.classList.remove("is-glitch");
    b.delete(B);
    B.classList.add("is-on");
  }
  function E() {
    var M;
    if (!m) {
      for (m = true, cancelAnimationFrame(p), p = 0, S(); f < l.length;) v(f++);
      w(((M = l.at(-1)) == null ? undefined : M.span) ?? null);
      i.classList.add("is-done");
      onDone == null || onDone();
      x();
    }
  }
  function C(M) {
    p = 0;
    const B = (M - _) / 1e3;
    if (u > 1 && voice != null && voice.failed) {
      for (let I = f; I < l.length; I++) l[I].at = B + (l[I].at - B) / u;
      u = 1;
    }
    const R = f;
    for (; f < l.length && l[f].at <= B;) v(f++);
    if (f > R && (w(l[f - 1].span), h == null || h()), f >= l.length) {
      E();
      return;
    }
    T(M);
    p = requestAnimationFrame(C);
  }
  !l.length || Qpe() ? (i.classList.add("is-instant"), E()) : p = requestAnimationFrame(C);
  return {
    done: y,
    get isDone() {
      return m;
    },
    finish() {
      voice == null || voice.stop();
      !m && (i.classList.add("is-instant"), E());
    },
    cancel() {
      voice == null || voice.stop();
      !m && (m = true, cancelAnimationFrame(p), p = 0, S(), x());
    }
  };
}
export const qpe = typeof matchMedia == "function" && matchMedia("(pointer: coarse)").matches;
export const Hpe = i => "★".repeat(i) + "☆".repeat(Math.max(0, 3 - i));
