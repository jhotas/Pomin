const hoursFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A countdown as `mm:ss`. Partial seconds round up, so 1 ms left reads `00:01`. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Seconds as hours with one decimal, e.g. `1,234.5`. */
export function formatHours(seconds: number): string {
  return hoursFormat.format(seconds / 3600);
}
