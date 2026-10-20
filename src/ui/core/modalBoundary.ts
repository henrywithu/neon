import { setInputBoundary } from './inputBoundary';

// Explicit adapters for the recovered panels. Their own factories still own closing
// and game state; this layer owns focus, inertness and the shared input boundary.
const surfaces = [
  ['.settings-overlay', ':not([hidden])', '.settings-close'],
  ['.about-overlay', ':not([hidden])', '.close-button-panel'],
  ['.story-screen', ':not(.is-closing)', '.story-screen__skip'],
  ['.phone-screen', ':not(.is-closing)', '.phone-screen__close'],
  ['.walk-controls', ':has(.walk-controls__overlay:not([hidden]))', '.walk-controls__close'],
  ['.achievements', ':not([hidden])', '.achievements__close'],
  ['.citymap', '.is-open', '.citymap__close'],
  ['.radio', '.is-open', '[data-action="close"]'],
  ['.garage', ':not([hidden])', '.garage__close'],
  ['.lby', '.is-open', '.lby__close'],
  ['.mp-chat', ':not([hidden])', ''],
  ['.mp-chip', '.is-open', '.mp-chip__x'],
  ['.night-pause', ':not([hidden])', '[data-resume]'],
  ['.night-choice', ':not([hidden])', '[data-cruise]'],
  ['.night-recovery', ':not([hidden])', '']
] as const;

export function installModalBoundary() {
  const roots = new Map<HTMLElement, typeof surfaces[number]>();
  const observers: MutationObserver[] = [];
  const stack: HTMLElement[] = [];
  const openers = new Map<HTMLElement, HTMLElement | null>();
  const inert = new Map<HTMLElement, boolean>();
  let top: HTMLElement | undefined;
  const focusable = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.closest('[hidden], [inert], [aria-hidden="true"]') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
  const restoreInert = () => { inert.forEach((value, node) => { node.inert = value; }); inert.clear(); };
  function refresh() {
    const previous = top;
    for (const [root, config] of roots) {
      const active = root.isConnected && root.matches(config[1]);
      const index = stack.indexOf(root);
      if (active && index < 0) {
        openers.set(root, document.activeElement instanceof HTMLElement ? document.activeElement : null);
        stack.push(root);
      } else if (!active && index >= 0) stack.splice(index, 1);
    }
    top = stack.at(-1);
    if (previous === top) return;
    restoreInert();
    setInputBoundary('modal', !!top);
    if (top) {
      document.exitPointerLock?.();
      for (const child of document.body.children) {
        if (!(child instanceof HTMLElement) || child === top || child.contains(top) || child.matches('script, style, #app-loader')) continue;
        inert.set(child, child.inert);
        child.inert = true;
      }
      const dialog = top.querySelector<HTMLElement>('[role="dialog"]') || top;
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.tabIndex = -1;
      (focusable(top)[0] || dialog).focus({ preventScroll: true });
    } else if (previous) {
      const opener = openers.get(previous);
      if (opener?.isConnected && !opener.closest('[hidden], [inert]') && opener.getClientRects().length) opener.focus({ preventScroll: true });
      else document.querySelector<HTMLButtonElement>('.hdr-btn--menu, .hdr-btn--settings')?.focus({ preventScroll: true });
      // Pointer lock is reacquired only by the next deliberate canvas click.
    }
  }
  function discover() {
    for (const config of surfaces) for (const root of document.querySelectorAll<HTMLElement>(config[0])) {
      if (roots.has(root)) continue;
      roots.set(root, config);
      const observer = new MutationObserver(refresh);
      observer.observe(root, { attributes: true, subtree: config[0] === '.walk-controls', attributeFilter: ['hidden', 'class', 'aria-hidden'] });
      observers.push(observer);
    }
    refresh();
  }
  function onKey(event: KeyboardEvent) {
    refresh();
    if (!top) return;
    if (event.key === 'Tab') {
      event.stopImmediatePropagation();
      const items = focusable(top);
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (index < 0 || event.shiftKey && index === 0 || !event.shiftKey && index === items.length - 1) {
        event.preventDefault();
        (event.shiftKey ? items.at(-1) : items[0])?.focus();
      }
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && event.target.closest('button, a[href], input, select, textarea')) {
      // Native activation belongs to the focused control, including Space on buttons.
      event.stopImmediatePropagation();
    } else if (event.key === 'Escape') {
      const close = roots.get(top)?.[2];
      if (close) {
        event.preventDefault();
        event.stopImmediatePropagation();
        top.querySelector<HTMLElement>(close)?.click();
      }
    }
  }
  function onFocus(event: FocusEvent) {
    if (top && event.target instanceof Node && !top.contains(event.target)) (focusable(top)[0] || top).focus({ preventScroll: true });
  }
  const bodyObserver = new MutationObserver(discover);
  bodyObserver.observe(document.body, { childList: true });
  window.addEventListener('keydown', onKey, true);
  document.addEventListener('focusin', onFocus);
  discover();
  return () => {
    bodyObserver.disconnect(); observers.forEach(o => o.disconnect()); restoreInert();
    window.removeEventListener('keydown', onKey, true); document.removeEventListener('focusin', onFocus);
    setInputBoundary('modal', false);
  };
}
