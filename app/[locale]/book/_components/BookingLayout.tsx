import type { ReactNode, RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
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
    <div style={{ backgroundColor: C.canvas, minHeight: "100dvh" }}>
      <div
        style={{
          borderBottom: `1px solid ${C.ink}0F`,
          padding: "3rem 2rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Link
            href="/services"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.82rem",
              color: `${C.ink}66`,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              marginBottom: "1.25rem",
            }}
          >
            {t("page.back")}
          </Link>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.75rem,3.5vw,2.5rem)",
              color: C.ink,
              margin: 0,
            }}
          >
            {t("page.title")}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 2rem" }}>
        <div
          ref={columnRef}
          style={{
            maxWidth: 660,
            margin: "0 auto",
            paddingTop: "3rem",
            paddingBottom: "6rem",
            scrollMarginTop: 64,
          }}
        >
          <ProgressIndicator step={step} />
          {children}
          <p
            style={{
              marginTop: "3rem",
              fontFamily: "var(--sans)",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              color: AA.muted,
            }}
          >
            {t.rich("boundary", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
