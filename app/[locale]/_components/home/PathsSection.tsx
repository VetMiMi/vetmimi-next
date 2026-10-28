import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoldMark, PetalOutline } from "@/components/art/Shapes";
import { AA, C } from "@/lib/tokens";

export function PathsSection() {
  const t = useTranslations("home");
  return (
    <section style={{ padding: "0 1.5rem 5rem", background: C.canvas }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "grid",
          gap: "1.5rem",
        }}
        className="grid-cols-1 md:grid-cols-2"
      >
        {/* Personal */}
        <div
          style={{
            background: AA.label,
            borderRadius: "20px",
            padding: "3rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <PetalOutline
            color="#fff"
            size={90}
            style={{
              position: "absolute",
              bottom: "-1rem",
              right: "-1rem",
              opacity: 0.2,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.5rem",
                color: "#fff",
                margin: "0 0 0.75rem",
              }}
            >
              {t("paths.personal.title")}
            </h3>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.75,
                margin: "0 0 2rem",
              }}
            >
              {t("paths.personal.text")}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link
                href="/services"
                style={{
                  backgroundColor: "#fff",
                  color: AA.label,
                  fontFamily: "var(--sans)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  padding: "11px 22px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                {t("paths.personal.servicesCta")}
              </Link>
              <Link
                href="/book"
                style={{
                  backgroundColor: "transparent",
                  color: "#fff",
                  fontFamily: "var(--sans)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  padding: "11px 22px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                }}
              >
                {t("paths.personal.bookCta")}
              </Link>
            </div>
          </div>
        </div>

        {/* Professional */}
        <div
          style={{
            background: C.indigo,
            borderRadius: "20px",
            padding: "3rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <GoldMark
            size={48}
            style={{
              position: "absolute",
              bottom: "1.5rem",
              right: "1.5rem",
              opacity: 0.5,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.5rem",
                color: C.canvas,
                margin: "0 0 0.75rem",
              }}
            >
              {t("paths.professional.title")}
            </h3>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.9rem",
                color: "rgba(255,247,239,0.7)",
                lineHeight: 1.75,
                margin: "0 0 2rem",
              }}
            >
              {t("paths.professional.text")}
            </p>
            <Link
              href="/contact"
              style={{
                backgroundColor: AA.action,
                color: "#fff",
                fontFamily: "var(--sans)",
                fontWeight: 600,
                fontSize: "0.88rem",
                padding: "11px 22px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              {t("paths.professional.contactCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
