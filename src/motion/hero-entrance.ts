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
  const headingChars: HTMLElement[] = [];
  let idleSpin: { kill: () => unknown } | null = null;
  let activeSpin: { kill: () => unknown } | null = null;
  const scheduleSpin = () => {
    // A rare single-letter accent, never a distracting continuous loop.
    idleSpin = gsap.delayedCall(35 + Math.random() * 20, () => {
      if (document.visibilityState === "visible" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
          headingChars.length) {
        const char = headingChars[Math.floor(Math.random() * headingChars.length)];
        if (char.isConnected) activeSpin = gsap.fromTo(char,
          { rotationY: 0 },
          { rotationY: 360, duration: 0.86, ease: "power2.inOut", clearProps: "transform" });
      }
      scheduleSpin();
    });
  };
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
        let typingAt = cue.at;
        for (const line of lines) {
          const split = SplitText.create(line, { type: "chars", aria: "none" });
          splits.push(split);
          headingChars.push(...split.chars.filter((char): char is HTMLElement =>
            char instanceof HTMLElement && Boolean(char.textContent?.trim())));
          timeline.fromTo(split.chars,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: .025, stagger: .027, ease: "none",
              clearProps: "opacity,visibility" },
            typingAt);
          typingAt += split.chars.length * .027 + .04;
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

  if (headingChars.length) timeline.call(scheduleSpin, [], timeline.duration());
  return Object.assign(timeline, {
    revertSplit() {
      idleSpin?.kill();
      activeSpin?.kill();
      for (const split of splits) split.revert();
    },
  });
}
