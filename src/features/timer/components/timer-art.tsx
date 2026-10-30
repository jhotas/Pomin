import Image from "next/image";
import { Pomo, type PomoMood } from "@/ui/pomo";

/**
 * The illustration beside the timer. Put the picture in `public/` and set its
 * path here, for example "/timer-art.png"; while it is null Pomo breathes in
 * its place.
 */
const TIMER_ART_SRC: string | null = null;

export function TimerArt({ mood }: { mood: PomoMood }) {
  return (
    <div className="relative hidden aspect-[4/3] w-full items-center justify-center md:flex">
      {TIMER_ART_SRC ? (
        <Image
          src={TIMER_ART_SRC}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      ) : (
        <Pomo
          mood={mood}
          size={320}
          className="h-auto w-[min(20rem,70%)] animate-breathe"
        />
      )}
    </div>
  );
}
