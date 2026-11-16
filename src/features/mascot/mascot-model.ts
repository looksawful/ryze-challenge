/** Pure layout and Codex Pet v2 atlas contract: 8 × 11 cells, 192 × 208. */
export const SPRITE_CELL = { width: 192, height: 208 } as const;

export type AnimationName = "idle" | "running-right" | "running-left" | "waving" |
  "jumping" | "failed" | "waiting" | "working" | "review";
const animations: Record<AnimationName, { row: number; durations: readonly number[]; loop: boolean }> = {
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320], loop: true },
  "running-right": { row: 1, durations: [120, 120, 120, 120, 120, 120, 120, 220], loop: true },
  "running-left": { row: 2, durations: [120, 120, 120, 120, 120, 120, 120, 220], loop: true },
  waving: { row: 3, durations: [140, 140, 140, 280], loop: false },
  jumping: { row: 4, durations: [140, 140, 140, 140, 280], loop: false },
  failed: { row: 5, durations: [140, 140, 140, 140, 140, 140, 140, 240], loop: false },
  waiting: { row: 6, durations: [150, 150, 150, 150, 150, 260], loop: true },
  working: { row: 7, durations: [120, 120, 120, 120, 120, 220], loop: true },
  review: { row: 8, durations: [150, 150, 150, 150, 150, 280], loop: false },
};
type SpriteCell = { row: number; frame: number; x: number; y: number };
function cell(row: number, frame: number): SpriteCell {
  return { row, frame, x: frame === 0 ? 0 : -frame * SPRITE_CELL.width, y: row === 0 ? 0 : -row * SPRITE_CELL.height };
}
export function resolveSpriteFrame(action: AnimationName, elapsedMs: number, reducedMotion = false) {
  const animation = animations[action];
  if (reducedMotion) return { ...cell(animation.row, 0), completed: false };
  const total = animation.durations.reduce((sum, duration) => sum + duration, 0);
  const safeElapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const completed = !animation.loop && safeElapsed >= total;
  const elapsed = completed ? total - 1 : safeElapsed % total;
  let consumed = 0;
  for (let i = 0; i < animation.durations.length; i++) {
    consumed += animation.durations[i];
    if (elapsed < consumed) return { ...cell(animation.row, i), completed };
  }
  return { ...cell(animation.row, animation.durations.length - 1), completed };
}

/** Codex v2 clockwise gaze: 000=up, 090=right, 180=down. */
export function resolveLookCell(dx: number, dy: number): SpriteCell {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || (!dx && !dy)) return cell(0, 0);
  const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
  const direction = Math.round(angle / (Math.PI / 8)) % 16;
  return cell(9 + Math.floor(direction / 8), direction % 8);
}

export function clampWanderDestination(input: {
  zoneWidth: number; petWidth: number; currentX: number; deltaX: number; gap?: number;
}): number {
  const { zoneWidth, petWidth, currentX, deltaX, gap = 8 } = input;
  if (![zoneWidth, petWidth, gap].every(Number.isFinite) || zoneWidth <= 0 || petWidth <= 0 || gap < 0) return 0;
  const upper = zoneWidth - petWidth - gap;
  if (upper < gap) return 0;
  if (!Number.isFinite(currentX)) return gap;
  const origin = currentX;
  const step = Number.isFinite(deltaX) ? deltaX : 0;
  return Math.min(upper, Math.max(gap, origin + Math.max(-50, Math.min(50, step))));
}
export function shouldCompact(size: { width: number; height: number }): boolean {
  return size.width < 300 || size.height < 170;
}
export function shouldWander(state: {
  desktop: boolean; motionAllowed: boolean; visible: boolean;
  actionOpen: boolean; messageOpen: boolean; compact: boolean; interacting?: boolean;
}): boolean {
  return state.desktop && state.motionAllowed && state.visible &&
    !state.actionOpen && !state.messageOpen && !state.compact && !state.interacting;
}
export function placeBubble(input: {
  zoneWidth: number; zoneHeight: number; petX: number; petTop: number;
  petWidth: number; bubbleWidth: number; bubbleHeight: number;
}): { x: number; y: number; side: "right" | "left" | "top" } {
  const finite = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
  const zoneWidth = finite(input.zoneWidth);
  const zoneHeight = finite(input.zoneHeight);
  const petX = finite(input.petX);
  const petTop = finite(input.petTop);
  const petWidth = finite(input.petWidth);
  const bubbleWidth = finite(input.bubbleWidth);
  const bubbleHeight = finite(input.bubbleHeight);
  const y = Math.max(0, Math.min(zoneHeight - bubbleHeight, petTop));
  const right = petX + petWidth + 12;
  if (right + bubbleWidth <= zoneWidth) return { x: right, y, side: "right" };
  const left = petX - bubbleWidth - 12;
  if (left >= 0) return { x: left, y, side: "left" };
  return { x: Math.max(0, Math.min(zoneWidth - bubbleWidth, petX)), y: 0, side: "top" };
}
