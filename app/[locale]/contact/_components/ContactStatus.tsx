import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export type SendState =
  | { status: "idle" | "sending" | "failed" }
  | { status: "rateLimited" }
  | { status: "sent"; reference: string | null };

// After a send: the confirmation with the reference the API returned.
export function SentNotice({ reference }: { reference: string | null }) {
  const t = useTranslations("contact");
  const box = useRef<HTMLDivElement>(null);
  // The sent card is much shorter than the form, so bring it into view.
  useEffect(() => box.current?.scrollIntoView({ block: "center" }), []);
  return (
    <div ref={box} className="contact-success" role="status">
      <h2>{t("success.title")}</h2>
      <p>{t("success.text")}</p>
      {reference && (
        <p className="contact-reference">
          {t("success.reference", { reference })}
        </p>
      )}
    </div>
  );
}

// A failed send keeps every field; say so and offer the same send again.
export function SendFailure({
  send,
  onRetry,
}: {
  send: SendState;
  onRetry: (e: React.MouseEvent) => void;
}) {
  const t = useTranslations("contact");
  if (send.status !== "failed" && send.status !== "rateLimited") return null;
  return (
    <div
      className="contact-status contact-status--error"
      role="alert"
      style={{ marginBottom: 24 }}
    >
      {send.status === "failed" ? (
        <>
          <p>
            <strong>{t("form.error.title")}</strong> {t("form.error.text")}
          </p>
          <button type="button" onClick={onRetry}>
            {t("form.error.retry")}
          </button>
        </>
      ) : (
        <p>{t("form.rateLimited")}</p>
      )}
    </div>
  );
}
