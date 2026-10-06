import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";

// ── Success State ────────────────────────────────────────────────────────────

const NEXT_STEPS = ["review", "email", "confirmed"] as const;

export function SuccessState() {
  const t = useTranslations("book.success");
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
        <div
          style={{
            display: "inline-block",
            padding: "0.4rem 1.25rem",
            backgroundColor: `${C.ochre}30`,
            color: C.ochre,
            borderRadius: 20,
            fontFamily: "var(--sans)",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          {t("badge")}
        </div>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(2rem,4vw,2.8rem)",
            color: C.ink,
            marginBottom: "1.5rem",
            lineHeight: 1.2,
          }}
        >
          {t("title")}
        </h1>

        <p
          style={{
            fontFamily: "var(--sans)",
            color: `${C.ink}BB`,
            lineHeight: 1.78,
            fontSize: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {t("text")}
        </p>

        <div
          style={{
            backgroundColor: C.paper,
            borderRadius: 10,
            padding: "1.75rem 2rem",
            textAlign: "left",
            marginBottom: "3rem",
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
            {t("next.title")}
          </div>
          {NEXT_STEPS.map((step, i) => (
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
                {t(`next.steps.${step}`)}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Btn href="/">{t("home")}</Btn>
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
            {t("question")}
          </Link>
        </div>
      </div>
    </div>
  );
}
