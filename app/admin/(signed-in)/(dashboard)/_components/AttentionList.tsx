import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { whenShort } from "@/lib/admin/appointments";
import { attentionLine } from "@/lib/admin/dashboard";
import type {
  AttentionItem,
  BookingDashboard,
} from "@/lib/api/types/appointments";

// Two failed emails for one booking read the same, so they share a line.
export function AttentionList({
  dashboard,
  today,
}: {
  dashboard: BookingDashboard;
  today: string;
}) {
  const { timezone } = dashboard;
  const holds = new Map(dashboard.pending.map((a) => [a.id, a.holdExpiresAt]));
  const lines = new Map<string, AttentionItem & { text: string }>();
  for (const item of dashboard.attentionRequired) {
    const text = attentionLine(item, {
      timeZone: timezone,
      today,
      holdExpiresAt: holds.get(item.appointmentId),
    });
    lines.set(`${item.appointmentId} ${text}`, { ...item, text });
  }

  if (lines.size === 0) {
    return (
      <EmptyState
        title="Nothing needs your attention."
        shape="petal"
        headingLevel={3}
      />
    );
  }
  return (
    <ul className="rounded-card border border-card-border bg-raised px-5">
      {[...lines].map(([key, line]) => (
        <li key={key} className="border-b border-divider last:border-b-0">
          <Link
            href={`/admin/appointments/${line.appointmentId}`}
            className="group flex min-h-12 flex-col justify-center gap-x-6 gap-y-0.5 py-3 text-[0.95rem] text-ink no-underline sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-semibold underline decoration-1 underline-offset-4 transition-colors duration-150 group-hover:text-indigo motion-reduce:transition-none">
              {line.text}
            </span>
            {line.startsAt && (
              <span className="shrink-0 text-[0.88rem] text-muted">
                {whenShort(line.startsAt, timezone)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
