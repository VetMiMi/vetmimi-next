import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { whenShort } from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";

type Item = components["schemas"]["AttentionItem"];

const reasons: Record<Item["kind"], string> = {
  pending_request: "New request to answer",
  hold_expiring: "Request hold expires soon",
  failed_communication: "A visitor email failed",
  reschedule_requested: "Visitor asked to reschedule",
  meeting_link_missing: "Meeting link missing",
  completion_due: "Mark as completed or no-show",
  block_conflict: "Falls inside blocked time",
};

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
  const shown = items.filter((item) => item.kind !== "pending_request");
  if (shown.length === 0) return null;
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
        {shown.map((item) => (
          <li key={`${item.kind}-${item.appointmentId}`}>
            <Link
              href={`/admin/appointments/${item.appointmentId}`}
              className="inline-flex min-h-11 flex-wrap items-center gap-x-2 py-1 text-[0.92rem] text-ink underline underline-offset-4 transition-colors duration-150 hover:text-indigo motion-reduce:transition-none"
            >
              <span className="font-semibold">{reasons[item.kind]}</span>
              <span>
                · {item.reference}
                {item.startsAt && ` · ${whenShort(item.startsAt, timezone)}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
