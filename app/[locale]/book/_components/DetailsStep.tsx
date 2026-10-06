import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { Notice } from "./Notice";
import { FieldError, inputStyle, labelStyle } from "./fields";
import {
  NOTE_MAX,
  checkDetails,
  type DetailsErrors,
  type DetailsField,
  type Draft,
} from "./bookingDraft";
import { stepIntro, stepTitle, textButton } from "./booking";
import type { BookableService } from "./booking";

const FIELD_ORDER: DetailsField[] = [
  "name",
  "email",
  "phone",
  "note",
  "privacyAck",
  "policyAck",
];

export function DetailsStep({
  service,
  draft,
  serverErrors,
  onChange,
  onBack,
  onNext,
}: {
  service: BookableService;
  draft: Draft;
  // Field errors the API sent back, as message keys.
  serverErrors: DetailsErrors;
  onChange: (patch: Partial<Draft>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("book");
  const [touched, setTouched] = useState<Set<DetailsField>>(
    () => new Set(Object.keys(serverErrors) as DetailsField[]),
  );
  const [showSummary, setShowSummary] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const errors = { ...serverErrors, ...checkDetails(draft) };
  const shown = FIELD_ORDER.filter((f) => touched.has(f) && errors[f]);

  useEffect(() => {
    if (showSummary) summary.current?.focus();
  }, [showSummary]);

  const touch = (field: DetailsField) =>
    setTouched((all) => new Set(all).add(field));
  const next = () => {
    if (FIELD_ORDER.some((f) => errors[f])) {
      setTouched(new Set(FIELD_ORDER));
      setShowSummary(true);
      return;
    }
    onNext();
  };

  // Label, help and error wired together for screen readers.
  const field = (name: DetailsField, help?: string) => {
    const error = touched.has(name) ? errors[name] : undefined;
    return {
      id: `book-${name}`,
      "aria-invalid": error ? true : undefined,
      "aria-describedby":
        [help, error && `book-${name}-error`].filter(Boolean).join(" ") ||
        undefined,
      onBlur: () => touch(name),
    };
  };
  const errorFor = (name: DetailsField) =>
    touched.has(name) && errors[name] ? (
      <FieldError id={`book-${name}-error`}>
        {t(`step3.errors.${errors[name]}`)}
      </FieldError>
    ) : null;

  return (
    <div>
      <h2 style={stepTitle}>{t("step3.title")}</h2>
      <p style={stepIntro}>{t("step3.intro")}</p>

      {showSummary && shown.length > 0 && (
        <div ref={summary} tabIndex={-1} style={{ outline: "none" }}>
          <Notice tone="coral" role="alert">
            <strong>{t("step3.errors.summary")}</strong>
            <ul
              style={{
                listStyle: "disc",
                margin: "0.5rem 0 0",
                paddingLeft: "1.2rem",
              }}
            >
              {shown.map((f) => (
                <li key={f}>
                  <a href={`#book-${f}`} style={{ color: AA.action }}>
                    {f === "privacyAck" || f === "policyAck"
                      ? t(`step3.errors.${f}`)
                      : t(`step3.errors.${errors[f]!}`)}
                  </a>
                </li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      <div style={{ maxWidth: 520 }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="book-name" style={labelStyle}>
            {t("step3.name.label")} <span style={{ color: C.coral }}>*</span>
          </label>
          <input
            {...field("name")}
            type="text"
            autoComplete="name"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("step3.name.placeholder")}
            style={inputStyle}
          />
          {errorFor("name")}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="book-email" style={labelStyle}>
            {t("step3.email.label")} <span style={{ color: C.coral }}>*</span>
          </label>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@example.com"
            style={inputStyle}
          />
          {errorFor("email")}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="book-phone" style={labelStyle}>
            {t("step3.phone.label")}{" "}
            <span style={{ color: AA.muted, fontWeight: 400 }}>
              {t("shared.optional")}
            </span>
          </label>
          <input
            {...field("phone")}
            type="tel"
            autoComplete="tel"
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+61 4xx xxx xxx"
            style={inputStyle}
          />
          {errorFor("phone")}
        </div>

        {service.formats.length > 1 ? (
          <fieldset style={{ border: 0, padding: 0, margin: "0 0 1rem" }}>
            <legend style={labelStyle}>{t("step3.format.label")}</legend>
            {service.formats.map((f) => (
              <label
                key={f}
                style={{
                  display: "inline-flex",
                  gap: "0.5rem",
                  marginRight: "1.5rem",
                  fontFamily: "var(--sans)",
                }}
              >
                <input
                  type="radio"
                  name="format"
                  checked={draft.format === f}
                  onChange={() => onChange({ format: f })}
                  style={{ accentColor: C.indigo }}
                />
                {t(`formats.${f}`)}
              </label>
            ))}
          </fieldset>
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            <span style={labelStyle}>{t("step3.format.label")}</span>
            <p style={{ margin: 0 }}>{t("step3.format.onlineOnly")}</p>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="book-note" style={labelStyle}>
            {t("step3.note.label")}{" "}
            <span style={{ color: AA.muted, fontWeight: 400 }}>
              {t("shared.optional")}
            </span>
          </label>
          <p
            id="book-note-help"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.82rem",
              color: AA.muted,
              marginTop: 0,
              marginBottom: "0.5rem",
              lineHeight: 1.6,
            }}
          >
            {t("step3.note.help")}
          </p>
          <textarea
            {...field("note", "book-note-help book-note-count")}
            value={draft.note}
            onChange={(e) => onChange({ note: e.target.value })}
            rows={4}
            placeholder={t("step3.note.placeholder")}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <div
            id="book-note-count"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.78rem",
              color: draft.note.length > NOTE_MAX ? AA.action : AA.muted,
              textAlign: "right",
            }}
          >
            {t("step3.note.count", { count: draft.note.length, max: NOTE_MAX })}
          </div>
          {errorFor("note")}
        </div>

        {(["privacyAck", "policyAck"] as const).map((ack) => (
          <div key={ack} style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                cursor: "pointer",
              }}
            >
              <input
                {...field(ack)}
                type="checkbox"
                checked={draft[ack]}
                onChange={(e) => onChange({ [ack]: e.target.checked })}
                style={{
                  marginTop: "0.2rem",
                  accentColor: C.indigo,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.875rem",
                  color: C.ink,
                  lineHeight: 1.6,
                }}
              >
                {t.rich(`step3.${ack}`, {
                  link: (chunks) => (
                    <Link
                      href={
                        ack === "privacyAck" ? "/privacy" : "/booking-policy"
                      }
                      style={{ color: C.rose, textDecoration: "none" }}
                    >
                      {chunks}
                    </Link>
                  ),
                })}{" "}
                <span style={{ color: C.coral }}>*</span>
              </span>
            </label>
            {errorFor(ack)}
          </div>
        ))}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <button type="button" onClick={onBack} style={textButton}>
            {t("shared.back")}
          </button>
          <Btn onClick={next}>{t("step3.continue")}</Btn>
        </div>
      </div>
    </div>
  );
}
