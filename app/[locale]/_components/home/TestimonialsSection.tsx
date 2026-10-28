import Image from "next/image";
import { useTranslations } from "next-intl";
import { AA, C } from "@/lib/tokens";
import gardenEasel from "@/assets/artworks/garden-easel.webp";

// Quote and tag text lives in messages/<locale>/home.json under testimonials.items.
const TESTIMONIALS = [
  { id: "sarah", name: "Sarah M." },
  { id: "james", name: "James T." },
  { id: "priya", name: "Priya K." },
] as const;

export function TestimonialsSection() {
  const t = useTranslations("home");
  return (
    <section
      style={{
        background: C.paper,
        padding: "5rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
        }}
      >
        <Image
          src={gardenEasel}
          alt=""
          fill
          sizes="100vw"
          quality={40}
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              fontFamily: "var(--hand)",
              color: AA.label,
              fontSize: "1rem",
              marginBottom: "0.4rem",
            }}
          >
            {t("testimonials.eyebrow")}
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              color: C.ink,
              margin: 0,
            }}
          >
            {t("testimonials.title")}
          </h2>
        </div>
        <div
          style={{ display: "grid", gap: "1.5rem" }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {TESTIMONIALS.map(({ id, name }) => (
            <div
              key={id}
              style={{
                background: C.canvas,
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 2px 12px rgba(73,76,109,0.07)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--hand)",
                  fontSize: "3rem",
                  color: C.rose,
                  lineHeight: 0.8,
                  marginBottom: "1rem",
                  opacity: 0.5,
                }}
              >
                &ldquo;
              </div>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.92rem",
                  color: "rgba(40,37,45,0.72)",
                  lineHeight: 1.8,
                  margin: "0 0 1.5rem",
                }}
              >
                {t(`testimonials.items.${id}.quote`)}
              </p>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "0.95rem",
                  color: C.ink,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.68rem",
                  color: AA.caption,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: "2px",
                }}
              >
                {t(`testimonials.items.${id}.tag`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
