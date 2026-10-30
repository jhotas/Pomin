import type { ReactNode } from "react";

type ClockRingProps = {
  clock: string;
  /** How much of the phase has passed, 0 to 1. */
  share: number;
  /** The progress colour, as a CSS value. */
  stroke: string;
  /** The phase and its state, for screen readers. */
  status: string;
  /** The controls, set under the time inside the ring. */
  children: ReactNode;
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The countdown on a white face inside a thick cream ring that fills in ink
 * as the phase runs, with the controls under the time. Only the time is
 * shown; the phase is announced to screen readers.
 */
export function ClockRing({
  clock,
  share,
  stroke,
  status,
  children,
}: ClockRingProps) {
  const filled = Math.min(1, Math.max(0, share)) * CIRCUMFERENCE;
  return (
    <div className="relative aspect-square w-full max-w-[min(30rem,86vw)]">
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full -rotate-90"
        fill="none"
      >
        {/* A white face, so the time reads ink on white in every phase. */}
        <circle cx="100" cy="100" r="80" fill="var(--surface)" />
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
          stroke="var(--cream)"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5%] pt-[6%]">
        <div
          role="timer"
          aria-label="Time left"
          className="font-display text-ring font-semibold num"
        >
          {clock}
        </div>
        {children}
      </div>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}
