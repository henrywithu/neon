// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { kl, ab, kS } from "../../audio/radio/createRadio.ts";
import { isAudioPlaying, setAudioPlaying, subscribeAudioState } from "../../audio/audioState.ts";
export function createRadioPanel({
  radio: radio,
  onToggle = null,
  getCarAudio = () => null,
  voice = null
}) {
  const n = document.createElement("div");
  n.className = "radio";
  n.setAttribute("aria-hidden", "true");
  n.setAttribute("data-ui-block-look", "true");
  n.innerHTML = `
    <div class="radio__screen" role="dialog" aria-label="Radio">
      <nav class="radio__tabs">
        <span class="radio__bumper">M</span>
        <span class="radio__tab radio__tab--brand">NEON·FM 88.7</span>
        <span class="radio__tab is-active">PLAYLIST<span class="radio__tab-count"></span></span>
        <span class="radio__tabs-fill" aria-hidden="true"></span>
        <button type="button" class="radio__tab radio__tab--btn" data-action="shuffle"></button>
        <button type="button" class="radio__tab radio__tab--btn" data-action="repeat"></button>
        <button type="button" class="radio__tab radio__tab--btn radio__tab--close" data-action="close">CLOSE</button>
        <span class="radio__bumper">ESC</span>
      </nav>
      <div class="radio__body">
        <ol class="radio__list"></ol>
        <section class="radio__deck">
          <h2 class="radio__title"></h2>
          <p class="radio__artist"></p>
          <canvas class="radio__viz"></canvas>
          <div class="radio__time"><span class="radio__elapsed">00:00</span><span class="radio__remaining">-00:00</span></div>
          <div class="radio__progress" role="slider" aria-label="Seek" tabindex="-1">
            <div class="radio__progress-fill"></div>
          </div>
          <div class="radio__controls">
            <div class="radio__transport">
              <button type="button" class="radio__key" data-action="prev" aria-label="Previous">${kl.prev}</button>
              <button type="button" class="radio__key" data-action="play" aria-label="Play">${kl.play}</button>
              <button type="button" class="radio__key" data-action="pause" aria-label="Pause">${kl.pause}</button>
              <button type="button" class="radio__key" data-action="stop" aria-label="Stop">${kl.stop}</button>
              <button type="button" class="radio__key" data-action="next" aria-label="Next">${kl.next}</button>
            </div>
            <div class="radio__mix">
              <div class="radio__volume" aria-label="Music volume">
                <span class="radio__volume-label">MUSIC</span>
                <div class="radio__volume-bars" data-channel="music"></div>
              </div>
              <div class="radio__volume radio__volume--car" aria-label="Car volume" hidden>
                <span class="radio__volume-label">CAR</span>
                <div class="radio__volume-bars" data-channel="car"></div>
              </div>
            </div>
            <div class="radio__switches">
              <button type="button" class="radio__mute radio__switch" data-action="mute" aria-pressed="false"></button>
              ${voice ? '<button type="button" class="radio__voices radio__switch" data-action="voices" aria-pressed="false"></button>' : ""}
            </div>
            <div class="radio__hatch" aria-hidden="true"></div>
          </div>
        </section>
      </div>
      <footer class="radio__hints">
        <span><kbd>↑↓</kbd> SELECT TRACK</span>
        <span><kbd>⏎</kbd> PLAY</span>
        <span><kbd>←→</kbd> SKIP</span>
        <span><kbd>SPACE</kbd> PAUSE</span>
        <span><kbd>X</kbd> MUTE</span>
        ${voice ? "<span><kbd>O</kbd> VOICES</span>" : ""}
        <span><kbd>N</kbd> NEXT (DRIVING)</span>
        <span><kbd>M</kbd> CLOSE</span>
        <span class="radio__credit"></span>
      </footer>
    </div>`;
  const r = document.createElement("div");
  r.className = "radio-ticker";
  r.innerHTML = `
    <span class="radio-ticker__eq"><i></i><i></i><i></i><i></i></span>
    <span class="radio-ticker__label">NEON·FM</span>
    <span class="radio-ticker__track"></span>`;
  document.body.appendChild(n);
  document.body.appendChild(r);
  const o = n.querySelector(".radio__list"),
    a = n.querySelector(".radio__title"),
    l = n.querySelector(".radio__artist"),
    c = n.querySelector(".radio__viz"),
    u = c.getContext("2d"),
    d = n.querySelector(".radio__elapsed"),
    h = n.querySelector(".radio__remaining"),
    f = n.querySelector(".radio__progress"),
    p = n.querySelector(".radio__progress-fill"),
    m = n.querySelector('.radio__volume-bars[data-channel="music"]'),
    A = n.querySelector(".radio__volume--car"),
    g = n.querySelector('.radio__volume-bars[data-channel="car"]'),
    b = n.querySelector('[data-action="shuffle"]'),
    x = n.querySelector('[data-action="repeat"]'),
    y = n.querySelector(".radio__credit"),
    _ = n.querySelector(".radio__tab-count"),
    w = n.querySelector(".radio__mute"),
    S = n.querySelector(".radio__voices"),
    T = r.querySelector(".radio-ticker__track"),
    v = radio.tracks;
  let E = false,
    C = radio.index,
    M = 0,
    B = 0;
  const R = new Uint8Array(radio.analyser.frequencyBinCount),
    I = new Float32Array(ab);
  o.innerHTML = v.length ? v.map((Q, j) => `
      <li class="radio__row" data-index="${j}">
        <span class="radio__row-name">${Q.display}</span>
        <span class="radio__row-artist">${Q.artist}</span>
        <span class="radio__row-time">${kS(Q.duration)}</span>
      </li>`).join("") : '<li class="radio__row radio__row--empty">NO SIGNAL — playlist missing</li>';
  const k = [...o.querySelectorAll(".radio__row[data-index]")];
  _.textContent = String(v.length);
  function L() {
    const Q = o.scrollHeight - o.clientHeight;
    o.classList.toggle("has-above", o.scrollTop > 2);
    o.classList.toggle("has-below", o.scrollTop < Q - 2);
  }
  o.addEventListener("scroll", L, {
    passive: true
  });
  function F() {
    var Q;
    k.forEach((j, de) => {
      j.classList.toggle("is-current", de === radio.index);
      j.classList.toggle("is-selected", de === C);
      j.classList.toggle("is-playing", de === radio.index && radio.playing);
      j.classList.toggle("is-unavailable", !!v[de].unavailable);
    });
    (Q = k[C]) == null || Q.scrollIntoView({
      block: "nearest"
    });
    L();
  }
  function O() {
    const Q = v[radio.index];
    Q && (a.textContent = Q.display, a.dataset.text = Q.display, l.textContent = `${Q.artist} · ${Q.title}`, y.innerHTML = `♪ “${Q.title}” by ${Q.artist} — <a href="${Q.page}" target="_blank" rel="noopener">Pixabay</a>`, F());
  }
  function H() {
    n.classList.toggle("is-playing", radio.playing);
    r.classList.toggle("is-playing", radio.playing);
    F();
  }
  function W() {
    const Q = radio.repeat.toUpperCase();
    b.innerHTML = `SHUFFLE<b class="radio__state">${radio.shuffle ? "ON" : "OFF"}</b>`;
    b.classList.toggle("is-on", radio.shuffle);
    b.setAttribute("aria-pressed", radio.shuffle ? "true" : "false");
    x.innerHTML = `REPEAT<b class="radio__state">${Q}</b>`;
    x.classList.toggle("is-on", radio.repeat !== "off");
    x.setAttribute("aria-label", `Repeat: ${radio.repeat}`);
  }
  function P(Q, j, de) {
    return Array.from({
      length: 10
    }, (K, V) => `<button type="button" class="radio__vol${(V + 1) / 10 <= Q + 1e-6 ? " is-on" : ""}" data-channel="${j}" data-volume="${(V + 1) / 10}" aria-label="${de} ${(V + 1) * 10}%"></button>`).join("");
  }
  function z() {
    m.innerHTML = P(radio.volume, "music", "Music volume");
    const Q = getCarAudio();
    A.hidden = !Q;
    Q && (g.innerHTML = P(Q.volume, "car", "Car volume"));
  }
  function Y(Q = isAudioPlaying()) {
    n.classList.toggle("is-muted", !Q);
    w.setAttribute("aria-pressed", Q ? "false" : "true");
    w.setAttribute("aria-label", Q ? "Mute the game" : "Unmute the game");
    w.innerHTML = `${Q ? kl.soundOn : kl.soundOff}<span><b>${Q ? "SOUND ON" : "MUTED"}</b><small>${Q ? "CLICK TO MUTE" : "CLICK FOR SOUND"}</small></span>`;
  }
  function G(Q) {
    S && (S.classList.toggle("is-off", !Q), S.setAttribute("aria-pressed", Q ? "false" : "true"), S.setAttribute("aria-label", Q ? "Turn the character voices off" : "Turn the character voices on"), S.innerHTML = `${Q ? kl.voiceOn : kl.voiceOff}<span><b>${Q ? "VOICES ON" : "VOICES OFF"}</b><small>${Q ? "CLICK TO TURN OFF" : "CLICK TO TURN ON"}</small></span>`);
  }
  function X() {
    const Q = radio.duration,
      j = radio.currentTime;
    d.textContent = kS(j);
    h.textContent = `-${kS(Math.max(0, Q - j))}`;
    p.style.transform = `scaleX(${Q > 0 ? Math.min(1, j / Q) : 0})`;
  }
  function ae() {
    const Q = v[radio.index];
    !Q || E || (T.textContent = `${Q.display} — ${Q.artist}`, r.classList.add("is-visible"), clearTimeout(B), B = setTimeout(() => r.classList.remove("is-visible"), 4800));
  }
  function ne() {
    const Q = Math.min(2, window.devicePixelRatio || 1),
      j = c.offsetWidth,
      de = c.offsetHeight;
    c.width = Math.max(1, Math.round(j * Q));
    c.height = Math.max(1, Math.round(de * Q));
  }
  function se() {
    M = requestAnimationFrame(se);
    const Q = c.width,
      j = c.height;
    u.clearRect(0, 0, Q, j);
    radio.analyser.getByteFrequencyData(R);
    const de = R.length,
      K = j / 2,
      V = Q / ab,
      te = Math.max(1, V * .46);
    u.fillStyle = "#34f5e9";
    const fe = performance.now() * .001;
    for (let Ce = 0; Ce < ab; Ce++) {
      const Ue = Ce / (ab - 1),
        Ae = Math.abs(Ue - .5) * 2,
        Be = Math.min(de - 1, Math.floor(1 + Math.pow(Ae, 1.6) * de * .7)),
        He = Math.min(1, R[Be] / 255 * (1 + Ae * 1.4)),
        at = radio.playing ? 0 : .03 + .02 * Math.sin(fe * 3 + Ce * .7),
        Re = Math.max(at, Math.pow(He, 1.5));
      I[Ce] += (Re - I[Ce]) * (Re > I[Ce] ? .55 : .16);
      const Fe = Math.pow(Math.cos(Ae * Math.PI * .5), .45) * .9 + .1,
        Je = Math.max(1.5, I[Ce] * Fe * K * .95);
      u.fillRect(Ce * V + (V - te) / 2, K - Je, te, Je * 2);
    }
    u.fillStyle = "rgba(52, 245, 233, 0.18)";
    u.fillRect(0, K - .5, Q, 1);
    X();
  }
  function re(Q) {
    var j;
    !!Q !== E && (E = !!Q, onToggle == null || onToggle(E), n.classList.toggle("is-open", E), n.setAttribute("aria-hidden", E ? "false" : "true"), E ? ((j = document.exitPointerLock) == null || j.call(document), r.classList.remove("is-visible"), C = radio.index, O(), H(), W(), z(), requestAnimationFrame(() => {
      ne();
      L();
      cancelAnimationFrame(M);
      se();
    })) : cancelAnimationFrame(M));
  }
  function le(Q, j) {
    var de;
    switch (Q) {
      case "play":
        radio.play(C !== radio.index ? C : undefined);
        break;
      case "pause":
        radio.pause();
        break;
      case "toggle":
        radio.toggle();
        break;
      case "stop":
        radio.stop();
        break;
      case "prev":
        radio.prev();
        break;
      case "next":
        radio.next();
        break;
      case "shuffle":
        radio.setShuffle(!radio.shuffle), W();
        break;
      case "repeat":
        radio.cycleRepeat(), W();
        break;
      case "volume":
        radio.setVolume(j), z();
        break;
      case "carVolume":
        (de = getCarAudio()) == null || de.setVolume(j), z();
        break;
      case "mute":
        setAudioPlaying(!isAudioPlaying());
        break;
      case "voices":
        voice == null || voice.setEnabled(!voice.enabled);
        break;
      case "close":
        re(false);
        break;
    }
  }
  n.addEventListener("click", Q => {
    const j = Q.target.closest("[data-action], [data-volume], .radio__row[data-index]");
    if (!j) {
      Q.target === n && re(false);
      return;
    }
    Q.stopPropagation();
    j.dataset.volume ? le(j.dataset.channel === "car" ? "carVolume" : "volume", Number(j.dataset.volume)) : j.dataset.index ? (C = Number(j.dataset.index), le("play")) : le(j.dataset.action);
  });
  f.addEventListener("pointerdown", Q => {
    const j = de => {
      const K = f.getBoundingClientRect();
      radio.seek((de.clientX - K.left) / K.width);
      X();
    };
    j(Q);
    f.setPointerCapture(Q.pointerId);
    f.onpointermove = j;
    f.onpointerup = () => {
      f.onpointermove = null;
    };
  });
  function we(Q) {
    if (Q.target instanceof HTMLElement && Q.target.matches("input, textarea, select")) return;
    const j = Q.code;
    if (!E) {
      if (Q.type !== "keydown" || Q.repeat) return;
      if (j === "KeyM" || j === "KeyP") re(true);else if (j === "KeyN") radio.next();else return;
      Q.preventDefault();
      return;
    }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "NumpadEnter", "Space", "Escape", "KeyP", "KeyS", "KeyN", "KeyM", "KeyX", "KeyO"].includes(j)) {
      Q.type === "keydown" && !Q.metaKey && !Q.ctrlKey && !/^F\d+$/.test(j) && (Q.preventDefault(), Q.stopImmediatePropagation());
      return;
    }
    Q.preventDefault();
    Q.stopImmediatePropagation();
    Q.type === "keydown" && (j === "ArrowUp" ? C = (C - 1 + v.length) % v.length : j === "ArrowDown" ? C = (C + 1) % v.length : j === "Enter" || j === "NumpadEnter" ? le("play") : j === "ArrowLeft" ? le("prev") : j === "ArrowRight" || j === "KeyN" ? le("next") : j === "Space" && !Q.repeat ? le("toggle") : j === "KeyS" && !Q.repeat ? le("shuffle") : j === "KeyX" && !Q.repeat ? le("mute") : j === "KeyO" && !Q.repeat ? le("voices") : (j === "Escape" || j === "KeyM" || j === "KeyP") && !Q.repeat && re(false), F());
  }
  window.addEventListener("keydown", we, true);
  window.addEventListener("keyup", we, true);
  window.addEventListener("resize", () => {
    E && (ne(), L());
  });
  const Se = radio.on("track", () => {
      C = radio.index;
      O();
      ae();
    }),
    ye = radio.on("state", () => {
      H();
      radio.playing && ae();
    });
  O();
  W();
  z();
  const U = subscribeAudioState(({
      isMusicPlaying: isMusicPlaying
    }) => Y(isMusicPlaying)),
    J = voice == null ? undefined : voice.subscribe(G);
  return {
    root: n,
    open: () => re(true),
    close: () => re(false),
    toggle: () => re(!E),
    get isOpen() {
      return E;
    },
    dispose() {
      Se();
      ye();
      U();
      J == null || J();
      cancelAnimationFrame(M);
      clearTimeout(B);
      window.removeEventListener("keydown", we, true);
      window.removeEventListener("keyup", we, true);
      n.remove();
      r.remove();
    }
  };
}
