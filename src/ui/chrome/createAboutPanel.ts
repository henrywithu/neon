import { getActiveInput } from '../../platform/activeInput';
import { vce } from './createHeader';
import { isTouchDevice, isMobileLayout, onDeviceLayoutChange } from '../../platform/deviceLayout';
import { createJournal } from './createJournal';
import type { AppUiState, PanelComponent } from '../core/types';

/** Original panel geometry, scrolling, close behavior, and UI-state integration. */
export function createAboutPanel({
  state
}: {
  state?: AppUiState;
} = {}): PanelComponent {
  const root = document.createElement('div');
  root.className = 'about-overlay';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'About Trapnest Neon');
  root.innerHTML = `
    <button type="button" class="close-button-panel" aria-label="Close">${vce}</button>
    <div class="about-content">
      <div class="about-body">
        <div class="about-brand">
          <img src="/brand/logo.webp" width="64" height="64" alt="" />
          <p class="about-brand-title">TRAPNEST NEON</p>
          <small class="about-brand-subtitle">A WORLD BY HENRY · TRAPNEST</small>
        </div>
        <div class="about-copy">
          <div class="about-copy-col">
            <p class="about-lead">A rain-soaked city under neon. Eight machines, an open road, and a radio tuned to the hours after midnight. Take the wheel. Find your own way through.</p>
            <p class="about-lead">Drive the city, follow its stories, collect its hidden marks, or step out and let the rain slow everything down.</p>
          </div>
          <div class="about-copy-col">
            <p class="about-lead">Neon is part of Trapnest: a collection of worlds at the intersection of life, art, science, and technology.</p>
            <p class="about-lead">The journal below opens the doors to those worlds, with field notes and experiments from July 2026 onward.</p>
          </div>
        </div>
      </div>
      <div class="about-footer">
        <div class="about-buttons">
          <a class="refresh-button-panel" href="https://henrywithu.com/" target="_blank" rel="noopener noreferrer">TRAPNEST ↗</a>
          <button type="button" class="refresh-button-panel" data-journal>EXPLORE THE JOURNAL</button>
        </div>
        <p class="about-model-credits">An adaptation of Threejs-Punk by Anderson Mancini &amp; Sunag.<br />Original scene, vehicle, shader and audio credits retained.</p>
        <p class="about-recommended about-recommended--desktop"><span class="about-recommended-title">Enter the night</span>Chrome or Edge with WebGPU · WASD to drive · Space to drift · Shift for nitro · F to step outside · headphones recommended.</p>
        <p class="about-recommended about-recommended--mobile"><span class="about-recommended-title">Enter the night</span>Use landscape orientation and the on-screen controls. A recent WebGPU-capable device and headphones give the best experience.</p>
      </div>
    </div>`;
  const content = root.querySelector<HTMLElement>('.about-content')!;
  const journal = createJournal();
  content.append(journal);
  const desktop = root.querySelector<HTMLElement>('.about-recommended--desktop')!;
  const mobile = root.querySelector<HTMLElement>('.about-recommended--mobile')!;
  function syncLayout(): void {
    const compact: boolean = getActiveInput() === "touch";
    desktop.hidden = compact;
    mobile.hidden = !compact;
  }
  const stopLayout = onDeviceLayoutChange(syncLayout);
  syncLayout();
  let lastFocus: HTMLElement | null = null;
  function open(): void {
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.classList.remove('about-overlay--force-hidden');
    root.hidden = false;
    root.scrollTop = 0;
    syncLayout();
    root.querySelector<HTMLButtonElement>('.close-button-panel')!.focus({
      preventScroll: true
    });
  }
  function close(): void {
    root.hidden = true;
    state?.closePanel();
    lastFocus?.focus({
      preventScroll: true
    });
  }
  const closeButton = root.querySelector<HTMLButtonElement>('.close-button-panel')!;
  closeButton.addEventListener('click', close);
  root.querySelector<HTMLButtonElement>('[data-journal]')!.addEventListener('click', () => journal.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  }));
  function onKey(event: KeyboardEvent): void {
    if (root.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const controls = [...root.querySelectorAll<HTMLElement>('a[href], button:not([hidden]), select')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }
  document.addEventListener('keydown', onKey);
  const unsubscribe = state?.subscribe(({
    openedPanel
  }) => {
    if (openedPanel === 'about') {
      if (root.hidden) open();
    } else root.hidden = true;
  });
  document.body.append(root);
  return {
    root,
    open,
    close,
    setForceHidden(hidden) {
      if (!(hidden && !root.hidden)) root.classList.toggle('about-overlay--force-hidden', hidden);
    },
    destroy() {
      stopLayout?.();
      unsubscribe?.();
      document.removeEventListener('keydown', onKey);
      root.remove();
    }
  };
}
