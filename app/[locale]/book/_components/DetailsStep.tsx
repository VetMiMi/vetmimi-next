import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { Notice } from "./Notice";
import { FieldError, inputClass, labelClass } from "./fields";
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
  const tc = useTranslations("common");
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
      <h2 className={stepTitle}>{t("step3.title")}</h2>
      <p className={stepIntro}>{t("step3.intro")}</p>

      {showSummary && shown.length > 0 && (
        <div ref={summary} tabIndex={-1} className="outline-none">
          <Notice tone="coral" role="alert">
            <strong>{t("step3.errors.summary")}</strong>
            <ul className="mt-2 list-disc pl-[1.2rem]">
              {shown.map((f) => (
                <li key={f}>
                  <a href={`#book-${f}`} className="text-action">
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

      <div className="max-w-[520px]">
        <div className="mb-4">
          <label htmlFor="book-name" className={labelClass}>
            {t("step3.name.label")} <span className="text-coral">*</span>
          </label>
          <input
            {...field("name")}
            type="text"
            autoComplete="name"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("step3.name.placeholder")}
            className={inputClass}
          />
          {errorFor("name")}
        </div>

        <div className="mb-4">
          <label htmlFor="book-email" className={labelClass}>
            {t("step3.email.label")} <span className="text-coral">*</span>
          </label>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@example.com"
            className={inputClass}
          />
          {errorFor("email")}
        </div>

        <div className="mb-4">
          <label htmlFor="book-phone" className={labelClass}>
            {t("step3.phone.label")}{" "}
            <span className="font-normal text-muted">
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
            className={inputClass}
          />
          {errorFor("phone")}
        </div>

        {service.formats.length > 1 ? (
          <fieldset className="mb-4">
            <legend className={labelClass}>{t("step3.format.label")}</legend>
            {service.formats.map((f) => (
              <label key={f} className="mr-6 inline-flex gap-2">
                <input
                  type="radio"
                  name="format"
                  checked={draft.format === f}
                  onChange={() => onChange({ format: f })}
                  className="accent-indigo"
                />
                {t(`formats.${f}`)}
              </label>
            ))}
          </fieldset>
        ) : (
          <div className="mb-4">
            <span className={labelClass}>{t("step3.format.label")}</span>
            <p>{t("step3.format.onlineOnly")}</p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="book-note" className={labelClass}>
            {t("step3.note.label")}{" "}
            <span className="font-normal text-muted">
              {t("shared.optional")}
            </span>
          </label>
          <p
            id="book-note-help"
            className="mb-2 text-[0.82rem] leading-[1.6] text-muted"
          >
            {t("step3.note.help")}
          </p>
          <textarea
            {...field("note", "book-note-help book-note-count")}
            value={draft.note}
            onChange={(e) => onChange({ note: e.target.value })}
            rows={4}
            placeholder={t("step3.note.placeholder")}
            className={`${inputClass} resize-y`}
          />
          <div
            id="book-note-count"
            className={`text-right text-[0.78rem] ${draft.note.length > NOTE_MAX ? "text-action" : "text-muted"}`}
          >
            {t("step3.note.count", { count: draft.note.length, max: NOTE_MAX })}
          </div>
          {errorFor("note")}
        </div>

        {(["privacyAck", "policyAck"] as const).map((ack) => (
          <div key={ack} className="mb-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                {...field(ack)}
                type="checkbox"
                checked={draft[ack]}
                onChange={(e) => onChange({ [ack]: e.target.checked })}
                className="mt-[0.2rem] shrink-0 accent-indigo"
              />
              <span className="text-[0.875rem] leading-[1.6] text-ink">
                {t.rich(`step3.${ack}`, {
                  link: (chunks) => (
                    // A new tab, so reading the policy never leaves the form.
                    <Link
                      href={
                        ack === "privacyAck" ? "/privacy" : "/booking-policy"
                      }
                      target="_blank"
                      rel="noopener"
                      className="text-rose no-underline"
                    >
                      {chunks}
                      <span className="sr-only"> {tc("newTab")}</span>
                    </Link>
                  ),
                })}{" "}
                <span className="text-coral">*</span>
              </span>
            </label>
            {errorFor(ack)}
          </div>
        ))}

        <div className="mt-4 flex items-center gap-4">
          <button type="button" onClick={onBack} className={textButton}>
            {t("shared.back")}
          </button>
          <Btn onClick={next}>{t("step3.continue")}</Btn>
        </div>
      </div>
    </div>
  );
}
