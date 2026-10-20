// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createMessagesPanel, wme, vme, Sme, Eme, Uk, Ok, Tme, Pk } from "../../ui/story/createMessagesPanel.ts";
import { UT, AE, mm } from "./definitions.ts";
import { ib, L1, Cue } from "./milestones.ts";
import { contacts, aB } from "./contacts.ts";
import { oB } from "../sigils/placements.ts";
export function Pf(i, e = false) {
  const t = Math.floor((Date.now() - i) / 6e4);
  if (t < 1) return "NOW";
  if (t < 60) return e ? `${t}M` : `${t} MIN AGO`;
  const s = Math.floor(t / 60);
  return s < 24 ? e ? `${s}H` : `${s} H AGO` : e ? `${Math.floor(s / 24)}D` : `${Math.floor(s / 24)} D AGO`;
}
export function createInbox({
  missions: missions,
  sigils = null,
  progress: progress,
  drive: drive,
  sfx = null,
  voice = null,
  canShow = () => true,
  canRing = () => true
}) {
  let l = null,
    c = null,
    u = () => true;
  const d = createMessagesPanel({
      sfx: {
        type: () => {
          var U;
          return (U = l == null ? undefined : l.type) == null ? undefined : U.call(l);
        },
        open: () => {
          var U;
          return (U = l == null ? undefined : l.open) == null ? undefined : U.call(l);
        },
        close: () => {
          var U;
          return (U = l == null ? undefined : l.close) == null ? undefined : U.call(l);
        },
        confirm: () => {
          var U;
          return (U = l == null ? undefined : l.confirm) == null ? undefined : U.call(l);
        }
      }
    }),
    h = U => U && typeof U.id == "string" && (U.kind === "job" ? UT.has(U.ref) : U.kind === "sigil" ? AE.has(U.ref) : U.kind === "friends" && U.ref === "invite");
  let f = progress.inbox.filter(h).map(U => ({
    ...U
  }));
  const p = new Set(),
    m = new Map(),
    A = new Map(),
    g = new Set();
  let b = wme,
    x = "start",
    y = 0,
    _ = null,
    w = 0,
    S = null,
    T = 0;
  const v = () => progress.saveInbox(f.map(U => ({
      ...U
    }))),
    E = () => f.filter(U => !U.read).length;
  function C() {
    const U = {
      unread: E(),
      total: f.length
    };
    d.setUnread(U.unread);
    for (const J of g) J(U);
  }
  const M = () => drive.playerPose(),
    B = U => (sigils == null ? undefined : sigils.items.find(J => J.def.id === U)) ?? null;
  function R(U) {
    var Q;
    if (U.kind === "friends") return null;
    if (U.kind === "job") {
      const j = (Q = missions.missions.find(de => de.def.id === U.ref)) == null ? undefined : Q.start;
      return j ? {
        x: j.x,
        z: j.z
      } : null;
    }
    const J = B(U.ref);
    return J ? {
      x: J.x,
      z: J.z
    } : null;
  }
  function I(U) {
    var j;
    const J = A.get(U.id),
      Q = (j = drive.gps) == null ? undefined : j.waypoint;
    return !!(J && Q) && Math.hypot(Q.x - J.x, Q.z - J.z) < 1;
  }
  function k() {
    let U = false;
    for (const J of f) (J.kind === "job" ? progress.isMissionDone(J.ref) : J.kind === "friends" ? progress.storySeen("invited") : progress.isSigilCollected(J.ref)) && !J.done && (J.done = true, J.read = true, U = true);
    for (; f.length > vme;) {
      const J = f.findIndex(Q => Q.done);
      f.splice(J >= 0 ? J : 0, 1);
      U = true;
    }
    U && (v(), C());
  }
  const L = U => f.find(J => J.kind === U && !J.done) ?? null;
  function F(U, J, Q = {}) {
    const j = {
      id: `${U}:${J}:${Date.now().toString(36)}`,
      kind: U,
      ref: J,
      at: Date.now(),
      read: false,
      done: false,
      ...Q
    };
    f.push(j);
    k();
    v();
    C();
    return j;
  }
  function O() {
    const U = mm.filter(de => !progress.isMissionDone(de.id)),
      J = U.filter(de => !de.final),
      Q = J.length ? J : U,
      j = Q.find(de => !p.has(de.id)) ?? Q[0];
    return j ? (p.delete(j.id), F("job", j.id)) : null;
  }
  function H() {
    return !!S && !progress.storySeen("friends") && !progress.storySeen("invited") && (progress.missionsDone() >= 1 || T >= 2);
  }
  function W() {
    progress.markStory("friends");
    return F("friends", "invite");
  }
  function P() {
    if (!sigils) return null;
    const U = M();
    let J = null,
      Q = 1 / 0;
    for (const K of sigils.items) {
      if (K.collected) continue;
      const V = Math.hypot(K.x - U.x, K.z - U.z) + (p.has(K.def.id) ? 1e6 : 0);
      V < Q && (Q = V, J = K);
    }
    if (!J) return null;
    p.delete(J.def.id);
    const j = f.filter(K => K.kind === "sigil").length,
      de = progress.sigilsFound() === 0 && j === 0 ? -1 : j % ib.lines.length;
    return F("sigil", J.def.id, {
      line: de
    });
  }
  const z = () => f.find(U => !U.read && !U.done && (m.get(U.id) ?? 0) <= Sme) ?? null;
  function Y(U) {
    const J = U.done,
      Q = J ? null : R(U),
      j = Q ? M() : null,
      de = Q ? Eme(Math.hypot(Q.x - j.x, Q.z - j.z)) : "";
    if (U.kind === "job") {
      const V = UT.get(U.ref);
      return {
        id: U.id,
        who: L1(V),
        tag: "JOB",
        text: V.text ?? V.brief,
        ago: Pf(U.at),
        when: Pf(U.at, true),
        unread: !U.read,
        done: J,
        gps: I(U),
        attach: {
          kind: "job",
          icon: V.icon,
          name: V.name,
          tier: V.tier,
          distance: de,
          status: J ? "✓ PASSED" : ""
        }
      };
    }
    if (U.kind === "friends") return {
      id: U.id,
      who: contacts.nyx,
      tag: "TOGETHER",
      text: Cue,
      ago: Pf(U.at),
      when: Pf(U.at, true),
      unread: !U.read,
      done: J,
      gps: false,
      attach: {
        kind: "friends",
        name: "DRIVE WITH OTHERS",
        note: "UP TO 4 DRIVERS",
        status: J ? "✓ JOINED" : "",
        canInvite: !!S
      }
    };
    const K = AE.get(U.ref);
    return {
      id: U.id,
      who: contacts[aB],
      tag: "SIGIL",
      text: U.line >= 0 ? ib.lines[U.line % ib.lines.length] : ib.first,
      ago: Pf(U.at),
      when: Pf(U.at, true),
      unread: !U.read,
      done: J,
      gps: I(U),
      attach: {
        kind: "sigil",
        iconUrl: oB(K.id),
        color: K.color,
        name: K.name,
        distance: de,
        status: J ? "✓ FOUND" : ""
      }
    };
  }
  function G(U, J) {
    var j;
    const Q = Y(U);
    d.notify({
      character: Q.who,
      text: Q.text,
      eyebrow: J,
      time: Uk
    });
    m.set(U.id, (m.get(U.id) ?? 0) + 1);
    (j = sfx == null ? undefined : sfx.message) == null || j.call(sfx);
    m.get(U.id) === 1 && (voice == null || voice.say(Q.who.id, Q.text, {
      priority: 1,
      delay: .35,
      comms: true
    }));
    y = Uk;
    _ = U.id;
  }
  function X() {
    k();
    const U = L("job"),
      J = L("sigil");
    let Q = null,
      j = "NEW MESSAGE";
    if (x !== "idle") {
      if (U && I(U)) {
        x = "idle";
        b = Ok;
        return;
      }
      U ? (Q = U, j = U.read ? "YOUR NEXT JOB" : "UNREAD MESSAGE") : Q = O();
    }
    x === "idle" && (T += 1);
    !Q && x === "idle" && H() && (Q = W());
    !Q && !J && (Q = P());
    !Q && !U && (Q = O());
    Q || (Q = z(), j = "UNREAD MESSAGE");
    x = "idle";
    b = Ok;
    Q && G(Q, j);
  }
  const ae = () => [...f].sort((U, J) => U.done - J.done || J.at - U.at),
    ne = () => !d.isOpen && !u() && canShow();
  function se(U) {
    const J = f.find(Q => Q.id === U);
    J && !J.read && (J.read = true, v(), C());
  }
  function re(U = null) {
    var j, de;
    if (!ne()) return missions.active && ((de = (j = drive.hud) == null ? undefined : j.flash) == null || de.call(j, "MESSAGES AFTER THE JOB")), false;
    k();
    const J = ae(),
      Q = J.find(K => K.id === U) ?? J.find(K => !K.read) ?? J[0] ?? null;
    y = 0;
    d.clear();
    c == null || c("phone", true);
    d.open({
      items: J.map(Y),
      selected: (Q == null ? undefined : Q.id) ?? null,
      onSelect: se,
      onGps: K => {
        var Ce, Ue, Ae;
        const V = f.find(Be => Be.id === K);
        if ((V == null ? undefined : V.kind) === "friends") {
          V.done || S == null || S();
          return;
        }
        const te = V && !V.done ? R(V) : null;
        if (!te) return;
        drive.setWaypoint(te);
        (Ce = drive.gps) != null && Ce.waypoint && A.set(V.id, {
          ...drive.gps.waypoint
        });
        w = 0;
        const fe = V.kind === "job" ? UT.get(V.ref).name : "SIGIL SIGNAL";
        (Ae = (Ue = drive.hud) == null ? undefined : Ue.flash) == null || Ae.call(Ue, `GPS SET · ${fe.toUpperCase()}`, 2400);
      },
      onDelete: K => {
        const V = f.findIndex(fe => fe.id === K);
        if (V < 0) return;
        const [te] = f.splice(V, 1);
        te.done || p.add(te.ref);
        I(te) && drive.setWaypoint(null);
        A.delete(te.id);
        w += 1;
        b = Math.max(b, Tme * 2 ** Math.min(w - 1, 3));
        v();
        C();
        d.refresh(ae().map(Y));
      }
    }).then(() => c == null ? undefined : c("phone", false));
    return true;
  }
  d.onActivate(U => re(U === "toast" ? _ : null));
  const le = missions.subscribe(U => {
      U.type === "start" ? (y = 0, d.fold()) : U.type === "pass" && (x = "pass", b = Pk, w = 0);
    }),
    we = progress.subscribe(U => {
      if (U.type === "reset") {
        f = [];
        v();
        C();
        return;
      }
      const J = U.type === "sigil" && f.some(Q => Q.kind === "sigil" && Q.ref === U.id && !Q.done);
      k();
      J && (x = "pass", b = Math.min(b, Pk));
    });
  function Se(U) {
    const J = ne();
    if (d.setHidden(!J), !!J) {
      if (y > 0) {
        y -= U;
        y <= 0 && d.fold();
        return;
      }
      x === "idle" && f.some(Q => !Q.done && I(Q)) || (b -= U, !(b > 0) && (canRing() ? X() : b = 1));
    }
  }
  function ye(U) {
    if (U.code !== "KeyI" || U.repeat || U.metaKey || U.ctrlKey || U.altKey) return;
    const J = U.target instanceof HTMLElement ? U.target : null;
    J != null && J.matches("input, textarea, select") || J != null && J.isContentEditable || re() && U.preventDefault();
  }
  window.addEventListener("keydown", ye);
  k();
  C();
  return {
    update: Se,
    open: re,
    setInvite(U) {
      S = U ?? null;
    },
    get busy() {
      return d.isOpen || d.isRinging;
    },
    get isOpen() {
      return d.isOpen;
    },
    subscribe(U) {
      g.add(U);
      U({
        unread: E(),
        total: f.length
      });
      return () => g.delete(U);
    },
    attachUi(U = {}) {
      l = U.uiSfx ?? l;
      c = U.setMenuOpen ?? c;
      u = U.isBusy ?? u;
    },
    ring(U = null) {
      y = 0;
      const J = U === "job" ? L("job") ?? O() : U === "sigil" ? L("sigil") ?? P() : U === "friends" ? L("friends") ?? W() : null;
      J ? G(J, "NEW MESSAGE") : X();
    },
    get messages() {
      return f.map(U => ({
        ...U
      }));
    },
    dispose() {
      le == null || le();
      we == null || we();
      window.removeEventListener("keydown", ye);
      d.dispose();
    }
  };
}
export const nv = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
export function Cme(i) {
  let e = 0;
  function t(s) {
    var n, r;
    s.repeat || (r = (n = s.target) == null ? undefined : n.closest) != null && r.call(n, "input, textarea, [contenteditable]") || (s.code === nv[e] ? e += 1 : e = s.code !== nv[0] ? 0 : e === 2 ? 2 : 1, !(e < nv.length) && (e = 0, i()));
  }
  window.addEventListener("keydown", t, true);
  return {
    dispose() {
      window.removeEventListener("keydown", t, true);
    }
  };
}
