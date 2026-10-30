import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { StorageScope } from "./storage-scope";

/**
 * A top bar with the logo, the pill navigation in the middle and where the
 * data lives, above a centred canvas. Below 768px the pill takes its own row.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-full focus:bg-sun focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 pt-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <Link href="/" className="justify-self-start">
          <Logo />
        </Link>
        <div className="col-span-2 justify-self-center md:col-span-1 md:col-start-2 md:row-start-1">
          <MainNav />
        </div>
        <div className="hidden justify-self-end md:block">
          <StorageScope />
        </div>
      </header>
      <main
        id="main"
        className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 md:px-8 md:pt-8"
      >
        {children}
      </main>
    </div>
  );
}
