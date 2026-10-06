import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, HourglassMedium } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { PetalOutline } from "@/components/art/Shapes";
import { usePracticeFormat } from "./booking";
import type { Receipt } from "./booking";

const PENDING_STEPS = ["review", "email", "join"] as const;
const CONFIRMED_STEPS = ["email", "manage", "join"] as const;

// S01 Pending and S02 Confirmed: shown only after the API stored the
// request, with the reference it returned (Requirements §4).
export function ResultState({ receipt }: { receipt: Receipt }) {
  const t = useTranslations("book");
  const format = usePracticeFormat(receipt.timezone);
  const status = receipt.status;
  const Icon = status === "pending" ? HourglassMedium : CheckCircle;
  const nextSteps =
    status === "pending"
      ? PENDING_STEPS.map((step) => t(`result.next.pending.${step}`))
      : CONFIRMED_STEPS.map((step) => t(`result.next.confirmed.${step}`));
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const summary = [
    receipt.service.name,
    t("step4.dateTimeValue", {
      dateTime: format.dateTime(receipt.startsAt),
      zone: format.zone(receipt.startsAt),
    }),
    `${t("shared.minutes", { count: receipt.durationMinutes })} · ${t(`formats.${receipt.format}`)}`,
  ];

  return (
    <div
      style={{
        backgroundColor: C.canvas,
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
      }}
    >
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <PetalOutline size={56} style={{ margin: "0 auto 1.5rem" }} />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 1.25rem",
            backgroundColor:
              status === "pending" ? `${C.ochre}30` : `${C.indigo}1F`,
            color: status === "pending" ? AA.goldText : C.indigo,
            borderRadius: 20,
            fontFamily: "var(--sans)",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          <Icon size={16} weight="bold" aria-hidden />
          {t(`result.${status}.badge`)}
        </div>

        <h1
          ref={heading}
          tabIndex={-1}
          style={{
            outline: "none",
            fontFamily: "var(--serif)",
            fontSize: "clamp(2rem,4vw,2.8rem)",
            color: C.ink,
            marginBottom: "1.5rem",
            lineHeight: 1.2,
          }}
        >
          {t(`result.${status}.title`)}
        </h1>

        <p
          style={{
            fontFamily: "var(--sans)",
            color: `${C.ink}BB`,
            lineHeight: 1.78,
            fontSize: "1rem",
            marginBottom: "2rem",
          }}
        >
          {t(`result.${status}.text`)}
        </p>

        <div
          style={{
            backgroundColor: "#fff",
            border: `1px solid ${C.ink}18`,
            borderRadius: 10,
            padding: "1.25rem 1.5rem",
            textAlign: "left",
            marginBottom: "1.5rem",
            fontFamily: "var(--sans)",
            lineHeight: 1.7,
            overflowWrap: "anywhere",
          }}
        >
          <div
            style={{ fontWeight: 700, color: C.ink, marginBottom: "0.4rem" }}
          >
            {t("result.reference", { reference: receipt.reference })}
          </div>
          {summary.map((line) => (
            <div key={line} style={{ color: `${C.ink}CC` }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: C.paper,
            borderRadius: 10,
            padding: "1.75rem 2rem",
            textAlign: "left",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 700,
              color: C.ink,
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {t("result.next.title")}
          </div>
          {nextSteps.map((step, i) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: i < 2 ? "0.875rem" : 0,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: C.indigo,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontFamily: "var(--sans)",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  fontFamily: "var(--sans)",
                  color: `${C.ink}CC`,
                  lineHeight: 1.6,
                  paddingTop: "0.15rem",
                }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.82rem",
            color: AA.muted,
            lineHeight: 1.6,
            textAlign: "left",
            marginBottom: "2.5rem",
          }}
        >
          {t.rich("boundary", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Btn href="/">{t("result.home")}</Btn>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--sans)",
              color: C.rose,
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {t("result.question")}
          </Link>
        </div>
      </div>
    </div>
  );
}
