import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { navFor, splitTabs } from "@/components/admin/nav";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/admin/session";

export const metadata: Metadata = { title: "More" };

// The sections that do not fit in the bottom tab bar. On a wide screen the
// sidebar lists everything, so this page is only reached from the tabs.
export default async function MorePage() {
  const user = await requireUser();
  const { more } = splitTabs(navFor(user.roles));
  if (more.length === 0) notFound();
  return (
    <>
      <PageHeader title="More" />
      <ul className="overflow-hidden rounded-card border border-card-border bg-raised">
        {more.map(({ href, label, icon: Icon }) => (
          <li key={href} className="border-b border-divider last:border-b-0">
            <Link
              href={href}
              className="flex min-h-14 items-center gap-3 px-5 text-[0.95rem] font-medium text-ink no-underline transition-colors duration-150 hover:bg-paper motion-reduce:transition-none"
            >
              <Icon aria-hidden="true" size={22} className="text-indigo" />
              <span className="grow">{label}</span>
              <CaretRight aria-hidden="true" size={18} className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
