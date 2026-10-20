import { reportSaveFailure } from "./saveStatus";
export type ExperiencePreferences = {
  districtAmbience: boolean;
  performance: 'balanced' | 'performance'; steering: 'buttons' | 'analog'; controls: 'standard' | 'large';
  cameraMotion: boolean; speedBlur: boolean; screenEffects: boolean; reducedMotion: boolean;
  music: number; effects: number; ambience: number; voice: number;
};
export const experiencePreferenceKey = 'trapnest-neon:experience';
const defaults: ExperiencePreferences = { districtAmbience: false, performance: 'balanced', steering: 'buttons', controls: 'standard', cameraMotion: true, speedBlur: true, screenEffects: true, reducedMotion: false, music: 1, effects: 1, ambience: 1, voice: 1 };
let preferences = { ...defaults };
try {
  const saved = JSON.parse(localStorage.getItem(experiencePreferenceKey) || '{}');
  for (const key of Object.keys(defaults) as (keyof ExperiencePreferences)[]) {
    const value = saved[key];
    if (typeof defaults[key] === 'number' && Number.isFinite(value)) Object.assign(preferences, { [key]: Math.max(0, Math.min(1, value)) });
    else if (typeof defaults[key] === 'boolean' && typeof value === 'boolean') Object.assign(preferences, { [key]: value });
  }
  for (const [key, options] of [['performance', ['balanced', 'performance']], ['steering', ['buttons', 'analog']], ['controls', ['standard', 'large']]] as const) {
    if ((options as readonly string[]).includes(saved[key])) Object.assign(preferences, { [key]: saved[key] });
  }
} catch { reportSaveFailure(); }
export function getExperiencePreferences(): Readonly<ExperiencePreferences> { return preferences; }
export function setExperiencePreference<K extends keyof ExperiencePreferences>(key: K, value: ExperiencePreferences[K]) {
  preferences = { ...preferences, [key]: value };
  try { localStorage.setItem(experiencePreferenceKey, JSON.stringify(preferences)); } catch { reportSaveFailure(); }
  window.dispatchEvent(new Event('neon:preferences'));
}
export function resetExperiencePreferences() {
  preferences = { ...defaults };
  try { localStorage.removeItem(experiencePreferenceKey); } catch {}
  window.dispatchEvent(new Event('neon:preferences'));
}
export function reducedMotion() { return preferences.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches; }
export function mixGain(channel: 'music' | 'effects' | 'ambience' | 'voice') { return preferences[channel]; }
const syncMotion = () => document.documentElement.classList.toggle('reduce-motion', reducedMotion());
window.addEventListener('neon:preferences', syncMotion);
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { syncMotion(); window.dispatchEvent(new Event('neon:preferences')); });
syncMotion();
