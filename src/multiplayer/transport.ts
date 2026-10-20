// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { closeCodes } from "./protocol.ts";
export const kme = 2e3;
export const Fme = 6e3;
export const Dme = 16 * 1024;
export const Pme = 8e3;
export function createMultiplayerTransport({
  url: url,
  onFrame: onFrame,
  onState: onState,
  onRtt: onRtt
}) {
  let n = null,
    r = "idle",
    o = 0,
    a = 0,
    l = 0,
    c = 0,
    u = 0,
    d = false;
  const h = (A, g) => {
    r = A;
    onState == null || onState(A, g);
  };
  function f() {
    clearTimeout(a);
    h(o ? "reconnecting" : "connecting");
    const A = new WebSocket(url());
    n = A;
    clearTimeout(l);
    l = setTimeout(() => {
      n === A && A.readyState === WebSocket.CONNECTING && A.close();
    }, Pme);
    A.onopen = () => {
      clearTimeout(l);
      o = 0;
      c = performance.now();
      h("open");
      p();
    };
    A.onmessage = g => {
      if (c = performance.now(), g.data === "k") {
        onRtt == null || onRtt(c - u);
        return;
      }
      let b = null;
      try {
        b = JSON.parse(g.data);
      } catch {
        return;
      }
      if (Array.isArray(b)) {
        if (b[0] === "x") {
          d = true;
          h("refused", {
            code: b[1],
            reason: b[2]
          });
          A.close(1e3);
          return;
        }
        onFrame(b);
      }
    };
    A.onclose = () => {
      if (n !== A || (n = null, d)) return;
      const g = Math.min(8e3, 400 * 2 ** o) * (.75 + Math.random() * .5);
      o += 1;
      clearTimeout(l);
      h("reconnecting", {
        attempts: o,
        failed: true
      });
      a = setTimeout(f, g);
    };
    A.onerror = () => {};
  }
  function p() {
    (n == null ? undefined : n.readyState) === WebSocket.OPEN && (u = performance.now(), n.send("k"));
  }
  const m = setInterval(() => {
    d || !n || n.readyState === WebSocket.OPEN && (performance.now() - c > Fme ? n.close() : p());
  }, kme);
  return {
    connect() {
      n || r === "refused" || (d = false, o = 0, f());
    },
    send(A) {
      return (n == null ? undefined : n.readyState) !== WebSocket.OPEN || n.bufferedAmount > Dme ? false : (n.send(A), true);
    },
    close() {
      d = true;
      clearTimeout(a);
      clearTimeout(l);
      const A = n;
      n = null;
      A == null || A.close(1e3);
      r !== "closed" && h("closed");
    },
    drop() {
      n == null || n.close();
    },
    get state() {
      return r;
    },
    dispose() {
      this.close();
      clearInterval(m);
    }
  };
}
export function Ume(i) {
  switch (i) {
    case closeCodes.FULL:
      return "ROOM IS FULL";
    case closeCodes.VERSION:
      return "GAME OUT OF DATE · RELOAD THE PAGE";
    case closeCodes.REPLACED:
      return "THIS SEAT WAS TAKEN BY ANOTHER TAB";
    case closeCodes.ABUSE:
      return "DISCONNECTED · TOO MANY MESSAGES";
    case closeCodes.TOO_MANY:
      return "TOO MANY CONNECTIONS FROM THIS NETWORK";
    case closeCodes.MAINTENANCE:
      return "ROOMS ARE BEING PREPARED AND CLEANED FOR THE NEXT DRIVERS · COME BACK IN A FEW HOURS";
    case closeCodes.IDLE:
      return "SEAT RELEASED · YOU WERE PARKED TOO LONG";
    default:
      return "COULD NOT JOIN THE ROOM";
  }
}
export const zme = 4e3;
