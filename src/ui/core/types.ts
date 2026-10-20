export interface UiSnapshot {
  openedPanel: string | null;
  uiVisible: boolean;
}
export interface AppUiState {
  readonly openedPanel: string | null;
  readonly uiVisible: boolean;
  subscribe(listener: (snapshot: UiSnapshot) => void): () => void;
  openPanel(name: string): void;
  closePanel(): void;
  hideAllUi(): void;
  showAllUi(): void;
}
export interface PanelComponent {
  readonly root: HTMLElement;
  open(): void;
  close(): void;
  setForceHidden(hidden: boolean): void;
  destroy(): void;
}
