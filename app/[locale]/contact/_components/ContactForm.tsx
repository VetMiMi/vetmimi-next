"use client";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WarningCircle } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { FormTrap } from "@/components/ui/FormTrap";
import type { Locale } from "@/i18n/routing";
import { sendEnquiry } from "../actions";
import { SendFailure, SentNotice, type SendState } from "./ContactStatus";
import {
  ENQUIRY_TYPES,
  FIELDS,
  MESSAGE_MAX,
  check,
  type EnquiryId,
  type Field,
  type Form,
} from "./enquiry";

export function ContactForm({
  formToken,
  service,
}: {
  formToken: string;
  service: { slug: string; name: string; type: EnquiryId } | null;
}) {
  const t = useTranslations("contact");
  const locale = useLocale() as Locale;
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    organisation: "",
    enquiryType: service?.type ?? "",
    subject: "",
    message: "",
    privacy: false,
  });
  const [touched, setTouched] = useState<Set<Field>>(new Set());
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const summary = useRef<HTMLDivElement>(null);
  const errors = check(form);
  const shown = FIELDS.filter((f) => touched.has(f) && errors[f]);

  const update = (name: keyof Form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [name]: value }));
  const touch = (field: Field) => setTouched((all) => new Set(all).add(field));
  const field = (name: Field) => ({
    id: name,
    name,
    "aria-invalid": touched.has(name) && errors[name] ? true : undefined,
    "aria-describedby":
      touched.has(name) && errors[name] ? `${name}-error` : undefined,
    onBlur: () => touch(name),
  });
  const errorFor = (name: Field) =>
    touched.has(name) && errors[name] ? (
      <p id={`${name}-error`} className="contact-field-error">
        <WarningCircle size={16} weight="bold" aria-hidden />
        {t(`form.errors.${errors[name]}`)}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (send.status === "sending") return;
    if (Object.keys(errors).length > 0) {
      setTouched(new Set(FIELDS));
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setSend({ status: "sending" });
    const outcome = await sendEnquiry({
      enquiry: {
        name: form.name.trim(),
        email: form.email.trim(),
        organisation: form.organisation.trim() || undefined,
        enquiryType: ENQUIRY_TYPES[form.enquiryType as EnquiryId],
        service: service?.slug,
        subject: form.subject.trim(),
        message: form.message.trim(),
        locale,
        privacyAcknowledged: true,
      },
      idempotencyKey: key,
      formToken,
      honeypot,
    }).catch(() => null);
    if (outcome?.ok)
      return setSend({ status: "sent", reference: outcome.reference });
    if (outcome?.code === "rate_limited")
      return setSend({ status: "rateLimited" });
    setSend({ status: "failed" });
  };

  if (send.status === "sent") return <SentNotice reference={send.reference} />;

  return (
    <>
      <h2>{t("form.title")}</h2>

      <SendFailure send={send} onRetry={handleSubmit} />

      {shown.length > 0 && (
        <div
          ref={summary}
          tabIndex={-1}
          className="contact-status contact-status--error"
          role="alert"
          style={{ marginBottom: 24 }}
        >
          <p>
            <strong>{t("form.errors.summary")}</strong>
          </p>
          <ul>
            {shown.map((f) => (
              <li key={f}>
                <a href={`#${f === "enquiryType" ? "enquiryType-first" : f}`}>
                  {t(`form.errors.${errors[f]!}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form" noValidate>
        {service && (
          <p className="contact-about">
            {t("form.about", { service: service.name })}
          </p>
        )}
        <div className="contact-row">
          <div>
            <label htmlFor="name" className="contact-label">
              {t("form.name.label")} <span className="req">*</span>
            </label>
            <input
              {...field("name")}
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="contact-input"
              placeholder={t("form.name.placeholder")}
            />
            {errorFor("name")}
          </div>
          <div>
            <label htmlFor="email" className="contact-label">
              {t("form.email.label")} <span className="req">*</span>
            </label>
            <input
              {...field("email")}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="contact-input"
              placeholder="your@email.com"
            />
            {errorFor("email")}
          </div>
        </div>

        <div>
          <label htmlFor="organisation" className="contact-label">
            {t("form.organisation.label")}{" "}
            <span className="opt">{t("form.optional")}</span>
          </label>
          <input
            id="organisation"
            name="organisation"
            type="text"
            autoComplete="organization"
            value={form.organisation}
            onChange={(e) => update("organisation", e.target.value)}
            className="contact-input"
            placeholder={t("form.organisation.placeholder")}
          />
        </div>

        <fieldset
          className="contact-pills"
          aria-invalid={touched.has("enquiryType") && !!errors.enquiryType}
          aria-describedby={
            touched.has("enquiryType") && errors.enquiryType
              ? "enquiryType-error"
              : undefined
          }
        >
          <legend className="contact-label">
            {t("form.enquiryType.label")} <span className="req">*</span>
          </legend>
          <div className="contact-pill-list">
            {(Object.keys(ENQUIRY_TYPES) as EnquiryId[]).map((type, i) => (
              <label key={type} className="contact-pill">
                <input
                  id={i === 0 ? "enquiryType-first" : undefined}
                  type="radio"
                  name="enquiryType"
                  value={type}
                  checked={form.enquiryType === type}
                  onChange={() => update("enquiryType", type)}
                  onBlur={() => touch("enquiryType")}
                />
                <span>{t(`form.enquiryType.options.${type}`)}</span>
              </label>
            ))}
          </div>
          {errorFor("enquiryType")}
        </fieldset>

        <div>
          <label htmlFor="subject" className="contact-label">
            {t("form.subject.label")} <span className="req">*</span>
          </label>
          <input
            {...field("subject")}
            type="text"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="contact-input"
            placeholder={t("form.subject.placeholder")}
          />
          {errorFor("subject")}
        </div>

        <div>
          <label htmlFor="message" className="contact-label">
            {t("form.message.label")} <span className="req">*</span>
          </label>
          <textarea
            {...field("message")}
            rows={7}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="contact-input"
            placeholder={t("form.message.placeholder")}
          />
          <p className="contact-count" aria-live="polite">
            {t("form.message.count", {
              count: form.message.length,
              max: MESSAGE_MAX,
            })}
          </p>
          {errorFor("message")}
        </div>

        <div>
          <label htmlFor="privacy" className="contact-privacy">
            <input
              {...field("privacy")}
              type="checkbox"
              checked={form.privacy}
              onChange={(e) => update("privacy", e.target.checked)}
            />
            <span>
              {t.rich("form.privacy", {
                link: (chunks) => <Link href="/privacy">{chunks}</Link>,
              })}
              <span className="req"> *</span>
            </span>
          </label>
          {errorFor("privacy")}
        </div>

        <p className="contact-note">{t("form.note")}</p>

        <FormTrap
          label={t("form.honeypot")}
          value={honeypot}
          onChange={setHoneypot}
        />

        <div>
          <Btn
            type="submit"
            disabled={send.status === "sending"}
            style={{ minWidth: 180 }}
          >
            {send.status === "sending" ? t("form.sending") : t("form.submit")}
          </Btn>
          <span role="status" className="sr-only">
            {send.status === "sending" ? t("form.sending") : ""}
          </span>
        </div>
      </form>
    </>
  );
}
