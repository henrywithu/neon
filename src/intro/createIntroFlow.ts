// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { reducedMotion } from "../platform/experiencePreferences.ts";
import { createRainGlassIntro } from "../audio/voice/createVoice.ts";
import { createIntroOverlay, createTransitionOverlay } from "../ui/intro/createIntroOverlay.ts";
import { FEATURES } from "../world/createWorld.ts";
export const fhe = i => new Promise(e => setTimeout(e, i));
export function createIntroFlow({
  pipeline: pipeline,
  renderer: renderer,
  loaderOverlay: loaderOverlay,
  revealAppUi: revealAppUi,
  world: world,
  beforeReveal = null,
  onSettled = null
}) {
  let a = null,
    l = false;
  function c(p) {
    var m;
    if (world) for (const A of ((m = world.smoke) == null ? undefined : m.emitters) ?? []) A.mesh.visible = !p;
  }
  async function u() {
    await new Promise(p => requestAnimationFrame(p));
    renderer.domElement.style.opacity = "1";
    renderer.domElement.style.zIndex = "14";
    await loaderOverlay.finish();
  }
  async function d() {
    l = true;
    c(true);
    renderer.domElement.style.pointerEvents = "none";
    a = pipeline.introRainGlass ? createRainGlassIntro({
      pipeline: pipeline
    }) : null;
    const p = createIntroOverlay({
      scrim: !a,
      onStart: async ({ skipWelcome = false } = {}) => {
        const m = createTransitionOverlay();
        m.show();
        const A = (async () => {
            await (a == null ? undefined : a.fadeOut({
              duration: reducedMotion() ? 0 : .24
            }));
            a == null || a.destroy();
            a = null;
            l = false;
            c(false);
            await fhe(reducedMotion() ? 0 : 160);
            await m.hide();
            m.destroy();
            onSettled == null || onSettled();
          })(),
          g = beforeReveal == null ? undefined : beforeReveal({ skipWelcome }).catch(b => console.warn("[intro] story message failed:", b));
        await Promise.all([A, g]);
        renderer.domElement.style.pointerEvents = "auto";
        revealAppUi();
      }
    });
    await u();
    p.playEnter();
  }
  async function h() {
    await u();
    renderer.domElement.style.pointerEvents = "auto";
    revealAppUi();
  }
  async function f() {
    FEATURES.intro ? await d() : await h();
  }
  return {
    run: f,
    getRainGlassIntro: () => a,
    isIntroActive: () => l
  };
}
