import type { ReactNode } from "react";
import { ClickSounds } from "@/features/sound/click-sounds";
import { PhaseBackdrop } from "@/features/timer/components/phase-backdrop";
import { TimerHeartbeat } from "@/features/timer/components/timer-heartbeat";
import { HeaderExtras } from "./header-extras";
import { MainNav } from "./main-nav";

/**
 * The timer's phase colour behind every page, and a top bar with the pill
 * navigation in the middle, the logo on its left and
 * where the data lives on its right (both left out on the home page), above a
 * centred canvas. Below 768px the pill takes its own row. With a mouse the
 * pill hides above the top edge until the pointer nears it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    // While <html> carries data-fullpage (the timer is shown), the page fills
    // the window exactly and never scrolls.
    <div className="flex min-h-dvh flex-col in-data-fullpage:h-dvh in-data-fullpage:overflow-hidden">
      <PhaseBackdrop />
      <ClickSounds />
      <TimerHeartbeat />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-full focus:bg-sun focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 pt-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <div className="justify-self-start empty:hidden">
          <HeaderExtras side="start" />
        </div>
        {/*
          With a mouse, the pill tucks up behind the top edge, its rim still
          showing, and drops back when the pointer nears it or a link takes
          keyboard focus. A click's focus does not hold it down. The padding stretches the hover zone up to the edge and
          around the pill. Touch screens keep it in place.
        */}
        <div className="group col-span-2 justify-self-center md:col-span-1 md:col-start-2 md:row-start-1 [@media(hover:hover)]:-mx-10 [@media(hover:hover)]:-mt-5 [@media(hover:hover)]:-mb-4 [@media(hover:hover)]:px-10 [@media(hover:hover)]:pt-5 [@media(hover:hover)]:pb-4">
          <div className="transition-transform delay-300 duration-300 ease-out group-hover:translate-y-0 group-hover:delay-0 group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:delay-0 motion-reduce:transition-none [@media(hover:hover)]:-translate-y-[calc(100%+0.75rem)]">
            <MainNav />
          </div>
        </div>
        <div className="hidden justify-self-end md:block">
          <HeaderExtras side="end" />
        </div>
      </header>
      <main
        id="main"
        className="mx-auto min-h-0 w-full max-w-7xl flex-1 px-4 pt-6 pb-12 md:px-8 md:pt-8"
      >
        {children}
      </main>
    </div>
  );
}
