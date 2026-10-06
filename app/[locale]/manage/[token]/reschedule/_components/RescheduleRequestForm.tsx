"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/admin/Button";
import { controlClass, FieldError } from "@/components/admin/Field";
import { Notice } from "@/components/admin/Notice";
import { CalendarMonth } from "@/components/booking/CalendarMonth";
import {
  DAY_IDS,
  usePracticeFormat,
} from "@/components/booking/practiceFormat";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { useAvailability } from "@/components/booking/useAvailability";
import type { ManagedAppointment } from "@/lib/api/manage";
import { addMonths, lastDayOfMonth, localDateKey } from "@/lib/time";
import { requestReschedule } from "../../actions";
import { linkClass } from "../../_components/manageClasses";
import { ChosenTimes } from "./ChosenTimes";
import { RequestSent } from "./RequestSent";

const MAX_TIMES = 3;
const MAX_MESSAGE = 500;

type Problem = "notAllowed" | "rateLimited" | "failed";

// Ask Daw Mi to move the appointment (#61): up to three free times from
// public availability, as the API gave them, and an optional message. A
// time or a message is needed. Nothing moves until Daw Mi acts.
export function RescheduleRequestForm({
  token,
  appointment: a,
  today,
}: {
  token: string;
  appointment: ManagedAppointment;
  today: string;
}) {
  const t = useTranslations("manage");
  const book = useTranslations("book");
  const format = usePracticeFormat(a.timezone);
  const router = useRouter();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [day, setDay] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [needOne, setNeedOne] = useState(false);
  const [problem, setProblem] = useState<Problem>();
  const [sent, setSent] = useState<string[]>();
  const [pending, startTransition] = useTransition();
  const { loading, error, data, retry } = useAvailability(
    a.service.slug,
    month,
  );

  const counts = new Map(data?.days.map((d) => [d.date, d.slots.length]));
  const daySlots = data?.days.find((d) => d.date === day)?.slots ?? [];
  const canNext = !!data && data.to >= lastDayOfMonth(month);
  const label = (startsAt: string) =>
    t("reschedule.chip", {
      date: format.date(localDateKey(startsAt, a.timezone)),
      time: format.time(startsAt),
      zone: format.zone(startsAt),
    });
  const toggle = (startsAt: string) => {
    setNeedOne(false);
    setChosen((list) =>
      list.includes(startsAt)
        ? list.filter((s) => s !== startsAt)
        : [...list, startsAt].sort(),
    );
  };

  function submit() {
    if (pending) return;
    if (chosen.length === 0 && !text.trim()) {
      setNeedOne(true);
      return;
    }
    setProblem(undefined);
    startTransition(async () => {
      const outcome = await requestReschedule(token, {
        preferredTimes: chosen,
        message: text,
      });
      if (outcome.ok) setSent(chosen);
      else if (outcome.code === "not_found") router.refresh();
      else if (outcome.code === "invalid_request") setNeedOne(true);
      else if (outcome.code === "action_not_allowed") setProblem("notAllowed");
      else if (outcome.code === "rate_limited") setProblem("rateLimited");
      else setProblem("failed");
    });
  }

  if (sent) {
    return <RequestSent token={token} times={sent.map(label)} />;
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-6"
    >
      <section aria-labelledby="pick-title">
        <h2 id="pick-title" className="mb-2 text-[1.35rem]">
          {t("reschedule.pickTitle")}
        </h2>
        <p className="mb-5 text-[0.92rem] text-muted">
          {t("reschedule.pickHelp")}
        </p>

        {error && (
          <div className="mb-4 flex flex-col items-start gap-2">
            <Notice tone="error">{book("step2.loadFailed")}</Notice>
            <Button variant="quiet" onClick={retry}>
              {book("shared.retry")}
            </Button>
          </div>
        )}
        {data && data.days.length === 0 && (
          <div className="mb-4 flex flex-col items-start gap-2">
            <Notice tone="info">{t("reschedule.noTimes")}</Notice>
            {canNext && (
              <Button
                variant="quiet"
                onClick={() => setMonth((m) => addMonths(m, 1))}
              >
                {book("step2.nextMonth")}
              </Button>
            )}
          </div>
        )}
        {loading && (
          <p role="status" className="mb-3 text-[0.85rem] text-muted">
            {book("step2.loading")}
          </p>
        )}

        <CalendarMonth
          month={month}
          counts={counts}
          selected={day}
          today={today}
          busy={loading}
          canPrevious={month > today.slice(0, 7)}
          canNext={canNext}
          labels={{
            title: format.month(month),
            weekdaysShort: DAY_IDS.map((d) =>
              book(`calendar.weekdaysShort.${d}`),
            ),
            previousMonth: book("calendar.previousMonth"),
            nextMonth: book("calendar.nextMonth"),
            day: (date, count) =>
              count > 0
                ? book("calendar.dayAvailable", {
                    date: format.date(date),
                    count,
                  })
                : book("calendar.dayUnavailable", { date: format.date(date) }),
          }}
          onSelect={setDay}
          onMonthChange={(step) => setMonth((m) => addMonths(m, step))}
        />

        {day && daySlots.length > 0 && (
          <div>
            <p className="mb-3 text-[0.9rem] font-semibold">
              {book("step2.availableTimes", { date: format.date(day) })}
            </p>
            <SlotPicker
              slots={daySlots}
              chosen={chosen}
              max={MAX_TIMES}
              label={book("step2.availableTimes", { date: format.date(day) })}
              time={format.time}
              name={(s) => `${format.time(s)} ${format.zone(s)}`}
              onSelect={(slot) => toggle(slot.startsAt)}
            />
            <p className="text-[0.78rem] text-muted">
              {book("calendar.timezoneNote")}
            </p>
          </div>
        )}
      </section>

      <ChosenTimes
        times={chosen.map((s) => ({ startsAt: s, label: label(s) }))}
        full={chosen.length >= MAX_TIMES}
        onRemove={toggle}
      />

      <div>
        <label
          htmlFor="field-message"
          className="mb-2 block text-[0.88rem] font-medium"
        >
          {t("reschedule.message")}{" "}
          <span className="font-normal text-muted">
            {book("shared.optional")}
          </span>
        </label>
        <p id="field-message-help" className="mb-2 text-[0.88rem] text-muted">
          {t("reschedule.messageHelp")}
        </p>
        <textarea
          id="field-message"
          value={text}
          maxLength={MAX_MESSAGE}
          rows={4}
          aria-invalid={needOne || undefined}
          aria-describedby={
            needOne
              ? "field-message-help field-message-error"
              : "field-message-help"
          }
          onChange={(e) => {
            setText(e.target.value);
            setNeedOne(false);
          }}
          className={`${controlClass} resize-y leading-[1.65]`}
        />
        <FieldError
          id="field-message-error"
          error={needOne ? t("reschedule.needOne") : undefined}
        />
      </div>

      {problem && (
        <div className="flex flex-col items-start gap-2">
          <Notice tone="error">
            {problem === "notAllowed"
              ? t("reschedule.notAllowed")
              : problem === "rateLimited"
                ? t("problems.rateLimited")
                : t("reschedule.failed")}
          </Notice>
          {problem === "notAllowed" && (
            <Link href="/contact" className={linkClass}>
              {t("actions.contact")}
            </Link>
          )}
        </div>
      )}

      <div>
        <Button type="submit" size="page" busy={pending}>
          {pending
            ? t("reschedule.sending")
            : problem === "failed"
              ? book("shared.retry")
              : t("reschedule.send")}
        </Button>
      </div>
    </form>
  );
}
