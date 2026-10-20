/** Rewards wait for a calm stop; hazards, route cues and the objective keep the road. */
export function createNoticeQueue() {
  const pending = new Map<string, { priority: number; show: () => void }>();
  let gap = 0;
  return {
    enqueue(id: string, priority: 'reward' | 'ambient', show: () => void) { pending.set(id, { priority: priority === 'reward' ? 0 : 1, show }); },
    update(dt: number, { stopped, busy }: { stopped: boolean; busy: boolean }) {
      gap = Math.max(0, gap - dt);
      if (!stopped || busy || gap > 0) return;
      const next = [...pending].sort((a, b) => a[1].priority - b[1].priority)[0];
      if (!next) return;
      pending.delete(next[0]); gap = 7; next[1].show();
    },
    get pending() { return pending.size; }
  };
}
