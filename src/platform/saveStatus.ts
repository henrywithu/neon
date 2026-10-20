let savingAvailable = true;
export function isSavingAvailable() { return savingAvailable; }
export function reportSaveFailure() {
  if (!savingAvailable) return;
  savingAvailable = false;
  window.dispatchEvent(new Event('neon:save-status'));
}
export function saveDescription() {
  return savingAvailable ? 'Progress saves locally in this browser.' : 'Local saving is unavailable. Progress and changes may last only for this visit.';
}
