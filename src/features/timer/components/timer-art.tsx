import Image from "next/image";
import type { PomoMood } from "@/ui/pomo";
import { useCheer } from "../celebration";
import { PomoIdle } from "./pomo-idle";
import { PomoWork } from "./pomo-work";

type Scene = "idle" | "work" | "rest";

/**
 * Rest is PNG layers (idle and work are vector, in pomo-idle.tsx and
 * pomo-work.tsx). Every layer is cut from the same 960×1160 frame (2× for
 * sharp screens), so they stack exactly with `inset-0`; each one animates on
 * its own (see the `pomo-*` classes in globals.css).
 */
const REST_LAYERS = [
  { src: "/pomo/rest-body.png", className: "pomo-sleep" },
  { src: "/pomo/rest-z-small.png", className: "pomo-z pomo-z-small" },
  { src: "/pomo/rest-z-big.png", className: "pomo-z pomo-z-big" },
];

const SCENE: Record<PomoMood, Scene> = {
  happy: "idle",
  proud: "idle",
  focused: "work",
  resting: "rest",
};

/**
 * Pomo in the scene for the mood: waiting, reading through a focus block, or
 * asleep through a break. A focus block that just ended holds the waiting
 * Pomo for a cheer before the break's scene comes in.
 */
function PomoScene({ mood, sizes }: { mood: PomoMood; sizes: string }) {
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
      {scene === "work" && <PomoWork />}
      {scene === "rest" && (
        <>
          <span className="pomo-shadow" />
          {REST_LAYERS.map((layer) => (
            <Image
              key={layer.src}
              src={layer.src}
              alt=""
              width={960}
              height={1160}
              sizes={sizes}
              quality={90}
              priority
              className={`absolute inset-0 h-full w-full select-none ${layer.className}`}
            />
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Pomo beside the timer, from tablet width up. Decorative; the clock states
 * the phase in words.
 */
export function TimerArt({ mood }: { mood: PomoMood }) {
  return (
    <div
      aria-hidden
      className="relative hidden aspect-[4/3] w-full items-center justify-center md:flex"
    >
      <PomoScene mood={mood} sizes="22rem" />
    </div>
  );
}

/**
 * A small Pomo sitting on the top of the clock ring, on phones, where there
 * is no room beside it. Its feet rest on the ring's outer edge.
 */
export function PomoPerch({ mood }: { mood: PomoMood }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[1.5%] left-1/2 h-[7.25rem] -translate-x-1/2 -translate-y-[92%] md:hidden"
    >
      <PomoScene mood={mood} sizes="6rem" />
    </div>
  );
}
