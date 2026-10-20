export interface AudioSnapshot {
  audioVolume: number;
  isMusicPlaying: boolean;
}
const audioListeners = new Set<(snapshot: AudioSnapshot) => void>();
let audioVolume = 0.5;
let audioPlaying = false;
function notifyAudioState(): void {
  for (const listener of audioListeners) listener({
    audioVolume,
    isMusicPlaying: audioPlaying
  });
}
export function getAudioVolume(): number {
  return audioVolume;
}
export function isAudioPlaying(): boolean {
  return audioPlaying;
}
export function setAudioPlaying(playing: boolean): void {
  if (audioPlaying !== playing) {
    audioPlaying = playing;
    notifyAudioState();
  }
}
export function subscribeAudioState(listener: (snapshot: AudioSnapshot) => void): () => void {
  audioListeners.add(listener);
  listener({
    audioVolume,
    isMusicPlaying: audioPlaying
  });
  return () => {
    audioListeners.delete(listener);
  };
}
