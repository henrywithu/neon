// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createExperienceSettings } from "./experienceSettings.ts";
import { resetExperiencePreferences } from "../../platform/experiencePreferences.ts";
import { R1, eb, Xle, Jle } from "../core/phosphorIcons.ts";
export function createSettingsPanel({
  state: state,
  lookOptions = [],
  defaultLookPreset = "neutral",
  showDevelopmentMode = false,
  getDevelopmentMode = () => false,
  onDevelopmentModeChange: onDevelopmentModeChange,
  getCurrentLookPreset = () => defaultLookPreset,
  onLookPresetChange: onLookPresetChange,
  qualityOptions = [],
  getQuality = () => null,
  onQualityChange: onQualityChange,
  resolutionOptions = [],
  getResolution = () => null,
  onResolutionChange: onResolutionChange,
  getCarReflections = () => null,
  onCarReflectionsChange: onCarReflectionsChange,
  voice = null,
  onRestart: onRestart,
  onResetGame = null,
  onOpenAbout = null
} = {}) {
  var se, re;
  const y = document.createElement("div");
  y.className = "settings-overlay";
  y.setAttribute("data-ui-block-look", "true");
  y.hidden = true;
  y.innerHTML = `
    <div class="settings-glass" role="dialog" aria-modal="true" aria-label="Settings">
      <button type="button" class="settings-close" aria-label="Close">
        ${R1}
      </button>

      <div class="settings-options">
        ${resolutionOptions.length ? `
        <div class="settings-section" data-resolution-section>
          <p class="settings-section-title">Resolution</p>
          <div class="settings-look-grid settings-quality-grid" role="group" aria-label="Rendering resolution">
            ${sL(resolutionOptions, "resolution")}
          </div>
          <p class="settings-quality-note">Sharper costs frame rate, heat and battery</p>
          ${getCarReflections() ? `
          <label class="settings-option">
            <span class="settings-option-text">
              <span class="settings-option-title">Car reflections</span>
            </span>
            <input
              type="checkbox"
              class="settings-toggle-input"
              data-car-reflections
              aria-label="Car reflections"
            />
            <span class="settings-toggle" aria-hidden="true"></span>
          </label>
          <p class="settings-quality-note" data-car-reflections-note>Turn off if the frame rate drops</p>
          <button type="button" class="settings-reload-btn" data-car-reflections-reload hidden>
            <span class="settings-restart-icon">${eb}</span>
            <span>Reload to apply</span>
          </button>
          ` : ""}
        </div>

        <div class="settings-divider" role="separator"></div>
        ` : ""}

        <div class="settings-section">
          <p class="settings-section-title">Look</p>
          <div class="settings-look-grid" role="group" aria-label="Color look">
            ${Mce(lookOptions)}
          </div>
        </div>

        <div class="settings-divider" role="separator"></div>

        ${qualityOptions.length ? `
        <div class="settings-section" data-quality-section>
          <p class="settings-section-title">Quality</p>
          <div class="settings-look-grid settings-quality-grid" role="group" aria-label="Graphics quality">
            ${sL(qualityOptions)}
          </div>
          <p class="settings-quality-note" data-quality-note hidden></p>
          <button type="button" class="settings-reload-btn" data-quality-reload hidden>
            <span class="settings-restart-icon">${eb}</span>
            <span>Reload to apply</span>
          </button>
        </div>

        <div class="settings-divider" role="separator"></div>
        ` : ""}

        ${voice ? `
        <div class="settings-section">
          <p class="settings-section-title">Sound</p>
          <label class="settings-option">
            <span class="settings-option-text">
              <span class="settings-option-title">Character voices</span>
            </span>
            <input
              type="checkbox"
              class="settings-toggle-input"
              data-voices
              aria-label="Character voices"
            />
            <span class="settings-toggle" aria-hidden="true"></span>
          </label>
          <p class="settings-quality-note">Characters read their messages and mission briefs aloud</p>
        </div>

        <div class="settings-divider" role="separator"></div>
        ` : ""}

        ${onOpenAbout ? `
        <button type="button" class="settings-about-btn" data-about>
          <span class="settings-about-icon">${Xle}</span>
          <span class="settings-about-text">
            <span class="settings-option-title">About</span>
            <span class="settings-about-sub">Credits · recommended setup</span>
          </span>
          <span class="settings-about-caret">${Jle}</span>
        </button>

        <div class="settings-divider" role="separator"></div>
        ` : ""}

        ${showDevelopmentMode ? `
        <label class="settings-option">
          <span class="settings-option-text">
            <span class="settings-option-title">Development mode</span>
          </span>
          <input
            type="checkbox"
            class="settings-toggle-input"
            data-development-mode
            aria-label="Development mode"
          />
          <span class="settings-toggle" aria-hidden="true"></span>
        </label>

        <div class="settings-divider" role="separator"></div>
        ` : ""}

        <button type="button" class="settings-restart-btn" data-restart>
          <span class="settings-restart-icon">${eb}</span>
          <span>Reset configs</span>
        </button>
        <p class="settings-restart-hint">
          Resets look, quality, resolution and voice preferences${showDevelopmentMode ? " and turns off development mode" : ""}
        </p>
        ${onResetGame ? `
        <button type="button" class="settings-restart-btn settings-restart-btn--game" data-reset-game>
          <span class="settings-restart-icon">${eb}</span>
          <span>Reset game</span>
        </button>
        <p class="settings-restart-hint">
          Starts over: missions, Neon Sigils, unlocked cars and the driving tips
        </p>` : ""}
      </div>
    </div>
  `;
  const _ = y.querySelector(".settings-glass"),
    w = y.querySelector(".settings-close"),
    S = y.querySelector("[data-development-mode]"),
    T = y.querySelector("[data-restart]"),
    v = [...y.querySelectorAll("[data-look-preset]")],
    E = new Set(lookOptions.map(le => le.id)),
    C = [...y.querySelectorAll("[data-quality]")],
    M = y.querySelector("[data-quality-note]"),
    B = y.querySelector("[data-quality-reload]"),
    R = [...y.querySelectorAll("[data-resolution]")],
    I = y.querySelector("[data-car-reflections]"),
    k = y.querySelector("[data-voices]"),
    L = y.querySelector("[data-car-reflections-note]"),
    F = y.querySelector("[data-car-reflections-reload]"),
    O = le => {
      var we;
      return ((we = qualityOptions.find(Se => Se.id === le)) == null ? undefined : we.label) ?? le;
    };
  function H(le) {
    S && (S.checked = !!le);
  }
  function W(le = getCurrentLookPreset()) {
    const we = E.has(le) ? le : defaultLookPreset;
    for (const Se of v) {
      const ye = Se.dataset.lookPreset === we;
      Se.classList.toggle("settings-look-btn--active", ye);
      Se.setAttribute("aria-pressed", ye ? "true" : "false");
    }
  }
  function P() {
    const le = getQuality();
    if (!le || !C.length) return;
    const {
      chosen: we,
      running: Se,
      stepped: ye
    } = le;
    for (const Q of C) {
      const j = Q.dataset.quality === we;
      Q.classList.toggle("settings-look-btn--active", j);
      Q.setAttribute("aria-pressed", j ? "true" : "false");
    }
    const U = we !== Se;
    let J = "";
    U ? J = `${O(we)} applies after a reload` : ye && (J = `Lowered to ${O(ye)} for this session (frame rate)`);
    M.textContent = J;
    M.hidden = !J;
    B.hidden = !U;
  }
  function z() {
    const le = String(getResolution());
    for (const we of R) {
      const Se = we.dataset.resolution === le;
      we.classList.toggle("settings-look-btn--active", Se);
      we.setAttribute("aria-pressed", Se ? "true" : "false");
    }
  }
  function Y() {
    const le = getCarReflections();
    if (!le || !I) return;
    I.checked = le.chosen;
    const we = le.chosen !== le.running;
    L.textContent = we ? `Car reflections ${le.chosen ? "on" : "off"} after a reload` : "Turn off if the frame rate drops";
    F.hidden = !we;
  }
  const experienceSettings = createExperienceSettings();
  y.querySelector(".settings-options").prepend(experienceSettings.root);
  function G() {
    y.classList.remove("settings-overlay--force-hidden");
    H(getDevelopmentMode());
    W();
    P();
    z();
    Y();
    y.hidden = false;
  }
  function X() {
    y.hidden = true;
    state == null || state.closePanel();
  }
  function ae(le) {
    le && !y.hidden || y.classList.toggle("settings-overlay--force-hidden", le);
  }
  y.addEventListener("pointerdown", () => {
    var le;
    (le = state == null ? undefined : state.showAllUi) == null || le.call(state);
  });
  y.addEventListener("click", le => {
    le.target === y && X();
  });
  w.addEventListener("click", X);
  (se = y.querySelector("[data-about]")) == null || se.addEventListener("click", () => onOpenAbout == null ? undefined : onOpenAbout());
  _.addEventListener("click", le => {
    le.stopPropagation();
  });
  for (const le of v) le.addEventListener("click", () => {
    const we = le.dataset.lookPreset;
    onLookPresetChange == null || onLookPresetChange(we);
    W(we);
  });
  for (const le of C) le.addEventListener("click", () => {
    onQualityChange == null || onQualityChange(le.dataset.quality);
    P();
  });
  for (const le of R) le.addEventListener("click", () => {
    onResolutionChange == null || onResolutionChange(le.dataset.resolution);
    z();
  });
  B == null || B.addEventListener("click", () => {
    window.location.reload();
  });
  I == null || I.addEventListener("change", () => {
    onCarReflectionsChange == null || onCarReflectionsChange(I.checked);
    Y();
  });
  F == null || F.addEventListener("click", () => {
    window.location.reload();
  });
  voice == null || voice.subscribe(le => {
    k && (k.checked = le);
  });
  k == null || k.addEventListener("change", () => {
    voice.setEnabled(k.checked);
  });
  S == null || S.addEventListener("change", () => {
    onDevelopmentModeChange == null || onDevelopmentModeChange(S.checked);
  });
  T.addEventListener("click", () => {
    window.confirm(`Reset configs? Look, quality, resolution and voice preferences will return to default${showDevelopmentMode ? " and development mode will turn off" : ""}.`) && (resetExperiencePreferences(), onRestart == null || onRestart(), X());
  });
  (re = y.querySelector("[data-reset-game]")) == null || re.addEventListener("click", () => {
    window.confirm("Reset game? Missions, Neon Sigils, unlocked cars and the driving tips start over. The game reloads.") && (onResetGame == null || onResetGame());
  });
  function ne(le) {
    le.key === "Escape" && !y.hidden && X();
  }
  document.addEventListener("keydown", ne);
  Y();
  state == null || state.subscribe(({
    openedPanel: openedPanel
  }) => {
    openedPanel === "settings" ? G() : y.hidden || (y.hidden = true);
  });
  document.body.appendChild(y);
  return {
    root: y,
    open: G,
    close: X,
    setForceHidden: ae,
    syncDevelopmentMode: H,
    syncLookPreset: W,
    syncQuality: P,
    syncResolution: z,
    syncCarReflections: Y,
    destroy() {
      document.removeEventListener("keydown", ne);
      y.remove();
    }
  };
}
export const Bce = ["/light-rain.mp3", "/night-ambience.mp3", "/thunderstorm.mp3"];
export const Rce = `
  <svg
    id="wave"
    class="audio-btn-wave"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    aria-hidden="true"
  >
    <path
      id="Line_1"
      fill="white"
      d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"
    />
    <path
      id="Line_2"
      fill="white"
      d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"
    />
    <path
      id="Line_3"
      fill="white"
      d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"
    />
    <path
      id="Line_4"
      fill="white"
      d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"
    />
    <path
      id="Line_5"
      fill="white"
      d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"
    />
  </svg>
`;
export function Mce(i) {
  return i.map(e => `
      <button
        type="button"
        class="settings-look-btn"
        data-look-preset="${e.id}"
        aria-pressed="false"
      >
        <span class="settings-look-icon">${e.icon}</span>
        <span class="settings-look-label">${e.label}</span>
      </button>
    `).join("");
}
export function sL(i, e = "quality") {
  return i.map(t => `
      <button
        type="button"
        class="settings-look-btn settings-quality-btn"
        data-${e}="${t.id}"
        aria-pressed="false"
      >
        <span class="settings-look-icon">${t.icon}</span>
        <span class="settings-look-label">${t.label}</span>
      </button>
    `).join("");
}
