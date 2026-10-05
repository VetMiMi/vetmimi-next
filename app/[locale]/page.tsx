"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  WaveDivider,
  GoldMark,
  PetalOutline,
  NestedOval,
  OverlappingCircles,
  FlowingRibbon,
  AlmondEye,
} from "@/components/art/Shapes";
import { AA, C } from "@/lib/tokens";
import { STORIES } from "@/lib/data";

import art3 from "@/assets/image-3.webp";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";
import art5 from "@/assets/image-5.webp";
import art7 from "@/assets/image-7.webp";
import gardenEasel from "@/assets/artworks/garden-easel.webp";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";
import { ArtMosaic } from "./_components/ArtMosaic";

/* ── Floating CTA ── */
function FloatingCTA() {
  const [vis, setVis] = useState(false);
  const t = useTranslations("home");
  useEffect(() => {
    const fn = () => setVis(window.scrollY > 600);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.75rem",
        right: "1.75rem",
        zIndex: 300,
        transform: vis
          ? "translateY(0) scale(1)"
          : "translateY(100px) scale(0.9)",
        opacity: vis ? 1 : 0,
        transition: "all 0.45s cubic-bezier(.22,.68,0,1.2)",
        pointerEvents: vis ? "auto" : "none",
      }}
    >
      <Link
        href="/book"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: AA.action,
          color: "#fff",
          fontFamily: "var(--sans)",
          fontWeight: 700,
          fontSize: "0.84rem",
          padding: "12px 22px",
          borderRadius: "50px",
          textDecoration: "none",
          boxShadow: "0 8px 28px rgba(219,95,89,0.38)",
        }}
      >
        ✦ {t("floatingCta")}
      </Link>
    </div>
  );
}

