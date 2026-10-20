const reasons = new Set<string>();
export function isGameInputBlocked() { return reasons.size > 0 || document.hidden; }
export function setInputBoundary(reason: string, blocked: boolean) {
  const before = reasons.has(reason);
  if (blocked) reasons.add(reason); else reasons.delete(reason);
  if (before === blocked) return;
  window.dispatchEvent(new Event('neon:clear-input'));
  document.documentElement.classList.toggle('game-input-blocked', isGameInputBlocked());
  window.dispatchEvent(new Event('neon:boundary-change'));
}
