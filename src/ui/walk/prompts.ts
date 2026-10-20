// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isTouchDevice } from "../../platform/deviceLayout.ts";
function createWalkPrompt({
  domElement: domElement,
  walkControls: walkControls,
  state: state
} = {}) {
  var g, b, x;
  const s = document.createElement("button");
  s.type = "button";
  s.className = "walk-prompt";
  s.setAttribute("data-ui-block-look", "true");
  s.hidden = true;
  s.setAttribute("aria-label", "Click to activate walk mode");
  s.innerHTML = `
    <div class="walk-prompt-frame">
      <div class="walk-prompt-pulse" aria-hidden="true"></div>
      <span class="walk-prompt-corner walk-prompt-corner--tl"></span>
      <span class="walk-prompt-corner walk-prompt-corner--tr"></span>
      <span class="walk-prompt-corner walk-prompt-corner--bl"></span>
      <span class="walk-prompt-corner walk-prompt-corner--br"></span>
      <div class="walk-prompt-inner">
        <span class="walk-prompt-kicker">Walk mode</span>
        <span class="walk-prompt-title">Click to look around</span>
      </div>
    </div>
  `;
  document.body.appendChild(s);
  const n = s.querySelector(".walk-prompt-title");
  let r = false,
    o = !!(state != null && state.openedPanel),
    a = ((g = walkControls == null ? undefined : walkControls.hasTouchLooked) == null ? undefined : g.call(walkControls)) ?? false;
  function l() {
    return document.pointerLockElement != null;
  }
  function c() {
    isTouchDevice() ? (n.textContent = "Drag to look around", s.setAttribute("aria-label", "Drag to look around"), s.classList.add("walk-prompt--passive")) : (n.textContent = "Click to look around", s.setAttribute("aria-label", "Click to activate walk mode"), s.classList.remove("walk-prompt--passive"));
  }
  function u() {
    c();
    const _ = isTouchDevice() ? r && !a && !o : r && !l() && !o;
    s.hidden = !_;
    s.classList.toggle("walk-prompt--visible", _);
  }
  function d(y) {
    r = !!y;
    u();
  }
  function h() {
    isTouchDevice() || u();
  }
  function f(y) {
    isTouchDevice() || (y.preventDefault(), y.stopPropagation(), !(!domElement || l() || o) && domElement.requestPointerLock());
  }
  function p({
    hasTouchLooked: hasTouchLooked
  } = {}) {
    isTouchDevice() && (a = !!hasTouchLooked, u());
  }
  document.addEventListener("pointerlockchange", h);
  s.addEventListener("click", f);
  const m = (b = walkControls == null ? undefined : walkControls.subscribe) == null ? undefined : b.call(walkControls, p),
    A = (x = state == null ? undefined : state.subscribe) == null ? undefined : x.call(state, ({
      openedPanel: openedPanel
    }) => {
      o = !!openedPanel;
      u();
    });
  return {
    root: s,
    setEnabled: d,
    show() {
      d(true);
    },
    hide() {
      d(false);
    },
    destroy() {
      m == null || m();
      A == null || A();
      document.removeEventListener("pointerlockchange", h);
      s.removeEventListener("click", f);
      s.remove();
    }
  };
}
export { createWalkPrompt };
export const kue = 9;
export const Fue = 45;
export const Due = 360;
export const AL = [{
  id: "accelerate",
  kicker: "Drive mode",
  text: {
    keyboard: "Press W or ↑ to accelerate",
    touch: "Press GAS to accelerate",
    gamepad: "Pull RT to accelerate"
  },
  after: 0,
  hold: 1 / 0,
  ready: () => true,
  used: i => i.throttle > .1
}, {
  id: "nitro",
  kicker: "Nitro",
  text: {
    keyboard: "Hold Shift for a boost",
    touch: "Hold NITRO for a boost",
    gamepad: "Click L3 for a boost"
  },
  after: 5,
  ready: i => i.speed > 25 && i.nitroCharge > .3,
  used: i => i.nitro
}, {
  id: "drift",
  kicker: "Drift",
  text: {
    keyboard: "Steer and hold Space to drift",
    touch: "Steer and hold DRIFT to drift",
    gamepad: "Steer and hold A to drift"
  },
  after: 35,
  ready: i => i.speed > 40,
  used: i => i.drifting
}, {
  id: "launch",
  kicker: "Launch control",
  text: {
    keyboard: "Stop, then hold W + Space",
    touch: "Stop, then hold GAS + DRIFT",
    gamepad: "Stop, then hold RT + A"
  },
  after: 75,
  ready: i => i.speed < 20,
  used: i => i.launched,
  hidden: i => i.launchArmed
}, {
  id: "online",
  kicker: "Together",
  text: {
    keyboard: "Click ONLINE to drive with others",
    touch: "Open ☰, tap ONLINE to drive with others",
    gamepad: "Click ONLINE to drive with others"
  },
  after: 120,
  ready: i => {
    var e;
    return !!((e = i.together) != null && e.available) && !i.together.inRoom;
  },
  used: i => {
    var e;
    return !!((e = i.together) != null && e.invited);
  }
}, {
  id: "chat",
  kicker: "Together",
  text: {
    keyboard: "Press Y to talk to the room",
    touch: "Tap the room button, then a phrase, to talk",
    gamepad: null
  },
  after: 0,
  ready: i => i.withFriends > 3,
  used: i => {
    var e;
    return !!((e = i.together) != null && e.chatUsed);
  }
}, {
  id: "horn",
  kicker: "Together",
  text: {
    keyboard: "Hold K to honk · L flashes your lights",
    touch: null,
    gamepad: "Click R3 to honk · D-pad up flashes"
  },
  after: 0,
  ready: i => i.withFriends > 25,
  used: i => i.honked
}, {
  id: "watch",
  kicker: "Together",
  text: {
    keyboard: "Park, then press V to watch another driver",
    touch: null,
    gamepad: "Park, then press D-pad down to watch another driver"
  },
  after: 0,
  ready: i => i.withFriends > 50 && i.speed < 4,
  used: i => i.watching
}];
