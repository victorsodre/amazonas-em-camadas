export type PointerSample = { id: number; x: number; y: number; time: number };

/** Movement (px) and duration (ms) that still count as a deliberate tap, not a drag or a long press. */
export const TAP_SLOP = 8;
export const TAP_MAX_MS = 500;

/** A tap is one pointer, released close to where and soon after it went down, with no second finger in between. */
export function isTap(down: PointerSample | null, up: PointerSample, multiTouch: boolean) {
  if (!down || multiTouch || down.id !== up.id) return false;
  return Math.hypot(up.x - down.x, up.y - down.y) <= TAP_SLOP && up.time - down.time <= TAP_MAX_MS && up.time >= down.time;
}
