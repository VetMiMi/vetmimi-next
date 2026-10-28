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
    <div ref={box} role="status">
      <h2 className="mb-3 text-[clamp(1.6rem,2.4vw,2rem)]">
        {t("success.title")}
      </h2>
      <p className="leading-[1.78] text-ink/72">{t("success.text")}</p>
      {reference && (
        <p className="mt-3 leading-[1.78] font-semibold text-ink">
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
      className="mb-6 rounded-(--radius-notice) border border-red/27 bg-red/7 px-6 py-5 text-[0.92rem] text-red"
      role="alert"
    >
      {send.status === "failed" ? (
        <>
          <p className="leading-[1.65]">
            <strong>{t("form.error.title")}</strong> {t("form.error.text")}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 cursor-pointer rounded-(--radius-small) border border-red px-3.5 py-1.5 font-body text-[0.85rem] text-red"
          >
            {t("form.error.retry")}
          </button>
        </>
      ) : (
        <p className="leading-[1.65]">{t("form.rateLimited")}</p>
      )}
    </div>
  );
}
