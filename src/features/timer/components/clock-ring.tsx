import type { ReactNode } from "react";

type ClockRingProps = {
  clock: string;
  /** How much of the phase has passed, 0 to 1. */
  share: number;
  /** The phase's colour, as a CSS value. */
  stroke: string;
  /** The phase and its state, for screen readers. */
  status: string;
  /** Shown above the time inside the ring. */
  above?: ReactNode;
  /** The controls, set under the time inside the ring. */
  children: ReactNode;
  /** Placed against the ring's top edge, for something sitting on it. */
  perch?: ReactNode;
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The countdown inside a thick ring that fills in the phase's colour as the
 * phase runs, with the controls under the time and anything else above it.
 * The phase is announced to screen readers.
 */
export function ClockRing({
  clock,
  share,
  stroke,
  status,
  above,
  children,
  perch,
}: ClockRingProps) {
  const filled = Math.min(1, Math.max(0, share)) * CIRCUMFERENCE;
  return (
    <div className="relative aspect-square w-full max-w-[min(30rem,86vw,calc(100dvh-17rem))]">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5%]">
        {above}
        <div
          role="timer"
          aria-label="Time left"
          className="font-display text-ring font-semibold"
        >
          <FixedDigits text={clock} />
        </div>
        {children}
      </div>
      {perch}
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}

/**
 * Fredoka has no tabular figures (`tabular-nums` changes nothing in it), so
 * each digit gets a box as wide as the widest one; otherwise "11:11" is a
 * third narrower than "00:00" and the centred time jumps on every tick.
 */
function FixedDigits({ text }: { text: string }) {
  return [...text].map((char, index) =>
    /\d/.test(char) ? (
      <span key={index} className="inline-block w-[0.58em] text-center">
        {char}
      </span>
    ) : (
      char
    ),
  );
}
