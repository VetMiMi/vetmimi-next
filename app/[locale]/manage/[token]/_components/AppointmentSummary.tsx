import { useTranslations } from "next-intl";
import { usePracticeFormat } from "@/components/booking/practiceFormat";
import { StatusBadge } from "@/components/booking/StatusBadge";
import type { ManagedAppointment } from "@/lib/api/manage";
import { localDateKey } from "@/lib/time";

// The white card (brief §5): status, reference and the appointment's facts
// in the practice timezone. ManagedAppointment carries no visitor details,
// so there is no name, email, phone or note to show (Booking UX §7).
export function AppointmentSummary({
  appointment: a,
}: {
  appointment: ManagedAppointment;
}) {
  const t = useTranslations();
  const format = usePracticeFormat(a.timezone);
  const rows = [
    { label: t("manage.card.service"), value: a.service.name },
    {
      label: t("manage.card.date"),
      value: format.date(localDateKey(a.startsAt, a.timezone)),
    },
    {
      label: t("manage.card.time"),
      value: (
        <>
          {t("manage.card.timeValue", {
            start: format.time(a.startsAt),
            end: format.time(a.endsAt),
            zone: format.zone(a.startsAt),
          })}
          <span className="block text-[0.82rem] font-normal text-muted">
            {t("manage.card.zoneNote")}
          </span>
        </>
      ),
    },
    {
      label: t("manage.card.length"),
      value: `${t("book.shared.minutes", { count: a.durationMinutes })} · ${t(`book.formats.${a.format}`)}`,
    },
  ];

  return (
    <section className="rounded-card border border-card-border bg-white px-[clamp(20px,4vw,36px)] py-[clamp(20px,4vw,32px)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <StatusBadge status={a.status} />
        <span className="text-[0.82rem] text-muted">
          {t("manage.card.reference", { reference: a.reference })}
        </span>
      </div>
      <dl className="text-[0.95rem] leading-[1.6]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-divider py-3 last:border-b-0 last:pb-0"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="m-0 font-medium break-words text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
