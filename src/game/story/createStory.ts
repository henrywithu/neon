// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createStoryModal, ume, cme } from "../../ui/story/storyModal.ts";
import { mL, Bue, vf, fL, vue, Mue, Eue } from "./milestones.ts";
import { wG, contacts } from "./contacts.ts";
import { vehicleCatalog, isVehicleUnlocked } from "../vehicles/catalog.ts";
import { L2 } from "../missions/definitions.ts";
import { lG, glyphPaths } from "../../ui/walk/hudPanel.ts";
export function createStory({
  progress: progress,
  voice = null,
  isCalm = () => true
}) {
  let s = null,
    n = null,
    r = () => false;
  const o = createStoryModal({
      sfx: {
        type: () => {
          var y;
          return (y = s == null ? undefined : s.type) == null ? undefined : y.call(s);
        },
        open: () => {
          var y;
          return (y = s == null ? undefined : s.open) == null ? undefined : y.call(s);
        },
        close: () => {
          var y;
          return (y = s == null ? undefined : s.close) == null ? undefined : y.call(s);
        },
        confirm: () => {
          var y;
          return (y = s == null ? undefined : s.confirm) == null ? undefined : y.call(s);
        }
      },
      voice: voice
    }),
    a = mL([wG(contacts.nyx.id)]);
  setTimeout(() => mL(Bue()), ume);
  let l = false,
    c = 0;
  const u = () => {
    l = progress.isAllComplete() && !progress.storySeen("ending");
  };
  progress.subscribe(u);
  u();
  {
    const {
      text: y,
      voiceId: _
    } = f();
    voice == null || voice.prefetch(contacts.nyx.id, y, {
      id: _
    });
  }
  function d() {
    const y = progress.missionsDone(),
      _ = progress.racesDone(),
      w = progress.sigilsFound(),
      S = vehicleCatalog.filter(v => isVehicleUnlocked(v, progress)).length,
      T = progress.isAllComplete();
    return [{
      icon: "flag",
      label: "JOBS",
      hint: "Yellow beams on the street",
      value: `${y} / ${progress.missionCount}`,
      done: y === progress.missionCount
    }, {
      icon: L2,
      label: "STREET RACES",
      hint: "Chequered flags",
      value: `${_} / ${progress.raceCount}`,
      done: _ === progress.raceCount
    }, {
      icon: "hexagon",
      label: "NEON SIGILS",
      hint: "Hidden between buildings",
      value: `${w} / ${progress.sigilCount}`,
      done: w === progress.sigilCount
    }, {
      icon: "garage",
      label: "RIDES",
      hint: "Jobs, races, sigils",
      value: `${S} / ${vehicleCatalog.length}`,
      done: S === vehicleCatalog.length
    }, {
      icon: "crown",
      label: "THE NIGHT",
      hint: "Do it all",
      value: T ? "YOURS" : "UP FOR GRABS",
      done: T
    }];
  }
  async function h() {
    const {
      first: y,
      crowned: _,
      text: w,
      voiceId: S
    } = f();
    await Promise.race([a, new Promise(T => setTimeout(T, 1500))]);
    _ && (progress.markStory("ending"), l = false);
    await o.show({
      character: contacts.nyx,
      eyebrow: y || _ ? "INCOMING MESSAGE" : "NEW MESSAGE",
      title: _ ? vf.title : "",
      text: w,
      voiceId: S,
      goals: d(),
      button: "LET'S RIDE"
    });
    progress.markStory("intro");
  }
  function f() {
    const y = !progress.storySeen("intro"),
      _ = progress.isAllComplete() && !progress.storySeen("ending");
    return _ ? {
      first: y,
      crowned: _,
      text: vf.text
    } : y ? {
      first: y,
      crowned: _,
      text: fL
    } : {
      first: y,
      crowned: _,
      ...g()
    };
  }
  let p = 0;
  async function m(y) {
    const _ = ++p;
    n == null || n(true);
    await o.show({
      character: contacts.nyx,
      goals: d(),
      ...y
    });
    _ === p && (n == null || n(false));
  }
  function A() {
    return {
      missionsLeft: progress.missionCount - progress.missionsDone(),
      racesLeft: progress.raceCount - progress.racesDone(),
      sigilsLeft: progress.sigilCount - progress.sigilsFound(),
      complete: progress.isAllComplete(),
      started: progress.missionsDone() + progress.racesDone() + progress.sigilsFound() > 0
    };
  }
  function g() {
    const y = A();
    return {
      text: vue(y),
      voiceId: Mue(Eue(y))
    };
  }
  function b() {
    progress.markStory("ending");
    return m({
      title: vf.title,
      text: vf.text,
      button: "CONTINUE"
    });
  }
  function x(y) {
    !l || o.isOpen || (c = isCalm() && !r() ? c + y : 0, !(c < cme) && (l = false, c = 0, b()));
  }
  return {
    playOpening: h,
    update: x,
    get isOpen() {
      return o.isOpen;
    },
    attachUi(y = {}) {
      s = y.uiSfx ?? s;
      n = y.setModal ?? n;
      r = y.isBusy ?? r;
    },
    play(y = "intro") {
      return m(y === "ending" ? {
        title: vf.title,
        text: vf.text,
        button: "CONTINUE"
      } : y === "welcome" ? {
        eyebrow: "NEW MESSAGE",
        ...g(),
        button: "LET'S RIDE"
      } : {
        text: fL,
        button: "LET'S RIDE"
      });
    }
  };
}
export const Ul = i => `<svg class="phone-icon" viewBox="${lG}" aria-hidden="true"><path d="${glyphPaths[i]}" fill="currentColor"/></svg>`;
