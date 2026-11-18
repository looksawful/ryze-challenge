import { HERO_ENTRANCE_CUES, MOTION } from "./tokens";

/** Pure DOM choreography. One GSAP timeline, no layout changes.
 * Call inside gsap.context() and revert that context on unmount. */
export function createHeroEntranceTimeline(
  gsap: typeof import("gsap")["gsap"],
  stage: HTMLElement,
  cookieHost: HTMLElement | null,
) {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: MOTION.enter.ease } });

  for (const cue of HERO_ENTRANCE_CUES) {
    const element = cue.name === "cookies"
      ? cookieHost
      : stage.querySelector<HTMLElement>(`[data-motion-slot="${cue.name}"]`);
    if (!element) continue;

    if (cue.name === "headline") {
      const lines = Array.from(element.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      if (lines.length) {
        // Reveal existing lines without splitting characters or rewriting copy.
        gsap.set(element, { opacity: 1 });
        timeline.fromTo(lines,
          { opacity: 0, yPercent: 66 },
          { opacity: 1, yPercent: 0, duration: cue.duration,
            stagger: 0.095, ease: MOTION.emphasis.ease, clearProps: "transform" },
          cue.at);
        continue;
      }
    }

    // The Nav wraps a fixed-position dock. Transforming the wrapper would
    // create a new containing block and disturb its position.
    const still = cue.name === "navigation" || cue.name === "cookies";
    const character = cue.name === "mascot";
    const action = cue.name === "action";
    timeline.fromTo(element,
      { autoAlpha: 0, y: still ? 0 : cue.rise,
        scale: character ? 0.965 : action ? 0.975 : 1 },
      { autoAlpha: 1, y: 0, scale: 1, duration: cue.duration,
        ease: character ? MOTION.character.ease : action ? "back.out(1.12)" : MOTION.enter.ease,
        clearProps: "transform" },
      cue.at);
  }

  return timeline;
}
