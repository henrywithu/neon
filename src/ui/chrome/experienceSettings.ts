import { saveDescription } from "../../platform/saveStatus";
import { getExperiencePreferences, setExperiencePreference, reducedMotion } from '../../platform/experiencePreferences';
import { isAudioPlaying, setAudioPlaying, subscribeAudioState } from '../../audio/audioState';
export function createExperienceSettings() {
  const root = document.createElement('div'); root.className = 'experience-settings';
  root.innerHTML = `<section><h2>Drive your way</h2>
    <label>Rendering mode<select data-pref="performance"><option value="balanced">Balanced</option><option value="performance">Performance</option></select></label>
    <p>Performance reduces reflections and effects. Reload to apply rendering changes.</p><button type="button" data-reload>Reload with this mode</button>
    <label>Touch steering<select data-pref="steering"><option value="buttons">Buttons</option><option value="analog">Anchored drag pad · try it</option></select></label>
    <label>Thumb targets<select data-pref="controls"><option value="standard">Standard</option><option value="large">Large</option></select></label>
  </section><section><h2>Motion comfort</h2>
    <label>Camera shake and speed zoom<input type="checkbox" data-pref="cameraMotion"></label>
    <label>Speed blur<input type="checkbox" data-pref="speedBlur"></label>
    <label>Strong screen effects<input type="checkbox" data-pref="screenEffects"></label>
    <label>Reduce menu and text motion<input type="checkbox" data-pref="reducedMotion"></label>
    <p>System reduced motion is also respected. Vehicle handling stays the same.</p>
  </section><section><h2>Sound mix</h2><label>Sound enabled<input type="checkbox" data-sound></label>
    ${(['music', 'effects', 'ambience', 'voice'] as const).map(key => `<label>${{ music: 'Music', effects: 'Vehicle and effects', ambience: 'Rain and ambience', voice: 'Voice' }[key]}<input type="range" min="0" max="1" step="0.05" data-pref="${key}" aria-label="${key} volume"><output data-value="${key}"></output></label>`).join('')}
  <label>Glass Turn district ambience · preview<input type="checkbox" data-pref="districtAmbience"></label>
  </section><section><h2>This browser remembers</h2><p data-save-status role="status"></p><p>Jobs, sigils, cars and preferences save locally in this browser. Clearing site data or using private browsing can remove them. Reset game removes progress and driving tips; Reset configs changes preferences.</p></section>`;
  const sound = root.querySelector<HTMLInputElement>('[data-sound]')!;
  sound.checked = isAudioPlaying(); sound.addEventListener('change', () => setAudioPlaying(sound.checked));
  const stopAudio = subscribeAudioState(({ isMusicPlaying }) => { sound.checked = isMusicPlaying; });
  function sync() {
    root.querySelector("[data-save-status]")!.textContent = saveDescription();
    const prefs = getExperiencePreferences();
    for (const element of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-pref]')) {
      const key = element.dataset.pref as keyof typeof prefs;
      if (element instanceof HTMLInputElement && element.type === 'checkbox') element.checked = key === 'reducedMotion' ? reducedMotion() : !!prefs[key];
      else element.value = String(prefs[key]);
      const value = root.querySelector(`[data-value="${key}"]`); if (value) value.textContent = `${Math.round(Number(prefs[key]) * 100)}%`;
    }
  }
  for (const element of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-pref]')) element.addEventListener('input', () => {
    const value = element instanceof HTMLInputElement ? element.type === 'checkbox' ? element.checked : Number(element.value) : element.value;
    setExperiencePreference(element.dataset.pref as keyof ReturnType<typeof getExperiencePreferences>, value as never);
  });
  root.querySelector('[data-reload]')!.addEventListener('click', () => {
    const url = new URL(location.href); for (const key of ['quality', 'dpr', 'lite']) url.searchParams.delete(key); location.assign(url);
  });
  window.addEventListener('neon:preferences', sync); window.addEventListener('neon:save-status', sync); sync();
  return { root, dispose() { stopAudio(); window.removeEventListener('neon:save-status', sync); window.removeEventListener('neon:preferences', sync); root.remove(); } };
}
