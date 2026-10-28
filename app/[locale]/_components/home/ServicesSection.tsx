import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  NestedOval,
  OverlappingCircles,
  FlowingRibbon,
} from "@/components/art/Shapes";
import { AA, C } from "@/lib/tokens";
import art3 from "@/assets/image-3.webp";
import art5 from "@/assets/image-5.webp";
import art7 from "@/assets/image-7.webp";

const SERVICE_IDS = ["individual", "group", "workshops"] as const;

export function ServicesSection() {
  const t = useTranslations("home");
  return (
    <section style={{ background: C.paper, padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div style={{ maxWidth: "680px", marginBottom: "3.5rem" }}>
          <div
            style={{
              fontFamily: "var(--hand)",
              color: AA.label,
              fontSize: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            {t("services.eyebrow")}
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.9rem, 3.5vw, 3rem)",
              color: C.ink,
              margin: "0 0 1rem",
            }}
          >
            {t("services.title")}
          </h2>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.97rem",
              color: "rgba(40,37,45,0.72)",
              lineHeight: 1.8,
            }}
          >
            {t("services.intro")}
          </p>
        </div>

        <div
          style={{ display: "grid", gap: "1.5rem" }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {[
            {
              id: SERVICE_IDS[0],
              Symbol: NestedOval,
              symbolColor: C.rose,
              art: art3,
              link: "/services/individual-art-therapy",
              accent: AA.label,
            },
            {
              id: SERVICE_IDS[1],
              Symbol: OverlappingCircles,
              symbolColor: C.aqua,
              art: art5,
              link: "/services/group-art-wellbeing",
              accent: AA.blueText,
            },
            {
              id: SERVICE_IDS[2],
              Symbol: FlowingRibbon,
              symbolColor: C.ochre,
              art: art7,
              link: "/services/workshops-programs",
              accent: AA.goldText,
            },
          ].map(({ id, Symbol, symbolColor, art, link, accent }) => (
            <div
              key={id}
              style={{
                background: C.canvas,
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 16px rgba(73,76,109,0.07)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={art}
                  alt={t(`services.items.${id}.artAlt`)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center 25%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(40,37,45,0.38) 0%, transparent 65%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                  }}
                >
                  <Symbol color={symbolColor} size={44} />
                </div>
              </div>
              <div
                style={{
                  padding: "1.75rem",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: accent,
                    marginBottom: "0.5rem",
                  }}
                >
                  {t(`services.items.${id}.label`)}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.2rem",
                    color: C.ink,
                    margin: "0 0 0.75rem",
                  }}
                >
                  {t(`services.items.${id}.title`)}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.88rem",
                    color: "rgba(40,37,45,0.72)",
                    lineHeight: 1.75,
                    flex: 1,
                    margin: "0 0 1.25rem",
                  }}
                >
                  {t(`services.items.${id}.desc`)}
                </p>
                <Link
                  href={link}
                  style={{
                    fontFamily: "var(--sans)",
                    fontWeight: 600,
                    fontSize: "0.84rem",
                    color: accent,
                    textDecoration: "none",
                    borderBottom: `1.5px solid ${accent}`,
                    paddingBottom: "2px",
                    width: "fit-content",
                  }}
                >
                  {t("services.learnMore")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
