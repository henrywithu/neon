import { isSavingAvailable } from "../../platform/saveStatus";
import { isTouchDevice } from '../../platform/deviceLayout';
import { setInputBoundary } from '../../ui/core/inputBoundary';
import { contacts } from '../story/contacts';
import { Sue } from '../story/milestones';
type MissionEvent = { type: string; id?: string };
type Store = { isDone(id: string): boolean; markDone(id: string): void };
type Progress = { storySeen(id: string): boolean; markStory(id: string): void };
type Missions = {
  phase: string; current: { id: string } | null; runInfo: { stopIndex: number } | null;
  startById(id: string): boolean; dismissResult(): void; subscribe(listener: (e: MissionEvent) => void): unknown;
};
type Drive = { vehicle: { telemetry: { speedKmh: number } }; input: { state: { steer: number; device: string } }; hud: { flash(text: string, ms?: number): void }; isPaused(): boolean; isActive(): boolean };
export function createFirstDrive({ drive, missions, progress, store, onGarage, voice = null }: { drive: Drive; missions: Missions; progress: Progress; store: Store; onGarage: () => void; voice?: { say(character: string, text: string, options: { priority: number }): unknown; stop(): void } | null }) {
  const choice = document.createElement('section'); choice.className = 'night-choice'; choice.hidden = true;
  choice.setAttribute('role', 'dialog'); choice.setAttribute('aria-label', 'Your first night');
  const cue = document.createElement('p'); cue.className = 'night-objective'; cue.hidden = true; cue.setAttribute('role', 'status');
  document.body.append(choice, cue);
  let guided = false, running = false, moved = false, braked = false, turned = false;
  let choose: ((value: boolean) => void) | null = null;
  function show(reward = false) {
    choice.innerHTML = `<div class="night-card"><p class="night-eyebrow">${reward ? 'POPS · FIRST FARE COMPLETE' : 'NYX · WELCOME TO TRAPNEST'}</p><h1>${reward ? 'You left a light on.' : 'One short fare. Or an open road.'}</h1><p>${reward ? 'The three-glass mark at Glass Turn is lit for you now. Pops: “Most drivers chase the lights. You brought someone home.” Your first fare is complete.' : 'Follow Pops past the rain-lit blocks to Glass Turn. We’ll take moving, braking and turning one at a time. You can cruise whenever you like.'}</p><div class="night-actions"><button data-guided>${reward ? 'Visit the garage' : 'Take a short job'}</button><button data-cruise>${reward ? 'Keep driving' : 'Just drive'}</button></div><p class="night-secondary">${reward ? 'Next: try Smoke Show in Messages, or take the city at your own pace.' : 'Help is always in Menu. Your progress saves in this browser.'}</p></div>`;
    if (!isSavingAvailable()) choice.querySelector(".night-secondary")!.textContent = "Local saving is unavailable. You can play; progress may last only for this visit.";
    if (reward) {
      const acknowledgement = Sue(contacts.pops, true);
      const subtitle = document.createElement('p'); subtitle.className = 'night-secondary'; subtitle.textContent = `Pops: ${acknowledgement}`;
      choice.querySelector('.night-actions')!.before(subtitle);
      // Reuse the credited recording and its exact subtitle; no new voice assets.
      voice?.say('pops', acknowledgement, { priority: 3 });
    }
    choice.hidden = false; setInputBoundary('first-drive', true);
    return new Promise<boolean>(resolve => {
      choose = value => { voice?.stop(); choice.hidden = true; setInputBoundary('first-drive', false); choose = null; resolve(value); };
      choice.querySelector('[data-guided]')!.addEventListener('click', () => choose?.(true));
      choice.querySelector('[data-cruise]')!.addEventListener('click', () => choose?.(false));
    });
  }
  function start() {
    if (!drive.isActive() || missions.phase === 'run' || missions.phase === 'countdown') return;
    running = missions.startById('first-fare'); document.body.classList.toggle('guided-first-drive', running); moved = false; braked = false; turned = false;
  }
  missions.subscribe(event => {
    if (event.id !== 'first-fare') return;
    if (event.type === 'pass' || event.type === 'fail') { running = false; document.body.classList.remove('guided-first-drive'); cue.hidden = true; }
    if (event.type === 'pass' && !progress.storySeen('glass-turn-reward')) {
      running = false; document.body.classList.remove("guided-first-drive"); cue.hidden = true; progress.markStory('glass-turn-reward');
      missions.dismissResult();
      void show(true).then(garage => { if (garage) onGarage(); });
    } else if (event.type === 'fail') { running = false; document.body.classList.remove("guided-first-drive"); cue.hidden = true; }
  });
  return {
    async welcome({ skipWelcome = false } = {}) {
      if (skipWelcome) { progress.markStory("intro"); return; }
      if (progress.storySeen('intro')) return;
      guided = await show(); progress.markStory('intro');
    },
    begin() { if (guided) start(); },
    start,
    update() {
      if (running && !missions.current && missions.phase === "idle") { running = false; document.body.classList.remove("guided-first-drive"); }
      if (!running || missions.current?.id !== 'first-fare' || missions.phase !== 'run') { cue.hidden = true; return; }
      if (drive.isPaused()) return;
      const speed = Math.abs(drive.vehicle.telemetry.speedKmh);
      const touch = isTouchDevice() || drive.input.state.device === 'touch';
      const gamepad = drive.input.state.device === 'gamepad';
      if (speed > 12) { moved = true; store.markDone('accelerate'); }
      if (moved && speed < 3) { braked = true; store.markDone('first-brake'); }
      if (braked && Math.abs(drive.input.state.steer) > .3 && speed > 5) { turned = true; store.markDone('first-turn'); }
      const instruction = !moved ? touch ? 'Hold GAS to get moving' : gamepad ? 'Hold RT to get moving' : 'Hold W to get moving' : !braked ? touch ? 'Hold BRAKE to slow down · stop at the first amber marker' : gamepad ? 'Hold LT to slow down · stop at the first amber marker' : 'Hold S to slow down · stop at the first amber marker' : !turned ? touch ? 'Steer with your left thumb · follow the cyan road ribbon' : gamepad ? 'Left stick to turn · follow the cyan road ribbon' : 'A / D to turn · follow the cyan road ribbon' : 'Glass Turn · follow the cyan ribbon and stop inside the final marker';
      if (cue.textContent !== instruction) cue.textContent = instruction;
      cue.hidden = false;
    },
    get active() { return running; }
  };
}
