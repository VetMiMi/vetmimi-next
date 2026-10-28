import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroTrustStrip } from "./HeroTrustStrip";

export function HeroSection() {
  const t = useTranslations("home");
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "clamp(640px, 95vh, 1000px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <HeroBackdrop />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "8rem 2rem 6rem 2.5rem",
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.ochre,
            marginBottom: "2rem",
            opacity: 0.8,
          }}
        >
          {t("hero.eyebrow")}
        </div>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(3rem, 6vw, 5.5rem)",
            fontWeight: 300,
            color: "#FEFCF8",
            lineHeight: 1.04,
            margin: "0 0 1.25rem",
            letterSpacing: "-0.01em",
            maxWidth: "680px",
          }}
        >
          {t("hero.title")}
        </h1>

        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
            color: C.ochre,
            lineHeight: 1.5,
            fontStyle: "italic",
            fontWeight: 300,
            maxWidth: "480px",
            marginBottom: "1.5rem",
          }}
        >
          {t("hero.subtitle")}
        </p>

        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "1rem",
            color: "rgba(255,247,239,0.7)",
            lineHeight: 1.85,
            maxWidth: "420px",
            marginBottom: "3rem",
          }}
        >
          {t("hero.intro")}
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "2.5rem",
          }}
        >
          <Link
            href="/book"
            style={{
              backgroundColor: AA.action,
              color: "#fff",
              fontFamily: "var(--sans)",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "15px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(219,95,89,0.35)",
            }}
          >
            {t("hero.bookCta")}
          </Link>
          <Link
            href="/about"
            style={{
              backgroundColor: "transparent",
              color: "#FEFCF8",
              fontFamily: "var(--sans)",
              fontWeight: 500,
              fontSize: "0.95rem",
              padding: "15px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              border: "1.5px solid rgba(254,252,248,0.4)",
            }}
          >
            {t("hero.meetCta")}
          </Link>
        </div>

        <HeroTrustStrip />
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          zIndex: 2,
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: "1px",
            height: "52px",
            background:
              "linear-gradient(to bottom, rgba(255,247,239,0.7), transparent)",
          }}
        />
      </div>
    </section>
  );
}
