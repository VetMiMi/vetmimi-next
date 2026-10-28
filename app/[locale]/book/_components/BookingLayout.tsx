import type { ReactNode, RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProgressIndicator } from "./ProgressIndicator";

// The page around the steps: title, progress, and the crisis boundary that
// every step repeats (Requirements §6: booking must never imply emergency
// support).
export function BookingLayout({
  step,
  columnRef,
  children,
}: {
  step: number;
  columnRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const t = useTranslations("book");
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="border-b border-ink/6 px-8 pt-12 pb-8">
        <div className="mx-auto max-w-[1240px]">
          <Link
            href="/services"
            className="mb-5 inline-flex items-center gap-[0.3rem] text-[0.82rem] text-ink/40 no-underline"
          >
            {t("page.back")}
          </Link>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
            {t("page.title")}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-8">
        <div
          ref={columnRef}
          className="mx-auto max-w-[660px] scroll-mt-16 pt-12 pb-24"
        >
          <ProgressIndicator step={step} />
          {children}
          <p className="mt-12 text-[0.82rem] leading-[1.6] text-muted">
            {t.rich("boundary", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
