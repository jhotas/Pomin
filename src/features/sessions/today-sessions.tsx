import type { Session } from "@/data/schemas";
import { formatDuration, formatTimeOfDay } from "@/lib/time";

/** Today's sessions of one skill, oldest first, as a row of tomato chips. */
export function TodaySessions({ sessions }: { sessions: readonly Session[] }) {
  return (
    <section aria-labelledby="today-title">
      <h2 id="today-title" className="text-section font-semibold">
        Today
      </h2>
      {sessions.length === 0 ? (
        <p className="mt-2 text-muted">
          No sessions yet today. The first one is the hardest.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className={`flex items-center gap-2 rounded-full border-2 border-text py-1 pr-3.5 pl-1.5 num ${
                session.outcome === "completed" ? "bg-tint" : "bg-surface"
              }`}
            >
              <span
                aria-hidden
                className={`size-4 rounded-full border-2 border-text ${
                  session.outcome === "completed" ? "bg-primary" : "bg-surface"
                }`}
              />
              <span>
                {formatTimeOfDay(session.startedAt)} ·{" "}
                <span className="font-semibold">
                  {formatDuration(session.focusedSeconds)}
                </span>
                {session.outcome === "interrupted" && (
                  <span className="text-muted"> · stopped early</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
