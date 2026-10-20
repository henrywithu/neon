import { setInputBoundary } from '../ui/core/inputBoundary';
export type FailureKind = 'capability' | 'asset' | 'shader' | 'device';
let stage: FailureKind = 'capability';
export function setStartupStage(value: FailureKind) { stage = value; }
export function showRecovery(error: unknown, kind: FailureKind = stage) {
  if (document.querySelector('.night-recovery')) return;
  setInputBoundary('recovery', true);
  window.dispatchEvent(new Event('neon:graphics-lost'));
  const copy = {
    capability: ['The city needs supported graphics', 'Use a recent browser with WebGPU enabled and hardware acceleration, then try again.'],
    asset: ['The city could not finish loading', 'A required city file did not arrive. Check your connection and retry.'],
    shader: ['The night could not be prepared', 'Graphics initialization did not complete. Retry, or restart in Performance mode.'],
    device: ['The graphics connection was interrupted', 'Your saved progress is safe. Reload to prepare the city again.']
  }[kind];
  const root = document.createElement('section');
  root.className = 'night-recovery';
  root.setAttribute('role', 'alertdialog'); root.setAttribute('aria-label', copy[0]);
  root.innerHTML = `<div class="night-card"><p class="night-eyebrow">TRAPNEST · RETURN TO THE NIGHT</p><h1></h1><p data-copy></p><div class="night-actions"><button data-retry>Retry</button>${kind !== 'capability' ? '<button data-performance>Restart in Performance mode</button>' : ''}</div><details><summary>Diagnostic details</summary><pre></pre></details><p class="night-secondary">Progress and preferences stay on this browser. Reloading does not reset your game.</p></div>`;
  root.querySelector('h1')!.textContent = copy[0]; root.querySelector('[data-copy]')!.textContent = copy[1];
  root.querySelector('pre')!.textContent = `${kind}: ${error instanceof Error ? error.message : String(error)}`;
  root.querySelector('[data-retry]')!.addEventListener('click', () => location.reload());
  root.querySelector('[data-performance]')?.addEventListener('click', () => {
    const url = new URL(location.href); url.searchParams.set('quality', 'low'); url.searchParams.set('lite', '1');
    url.searchParams.set('dpr', '1'); url.searchParams.set('glass', '0'); location.assign(url);
  });
  document.getElementById('app-loader')?.remove();
  document.body.append(root);
}
