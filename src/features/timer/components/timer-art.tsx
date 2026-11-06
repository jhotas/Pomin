import type { PomoMood } from "@/ui/pomo";
import { useCheer } from "../celebration";
import { PomoIdle } from "./pomo-idle";
import { PomoRest } from "./pomo-rest";
import { PomoWork } from "./pomo-work";

type Scene = "idle" | "work" | "rest";

const SCENE: Record<PomoMood, Scene> = {
  happy: "idle",
  proud: "idle",
  focused: "work",
  resting: "rest",
};

type SceneProps = {
  mood: PomoMood;
  /** How much of the current block has passed, 0 to 1. */
  share: number;
};

/**
 * Pomo in the scene for the mood: waiting, reading through a focus block, or
 * asleep through a break, each drawn in vector at one 960×1160 aspect. A
 * focus block that just ended holds the waiting Pomo for a cheer before the
 * break's scene comes in.
 */
function PomoScene({ mood, share }: SceneProps) {
  const cheer = useCheer();
  const scene = cheer ? "idle" : SCENE[mood];
  return (
    // Keyed so a change of phase, or a cheer, plays the entrance again.
    <div
      key={cheer ?? scene}
      data-scene={scene}
      className="pomo-scene relative aspect-[960/1160] h-full max-h-[26rem]"
    >
      {scene === "idle" && <PomoIdle cheer={cheer} />}
      {scene === "work" && <PomoWork share={share} />}
      {scene === "rest" && <PomoRest />}
    </div>
  );
}

/**
 * Pomo beside the timer, from tablet width up. Decorative; the clock states
 * the phase in words.
 */
export function TimerArt({ mood, share }: SceneProps) {
  return (
    <div
      aria-hidden
      className="relative hidden aspect-[4/3] w-full items-center justify-center md:flex"
    >
      <PomoScene mood={mood} share={share} />
    </div>
  );
}

/**
 * A small Pomo sitting on the top of the clock ring, on phones, where there
 * is no room beside it. Its feet rest on the ring's outer edge.
 */
export function PomoPerch({ mood, share }: SceneProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[1.5%] left-1/2 h-[7.25rem] -translate-x-1/2 -translate-y-[92%] md:hidden"
    >
      <PomoScene mood={mood} share={share} />
    </div>
  );
}
