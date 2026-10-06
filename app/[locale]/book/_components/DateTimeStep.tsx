import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { CalendarMonth } from "@/components/booking/CalendarMonth";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { addMonths, lastDayOfMonth, localDateKey } from "@/lib/time";
import { todayIn } from "@/lib/zonedTime";
import { Notice, NoticeActions, noticeLink } from "./Notice";
import {
  DAY_IDS,
  usePracticeFormat,
} from "@/components/booking/practiceFormat";
import { useAvailability } from "@/components/booking/useAvailability";
import { stepTitle, textButton } from "./booking";
import type { BookableService, Slot } from "./booking";

// Why the visitor is back on this step: the chosen time was taken (S05) or
// fell out of the booking window, or the service changed.
export type TimeAlert = {
  kind: "timeLost" | "outsideWindow" | "serviceChanged";
  alternatives: Slot[];
};

export function DateTimeStep({
  service,
  timeZone,
  slot,
  alert,
  onSelect,
  onBack,
  onNext,
}: {
  service: BookableService;
  timeZone: string;
  slot: Slot | null;
  alert: TimeAlert | null;
  onSelect: (slot: Slot) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("book");
  const format = usePracticeFormat(timeZone);
  const today = todayIn(timeZone);
  const chosenDay = slot ? localDateKey(slot.startsAt, timeZone) : "";
  const [month, setMonth] = useState((chosenDay || today).slice(0, 7));
  const [day, setDay] = useState(chosenDay);
  const { loading, error, data, retry } = useAvailability(service.slug, month);
  const calendar = useRef<HTMLDivElement>(null);
  const alertBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alert) alertBox.current?.focus();
  }, [alert]);

  const counts = new Map(data?.days.map((d) => [d.date, d.slots.length]));
  const daySlots = data?.days.find((d) => d.date === day)?.slots ?? [];
  const canPrevious = month > today.slice(0, 7);
  const canNext = !!data && data.to >= lastDayOfMonth(month);
  const changeMonth = (step: -1 | 1) => setMonth((m) => addMonths(m, step));
  const choose = (next: Slot) => {
    const key = localDateKey(next.startsAt, timeZone);
    setDay(key);
    setMonth(key.slice(0, 7));
    onSelect(next);
  };
  const slotName = (startsAt: string) =>
    t("calendar.slot", {
      time: format.time(startsAt),
      zone: format.zone(startsAt),
    });

  return (
    <div>
      <h2 style={stepTitle}>{t("step2.title")}</h2>
      <div
        style={{
          display: "inline-block",
          padding: "0.4rem 1rem",
          backgroundColor: `${C.indigo}12`,
          borderRadius: 20,
          fontFamily: "var(--sans)",
          fontSize: "0.85rem",
          color: C.indigo,
          marginBottom: "2rem",
        }}
      >
        {service.name}
      </div>

      {alert && (
        <div ref={alertBox} tabIndex={-1} style={{ outline: "none" }}>
          <Notice
            tone={alert.kind === "serviceChanged" ? "ochre" : "coral"}
            role="alert"
          >
            {t(`step2.${alert.kind}`)}
            {alert.alternatives.length > 0 && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                  {t("step2.alternatives")}
                </div>
                <SlotPicker
                  slots={alert.alternatives}
                  selected={slot?.startsAt}
                  label={t("step2.alternatives")}
                  time={format.dateTime}
                  name={(s) => `${format.dateTime(s)} ${format.zone(s)}`}
                  onSelect={choose}
                />
              </div>
            )}
          </Notice>
        </div>
      )}

      {error && (
        <Notice tone="coral" role="alert">
          {t("step2.loadFailed")}
          <NoticeActions>
            <button type="button" onClick={retry} style={noticeLink}>
              {t("shared.retry")}
            </button>
          </NoticeActions>
        </Notice>
      )}

      {data && data.days.length === 0 && (
        <Notice tone="ochre" role="status">
          {t("step2.noTimes")}
          <NoticeActions>
            {canNext && (
              <button
                type="button"
                onClick={() => changeMonth(1)}
                style={noticeLink}
              >
                {t("step2.nextMonth")}
              </button>
            )}
            <Link href="/contact" style={noticeLink}>
              {t("shared.contact")}
            </Link>
            <Link href="/services" style={noticeLink}>
              {t("shared.services")}
            </Link>
          </NoticeActions>
        </Notice>
      )}

      {loading && (
        <p
          role="status"
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.85rem",
            color: AA.muted,
            margin: "0 0 0.75rem",
          }}
        >
          {t("step2.loading")}
        </p>
      )}

      <div ref={calendar}>
        <CalendarMonth
          month={month}
          counts={counts}
          selected={day}
          today={today}
          busy={loading}
          canPrevious={canPrevious}
          canNext={canNext}
          labels={{
            title: format.month(month),
            weekdaysShort: DAY_IDS.map((d) => t(`calendar.weekdaysShort.${d}`)),
            previousMonth: t("calendar.previousMonth"),
            nextMonth: canNext
              ? t("calendar.nextMonth")
              : t("calendar.outsideWindow", {
                  label: t("calendar.nextMonth"),
                }),
            day: (date, count) =>
              count > 0
                ? t("calendar.dayAvailable", { date: format.date(date), count })
                : t("calendar.dayUnavailable", { date: format.date(date) }),
          }}
          onSelect={setDay}
          onMonthChange={changeMonth}
        />
      </div>

      {day && daySlots.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 600,
              color: C.ink,
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            {t("step2.availableTimes", { date: format.date(day) })}
          </div>
          <SlotPicker
            slots={daySlots}
            selected={slot?.startsAt}
            label={t("step2.availableTimes", { date: format.date(day) })}
            time={format.time}
            name={slotName}
            onSelect={choose}
          />
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.78rem",
              color: AA.muted,
              margin: 0,
            }}
          >
            {t("calendar.timezoneNote")}
          </p>
        </div>
      )}

      {slot && (
        <div
          style={{
            padding: "1.25rem",
            backgroundColor: C.paper,
            borderRadius: 8,
            marginBottom: "2rem",
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
          }}
        >
          <div
            style={{
              color: `${C.ink}88`,
              marginBottom: "0.3rem",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {t("step2.selection")}
          </div>
          <div style={{ color: C.ink, fontWeight: 600 }}>{service.name}</div>
          <div style={{ color: `${C.ink}BB` }}>
            {t("step2.selected", {
              date: format.date(localDateKey(slot.startsAt, timeZone)),
              time: format.time(slot.startsAt),
              zone: format.zone(slot.startsAt),
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              calendar.current
                ?.querySelector<HTMLButtonElement>(
                  '[role="grid"] [tabindex="0"]',
                )
                ?.focus()
            }
            style={{ ...noticeLink, marginTop: "0.5rem", fontWeight: 400 }}
          >
            {t("step2.change")}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button type="button" onClick={onBack} style={textButton}>
          {t("shared.back")}
        </button>
        <Btn onClick={onNext} disabled={!slot}>
          {t("step2.continue")}
        </Btn>
      </div>
    </div>
  );
}
