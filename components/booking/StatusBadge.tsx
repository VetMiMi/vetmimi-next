import { useTranslations } from "next-intl";
import { statuses } from "@/components/admin/status";
import type { components } from "@/lib/api/schema";

type Status = components["schemas"]["AppointmentStatus"];

// The public appointment badge: the admin's tint and icon for each status
// (brief §3, components/admin/status.ts), with the label in the visitor's
// language. Icon, text and tint together, never colour alone.
export function StatusBadge({ status }: { status: Status }) {
  const t = useTranslations("manage.status");
  const { tint, text, icon: Icon } = statuses.appointment[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-[11px] py-1 text-[0.78rem] leading-tight font-semibold ${tint} ${text}`}
    >
      <Icon aria-hidden="true" size={16} className="shrink-0" />
      {t(status)}
    </span>
  );
}
