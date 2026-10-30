import Link from "next/link";
import { isActivePath, NAV_ITEMS } from "./nav";

type NavListProps = {
  pathname: string;
  onNavigate?: () => void;
};

export function NavList({ pathname, onNavigate }: NavListProps) {
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-2.5 rounded-full border-2 px-3.5 font-display font-medium transition-colors md:h-10 ${
                  active
                    ? "border-text bg-primary text-primary-ink shadow-sticker-sm"
                    : "border-transparent text-muted hover:bg-active hover:text-text"
                }`}
              >
                <Icon aria-hidden size={18} strokeWidth={2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
