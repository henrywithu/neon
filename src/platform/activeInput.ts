import { isTouchDevice } from './deviceLayout';
let active: 'touch' | 'keyboard' | 'gamepad' = isTouchDevice() ? 'touch' : 'keyboard';
export function getActiveInput() { return active; }
export function markActiveInput(value: typeof active) { active = value; }
window.addEventListener('pointerdown', event => markActiveInput(event.pointerType === 'touch' ? 'touch' : 'keyboard'), true);
window.addEventListener('keydown', event => { if (!['Tab', 'Escape'].includes(event.key)) markActiveInput('keyboard'); }, true);
