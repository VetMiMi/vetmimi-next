import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleNotch } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { FormTrap } from "@/components/ui/FormTrap";
import { Notice, NoticeActions, noticeLink } from "./Notice";
import { stepIntro, stepTitle, textButton, usePracticeFormat } from "./booking";
import type { BookableService, ServiceList } from "./booking";
import type { Draft } from "./bookingDraft";

// What the last attempt left behind: nothing, a send in progress, or a
// failure that kept every answer (S03, rate limit).
export type SendState =
  | { status: "idle" | "sending" }
  | { status: "failed" }
  | { status: "rateLimited"; retryAfterSeconds?: number };

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "0.875rem 0",
  borderBottom: `1px solid ${C.ink}11`,
};

const labelCol: CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.8rem",
  color: `${C.ink}66`,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  minWidth: 100,
  marginRight: "1rem",
  paddingTop: "0.1rem",
};

// minWidth 0 and anywhere-wrapping keep a long email inside the card at
// 375 px (#130).
const valueCol: CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.95rem",
  color: C.ink,
  flex: 1,
  minWidth: 0,
  overflowWrap: "anywhere",
};

// 44 px tall to tap, pulled into the row's padding so rows keep their height.
const editBtn: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  fontSize: "0.82rem",
  color: C.rose,
  padding: "0 0 0 1rem",
  textDecoration: "underline",
  flexShrink: 0,
  minHeight: 44,
  margin: "-0.75rem 0",
};

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
    <div style={rowStyle}>
      <span style={labelCol}>{label}</span>
      <span style={valueCol}>{value}</span>
      <button
        type="button"
        style={editBtn}
        disabled={sending}
        onClick={() => goToStep(step)}
      >
        {t("step4.edit")}
      </button>
    </div>
  );

  return (
    <div>
      <h2 style={stepTitle}>{t("step4.title")}</h2>
      <p style={stepIntro}>{t("step4.intro")}</p>

      <div ref={alertBox}>
        {send.status === "failed" && (
          <Notice tone="coral" role="alert">
            <strong>{t("step4.failed.title")}</strong> {t("step4.failed.text")}
            <NoticeActions>
              <button type="button" onClick={onSubmit} style={noticeLink}>
                {t("shared.retry")}
              </button>
              <button
                type="button"
                onClick={() => goToStep(2)}
                style={noticeLink}
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

      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${C.ink}18`,
          borderRadius: 10,
          padding: "0.25rem 1.5rem",
          marginBottom: "1.5rem",
          maxWidth: 560,
        }}
      >
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
            <span style={{ fontStyle: "italic", color: `${C.ink}BB` }}>
              {draft.note}
            </span>,
            3,
          )}
        {row(
          t("step4.rows.acknowledgements"),
          t.rich("step4.acknowledgements", {
            privacy: (chunks) => (
              <Link href="/privacy" style={{ color: C.rose }}>
                {chunks}
              </Link>
            ),
            policy: (chunks) => (
              <Link href="/booking-policy" style={{ color: C.rose }}>
                {chunks}
              </Link>
            ),
          }),
          3,
        )}
      </div>

      <div
        style={{
          padding: "1.25rem 1.5rem",
          backgroundColor: `${C.ochre}18`,
          border: `1px solid ${C.ochre}44`,
          borderRadius: 8,
          marginBottom: "2rem",
          maxWidth: 560,
        }}
      >
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: C.ink,
            margin: 0,
            lineHeight: 1.7,
          }}
        >
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

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={onBack}
          disabled={sending}
          style={textButton}
        >
          {t("shared.back")}
        </button>
        <Btn onClick={onSubmit} disabled={sending}>
          {sending ? (
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
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
