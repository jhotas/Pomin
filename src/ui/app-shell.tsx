import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { SidebarNav } from "./sidebar-nav";
import { StorageScope } from "./storage-scope";

/**
 * Open-plane shell: a 240px labelled sidebar on the page ground and a fluid
 * canvas with a 24px gutter. Below 768px the sidebar folds into a 48px top
 * bar with a full-screen menu sheet.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-control focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <MobileNav />
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col px-3 py-6 md:flex">
        <Link href="/" className="mb-8 px-2.5">
          <Logo />
        </Link>
        <SidebarNav />
        <div className="mt-auto">
          <StorageScope />
        </div>
      </aside>
      <main
        id="main"
        className="min-w-0 flex-1 px-4 py-6 md:py-9 md:pr-6 md:pl-0"
      >
        {children}
      </main>
    </div>
  );
}
