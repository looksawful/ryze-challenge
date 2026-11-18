/** Ryze motion score. Display type leads, utility UI responds, character moves independently.
 * Time units are seconds; CSS fallbacks mirror the interaction ranges in foundation.css.
 * Do not replace specialized Canvas/WebGL clocks with DOM animation. */
export const MOTION = {
  control: { duration: 0.18, ease: "power2.out" },
  exit: { duration: 0.2, ease: "power2.in" },
  surface: { duration: 0.42, ease: "power3.out" },
  enter: { duration: 0.58, ease: "power3.out" },
  emphasis: { duration: 0.76, ease: "expo.out" },
  character: { duration: 0.68, ease: "power3.out" },
} as const;

/** One rhythm for decorative text and AI replies. All values in seconds.
 * Replies and placeholder typing use the same key cadence. */
export const CHAT_RHYTHM = {
  character: 0.045,
  eraseCharacter: 0.027,
  pause: 1.2,
  gap: 0.24,
  reveal: 0.68,
  processingTail: 0.45,
} as const;

/** Relative to the completed paper wind intro, not navigation time.
 * Cues deliberately overlap after the brand has left the screen. */
export const HERO_ENTRANCE_CUES = [
  { name: "brand", at: 0, duration: 0.46, rise: -10 },
  { name: "headline", at: 0, duration: 0.76, rise: 32 },
  { name: "lead", at: 0.22, duration: 0.56, rise: 14 },
  { name: "description", at: 0.44, duration: 0.58, rise: 12 },
  { name: "action", at: 0.66, duration: 0.64, rise: 17 },
  { name: "integration", at: 0.66, duration: 0.58, rise: 12 },
  { name: "navigation", at: 0.9, duration: 0.42, rise: 0 },
  { name: "cookies", at: 1.14, duration: 0.42, rise: 0 },
] as const;

export type HeroEntranceSlot = (typeof HERO_ENTRANCE_CUES)[number]["name"];
