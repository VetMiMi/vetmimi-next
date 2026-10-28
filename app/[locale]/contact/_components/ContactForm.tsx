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

// The rose border and halo show focus, so the global coral ring is turned off.
const input =
  "w-full rounded-(--radius-control) border border-ink/16 bg-white px-4 py-[13px] font-body text-[1rem] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-caption hover:border-ink/28 focus:border-rose focus:shadow-focus-input";
const label = "mb-2 block text-[0.88rem] font-medium";
const row = "grid grid-cols-2 gap-[18px] max-[640px]:grid-cols-1";

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
      <p
        id={`${name}-error`}
        className="mt-2 flex items-center gap-1.5 text-[0.82rem] text-action"
      >
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
      <h2 className="mb-7 text-[clamp(1.6rem,2.4vw,2rem)]">
        {t("form.title")}
      </h2>

      <SendFailure send={send} onRetry={handleSubmit} />

      {shown.length > 0 && (
        <div
          ref={summary}
          tabIndex={-1}
          className="mb-6 rounded-(--radius-notice) border border-red/27 bg-red/7 px-6 py-5 text-[0.92rem] text-red outline-none"
          role="alert"
        >
          <p className="leading-[1.65]">
            <strong>{t("form.errors.summary")}</strong>
          </p>
          <ul className="mt-2 list-disc pl-[1.2rem] leading-[1.65]">
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

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[22px]"
        noValidate
      >
        {service && (
          <p className="text-[0.92rem] text-muted">
            {t("form.about", { service: service.name })}
          </p>
        )}
        <div className={row}>
          <div>
            <label htmlFor="name" className={label}>
              {t("form.name.label")} <span className="text-label">*</span>
            </label>
            <input
              {...field("name")}
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={input}
              placeholder={t("form.name.placeholder")}
            />
            {errorFor("name")}
          </div>
          <div>
            <label htmlFor="email" className={label}>
              {t("form.email.label")} <span className="text-label">*</span>
            </label>
            <input
              {...field("email")}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={input}
              placeholder="your@email.com"
            />
            {errorFor("email")}
          </div>
        </div>

        <div>
          <label htmlFor="organisation" className={label}>
            {t("form.organisation.label")}{" "}
            <span className="font-normal text-caption">
              {t("form.optional")}
            </span>
          </label>
          <input
            id="organisation"
            name="organisation"
            type="text"
            autoComplete="organization"
            value={form.organisation}
            onChange={(e) => update("organisation", e.target.value)}
            className={input}
            placeholder={t("form.organisation.placeholder")}
          />
        </div>

        <fieldset
          className="min-w-0"
          aria-invalid={touched.has("enquiryType") && !!errors.enquiryType}
          aria-describedby={
            touched.has("enquiryType") && errors.enquiryType
              ? "enquiryType-error"
              : undefined
          }
        >
          <legend className={label}>
            {t("form.enquiryType.label")} <span className="text-label">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ENQUIRY_TYPES) as EnquiryId[]).map((type, i) => (
              <label key={type}>
                <input
                  id={i === 0 ? "enquiryType-first" : undefined}
                  type="radio"
                  name="enquiryType"
                  value={type}
                  checked={form.enquiryType === type}
                  onChange={() => update("enquiryType", type)}
                  onBlur={() => touch("enquiryType")}
                  className="peer pointer-events-none absolute size-px opacity-0"
                />
                <span className="inline-block cursor-pointer rounded-(--radius-pill) border border-ink/16 bg-white px-4 py-[9px] text-[0.88rem] transition-[background-color,border-color,color] duration-150 peer-checked:border-label peer-checked:bg-label peer-checked:text-white peer-focus-visible:shadow-focus-pill hover:border-rose">
                  {t(`form.enquiryType.options.${type}`)}
                </span>
              </label>
            ))}
          </div>
          {errorFor("enquiryType")}
        </fieldset>

        <div>
          <label htmlFor="subject" className={label}>
            {t("form.subject.label")} <span className="text-label">*</span>
          </label>
          <input
            {...field("subject")}
            type="text"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className={input}
            placeholder={t("form.subject.placeholder")}
          />
          {errorFor("subject")}
        </div>

        <div>
          <label htmlFor="message" className={label}>
            {t("form.message.label")} <span className="text-label">*</span>
          </label>
          <textarea
            {...field("message")}
            rows={7}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className={`${input} min-h-[168px] leading-[1.65]`}
            placeholder={t("form.message.placeholder")}
          />
          <p
            className="mt-1.5 text-right text-[0.78rem] text-muted"
            aria-live="polite"
          >
            {t("form.message.count", {
              count: form.message.length,
              max: MESSAGE_MAX,
            })}
          </p>
          {errorFor("message")}
        </div>

        <div>
          <label
            htmlFor="privacy"
            className="flex cursor-pointer items-start gap-3 text-[0.9rem]"
          >
            <input
              {...field("privacy")}
              type="checkbox"
              checked={form.privacy}
              onChange={(e) => update("privacy", e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-rose"
            />
            <span>
              {t.rich("form.privacy", {
                link: (chunks) => (
                  <Link
                    href="/privacy"
                    className="text-label underline underline-offset-2"
                  >
                    {chunks}
                  </Link>
                ),
              })}
              <span className="text-label"> *</span>
            </span>
          </label>
          {errorFor("privacy")}
        </div>

        <p className="rounded-(--radius-control) bg-canvas px-4 py-3 text-[0.8rem] leading-[1.65] text-ink/72">
          {t("form.note")}
        </p>

        <FormTrap
          label={t("form.honeypot")}
          value={honeypot}
          onChange={setHoneypot}
        />

        <div>
          <Btn
            type="submit"
            disabled={send.status === "sending"}
            className="min-w-[180px]"
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
