import { setInputBoundary } from './inputBoundary';
import type { AppUiState, UiSnapshot } from './types';
export function createAppUiState(): AppUiState {
  const listeners = new Set<(snapshot: UiSnapshot) => void>();
  let openedPanel: string | null = null;
  let uiVisible = true;
  function notify(): void {
    setInputBoundary("panel", openedPanel !== null);
    for (const listener of listeners) listener({
      openedPanel,
      uiVisible
    });
  }
  return {
    get openedPanel() {
      return openedPanel;
    },
    get uiVisible() {
      return uiVisible;
    },
    subscribe(listener) {
      listeners.add(listener);
      listener({
        openedPanel,
        uiVisible
      });
      return () => {
        listeners.delete(listener);
      };
    },
    openPanel(name) {
      openedPanel = name;
      uiVisible = true;
      notify();
    },
    closePanel() {
      if (openedPanel !== null) {
        openedPanel = null;
        notify();
      }
    },
    hideAllUi() {
      if (uiVisible) {
        uiVisible = false;
        notify();
      }
    },
    showAllUi() {
      if (!uiVisible) {
        uiVisible = true;
        notify();
      }
    }
  };
}
