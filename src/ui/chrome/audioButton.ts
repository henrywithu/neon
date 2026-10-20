import { Bce, Rce } from './createSettingsPanel';
import { getAudioVolume, setAudioPlaying, subscribeAudioState, isAudioPlaying, enableAudioForEntry } from '../../audio/audioState';
import { getExperiencePreferences, mixGain } from '../../platform/experiencePreferences';
import { isTouchDevice } from '../../platform/deviceLayout';
export function createAudioButton({ urls = Bce, url = '', showButton = true } = {}) {
  const root = document.createElement('div'); root.className = `audio-btn-root audio-btn-root--hidden${showButton ? '' : ' audio-btn-root--headless'}`;
  root.setAttribute('data-ui-block-look', 'true');
  root.innerHTML = `${showButton ? `<button type="button" id="buttonAudio" class="audio-btn" aria-label="Toggle sound">${Rce}</button>` : ''}`;
  const audioEls = (url ? [url] : urls).map((src: string) => { const el = new Audio(src); el.preload = 'none'; el.loop = true; root.append(el); return el; });
  const button = root.querySelector<HTMLButtonElement>('#buttonAudio');
  let district = 0;
  function sync() {
    const playing = isAudioPlaying();
    root.querySelector('.audio-btn-wave')?.classList.toggle('animated', playing);
    for (const [index, el] of audioEls.entries()) {
      const districtGain = getExperiencePreferences().districtAmbience ? index === 2 ? 1 - district * .45 : index === 0 ? 1 - district * .1 : 1 : 1;
      el.volume = getAudioVolume() * mixGain('ambience') * districtGain;
      if (playing && el.paused) void el.play().catch(() => {});
      else if (!playing && !el.paused) el.pause();
    }
  }
  const unsubscribe = subscribeAudioState(sync);
  function unlock() { enableAudioForEntry(); sync(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); }
  window.addEventListener('pointerdown', unlock, { passive: true }); window.addEventListener('keydown', unlock, { passive: true });
  button?.addEventListener('click', () => setAudioPlaying(!isAudioPlaying()));
  document.body.append(root);
  return { root, button, audioEl: audioEls[0], audioEls,
    setDistrictMix(value: number) { if (Math.abs(district - value) > .02) { district = value; if (getExperiencePreferences().districtAmbience) sync(); } },
    play() { setAudioPlaying(true); sync(); }, pause() { setAudioPlaying(false); sync(); },
    setVisible(value: boolean) { root.classList.toggle('audio-btn-root--hidden', !value); root.setAttribute('aria-hidden', String(!value)); },
    setForceHidden(value: boolean) { root.classList.toggle('audio-btn-root--force-hidden', value); },
    destroy() { unsubscribe(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); audioEls.forEach(el => el.pause()); root.remove(); }
  };
}
export const Nce = 5e3;
export const Lce = 12e3;
export function kce(i?: number) {
  return typeof i == "number" ? i : isTouchDevice() ? Lce : Nce;
}
