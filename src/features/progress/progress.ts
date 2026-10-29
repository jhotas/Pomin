type Focused = { focusedSeconds: number };
type Dated = Focused & { startedAt: string };

export function totalFocusedSeconds(sessions: readonly Focused[]): number {
  return sessions.reduce((sum, session) => sum + session.focusedSeconds, 0);
}

/** Focused time in sessions started at or after `since`. */
export function sumSince(sessions: readonly Dated[], since: Date): number {
  const from = since.getTime();
  return totalFocusedSeconds(
    sessions.filter((session) => Date.parse(session.startedAt) >= from),
  );
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

/** Local midnight `days` days after `date` (negative goes back). */
function localDay(date: Date, days = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Focused time per local week (Monday to Sunday), oldest first, this week last. */
export function weeklyTotals(
  sessions: readonly Dated[],
  now: Date,
  weeks = 8,
): { start: Date; seconds: number }[] {
  const today = localDay(now);
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const thisMonday = localDay(today, -daysSinceMonday);

  return Array.from({ length: weeks }, (_, index) => {
    const start = localDay(thisMonday, -7 * (weeks - 1 - index));
    const end = localDay(start, 7).getTime();
    const seconds = totalFocusedSeconds(
      sessions.filter((session) => {
        const at = Date.parse(session.startedAt);
        return at >= start.getTime() && at < end;
      }),
    );
    return { start, seconds };
  });
}

const PACE_DAYS = 30;

/**
 * When the target is reached at the pace of the last 30 days (today
 * included). No practice in that window means no projection.
 */
export function projectCompletion(
  sessions: readonly Dated[],
  targetHours: number,
  now: Date,
) {
  const today = localDay(now);
  const dailyAverageSeconds =
    sumSince(sessions, localDay(today, -(PACE_DAYS - 1))) / PACE_DAYS;
  const remainingSeconds = Math.max(
    0,
    targetHours * 3600 - totalFocusedSeconds(sessions),
  );

  let completesOn: Date | null = null;
  if (remainingSeconds === 0) completesOn = today;
  else if (dailyAverageSeconds > 0) {
    completesOn = localDay(
      today,
      Math.ceil(remainingSeconds / dailyAverageSeconds),
    );
  }
  return { dailyAverageSeconds, remainingSeconds, completesOn };
}

const TICK_STEPS = [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
const MAX_TICKS = 6;

/** Round, even axis ticks from zero, with the top tick above the maximum. */
export function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const step =
    TICK_STEPS.find(
      (candidate) => Math.floor(max / candidate) + 2 <= MAX_TICKS,
    ) ?? 10 ** Math.ceil(Math.log10(max));
  const count = Math.floor(max / step) + 1;
  return Array.from({ length: count + 1 }, (_, index) => index * step);
}
