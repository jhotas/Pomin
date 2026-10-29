import { Layers, Settings, Timer, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: "/" | "/skills" | "/settings";
  label: "Timer" | "Skills" | "Settings";
  icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Timer", icon: Timer },
  { href: "/skills", label: "Skills", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** The root matches only itself; any other section also owns its subpaths. */
export function isActivePath(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
