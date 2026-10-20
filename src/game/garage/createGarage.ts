// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { glyphPaths } from "../../ui/walk/hudPanel.ts";
import { Vector3, Quaternion, Object3D, MathUtils } from "three/webgpu";
import { l0e, ia } from "../../ui/garage/transitions.ts";
import { isVehicleUnlocked, gm, getUnlockDescription } from "../vehicles/catalog.ts";
import { $U, die } from "../../world/car/loadCar.ts";
import { o0e } from "../../runtime/warmup.ts";
export const c0e = 17;
export const u0e = {
  reflectionStrength: .32,
  normalWarp: .012,
  rippleStrength: .022,
  reflectionHighlight: 2.5
};
export const d0e = 36;
export const ra = {
  radius: 9.6,
  min: 5.4,
  max: 14,
  polar: 1.27,
  polarMin: .86,
  polarMax: 1.5,
  spin: .14
};
export const h0e = 2.6;
export const Tg = (i, e = "") => `<svg class="garage-icon ${e}" viewBox="0 -960 960 960" aria-hidden="true"><path d="${glyphPaths[i]}" fill="currentColor"/></svg>`;
export const uF = i => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${i}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const f0e = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/></svg>';
export const p0e = [["speed", "TOP SPEED"], ["accel", "ACCELERATION"], ["handling", "HANDLING"], ["nitro", "NITRO"]];
export const Lb = i => new Promise(e => setTimeout(e, i));
export const m0e = i => 1 - (1 - i) ** 3;
export function createGarage({
  renderer: renderer,
  scene: scene,
  camera: camera,
  pipeline: pipeline,
  world: world,
  drive: drive,
  fleet: fleet,
  progress: progress,
  cameraDirector: cameraDirector,
  renderLoop: renderLoop,
  state = null,
  onToggle = null,
  canOpen = () => true
}) {
  var Ue, Ae, Be, He, at;
  const f = world.car,
    p = world.ground,
    m = ((Ue = world.cityApi) == null ? undefined : Ue.lightPools) ?? null,
    A = ((Be = (Ae = world.cityApi) == null ? undefined : Ae.map) == null ? undefined : Be.groundY) ?? -5.4,
    g = fleet.cars,
    b = document.createElement("div");
  b.className = "garage";
  b.hidden = true;
  b.setAttribute("data-ui-block-look", "true");
  b.innerHTML = `
    <div class="garage__drag" aria-hidden="true"></div>
    <header class="garage__head">
      <div class="garage__title">${Tg("garage", "garage__title-icon")}<div><p>TRAPNEST NEON</p><h2>GARAGE</h2></div></div>
      <button type="button" class="garage__close" aria-label="Back to the city (Esc)">${f0e}</button>
    </header>
    <section class="garage__card" aria-live="polite">
      <p class="garage__maker"></p>
      <h3 class="garage__name"></h3>
      <p class="garage__blurb"></p>
      <div class="garage__unlock">${Tg("lock")}<p></p></div>
      <dl class="garage__specs"></dl>
      <ul class="garage__stats"></ul>
      <div class="garage__neon">
        <p><span>NEON</span><b class="garage__neon-name"></b></p>
        <div class="garage__swatches"></div>
        <small>A new hue every time you take the wheel.</small>
      </div>
      <div class="garage__paint">
        <p><span>PAINT</span><b class="garage__paint-name"></b></p>
        <div class="garage__swatches garage__paints"></div>
      </div>
      <p class="garage__credit"></p>
    </section>
    <nav class="garage__picker">
      <button type="button" class="garage__arrow" data-step="-1" aria-label="Previous car">${uF("M15 5l-7 7 7 7")}</button>
      <div class="garage__dots"></div>
      <button type="button" class="garage__arrow" data-step="1" aria-label="Next car">${uF("M9 5l7 7-7 7")}</button>
    </nav>
    <div class="garage__actions">
      <button type="button" class="garage__select"></button>
      <p class="garage__hint">DRAG TO ORBIT · SCROLL TO ZOOM · ← → CARS · ENTER SELECT · ESC BACK</p>
    </div>`;
  document.body.appendChild(b);
  const x = Re => b.querySelector(Re),
    y = x(".garage__drag"),
    _ = x(".garage__select"),
    w = x(".garage__dots"),
    S = x(".garage__swatches"),
    T = x(".garage__paints");
  w.innerHTML = g.map((Re, Fe) => `<button type="button" data-index="${Fe}" aria-label="${Re.name}"></button>`).join("");
  let v = false,
    E = false,
    C = 0,
    M = null,
    B = 0,
    R = 1,
    I = false;
  const k = {
      mode: "walk",
      position: new Vector3(),
      quaternion: new Quaternion(),
      fov: 60,
      ground: {}
    },
    L = {
      azimuth: 0,
      polar: ra.polar,
      radius: ra.radius,
      idle: 0
    },
    F = new Vector3(),
    O = new Vector3(),
    H = new Vector3();
  function W() {
    return camera.aspect < 1 ? {
      fov: 58,
      radius: 1.25,
      right: 0,
      down: 1.1
    } : window.innerHeight < 520 ? {
      fov: 40,
      radius: 1,
      right: -1.3,
      down: .15
    } : {
      fov: d0e,
      radius: 1,
      right: 0,
      down: 0
    };
  }
  const P = new Set([fleet.current.id]),
    z = l0e(),
    Y = 520,
    G = Re => Lb(Math.max(0, Y - (performance.now() - Re)));
  function X(Re) {
    return g[(Re % g.length + g.length) % g.length];
  }
  function ae() {
    var xe;
    const Re = X(C),
      Fe = fleet.get(Re.id),
      Je = isVehicleUnlocked(Re, progress),
      je = fleet.current.id === Re.id,
      Te = (M ?? fleet.current.id) === Re.id;
    b.classList.toggle("is-locked", !Je);
    x(".garage__maker").textContent = Re.maker;
    x(".garage__name").textContent = Re.name;
    x(".garage__blurb").textContent = Re.blurb;
    x(".garage__credit").textContent = Re.credit ?? "";
    const ue = Re.specs;
    x(".garage__specs").innerHTML = [["ENGINE", ue.engine], ["0–100 KM/H", `${ue.zeroTo100.toFixed(1)} s`], ["TOP SPEED", `${ue.topSpeed} km/h`], ["WEIGHT", `${ue.mass} kg`]].map(([me, ie]) => `<div><dt>${me}</dt><dd>${ie}</dd></div>`).join("");
    x(".garage__stats").innerHTML = p0e.map(([me, ie]) => `<li><span>${ie}</span><i><b style="transform:scaleX(${Re.stats[me]})"></b></i></li>`).join("");
    const $ = !!((xe = Re.paints) != null && xe.some(me => me.neon)),
      q = Fe != null && Fe.neon && !$ ? Fe.neon : null;
    b.classList.toggle("has-neon", !!q);
    q && (S.innerHTML = q.palette.map((me, ie) => `<button type="button" data-hue="${ie}" style="--c:${me.hex}" aria-label="${me.name}"></button>`).join(""), ne());
    const oe = Re.paints && Fe != null && Fe.paint ? Fe.paint : null;
    b.classList.toggle("has-paint", !!oe);
    oe && (x(".garage__paint p span").textContent = $ ? "STYLE" : "PAINT", T.innerHTML = Re.paints.map((me, ie) => `<button type="button" data-paint="${ie}"${me.neon ? ' class="is-style"' : ""} style="--c:${me.hex}${me.neon ? `;--n:${me.neon.hex}` : ""}" aria-label="${me.name}"></button>`).join(""), se());
    for (const [me, ie] of [...w.children].entries()) ie.classList.toggle("is-active", me === (C % g.length + g.length) % g.length);
    if (_.disabled = !Je || Te, !Je) {
      const {
          missions: me,
          races: ie,
          sigils: Ne
        } = gm(Re, progress),
        ze = (tt, dt, {
          need: need,
          have: have
        }) => need ? `<b>${tt} ${need} ${dt}${need === 1 ? "" : "S"} · ${Math.min(have, need)} / ${need}</b>` : "";
      x(".garage__unlock p").innerHTML = `<span>LOCKED</span>${ze("PASS", "MAIN MISSION", me)}${ze("WIN", "STREET RACE", ie)}${ze("FIND", "NEON SIGIL", Ne)}`;
    }
    _.innerHTML = Je ? Te ? `${Tg("check")}<span>${je && !M ? "YOUR RIDE" : "SELECTED · ESC TO DRIVE"}</span>` : `${Tg("garage")}<span>DRIVE THIS ONE</span>` : `${Tg("lock")}<span>LOCKED · ${getUnlockDescription(Re, progress).toUpperCase()}</span>`;
  }
  function ne() {
    var Fe;
    const Re = (Fe = fleet.get(X(C).id)) == null ? undefined : Fe.neon;
    if (Re) {
      x(".garage__neon-name").textContent = Re.current.name;
      x(".garage__neon-name").style.color = Re.current.hex;
      for (const [Je, je] of [...S.children].entries()) je.classList.toggle("is-active", Je === Re.index);
    }
  }
  function se() {
    var Je;
    const Re = X(C),
      Fe = $U(Re);
    if (Fe) {
      x(".garage__paint-name").textContent = Fe.name;
      x(".garage__paint-name").style.color = ((Je = Fe.neon) == null ? undefined : Je.hex) ?? "";
      for (const [je, Te] of [...T.children].entries()) Te.classList.toggle("is-active", Re.paints[je] === Fe);
    }
  }
  function re() {
    var ue;
    const {
        x: Re,
        z: Fe
      } = ia,
      Je = (ue = fleet.get(X(C).id)) == null ? undefined : ue.neon,
      je = Je ? Je.underglow.rgb : [.62, .7, 1],
      Te = [[7.5, 0, [.55, .2, 1]], [-7.5, 0, [0, .75, 1]], [0, 8.5, je], [0, -8.5, [1, .1, .55]]];
    m == null || m.setStage([{
      x: Re,
      z: Fe,
      size: 9,
      rgb: [.72, .78, 1],
      intensity: Je ? .35 : .8
    }, ...Te.map(([$, q, oe]) => ({
      x: Re + $,
      z: Fe + q,
      size: 7,
      rgb: oe,
      intensity: .55
    }))]);
  }
  function le() {
    f.position.set(ia.x, A, ia.z);
    f.quaternion.setFromAxisAngle(Object3D.DEFAULT_UP, ia.yaw);
    f.updateMatrixWorld(true);
  }
  function we(Re) {
    C = (Re % g.length + g.length) % g.length;
    fleet.show(X(C).id);
    le();
    B = 0;
    re();
    ae();
  }
  function Se(Re) {
    R = Math.min(1, R + Re / 1.8);
    const Fe = m0e(R);
    L.idle += Re;
    const Je = ra.spin * MathUtils.smoothstep(L.idle, 2.5, 4.5);
    L.azimuth += Je * Re;
    const je = W(),
      Te = (L.radius + (1 - Fe) * 4.5) * je.radius,
      ue = L.polar + (1 - Fe) * .12,
      $ = L.azimuth + (1 - Fe) * 1.1;
    F.set(ia.x, A + .62, ia.z);
    camera.position.set(F.x + Math.sin(ue) * Math.sin($) * Te, F.y + Math.cos(ue) * Te, F.z + Math.sin(ue) * Math.cos($) * Te);
    H.set(Math.cos($), 0, -Math.sin($));
    O.copy(F).addScaledVector(H, je.right).y -= je.down;
    camera.lookAt(O);
    camera.updateMatrixWorld(true);
    camera.fov !== je.fov && (camera.fov = je.fov, camera.updateProjectionMatrix());
  }
  const ye = new Map();
  let U = 0;
  y.addEventListener("pointerdown", Re => {
    var Fe;
    if ((Fe = y.setPointerCapture) == null || Fe.call(y, Re.pointerId), ye.set(Re.pointerId, {
      x: Re.clientX,
      y: Re.clientY
    }), ye.size === 2) {
      const [Je, je] = [...ye.values()];
      U = Math.hypot(Je.x - je.x, Je.y - je.y);
    }
  });
  y.addEventListener("pointermove", Re => {
    const Fe = ye.get(Re.pointerId);
    if (!Fe) return;
    const Je = Re.clientX - Fe.x,
      je = Re.clientY - Fe.y;
    if (Fe.x = Re.clientX, Fe.y = Re.clientY, ye.size === 1) L.azimuth -= Je * .006, L.polar = MathUtils.clamp(L.polar - je * .004, ra.polarMin, ra.polarMax);else if (ye.size === 2) {
      const [Te, ue] = [...ye.values()],
        $ = Math.hypot(Te.x - ue.x, Te.y - ue.y);
      U > 0 && (L.radius = MathUtils.clamp(L.radius * (U / $), ra.min, ra.max));
      U = $;
    }
    L.idle = 0;
  });
  const J = Re => {
    ye.delete(Re.pointerId);
    U = 0;
  };
  y.addEventListener("pointerup", J);
  y.addEventListener("pointercancel", J);
  y.addEventListener("wheel", Re => {
    Re.preventDefault();
    L.radius = MathUtils.clamp(L.radius * Math.exp(Re.deltaY * .0012), ra.min, ra.max);
    L.idle = Math.min(L.idle, 1.5);
  }, {
    passive: false
  });
  async function Q() {
    var je, Te, ue, $, q, oe, xe;
    if (v || E || !canOpen()) return;
    E = true;
    k.mode = cameraDirector.getCameraMode();
    k.position.copy(camera.position);
    k.quaternion.copy(camera.quaternion);
    k.fov = camera.fov;
    (je = cameraDirector.walkControls) == null || je.setActive(false);
    M = null;
    I = false;
    v = true;
    b.hidden = false;
    document.body.classList.add("garage-open");
    (Te = state == null ? undefined : state.openPanel) == null || Te.call(state, "garage");
    document.pointerLockElement && ((ue = document.exitPointerLock) == null || ue.call(document));
    onToggle == null || onToggle(true);
    await z.cover("PREPARING THE GARAGE");
    const Re = performance.now();
    if (await fleet.load(fleet.current.id), ($ = p == null ? undefined : p.uniforms) != null && $.garage) {
      for (const [me, ie] of Object.entries(u0e)) k.ground[me] = p.uniforms[me].value, p.uniforms[me].value = ie;
      p.uniforms.garage.value = 1;
      p.uniforms.garageCenter.value.set(ia.x, ia.z);
      p.uniforms.garageRadius.value = c0e;
    }
    camera.fov = W().fov;
    camera.updateProjectionMatrix();
    (oe = (q = world.smoke) == null ? undefined : q.setExhaustFade) == null || oe.call(q, 0);
    L.azimuth = ia.yaw + .75;
    L.polar = ra.polar;
    L.radius = ra.radius;
    L.idle = 3;
    R = 1;
    Se(0);
    const Fe = Math.max(0, g.findIndex(me => me.id === fleet.current.id)),
      Je = g.filter(me => !P.has(me.id) && fleet.get(me.id));
    if (Je.length) {
      renderLoop.stopLoop();
      try {
        for (const me of Je) fleet.show(me.id), le(), (xe = pipeline.syncCameras) == null || xe.call(pipeline, camera), await o0e({
          renderer: renderer,
          scene: scene,
          pipeline: pipeline,
          camera: camera,
          world: world
        }), P.add(me.id);
      } catch (me) {
        console.warn("[garage] compile:", me);
      } finally {
        renderLoop.startLoop();
      }
    }
    we(Fe);
    I = true;
    await Lb(120);
    await G(Re);
    R = 0;
    b.classList.add("is-open");
    await z.reveal();
    E = false;
  }
  async function j() {
    var Je, je, Te, ue, $;
    if (!v || E) return;
    E = true;
    const Re = M && M !== fleet.current.id;
    b.classList.remove("is-open");
    await z.cover(Re ? `WARMING UP · ${X(C).name}` : "BACK TO THE CITY");
    const Fe = performance.now();
    try {
      M && M !== fleet.current.id ? await fleet.commit(M) : fleet.show(fleet.current.id);
    } catch (q) {
      console.warn("[garage] could not switch cars:", q);
      fleet.show(fleet.current.id);
    }
    if (I = false, drive.visual.resetInterpolation(), drive.visual.update(1), f.updateMatrixWorld(true), m == null || m.setStage([]), (je = m == null ? undefined : m.setUnderglow) == null || je.call(m, ((Je = drive.car.neon) == null ? undefined : Je.underglow) ?? null), (Te = p == null ? undefined : p.uniforms) != null && Te.garage) {
      p.uniforms.garage.value = 0;
      for (const [q, oe] of Object.entries(k.ground)) p.uniforms[q].value = oe;
    }
    camera.fov = k.fov;
    camera.updateProjectionMatrix();
    camera.position.copy(k.position);
    camera.quaternion.copy(k.quaternion);
    camera.updateMatrixWorld(true);
    k.mode === "walk" ? ((ue = world.syncCarWalkCollider) == null || ue.call(world), ($ = cameraDirector.walkControls) == null || $.setActive(true)) : drive.chase.snap();
    v = false;
    b.hidden = true;
    document.body.classList.remove("garage-open");
    (state == null ? undefined : state.openedPanel) === "garage" && state.closePanel();
    onToggle == null || onToggle(false);
    await Lb(60);
    await G(Fe);
    await z.reveal();
    E = false;
  }
  function de() {
    const Re = X(C);
    E || !isVehicleUnlocked(Re, progress) || (M = Re.id, ae(), j());
  }
  async function K(Re) {
    if (E) return;
    E = true;
    const previous = C;
    try {
      await z.cover("PREPARING THIS RIDE", { quick: true });
      const next = (C + Re + g.length) % g.length;
      await fleet.load(X(next).id);
      we(next);
      if (!P.has(X(next).id)) {
        renderLoop.stopLoop();
        try {
          pipeline.syncCameras?.(camera);
          await o0e({ renderer, scene, pipeline, camera, world });
          P.add(X(next).id);
        } finally { renderLoop.startLoop(); }
      }
      R = .55;
      await Lb(40);
    } catch (error) {
      we(previous);
      x(".garage__blurb").textContent = "That ride could not arrive. Your current car is safe. Check your connection and select the ride again to retry.";
    } finally {
      await z.reveal();
      E = false;
    }
  }
  b.addEventListener("click", Re => {
    var Je, je, Te, ue, $, q, oe, xe, me;
    const Fe = Re.target;
    if ((Je = Fe.closest) != null && Je.call(Fe, ".garage__close")) j();else if ((je = Fe.closest) != null && je.call(Fe, ".garage__select")) de();else if ((Te = Fe.closest) != null && Te.call(Fe, "[data-step]")) K(Number(Fe.closest("[data-step]").dataset.step));else if ((ue = Fe.closest) != null && ue.call(Fe, "[data-index]")) {
      const ie = Number(Fe.closest("[data-index]").dataset.index);
      ie !== C && K(ie - C);
    } else if (($ = Fe.closest) != null && $.call(Fe, "[data-hue]")) {
      const ie = (q = fleet.get(X(C).id)) == null ? undefined : q.neon;
      ie == null || ie.setIndex(Number(Fe.closest("[data-hue]").dataset.hue));
      B = -4;
      re();
      ne();
    } else if ((oe = Fe.closest) != null && oe.call(Fe, "[data-paint]")) {
      const ie = X(C),
        Ne = (xe = ie.paints) == null ? undefined : xe[Number(Fe.closest("[data-paint]").dataset.paint)],
        ze = fleet.get(ie.id);
      Ne && ze != null && ze.paint && (ze.paint.set(Ne.hex), Ne.neon && ((me = ze.neon) == null || me.setStyle({
        name: Ne.name,
        ...Ne.neon
      }), re()), die(ie, Ne), se());
    }
  });
  function V(Re) {
    if (!v || (Re.stopImmediatePropagation(), Re.repeat)) return;
    const Fe = Re.code;
    Fe === "Escape" ? (Re.preventDefault(), j()) : Fe === "ArrowLeft" || Fe === "KeyA" ? K(-1) : Fe === "ArrowRight" || Fe === "KeyD" ? K(1) : (Fe === "Enter" || Fe === "NumpadEnter" || Fe === "Space") && (Re.preventDefault(), de());
  }
  window.addEventListener("keydown", V, true);
  const te = (He = state == null ? undefined : state.subscribe) == null ? undefined : He.call(state, ({
      openedPanel: openedPanel
    }) => {
      v && !E && openedPanel && openedPanel !== "garage" && j();
    }),
    fe = (at = progress == null ? undefined : progress.subscribe) == null ? undefined : at.call(progress, Re => {
      v && Re.type === "allCars" && ae();
    });
  function Ce(Re) {
    var je;
    if (!v || !I) return;
    Se(Re);
    const Fe = fleet.shown();
    (je = Fe == null ? undefined : Fe.lights) == null || je.update({
      braking: 0,
      reversing: false
    });
    const Je = Fe == null ? undefined : Fe.neon;
    Je && !Je.styled && !E && (B += Re, B >= h0e && (B = 0, Je.setIndex(Je.index + 1), re(), ne()));
  }
  return {
    root: b,
    update: Ce,
    mapMarker: {
      kind: "garage",
      id: "garage",
      name: "Garage",
      icon: "garage",
      x: ia.x,
      z: ia.z,
      onSelect: () => Q()
    },
    open: Q,
    close: j,
    get isOpen() {
      return v;
    },
    orbit: L,
    dispose() {
      window.removeEventListener("keydown", V, true);
      te == null || te();
      fe == null || fe();
      z.dispose();
      b.remove();
    }
  };
}
