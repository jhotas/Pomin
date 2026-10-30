type ClockRingProps = {
  clock: string;
  /** How much of the phase has passed, 0 to 1. */
  share: number;
  /** The phase's colour, as a CSS value. */
  stroke: string;
  label: string;
  detail: string | null;
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The countdown inside a thick ring. The ring fills in the phase's colour as
 * the phase runs; the time and the phase are the text in its middle.
 */
export function ClockRing({
  clock,
  share,
  stroke,
  label,
  detail,
}: ClockRingProps) {
  const filled = Math.min(1, Math.max(0, share)) * CIRCUMFERENCE;
  return (
    <div className="relative aspect-square w-full max-w-[min(30rem,80vw)]">
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full -rotate-90"
        fill="none"
      >
        {/* An ink outline on both edges of the track. */}
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          stroke="var(--text)"
          strokeWidth="18"
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          stroke="var(--surface)"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          stroke={stroke}
          strokeWidth="14"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <p
          aria-live="polite"
          className="rounded-full border-2 border-text bg-surface px-4 py-1 font-display text-section font-semibold"
        >
          {label}
        </p>
        <div
          role="timer"
          aria-label="Time left"
          className="font-display text-ring font-semibold num"
        >
          {clock}
        </div>
        {detail && (
          <p className="font-display font-medium text-muted num">{detail}</p>
        )}
      </div>
    </div>
  );
}
