import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { groupAttention, whenShort } from "@/lib/admin/appointments";
import type { AttentionItem } from "@/lib/api/types/appointments";

type Item = AttentionItem;

// There is no separate dashboard yet, so what needs Daw Mi sits at the top
// of the list. Pending requests have their own section below, so they are
// left out here.
export function AttentionPanel({
  items,
  timezone,
}: {
  items: Item[];
  timezone: string;
}) {
  const groups = groupAttention(
    items.filter((item) => item.kind !== "pending_request"),
  );
  if (groups.length === 0) return null;
  return (
    <section
      aria-labelledby="attention-title"
      className="mb-10 rounded-notice border border-ochre bg-ochre/12 px-6 py-5"
    >
      <h2
        id="attention-title"
        className="flex items-center gap-2 font-body text-[0.95rem] font-semibold"
      >
        <WarningCircle aria-hidden="true" size={20} className="shrink-0" />
        Needs attention
      </h2>
      <ul className="mt-2 flex flex-col">
        {groups.map((group) => (
          <li key={group.appointmentId}>
            <Link
              href={`/admin/appointments/${group.appointmentId}`}
              className="group flex min-h-11 flex-col justify-center py-1.5 text-[0.92rem] text-ink no-underline"
            >
              <span className="font-semibold underline underline-offset-4 transition-colors duration-150 group-hover:text-indigo motion-reduce:transition-none">
                {group.reference}
                {group.startsAt && ` · ${whenShort(group.startsAt, timezone)}`}
              </span>
              {group.reasons.map((reason) => (
                <span key={reason} className="text-[0.88rem] text-muted">
                  {reason}
                </span>
              ))}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
