import { formatHours } from "@/lib/time";
import { masteryCells } from "./progress";

type MasteryGridProps = { focusedSeconds: number; targetHours: number };

const hoursFormat = new Intl.NumberFormat("en-US");

/**
 * The skill's target as 100 squares. Finished squares are filled tomato; the
 * square in progress is outlined in ink and filled to its real share.
 */
export function MasteryGrid({ focusedSeconds, targetHours }: MasteryGridProps) {
  const { cells, hoursPerCell, full, partial } = masteryCells(
    focusedSeconds,
    targetHours,
  );
  const inProgress = full < cells ? full : -1;
  const label = `${formatHours(focusedSeconds)} of ${hoursFormat.format(
    targetHours,
  )} hours. Each square is ${hoursFormat.format(hoursPerCell)} hours.`;

  return (
    <div role="img" aria-label={label} className="grid grid-cols-10 gap-1.5">
      {Array.from({ length: cells }, (_, index) => {
        if (index < full) {
          return (
            <span
              key={index}
              className="aspect-square rounded-md border-2 border-text bg-primary"
            />
          );
        }
        if (index === inProgress) {
          return (
            <span
              key={index}
              className="relative aspect-square overflow-hidden rounded-md border-2 border-text bg-surface"
            >
              <span
                className="absolute inset-x-0 bottom-0 bg-primary"
                style={{ height: `${partial * 100}%` }}
              />
            </span>
          );
        }
        return (
          <span key={index} className="aspect-square rounded-md bg-cream" />
        );
      })}
    </div>
  );
}
