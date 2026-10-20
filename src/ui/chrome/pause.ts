import { setInputBoundary } from '../core/inputBoundary';
export function createPause({ onHelp, onMap, onSettings }: { onHelp: () => void; onMap: () => void; onSettings: () => void }) {
  const root = document.createElement('section'); root.className = 'night-pause'; root.hidden = true;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Paused');
  root.innerHTML = '<div class="night-card"><p class="night-eyebrow">TRAPNEST · A MOMENT IN THE RAIN</p><h1>Take your time.</h1><p>Driving and job timers are paused. Online rooms keep running; your car stays here until you resume.</p><div class="night-actions"><button data-resume>Resume driving</button><button data-help>Help</button><button data-map>City map</button><button data-settings>Settings</button></div><p class="night-secondary">After resuming on foot, click the road to look around.</p></div>';
  document.body.append(root);
  function open() { root.hidden = false; setInputBoundary('pause', true); }
  function close() { root.hidden = true; setInputBoundary('pause', false); }
  root.querySelector('[data-resume]')!.addEventListener('click', close);
  for (const [action, callback] of [['help', onHelp], ['map', onMap], ['settings', onSettings]] as const) root.querySelector(`[data-${action}]`)!.addEventListener('click', () => { close(); callback(); });
  const interrupt = () => { window.dispatchEvent(new Event('neon:clear-input')); if (!document.getElementById('app-loader') && document.querySelector('.app-header.show')) open(); };
  window.addEventListener('neon:pause', open);
  window.addEventListener('blur', interrupt);
  document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); });
  window.addEventListener('keydown', event => {
    if (event.code !== 'KeyP' || event.repeat || event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [role="dialog"]')) return;
    event.preventDefault(); if (root.hidden) open(); else close();
  });
  return { open, close, root };
}
