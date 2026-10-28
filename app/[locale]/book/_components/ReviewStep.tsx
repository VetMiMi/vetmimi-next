import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleNotch } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { FormTrap } from "@/components/ui/FormTrap";
import { Notice, NoticeActions, noticeLink } from "./Notice";
import { usePracticeFormat } from "@/components/booking/practiceFormat";
import { stepIntro, stepTitle, textButton } from "./booking";
import type { BookableService, ServiceList } from "./booking";
import type { Draft } from "./bookingDraft";

// What the last attempt left behind: nothing, a send in progress, or a
// failure that kept every answer (S03, rate limit).
export type SendState =
  | { status: "idle" | "sending" }
  | { status: "failed" }
  | { status: "rateLimited"; retryAfterSeconds?: number };

export function ReviewStep({
  service,
  timeZone,
  bookingMode,
  draft,
  send,
  honeypot,
  onHoneypot,
  onSubmit,
  onBack,
  goToStep,
}: {
  service: BookableService;
  timeZone: string;
  bookingMode: ServiceList["bookingMode"];
  draft: Draft;
  send: SendState;
  honeypot: string;
  onHoneypot: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  goToStep: (step: 1 | 2 | 3) => void;
}) {
  const t = useTranslations("book");
  const format = usePracticeFormat(timeZone);
  const sending = send.status === "sending";
  const instant = bookingMode === "instant" && service.bookingAction === "book";
  const slot = draft.slot;
  const alertBox = useRef<HTMLDivElement>(null);

  // The button sits below the summary, so bring the failure into view.
  useEffect(() => {
    if (send.status === "failed" || send.status === "rateLimited") {
      alertBox.current?.scrollIntoView({ block: "center" });
    }
  }, [send.status]);

  const row = (label: string, value: ReactNode, step: 1 | 2 | 3) => (
    <div className="flex items-start justify-between border-b border-ink/7 py-[0.875rem]">
      <span className="mr-4 min-w-[100px] pt-[0.1rem] text-[0.8rem] tracking-[0.06em] text-ink/40 uppercase">
        {label}
      </span>
      {/* min-w-0 and anywhere-wrapping keep a long email inside the card at
          375 px (#130). */}
      <span className="min-w-0 flex-1 text-[0.95rem] text-ink wrap-anywhere">
        {value}
      </span>
      {/* 44 px tall to tap, pulled into the row's padding so rows keep their
          height. */}
      <button
        type="button"
        className="-my-3 min-h-11 shrink-0 cursor-pointer pl-4 text-[0.82rem] text-rose underline"
        disabled={sending}
        onClick={() => goToStep(step)}
      >
        {t("step4.edit")}
      </button>
    </div>
  );

  return (
    <div>
      <h2 className={stepTitle}>{t("step4.title")}</h2>
      <p className={stepIntro}>{t("step4.intro")}</p>

      <div ref={alertBox}>
        {send.status === "failed" && (
          <Notice tone="coral" role="alert">
            <strong>{t("step4.failed.title")}</strong> {t("step4.failed.text")}
            <NoticeActions>
              <button type="button" onClick={onSubmit} className={noticeLink}>
                {t("shared.retry")}
              </button>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={noticeLink}
              >
                {t("step4.failed.changeTime")}
              </button>
            </NoticeActions>
          </Notice>
        )}
        {send.status === "rateLimited" && (
          <Notice tone="coral" role="alert">
            {send.retryAfterSeconds
              ? t("step4.rateLimitedFor", {
                  minutes: Math.ceil(send.retryAfterSeconds / 60),
                })
              : t("step4.rateLimited")}
          </Notice>
        )}
      </div>

      <div className="mb-6 max-w-[560px] rounded-control border border-ink/9 bg-white px-6 py-1">
        {row(
          t("step4.rows.service"),
          t("step4.serviceValue", {
            name: service.name,
            duration: t("shared.minutes", { count: service.durationMinutes }),
          }),
          1,
        )}
        {service.feeText && row(t("step4.rows.fee"), service.feeText, 1)}
        {slot &&
          row(
            t("step4.rows.dateTime"),
            t("step4.dateTimeValue", {
              dateTime: format.dateTime(slot.startsAt),
              zone: format.zone(slot.startsAt),
            }),
            2,
          )}
        {row(t("step4.rows.name"), draft.name, 3)}
        {row(t("step4.rows.email"), draft.email, 3)}
        {draft.phone && row(t("step4.rows.phone"), draft.phone, 3)}
        {draft.format &&
          row(t("step4.rows.format"), t(`formats.${draft.format}`), 3)}
        {draft.note &&
          row(
            t("step4.rows.note"),
            <span className="text-ink/73 italic">{draft.note}</span>,
            3,
          )}
        {row(
          t("step4.rows.acknowledgements"),
          t.rich("step4.acknowledgements", {
            privacy: (chunks) => (
              <Link href="/privacy" className="text-rose">
                {chunks}
              </Link>
            ),
            policy: (chunks) => (
              <Link href="/booking-policy" className="text-rose">
                {chunks}
              </Link>
            ),
          }),
          3,
        )}
      </div>

      <div className="mb-8 max-w-[560px] rounded-small border border-ochre/27 bg-ochre/9 px-6 py-5">
        <p className="text-[0.875rem] leading-[1.7] text-ink">
          {t.rich(instant ? "step4.noticeInstant" : "step4.notice", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>

      <FormTrap
        label={t("shared.honeypot")}
        value={honeypot}
        onChange={onHoneypot}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={sending}
          className={textButton}
        >
          {t("shared.back")}
        </button>
        <Btn onClick={onSubmit} disabled={sending}>
          {sending ? (
            <span className="inline-flex items-center gap-2">
              <CircleNotch
                size={16}
                className="motion-safe:animate-spin"
                aria-hidden
              />
              {t("step4.submitting")}
            </span>
          ) : instant ? (
            t("step4.submitInstant")
          ) : (
            t("step4.submit")
          )}
        </Btn>
      </div>
      <p role="status" className="sr-only">
        {sending ? t("step4.submitting") : ""}
      </p>
    </div>
  );
}
