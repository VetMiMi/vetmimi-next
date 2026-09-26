import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { C } from "@/lib/tokens";
import { Btn } from "@/components/ui/Button";
import { AlmondEye, PetalOutline, GoldMark } from "@/components/art/Shapes";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div
      style={{
        backgroundColor: C.canvas,
        minHeight: "100dvh",
        padding: "10rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative — top right */}
      <div
        style={{
          position: "absolute",
          top: "4rem",
          right: "6vw",
          opacity: 0.35,
          pointerEvents: "none",
        }}
      >
        <AlmondEye />
      </div>

      {/* Decorative — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "5rem",
          left: "5vw",
          opacity: 0.28,
          pointerEvents: "none",
        }}
      >
        <PetalOutline />
      </div>

      {/* Decorative — center loosely */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      >
        <GoldMark />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* 404 label */}
        <div
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.72rem",
            color: C.rose,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          404
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(2.5rem,5vw,4rem)",
            color: C.ink,
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.15,
          }}
        >
          {t("notFound.heading")}
        </h1>

        {/* Negative space */}
        <div style={{ minHeight: "20vh" }} />

        {/* Copy */}
        <p
          style={{
            fontFamily: "var(--sans)",
            color: `${C.ink}BB`,
            lineHeight: 1.78,
            fontSize: "1rem",
            maxWidth: 440,
            margin: "0 auto 2.5rem",
          }}
        >
          {t("notFound.text")}
        </p>

        {/* Primary actions */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <Btn href="/">{t("notFound.home")}</Btn>
          <Btn href="/services" variant="secondary">
            {t("notFound.services")}
          </Btn>
        </div>

        {/* Secondary links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/portfolio"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
              margin: "0 1rem",
            }}
          >
            {t("nav.portfolio")}
          </Link>
          <Link
            href="/stories"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
              margin: "0 1rem",
            }}
          >
            {t("nav.stories")}
          </Link>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
              margin: "0 1rem",
            }}
          >
            {t("nav.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