/* ── FAQ ── */
// Question and answer text lives in messages/<locale>/home.json under faq.items.
const FAQ_IDS = ["whatIs", "draw", "session", "medicare", "howMany"] as const;

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(40,37,45,0.1)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "1.35rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.05rem",
            color: C.ink,
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <span
          style={{
            color: C.coral,
            fontSize: "1.4rem",
            lineHeight: 1,
            flexShrink: 0,
            marginTop: "2px",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            display: "block",
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.93rem",
            color: "rgba(40,37,45,0.65)",
            lineHeight: 1.8,
            paddingBottom: "1.35rem",
            margin: 0,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

// Quote and tag text lives in messages/<locale>/home.json under testimonials.items.
const TESTIMONIALS = [
  { id: "sarah", name: "Sarah M." },
  { id: "james", name: "James T." },
  { id: "priya", name: "Priya K." },
] as const;

const SERVICE_IDS = ["individual", "group", "workshops"] as const;

/* ────────────────────────────────────── */
export default function Home() {
  const t = useTranslations("home");
  // Story titles and excerpts are shared with the Stories pages.
  const tStories = useTranslations("stories");
  return (
    <div style={{ background: C.canvas, overflowX: "hidden" }}>
      <FloatingCTA />

      {/* ══════════════════════════════════════
          HERO — dark full-bleed
      ══════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "clamp(640px, 95vh, 1000px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* art7 full-bleed background */}
        <Image
          src={art7}
          alt=""
          fill
          preload
          fetchPriority="high"
          quality={60}
          sizes="100vw"
          placeholder="blur"
          style={{
            objectFit: "cover",
            objectPosition: "center 28%",
            pointerEvents: "none",
          }}
          aria-hidden
        />
        {/* Dark gradient overlay — heavy left, fades right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(18,14,26,0.95) 0%, rgba(18,14,26,0.88) 42%, rgba(18,14,26,0.35) 100%)",
          }}
        />

        {/* Abstract gestures */}
        <GoldMark
          size={56}
          style={{
            position: "absolute",
            top: "14%",
            right: "12%",
            zIndex: 1,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
        <GoldMark
          size={36}
          style={{
            position: "absolute",
            bottom: "18%",
            right: "28%",
            zIndex: 1,
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />
        <AlmondEye
          color={C.ochre}
          size={80}
          style={{
            position: "absolute",
            top: "22%",
            left: "48%",
            zIndex: 1,
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />

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

          {/* Trust strip */}
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              flexWrap: "wrap",
              paddingTop: "1.75rem",
              borderTop: "1px solid rgba(254,252,248,0.15)",
            }}
          >
            {[
              t("hero.trust.certified"),
              t("hero.trust.hospital"),
              t("hero.trust.location"),
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: C.ochre,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.8rem",
                    color: "rgba(255,247,239,0.5)",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
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

      {/* Aqua ribbon transition */}
      <WaveDivider from={C.canvas} to={C.coral} variant="gentle" flip />

      {/* ══════════════════════════════════════
          EMOTIONAL PAUSE
      ══════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════
          ARTWORK GALLERY
      ══════════════════════════════════════ */}
      <section style={{ background: C.paper, padding: "5rem 0 0" }}>
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "0 1.5rem 2.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--hand)",
                  color: AA.label,
                  fontSize: "1rem",
                  marginBottom: "0.3rem",
                }}
              >
                {t("gallery.eyebrow")}
              </div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                  color: C.ink,
                  margin: 0,
                }}
              >
                {t("gallery.title")}
              </h2>
            </div>
            <Link
              href="/portfolio"
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.88rem",
                color: C.indigo,
                textDecoration: "none",
                borderBottom: `1px solid ${C.indigo}`,
              }}
            >
              {t("gallery.link")}
            </Link>
          </div>
        </div>

        {/* Mosaic of Daw Mi's own artworks */}
        <ArtMosaic />
      </section>

      {/* ══════════════════════════════════════
          ABOUT PREVIEW
      ══════════════════════════════════════ */}
      <WaveDivider from={C.paper} to={C.canvas} variant="gentle" />
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

      {/* ══════════════════════════════════════
          SERVICES OVERVIEW
      ══════════════════════════════════════ */}
      <WaveDivider from={C.canvas} to={C.paper} variant="gentle" />
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

      {/* ══════════════════════════════════════
          ART OF WELLNESS — dark indigo feature
      ══════════════════════════════════════ */}
      <WaveDivider from={C.paper} to={C.indigo} variant="gentle" />
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

      {/* ══════════════════════════════════════
          STORIES PREVIEW
      ══════════════════════════════════════ */}
      <WaveDivider from={C.indigo} to="#F0EEF5" variant="gentle" />
      <section
        style={{
          background: "#F0EEF5",
          padding: "5rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AlmondEye
          color={C.violet}
          size={72}
          style={{
            position: "absolute",
            right: "3rem",
            top: "3rem",
            opacity: 0.25,
          }}
        />
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ maxWidth: "680px", marginBottom: "3rem" }}>
            <div
              style={{
                fontFamily: "var(--hand)",
                color: C.violet,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              {t("stories.eyebrow")}
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: C.ink,
                margin: "0 0 1rem",
              }}
            >
              {t("stories.title")}
            </h2>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.95rem",
                color: "rgba(40,37,45,0.72)",
                lineHeight: 1.8,
              }}
            >
              {t("stories.intro")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STORIES.slice(0, 3).map((story) => {
              const title = tStories(`items.${story.slug}.title`);
              return (
                <article
                  key={story.slug}
                  style={{
                    background: C.canvas,
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    boxShadow: "0 2px 16px rgba(107,99,150,0.09)",
                  }}
                >
                  <Image
                    src={story.img}
                    alt=""
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      objectPosition: "center 30%",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: C.violet,
                        marginBottom: "0.75rem",
                      }}
                    >
                      {tStories(`items.${story.slug}.category`)}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "1.35rem",
                        color: C.ink,
                        margin: "0 0 0.75rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.88rem",
                        color: "rgba(40,37,45,0.68)",
                        lineHeight: 1.75,
                        margin: "0 0 1.25rem",
                      }}
                    >
                      {tStories(`items.${story.slug}.excerpt`)}
                    </p>
                    <Link
                      href={`/stories/${story.slug}`}
                      aria-label={t("stories.readStoryLabel", { title })}
                      style={{
                        fontFamily: "var(--sans)",
                        fontWeight: 600,
                        fontSize: "0.84rem",
                        color: C.violet,
                        textDecoration: "none",
                        marginTop: "auto",
                        alignSelf: "flex-start",
                        borderBottom: `1px solid ${C.violet}`,
                        paddingBottom: "1px",
                      }}
                    >
                      {t("stories.readStory")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div style={{ marginTop: "2.5rem" }}>
            <Link
              href="/stories"
              style={{
                fontFamily: "var(--sans)",
                fontWeight: 500,
                fontSize: "0.9rem",
                color: C.indigo,
                textDecoration: "none",
                borderBottom: `1px solid ${C.indigo}`,
                paddingBottom: "1px",
              }}
            >
              {t("stories.allLink")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <WaveDivider from="#F0EEF5" to={C.paper} variant="gentle" />
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

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <WaveDivider from={C.paper} to={C.canvas} variant="gentle" />
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

      {/* ══════════════════════════════════════
          TWO-PATH CTA
      ══════════════════════════════════════ */}
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
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
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
    </div>
  );
}
