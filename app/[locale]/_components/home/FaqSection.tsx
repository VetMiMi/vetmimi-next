import Image from "next/image";
import { useTranslations } from "next-intl";
import { AA, C } from "@/lib/tokens";
import gardenEasel from "@/assets/artworks/garden-easel.webp";
import { FAQItem } from "./FAQItem";

// Question and answer text lives in messages/<locale>/home.json under faq.items.
const FAQ_IDS = ["whatIs", "draw", "session", "medicare", "howMany"] as const;

export function FaqSection() {
  const t = useTranslations("home");
  return (
    <section style={{ background: C.canvas, padding: "5rem 1.5rem" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "grid",
          gap: "clamp(2rem, 5vw, 5rem)",
          alignItems: "start",
        }}
        className="grid-cols-1 md:grid-cols-2"
      >
        <div>
          <div
            style={{
              fontFamily: "var(--hand)",
              color: AA.label,
              fontSize: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            {t("faq.eyebrow")}
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              color: C.ink,
              margin: "0 0 2rem",
            }}
          >
            {t("faq.title")}
          </h2>
          <div style={{ borderTop: "1px solid rgba(40,37,45,0.1)" }}>
            {FAQ_IDS.map((id) => (
              <FAQItem
                key={id}
                q={t(`faq.items.${id}.q`)}
                a={t(`faq.items.${id}.a`)}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            minHeight: "100%",
            paddingTop: "2rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              padding: "14px",
              backgroundColor: "#eee4e2",
              borderRadius: "34% 34% 20px 20px",
            }}
          >
            <div
              style={{
                position: "relative",
                aspectRatio: "4/3",
                overflow: "hidden",
                borderRadius: "32% 32% 14px 14px",
              }}
            >
              <Image
                src={gardenEasel}
                alt={t("faq.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                placeholder="blur"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "1.5rem",
                right: "1.5rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: "rgba(255,247,239,0.92)",
                fontFamily: "var(--sans)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.indigo,
              }}
            >
              {t("faq.imageCaption")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
