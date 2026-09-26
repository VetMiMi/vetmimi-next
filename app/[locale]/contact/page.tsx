"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import "@/styles/contact.css";

type ContactFormData = {
  name: string;
  email: string;
  organisation: string;
  enquiryType: string;
  subject: string;
  message: string;
  privacy: boolean;
};

type SubmitState = null | "success" | "failed";

// Stable ids are stored in the form; the visible labels come from messages.
const ENQUIRY_TYPES = [
  "collaboration",
  "workshop",
  "speaking",
  "artOfWellness",
  "media",
  "organisation",
  "general",
] as const;

export default function Contact() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    organisation: "",
    enquiryType: "",
    subject: "",
    message: "",
    privacy: false,
  });
  const [submitState, setSubmitState] = useState<SubmitState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: nothing is sent yet. This delay fakes a submission and the
    // message is discarded. Wire up a Server Action or form service.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitState("success");
  };

  return (
    <div className="contact-page">
      {/* ── Hero: which page do I need? ─────────────────── */}
      <section className="contact-container contact-hero">
        <p className="contact-eyebrow">{t("hero.eyebrow")}</p>
        <h1>{t("hero.title")}</h1>
        <div className="contact-choices">
          <Link href="/book" className="contact-choice">
            <strong>{t("hero.book.title")}</strong>
            <span>{t("hero.book.text")}</span>
            <em>{t("hero.book.cta")}</em>
          </Link>
          <a href="#enquiry" className="contact-choice">
            <strong>{t("hero.enquiry.title")}</strong>
            <span>{t("hero.enquiry.text")}</span>
            <em>{t("hero.enquiry.cta")}</em>
          </a>
        </div>
      </section>

      {/* ── Form + details ──────────────────────────────── */}
      <section id="enquiry" className="contact-container contact-main">
        <div className="contact-card">
          {submitState === "success" ? (
            <div className="contact-success" role="status">
              <h2>{t("success.title")}</h2>
              <p>{t("success.text")}</p>
            </div>
          ) : (
            <>
              <h2>{t("form.title")}</h2>

              {submitState === "failed" && (
                <div
                  className="contact-status contact-status--error"
                  role="alert"
                  style={{ marginBottom: 24 }}
                >
                  <p>{t("form.error.text")}</p>
                  <button type="button" onClick={() => setSubmitState(null)}>
                    {t("form.error.retry")}
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-row">
                  <div>
                    <label htmlFor="name" className="contact-label">
                      {t("form.name.label")} <span className="req">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="contact-input"
                      placeholder={t("form.name.placeholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="contact-label">
                      {t("form.email.label")} <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="contact-input"
                      placeholder="your@email.com"
                    />
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
                    value={formData.organisation}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder={t("form.organisation.placeholder")}
                  />
                </div>

                <fieldset className="contact-pills">
                  <legend className="contact-label">
                    {t("form.enquiryType.label")}
                  </legend>
                  <div className="contact-pill-list">
                    {ENQUIRY_TYPES.map((type) => (
                      <label key={type} className="contact-pill">
                        <input
                          type="radio"
                          name="enquiryType"
                          value={type}
                          checked={formData.enquiryType === type}
                          onChange={handleChange}
                        />
                        <span>{t(`form.enquiryType.options.${type}`)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="subject" className="contact-label">
                    {t("form.subject.label")} <span className="req">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder={t("form.subject.placeholder")}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="contact-label">
                    {t("form.message.label")} <span className="req">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={7}
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder={t("form.message.placeholder")}
                  />
                </div>

                <label htmlFor="privacy" className="contact-privacy">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    checked={formData.privacy}
                    onChange={handleChange}
                  />
                  <span>
                    {t.rich("form.privacy", {
                      link: (chunks) => <Link href="/privacy">{chunks}</Link>,
                    })}
                    <span className="req"> *</span>
                  </span>
                </label>

                <p className="contact-note">{t("form.note")}</p>

                <div>
                  <Btn
                    type="submit"
                    disabled={isSubmitting}
                    style={{ minWidth: 180 }}
                  >
                    {isSubmitting ? t("form.sending") : t("form.submit")}
                  </Btn>
                </div>
              </form>
            </>
          )}
        </div>

        <aside className="contact-details" aria-label={t("details.title")}>
          <p className="contact-eyebrow">{t("details.title")}</p>
          <dl>
            <div>
              <dt>{t("details.email.label")}</dt>
              <dd>{t("details.email.value")}</dd>
            </div>
            <div>
              <dt>{t("details.location.label")}</dt>
              <dd>{t("details.location.value")}</dd>
            </div>
            <div>
              <dt>{t("details.responseTime.label")}</dt>
              <dd>{t("details.responseTime.value")}</dd>
            </div>
          </dl>
          <hr />
          <p className="contact-details-note">
            {t.rich("details.bookingNote", {
              link: (chunks) => <Link href="/book">{chunks}</Link>,
            })}
          </p>
        </aside>
      </section>
    </div>
  );
}
