// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const iv = "trapnest-neon:tutorial";
export function Nme() {
  let i = {};
  try {
    const t = JSON.parse(localStorage.getItem(iv) ?? "null");
    (t == null ? undefined : t.v) === 1 && t.done && (i = t.done);
  } catch {}
  function e() {
    try {
      localStorage.setItem(iv, JSON.stringify({
        v: 1,
        done: i
      }));
    } catch {}
  }
  return {
    isDone: t => !!i[t],
    markDone(t) {
      i[t] || (i[t] = Date.now(), e());
    },
    reset() {
      i = {};
      try {
        localStorage.removeItem(iv);
      } catch {}
    }
  };
}
