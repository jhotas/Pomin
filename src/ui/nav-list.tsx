import Link from "next/link";
import { isActivePath, NAV_ITEMS } from "./nav";

type NavListProps = {
  pathname: string;
  onNavigate?: () => void;
};

export function NavList({ pathname, onNavigate }: NavListProps) {
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-2.5 rounded-control px-2.5 transition-colors md:h-8 ${
                  active
                    ? "bg-active text-text"
                    : "text-muted hover:bg-raised hover:text-text"
                }`}
              >
                <Icon aria-hidden size={16} strokeWidth={1.5} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
