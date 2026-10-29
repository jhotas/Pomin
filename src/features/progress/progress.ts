export function totalFocusedSeconds(
  sessions: readonly { focusedSeconds: number }[],
): number {
  return sessions.reduce((sum, session) => sum + session.focusedSeconds, 0);
}

const CELLS = 100;

/**
 * The mastery grid: a skill's target drawn as 100 blocks. `full` blocks are
 * done and `partial` (0-1) is how far the block in progress has come.
 */
export function masteryCells(focusedSeconds: number, targetHours: number) {
  const hoursPerCell = targetHours / CELLS;
  const blocks = Math.min(CELLS, focusedSeconds / 3600 / hoursPerCell);
  const full = Math.floor(blocks);
  return {
    cells: CELLS,
    hoursPerCell,
    full,
    partial: full === CELLS ? 0 : blocks - full,
  };
}
