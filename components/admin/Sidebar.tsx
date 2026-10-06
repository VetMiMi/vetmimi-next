import { NavLink } from "./NavLink";
import type { NavItem } from "./nav";
import { SignOutButton } from "./SignOutButton";
import { Wordmark } from "./Wordmark";

// From 1024px (brief §7 Shell): paper, links in the header's style, the
// current one at full ink with an indigo marker.
export function Sidebar({
  items,
  displayName,
}: {
  items: NavItem[];
  displayName: string;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col bg-paper px-5 py-7 lg:flex">
      <div className="px-3">
        <Wordmark />
      </div>
      <nav aria-label="Admin" className="mt-10">
        <ul className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <NavLink
                href={href}
                className="relative flex min-h-11 items-center gap-3 rounded-control px-3 text-[0.84rem] font-medium text-ink/72 no-underline transition-colors duration-150 before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-pill before:bg-indigo before:opacity-0 hover:text-ink motion-reduce:transition-none aria-[current=page]:bg-canvas aria-[current=page]:text-ink aria-[current=page]:before:opacity-100"
              >
                <Icon aria-hidden="true" size={20} className="shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto border-t border-divider px-3 pt-5">
        <p className="mb-1 truncate text-[0.84rem] font-semibold">
          {displayName}
        </p>
        <SignOutButton />
      </div>
    </aside>
  );
}
