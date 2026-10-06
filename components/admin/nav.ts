import {
  CalendarBlank,
  ChatCircleText,
  ClockCountdown,
  GearSix,
  Newspaper,
  Palette,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { canUse, type Role } from "@/lib/admin/roles";

export type NavItem = {
  href: string;
  label: string;
  // Soft hyphens let a long label break in a 64px tab on a 320px phone.
  tabLabel?: string;
  icon: Icon;
  // Empty: every signed-in user. `site_admin` sees everything.
  roles: Role[];
};

// The one navigation config (brief §7 Shell). Booking items are for
// booking_admin only, so a content editor never sees appointment data
// (Booking UX §8).
export const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: SquaresFour, roles: [] },
  {
    href: "/admin/appointments",
    label: "Appointments",
    tabLabel: "Appoint\u00ADments",
    icon: CalendarBlank,
    roles: ["booking_admin"],
  },
  {
    href: "/admin/availability",
    label: "Availability",
    tabLabel: "Avail\u00ADability",
    icon: ClockCountdown,
    roles: ["booking_admin"],
  },
  {
    href: "/admin/services",
    label: "Services",
    icon: Palette,
    roles: ["booking_admin"],
  },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: ChatCircleText,
    roles: ["booking_admin"],
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: Newspaper,
    roles: ["content_editor"],
  },
  { href: "/admin/settings", label: "Settings", icon: GearSix, roles: [] },
];

export const navFor = (roles: readonly Role[]) =>
  nav.filter((item) => canUse(roles, item.roles));

export const navItem = (href: string) =>
  nav.find((item) => item.href === href)!;

// The bottom tab bar holds five tabs; with more items the fifth is "More",
// a page listing the rest (brief §7 Shell).
const TABS = 5;

export function splitTabs(items: NavItem[]) {
  return items.length <= TABS
    ? { tabs: items, more: [] }
    : { tabs: items.slice(0, TABS - 1), more: items.slice(TABS - 1) };
}
