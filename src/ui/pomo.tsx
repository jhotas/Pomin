export type PomoMood = "happy" | "focused" | "resting" | "proud";

type PomoProps = {
  mood?: PomoMood;
  size?: number;
  className?: string;
};

const INK = "var(--text)";

/**
 * Pomin, the app's mascot: a tomato with a leaf crown whose face follows the
 * timer. Decorative; the screen states everything Pomin shows in words.
 */
export function Pomo({ mood = "happy", size = 120, className }: PomoProps) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke={INK}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* feet */}
      <path d="M44 104 q-2 9 8 9 q8 0 7 -9" fill="var(--primary)" />
      <path d="M76 104 q2 9 -8 9 q-8 0 -7 -9" fill="var(--primary)" />
      {/* body */}
      <path
        d="M60 26 C30 26 12 44 12 68 C12 92 32 108 60 108 C88 108 108 92 108 68 C108 44 90 26 60 26 Z"
        fill="var(--primary)"
      />
      {/* shine */}
      <path d="M28 56 q4 -12 16 -16" stroke="var(--surface)" strokeWidth={5} />
      {/* leaf crown */}
      <path
        d="M60 32 L48 20 L60 24 L62 10 L68 24 L82 18 L72 30 Z"
        fill="var(--leaf)"
      />
      <path d="M62 24 q2 -10 8 -14" />
      {/* cheeks */}
      <ellipse
        cx="34"
        cy="78"
        rx="7"
        ry="4.5"
        fill="var(--blush)"
        stroke="none"
      />
      <ellipse
        cx="86"
        cy="78"
        rx="7"
        ry="4.5"
        fill="var(--blush)"
        stroke="none"
      />
      <Face mood={mood} />
      {mood === "resting" && (
        <g strokeWidth={3}>
          <path d="M92 20 h10 l-10 12 h10" />
          <path d="M104 6 h7 l-7 8 h7" />
        </g>
      )}
    </svg>
  );
}

function Face({ mood }: { mood: PomoMood }) {
  switch (mood) {
    case "focused":
      return (
        <g>
          <path d="M39 57 h12" />
          <path d="M69 57 h12" />
          <circle cx="45" cy="68" r="4" fill={INK} />
          <circle cx="75" cy="68" r="4" fill={INK} />
          <path d="M54 82 q6 3 12 0" />
        </g>
      );
    case "resting":
      return (
        <g>
          <path d="M38 68 q7 6 14 0" />
          <path d="M68 68 q7 6 14 0" />
          <path d="M55 84 q5 4 10 0" />
        </g>
      );
    case "proud":
      return (
        <g>
          <path d="M38 70 q7 -8 14 0" />
          <path d="M68 70 q7 -8 14 0" />
          <path d="M48 80 q12 14 24 0 Z" fill={INK} />
        </g>
      );
    case "happy":
      return (
        <g>
          <circle cx="45" cy="68" r="4.5" fill={INK} />
          <circle cx="75" cy="68" r="4.5" fill={INK} />
          <path d="M52 80 q8 8 16 0" />
        </g>
      );
  }
}
