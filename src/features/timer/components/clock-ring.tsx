type ClockRingProps = {
  clock: string;
  /** How much of the phase has passed, 0 to 1. */
  share: number;
  /** The phase's colour, as a CSS value. */
  stroke: string;
  /** The phase and its state, for screen readers. */
  status: string;
  /** What pressing the ring does, for screen readers, e.g. "Start focus". */
  action: string;
  onToggle: () => void;
  disabled: boolean;
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The countdown inside a thick ring that fills in the phase's colour as the
 * phase runs. The ring is the timer's button: pressing it starts or pauses.
 * Only the time is shown; the phase is announced to screen readers.
 */
export function ClockRing({
  clock,
  share,
  stroke,
  status,
  action,
  onToggle,
  disabled,
}: ClockRingProps) {
  const filled = Math.min(1, Math.max(0, share)) * CIRCUMFERENCE;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={action}
      className="relative aspect-square w-full max-w-[min(30rem,80vw)] rounded-full transition-transform enabled:cursor-pointer enabled:active:scale-[0.99] disabled:cursor-default"
    >
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
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          role="timer"
          aria-label="Time left"
          className="font-display text-ring font-semibold num"
        >
          {clock}
        </span>
      </span>
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </button>
  );
}
