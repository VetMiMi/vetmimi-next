import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";

export function ArtOfWellnessSection() {
  const t = useTranslations("home");
  return (
    <section
      style={{
        background: C.indigo,
        position: "relative",
        overflow: "hidden",
        padding: "5rem 1.5rem 6rem",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "center",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Framed photo: cream mat, thin ochre edge, soft shadow */}
          <figure
            style={{
              margin: 0,
              background: C.canvas,
              padding: "clamp(10px, 1.4vw, 18px)",
              border: `1px solid ${C.ochre}`,
              boxShadow: "0 24px 48px rgba(18,14,26,0.35)",
            }}
          >
            <Image
              src={hewPhoto}
              alt={t("artOfWellness.photoAlt")}
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder="blur"
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </figure>

          {/* Text */}
          <div>
            <div
              style={{
                fontFamily: "var(--hand)",
                color: C.butter,
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            >
              The Art of Wellness
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: C.canvas,
                margin: "0 0 1.5rem",
                lineHeight: 1.12,
              }}
            >
              {t("artOfWellness.title")}
            </h2>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.97rem",
                color: "rgba(255,247,239,0.68)",
                lineHeight: 1.85,
                marginBottom: "2rem",
              }}
            >
              {t("artOfWellness.body")}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/art-of-wellness"
                style={{
                  backgroundColor: AA.action,
                  color: "#fff",
                  fontFamily: "var(--sans)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                {t("artOfWellness.exploreCta")}
              </Link>
              <Link
                href="/portfolio"
                style={{
                  color: C.canvas,
                  fontFamily: "var(--sans)",
                  fontWeight: 500,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                  borderBottom: `1px solid ${C.aqua}`,
                  paddingBottom: "1px",
                  alignSelf: "center",
                }}
              >
                {t("artOfWellness.projectsLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
