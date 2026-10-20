export interface AudioSnapshot {
  audioVolume: number;
  isMusicPlaying: boolean;
}
const audioListeners = new Set<(snapshot: AudioSnapshot) => void>();
let audioVolume = 0.5;
let audioPlaying = false;
const savedAudioKey = 'trapnest-neon:audio-enabled';
export function enableAudioForEntry(): void {
  try { if (localStorage.getItem(savedAudioKey) === 'off') return; } catch {}
  setAudioPlaying(true);
}
function notifyAudioState(): void {
  for (const listener of audioListeners) listener({
    audioVolume,
    isMusicPlaying: isAudioPlaying()
  });
}
export function getAudioVolume(): number {
  return audioVolume;
}
export function isAudioPlaying(): boolean {
  return audioPlaying && !document.hidden;
}
export function setAudioPlaying(playing: boolean): void {
  try { localStorage.setItem(savedAudioKey, playing ? 'on' : 'off'); } catch {}
  if (audioPlaying !== playing) {
    audioPlaying = playing;
    notifyAudioState();
  }
}
export function subscribeAudioState(listener: (snapshot: AudioSnapshot) => void): () => void {
  audioListeners.add(listener);
  listener({
    audioVolume,
    isMusicPlaying: isAudioPlaying()
  });
  return () => {
    audioListeners.delete(listener);
  };
}
window.addEventListener('neon:preferences', notifyAudioState);
document.addEventListener('visibilitychange', notifyAudioState);
