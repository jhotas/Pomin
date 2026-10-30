import Image from "next/image";

/**
 * The illustration beside the timer. Put the picture in `public/` and set its
 * path here, for example "/timer-art.png"; while it is null the column stays
 * empty and keeps the layout.
 */
const TIMER_ART_SRC: string | null = null;

export function TimerArt() {
  return (
    <div className="relative hidden aspect-[4/3] w-full md:block">
      {TIMER_ART_SRC && (
        <Image
          src={TIMER_ART_SRC}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      )}
    </div>
  );
}
