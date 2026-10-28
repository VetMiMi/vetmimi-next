import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";

export function AboutSection() {
  const t = useTranslations("home");
  return (
    <section style={{ background: C.canvas, padding: "5rem 1.5rem" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "grid",
          gap: "clamp(2rem, 5vw, 5rem)",
          alignItems: "center",
        }}
        className="grid-cols-1 md:grid-cols-[5fr_6fr]"
      >
        {/* Daw Mi's portrait in the same framed arch as the About page */}
        <div
          style={{
            position: "relative",
            padding: "14px",
            background: "#eee4e2",
            borderRadius: "48% 48% 20px 20px",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "48% 48% 12px 12px",
              aspectRatio: "3/4",
            }}
          >
            <Image
              src={dawMiPortrait}
              alt={t("about.portraitAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              placeholder="blur"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
          {/* Credential badge */}
          <div
            style={{
              position: "absolute",
              bottom: "-1.25rem",
              left: "2rem",
              background: "#fff",
              borderRadius: "12px",
              padding: "0.9rem 1.25rem",
              boxShadow: "0 6px 24px rgba(73,76,109,0.12)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.64rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: AA.action,
                marginBottom: "0.2rem",
              }}
            >
              {t("about.badge.role")}
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "0.92rem",
                color: C.ink,
              }}
            >
              The Art of Wellness
            </div>
            <div
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.68rem",
                color: AA.caption,
              }}
            >
              Royal North Shore Hospital
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <div
            style={{
              fontFamily: "var(--hand)",
              color: AA.label,
              fontSize: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            {t("about.eyebrow")}
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: C.ink,
              margin: "0 0 1.5rem",
              lineHeight: 1.12,
            }}
          >
            {t("about.title")}
          </h2>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.97rem",
              color: "rgba(40,37,45,0.66)",
              lineHeight: 1.85,
              marginBottom: "1.25rem",
            }}
          >
            {t("about.body1")}
          </p>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.97rem",
              color: "rgba(40,37,45,0.66)",
              lineHeight: 1.85,
              marginBottom: "2.25rem",
            }}
          >
            {t.rich("about.body2", {
              em: (chunks) => <em>{chunks}</em>,
            })}
          </p>
          <Link
            href="/about"
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 600,
              fontSize: "0.92rem",
              color: AA.action,
              textDecoration: "none",
              borderBottom: `1.5px solid ${AA.action}`,
              paddingBottom: "2px",
            }}
          >
            {t("about.link")}
          </Link>
        </div>
      </div>
    </section>
  );
}
