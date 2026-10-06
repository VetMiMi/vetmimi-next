"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The shell's only client part: marking the current section. A section is
// current on its own page and on the pages under it; `also` lists other
// sections that count, for the "More" tab.
export function NavLink({
  href,
  also = [],
  className,
  children,
}: {
  href: string;
  also?: string[];
  className: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const within = (base: string) =>
    base === "/admin"
      ? pathname === base
      : pathname === base || pathname.startsWith(`${base}/`);
  const current = [href, ...also].some(within);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
