import type { Session } from "@/data/schemas";
import { formatDuration, formatTimeOfDay } from "@/lib/time";

/** Today's sessions of one skill, oldest first. */
export function TodaySessions({ sessions }: { sessions: readonly Session[] }) {
  return (
    <section aria-labelledby="today-title">
      <h2 id="today-title" className="font-medium">
        Today
      </h2>
      {sessions.length === 0 ? (
        <p className="mt-2 text-muted">No sessions yet today.</p>
      ) : (
        <ul className="mt-1">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-baseline justify-between gap-3 border-b border-rule py-2 last:border-b-0"
            >
              <span className="text-muted num">
                {formatTimeOfDay(session.startedAt)}
                {session.outcome === "interrupted" && " · stopped early"}
              </span>
              <span className="num">
                {formatDuration(session.focusedSeconds)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
