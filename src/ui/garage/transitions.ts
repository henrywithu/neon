// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { cc } from "../map/markers.ts";
import { aF, rF, cF, lF, oF } from "../../runtime/warmup.ts";
export function l0e({
  parent = document.body
} = {}) {
  const e = document.createElement("div");
  e.className = "garage-transit";
  e.setAttribute("aria-hidden", "true");
  e.innerHTML = `
    <div class="garage-transit__veil"></div>
    <div class="garage-transit__center">
      <div class="garage-transit__badge">${cc("garage", {
    size: 92,
    variant: "garage"
  })}</div>
      <p class="garage-transit__title">GARAGE</p>
      <p class="garage-transit__status"></p>
      <span class="garage-transit__bar"><i></i></span>
    </div>`;
  parent.appendChild(e);
  const t = e.querySelector(".garage-transit__status");
  let s = 0;
  async function n(o = "", {
    quick = false
  } = {}) {
    const l = ++s;
    t.textContent = o;
    e.classList.remove("is-revealing");
    e.classList.toggle("is-quick", quick);
    e.style.setProperty("--fade-ms", `${quick ? aF : rF}ms`);
    e.classList.add("is-active");
    await new Promise(c => requestAnimationFrame(c));
    l === s && (e.classList.add("is-covering"), await cF(quick ? aF : rF));
  }
  async function r() {
    const o = ++s,
      a = e.classList.contains("is-quick");
    e.style.setProperty("--fade-ms", `${a ? lF : oF}ms`);
    e.classList.add("is-revealing");
    e.classList.remove("is-covering");
    await cF(a ? lF : oF);
    o === s && e.classList.remove("is-active", "is-revealing", "is-quick");
  }
  return {
    root: e,
    cover: n,
    reveal: r,
    setStatus(o) {
      t.textContent = o;
    },
    dispose() {
      s++;
      e.remove();
    }
  };
}
export const ia = {
  x: -216,
  z: 1208,
  yaw: -2.35
};
