import Image from "next/image";
import type { PomoMood } from "@/ui/pomo";
import { PomoIdle } from "./pomo-idle";

type Scene = "idle" | "work" | "rest";
type RasterScene = Exclude<Scene, "idle">;

/**
 * Work and rest are PNG layers (idle is vector, in pomo-idle.tsx). Every
 * layer is cut from the same 960×1160 frame (2× for sharp screens), so
 * they stack exactly with `inset-0`; each one animates on its own (see the
 * `pomo-*` classes in globals.css).
 */
const LAYERS: Record<RasterScene, { src: string; className: string }[]> = {
  work: [
    { src: "/pomo/work-body.png", className: "pomo-read" },
    { src: "/pomo/work-clock.png", className: "pomo-tick" },
    { src: "/pomo/work-sparks.png", className: "pomo-flash" },
  ],
  rest: [
    { src: "/pomo/rest-body.png", className: "pomo-sleep" },
    { src: "/pomo/rest-z-small.png", className: "pomo-z pomo-z-small" },
    { src: "/pomo/rest-z-big.png", className: "pomo-z pomo-z-big" },
  ],
};

const SCENE: Record<PomoMood, Scene> = {
  happy: "idle",
  proud: "idle",
  focused: "work",
  resting: "rest",
};

/**
 * Pomo beside the timer: waiting, reading through a focus block, or asleep
 * through a break. Decorative; the clock states the phase in words.
 */
export function TimerArt({ mood }: { mood: PomoMood }) {
  const scene = SCENE[mood];
  return (
    <div
      aria-hidden
      className="relative hidden aspect-[4/3] w-full items-center justify-center md:flex"
    >
      {/* Keyed so a change of phase plays the entrance again. */}
      <div
        key={scene}
        data-scene={scene}
        className="pomo-scene relative aspect-[960/1160] h-full max-h-[26rem]"
      >
        {scene === "idle" ? (
          <PomoIdle />
        ) : (
          <>
            <span className="pomo-shadow" />
            {LAYERS[scene].map((layer) => (
              <Image
                key={layer.src}
                src={layer.src}
                alt=""
                width={960}
                height={1160}
                sizes="22rem"
                quality={90}
                priority
                className={`absolute inset-0 h-full w-full select-none ${layer.className}`}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
