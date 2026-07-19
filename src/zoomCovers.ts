/**
 * When true, zooming in spreads book positions but keeps cover glyphs at a
 * roughly constant screen size (so overlaps become separable). Zooming out
 * still shrinks covers with the layout for a readable overview.
 *
 * Flip to `false` (or revert the commit that introduced constant-size covers)
 * to restore the classic behaviour where covers grow/shrink with canvas zoom.
 */
export const CONSTANT_COVER_SCREEN_SIZE = true

/** Counter-scale applied inside the zoomed group so covers stay readable. */
export function coverCounterScale(k: number, enabled = CONSTANT_COVER_SCREEN_SIZE): number {
  if (!enabled) return 1
  return 1 / Math.max(k, 1)
}
