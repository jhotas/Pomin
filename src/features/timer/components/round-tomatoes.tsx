import { useGains } from "@/lib/use-gains";

/**
 * One tomato per focus block in the round before a long break: an ink
 * outline while the block is still ahead, ripe once it is done. The tomato
 * that just ripened pops.
 */
export function RoundTomatoes({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  // Keyed on the count, so each new ripe tomato replays its pop.
  const gains = useGains(done, String(total));
  return (
    <div
      role="img"
      aria-label={`${done} of ${total} pomodoros done`}
      className="flex items-center gap-1.5 md:gap-2"
    >
      {Array.from({ length: total }, (_, index) => {
        const ripe = index < done;
        const justRipe = gains > 0 && index === done - 1;
        return (
          <Tomato
            key={justRipe ? `${index}-${gains}` : index}
            ripe={ripe}
            className={justRipe ? "animate-pop" : undefined}
          />
        );
      })}
    </div>
  );
}

function Tomato({ ripe, className }: { ripe: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`size-6 transition-colors duration-300 md:size-8 ${className ?? ""}`}
      stroke="var(--text)"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <ellipse
        cx="12"
        cy="14.5"
        rx="9"
        ry="7.75"
        fill={ripe ? "var(--primary)" : "var(--surface)"}
      />
      {ripe && (
        <ellipse
          cx="8"
          cy="12"
          rx="2"
          ry="1.25"
          fill="var(--surface)"
          stroke="none"
          opacity="0.7"
          transform="rotate(-30 8 12)"
        />
      )}
      <path
        d="M12 6.75 9 5l.75 3.25L7 9.5h3.5L12 11l1.5-1.5H17l-2.75-1.25L15 5Z"
        fill={ripe ? "var(--leaf)" : "var(--surface)"}
      />
      <path d="M12 6.75V3.5" fill="none" />
    </svg>
  );
}
