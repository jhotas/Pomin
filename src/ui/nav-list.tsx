import Link from "next/link";
import { isActivePath, NAV_ITEMS } from "./nav";

/** The three sections as one pill; the current one is filled tomato. */
export function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main">
      <ul className="flex gap-1 rounded-full border-2 border-text bg-surface p-1 shadow-sticker-sm">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center gap-2 rounded-full px-4 font-display font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-ink"
                    : "text-muted hover:bg-cream hover:text-text"
                }`}
              >
                <Icon
                  aria-hidden
                  size={18}
                  strokeWidth={2}
                  className="max-sm:hidden"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
