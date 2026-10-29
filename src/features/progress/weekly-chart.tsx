import { formatHours, formatShortDate } from "@/lib/time";
import { niceTicks } from "./progress";

type Week = { start: Date; seconds: number };

/**
 * Focused hours per week as columns. The current week, the last column,
 * carries the data hue; past weeks are grey. Drawn in HTML so the labels stay
 * crisp at every width.
 */
export function WeeklyChart({ weeks }: { weeks: readonly Week[] }) {
  const hours = weeks.map((week) => week.seconds / 3600);
  const ticks = niceTicks(Math.max(...hours, 0));
  const top = ticks.at(-1) ?? 1;
  const label = `Focused hours per week, ${weeks
    .map(
      (week) =>
        `${formatShortDate(week.start)}: ${formatHours(week.seconds)} h`,
    )
    .join(", ")}.`;

  return (
    <div role="img" aria-label={label}>
      <div className="relative ml-10 h-44 lg:h-80">
        {ticks.map((tick) => (
          <div
            key={tick}
            aria-hidden
            className={`absolute inset-x-0 border-t ${
              tick === 0 ? "border-control" : "border-rule"
            }`}
            style={{ bottom: `${(tick / top) * 100}%` }}
          >
            <span className="absolute -top-2 -left-10 w-8 text-right text-small text-muted num">
              {tick} h
            </span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-end gap-2">
          {hours.map((value, index) => (
            <div
              key={index}
              className={`flex-1 rounded-t-xs ${
                index === hours.length - 1 ? "bg-data" : "bg-control"
              }`}
              style={{ height: `${(value / top) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div aria-hidden className="mt-2 ml-10 flex gap-2">
        {weeks.map((week, index) => (
          <span
            key={week.start.toISOString()}
            className={`flex-1 text-center text-small whitespace-nowrap text-muted num ${
              index % 2 === 1 ? "max-sm:invisible" : ""
            }`}
          >
            {formatShortDate(week.start)}
          </span>
        ))}
      </div>
    </div>
  );
}
