const hoursFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A countdown as `mm:ss`. Partial seconds round up, so 1 ms left reads `00:01`. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0"); // a clock face taste-skill-ignore
  const ss = String(seconds).padStart(2, "0"); // taste-skill-ignore
  return `${mm}:${ss}`;
}

/** Seconds as hours with one decimal, e.g. `1,234.5`. */
export function formatHours(seconds: number): string {
  return hoursFormat.format(seconds / 3600);
}

/** A span of focused time in whole minutes: `25 m`, `1 h 15 m`, `3 h`. */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.floor(Math.max(0, seconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} m`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} m`;
}

/** Local midnight to the next local midnight around `date`, as ISO strings. */
export function dayRange(date: Date): { from: string; to: string } {
  const from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

/** Time of day in the viewer's locale, e.g. `09:25`. */
export function formatTimeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0"); // taste-skill-ignore
  const day = String(date.getDate()).padStart(2, "0"); // taste-skill-ignore
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `Today`, `Yesterday`, or the local date in ISO form for rows compared by date. */
export function formatDayLabel(iso: string, now: Date): string {
  const key = localDateKey(new Date(iso));
  if (key === localDateKey(now)) return "Today";
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  if (key === localDateKey(yesterday)) return "Yesterday";
  return key;
}

const monthYearFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const shortDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const shortMonthYearFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

/** `February 2054`, or `Feb 2054` where space is tight. */
export function formatMonthYear(
  date: Date,
  length: "long" | "short" = "long",
): string {
  return (length === "long" ? monthYearFormat : shortMonthYearFormat).format(
    date,
  );
}

/** `Oct 19`. */
export function formatShortDate(date: Date): string {
  return shortDateFormat.format(date);
}
