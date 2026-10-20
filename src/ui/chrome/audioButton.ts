import { Bce, Rce } from './createSettingsPanel';
import { getAudioVolume, setAudioPlaying, subscribeAudioState, isAudioPlaying, enableAudioForEntry } from '../../audio/audioState';
import { mixGain } from '../../platform/experiencePreferences';
import { isTouchDevice } from '../../platform/deviceLayout';
export function createAudioButton({ urls = Bce, url = '', showButton = true } = {}) {
  const root = document.createElement('div'); root.className = `audio-btn-root audio-btn-root--hidden${showButton ? '' : ' audio-btn-root--headless'}`;
  root.setAttribute('data-ui-block-look', 'true');
  root.innerHTML = `${showButton ? `<button type="button" id="buttonAudio" class="audio-btn" aria-label="Toggle sound">${Rce}</button>` : ''}`;
  const audioEls = (url ? [url] : urls).map((src: string) => { const el = new Audio(src); el.preload = 'none'; el.loop = true; root.append(el); return el; });
  const button = root.querySelector<HTMLButtonElement>('#buttonAudio');
  function sync() {
    const playing = isAudioPlaying();
    root.querySelector('.audio-btn-wave')?.classList.toggle('animated', playing);
    for (const el of audioEls) {
      el.volume = getAudioVolume() * mixGain('ambience');
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
