import { DotsThreeOutline } from "@phosphor-icons/react/dist/ssr";
import { NavLink } from "./NavLink";
import { splitTabs, type NavItem } from "./nav";

const tabClass =
  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-[0.75rem] leading-tight font-medium text-ink/72 no-underline transition-colors duration-150 hover:text-ink motion-reduce:transition-none aria-[current=page]:font-semibold aria-[current=page]:text-indigo";

// Below 1024px (brief §7 Shell): icon above label, every tab at least 44px
// tall plus the phone's home-indicator area. With more than five sections
// the fifth tab is "More", a page listing the rest.
export function BottomNav({ items }: { items: NavItem[] }) {
  const { tabs, more } = splitTabs(items);
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/9 bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid auto-cols-fr grid-flow-col">
        {tabs.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <NavLink href={href} className={tabClass}>
              <Icon aria-hidden="true" size={22} />
              {label}
            </NavLink>
          </li>
        ))}
        {more.length > 0 && (
          <li>
            <NavLink
              href="/admin/more"
              also={more.map((item) => item.href)}
              className={tabClass}
            >
              <DotsThreeOutline aria-hidden="true" size={22} />
              More
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
