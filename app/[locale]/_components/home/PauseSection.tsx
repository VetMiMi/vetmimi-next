import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WaveDivider } from "@/components/art/Shapes";
import { AA, C } from "@/lib/tokens";

export function PauseSection() {
  const t = useTranslations("home");
  return (
    <section
      style={{
        background: C.canvas,
        padding: "6rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveDivider
        from={C.canvas}
        to={C.coral}
        variant="gentle"
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      />

      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: C.ink,
            lineHeight: 1.4,
            fontStyle: "italic",
            fontWeight: 300,
            margin: "0 0 2rem",
          }}
        >
          <span style={{ display: "block" }}>{t("pause.line1")}</span>
          <span style={{ display: "block" }}>{t("pause.line2")}</span>
          <span style={{ display: "block" }}>{t("pause.line3")}</span>
        </p>
        <Link
          href="/services"
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
            color: AA.action,
            textDecoration: "none",
            borderBottom: `1px solid ${AA.action}`,
            paddingBottom: "1px",
          }}
        >
          {t("pause.link")}
        </Link>
      </div>
    </section>
  );
}
