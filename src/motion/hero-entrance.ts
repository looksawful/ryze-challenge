import { SplitText } from "gsap/SplitText";
import { HERO_ENTRANCE_CUES, MOTION } from "./tokens";

/** One orchestrator for the staged Hero entrance. CSS owns all placement.
 * SplitText operates on the two intentional display lines, never the H1's
 * meaning or source copy. The returned cleanup restores the source DOM. */
export function createHeroEntranceTimeline(
  gsap: typeof import("gsap")["gsap"],
  stage: HTMLElement,
  cookieHost: HTMLElement | null,
) {
  gsap.registerPlugin(SplitText);
  const splits: SplitText[] = [];
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
        gsap.set(element, { opacity: 1 });
        for (const [lineIndex, line] of lines.entries()) {
          const split = SplitText.create(line, { type: "chars", mask: "chars", aria: "none" });
          splits.push(split);
          timeline.fromTo(split.chars,
            { yPercent: 102, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: .58, ease: MOTION.emphasis.ease,
              stagger: .018, clearProps: "transform,opacity,visibility" },
            cue.at + lineIndex * .13);
        }
        continue;
      }
    }

    // Do not transform the fixed-position navigation's parent.
    const still = cue.name === "navigation" || cue.name === "cookies";
    const action = cue.name === "action";
    timeline.fromTo(element,
      { autoAlpha: 0, y: still ? 0 : cue.rise,
        scale: action ? .975 : 1 },
      { autoAlpha: 1, y: 0, scale: 1, duration: cue.duration,
        ease: action ? "back.out(1.12)" : MOTION.enter.ease,
        clearProps: "transform,opacity,visibility" },
      cue.at);
  }

  return Object.assign(timeline, {
    revertSplit() { for (const split of splits) split.revert(); },
  });
}
