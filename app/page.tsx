"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  WaveDivider,
  GoldMark,
  MintOpenCircle,
  PetalOutline,
  NestedOval,
  OverlappingCircles,
  FlowingRibbon,
  AlmondEye,
  LavenderWaveAccent,
} from "@/components/art/Shapes";
import { C } from "@/lib/tokens";
import { STORIES } from "@/lib/data";

import art3 from "@/assets/image-3.webp";
import art4 from "@/assets/image-4.webp";
import art5 from "@/assets/image-5.webp";
import art7 from "@/assets/image-7.webp";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";
import { ArtMosaic } from "./_components/ArtMosaic";

/* ── Floating CTA ── */
function FloatingCTA() {
  const [vis, setVis] = useState(false);
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
          backgroundColor: C.coral,
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
        ✦ Book Free Consultation
      </Link>
    </div>
  );
}

/* ── FAQ ── */
const FAQ_DATA = [
  {
    q: "What is art psychotherapy?",
    a: "Art psychotherapy uses the creative process — drawing, painting, collage — as a medium for self-expression and reflection. You do not need any art experience. The artwork you make is not judged; what it evokes and reveals is what matters.",
  },
  {
    q: "Do I need to know how to draw?",
    a: "No. You do not need to know how to draw, or make anything beautiful. Many people who come have never picked up a paintbrush. The process of making is what matters, not the result.",
  },
  {
    q: "What does a session look like?",
    a: "Sessions are 50–60 minutes, one-on-one. We begin with a brief conversation, then explore through art materials at your own pace. The way a session unfolds can be different each time.",
  },
  {
    q: "Is this covered by Medicare or private health?",
    a: "Art psychotherapy may be covered under Mental Health Care Plans with a GP referral, or through private health extras. Contact us to discuss your specific situation.",
  },
  {
    q: "How many sessions will I need?",
    a: "Some people find real value in a single session; others benefit from ongoing work over weeks or months. There is no pressure to commit beyond what feels right for you.",
  },
];

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
          maxHeight: open ? "260px" : "0",
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

const TESTIMONIALS = [
  {
    quote:
      "I walked in not knowing what to expect and left feeling like I had finally said something I never found words for.",
    name: "Sarah M.",
    tag: "Individual therapy client",
  },
  {
    quote:
      "Daw Mi creates the most gentle, unhurried space. The artwork I made in our sessions helped me understand myself more than years of talk therapy.",
    name: "James T.",
    tag: "Long-term client",
  },
  {
    quote:
      "The creative process bypassed the part of my brain that was stuck. After struggling with anxiety for years, this genuinely changed things for me.",
    name: "Priya K.",
    tag: "Art therapy client",
  },
];

/* ────────────────────────────────────── */
export default function Home() {
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
            Art&nbsp;·&nbsp;Reflection&nbsp;·&nbsp;Wellbeing
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
            Where the inner world finds its form.
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
            Art psychotherapy with Daw Mi — Sydney
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
            VetMiMi is a space where creativity and reflection meet. Through art
            and thoughtful conversation, Daw Mi creates another way to explore
            what may be difficult to put into words.
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
                backgroundColor: C.coral,
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
              Book Free Consultation
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
              Meet Daw Mi
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
              "Certified Art Therapist [To confirm]",
              "Royal North Shore Hospital — The Art of Wellness",
              "Sydney, NSW",
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
            <span style={{ display: "block" }}>
              You do not need to know how to draw.
            </span>
            <span style={{ display: "block" }}>
              You do not need to make something beautiful.
            </span>
            <span style={{ display: "block" }}>
              You only need somewhere to begin.
            </span>
          </p>
          <Link
            href="/services"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.coral,
              textDecoration: "none",
              borderBottom: `1px solid ${C.coral}`,
              paddingBottom: "1px",
            }}
          >
            Find out how it works →
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
                  color: C.rose,
                  fontSize: "1rem",
                  marginBottom: "0.3rem",
                }}
              >
                From the studio
              </div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                  color: C.ink,
                  margin: 0,
                }}
              >
                Made, shared and experienced
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
              View the Portfolio →
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
          {/* Artwork portrait with halo */}
          <div style={{ position: "relative" }}>
            <LavenderWaveAccent
              style={{
                position: "absolute",
                top: "-2rem",
                left: "-2rem",
                width: "140%",
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "50% 50% 12px 12px",
                aspectRatio: "3/4",
              }}
            >
              <Image
                src={art4}
                alt="Portrait of a woman with pink poppy — by Daw Mi 2023"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                style={{ objectFit: "cover", objectPosition: "center 12%" }}
              />
            </div>
            {/* Petal shape accent */}
            <PetalOutline
              color={C.rose}
              size={70}
              style={{
                position: "absolute",
                bottom: "2rem",
                right: "-1.5rem",
                opacity: 0.55,
              }}
            />
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
                  color: C.coral,
                  marginBottom: "0.2rem",
                }}
              >
                Co-founder
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
                  color: "rgba(40,37,45,0.45)",
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
                color: C.rose,
                fontSize: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              About Daw Mi
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
              Care and creativity have always met in Daw Mi&apos;s work.
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
              Her work brings together experience in healthcare, mental health,
              creative practice and art therapy. VetMiMi grew from a simple
              idea: creativity can give us another way to notice, express and
              reflect.
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
              Daw Mi is a certified art psychotherapist, transformative artist,
              and co-founder of The Art of Wellness at Royal North Shore
              Hospital in Sydney. The artworks on this site were made{" "}
              <em>in</em> these sessions.
            </p>
            <Link
              href="/about"
              style={{
                fontFamily: "var(--sans)",
                fontWeight: 600,
                fontSize: "0.92rem",
                color: C.coral,
                textDecoration: "none",
                borderBottom: `1.5px solid ${C.coral}`,
                paddingBottom: "2px",
              }}
            >
              Get to know Daw Mi →
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
                color: C.rose,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              How we work together
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.9rem, 3.5vw, 3rem)",
                color: C.ink,
                margin: "0 0 1rem",
              }}
            >
              A different kind of space to explore.
            </h2>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.97rem",
                color: "rgba(40,37,45,0.58)",
                lineHeight: 1.8,
              }}
            >
              Every person and every setting is different. Start by reading what
              each service is like and choose the place that feels closest to
              what you are looking for.
            </p>
          </div>

          <div
            style={{ display: "grid", gap: "1.5rem" }}
            className="grid-cols-1 md:grid-cols-3"
          >
            {[
              {
                Symbol: NestedOval,
                symbolColor: C.rose,
                art: art3,
                artAlt: "Organic flowing figure",
                label: "ONE-TO-ONE",
                title: "Individual Art Therapy",
                desc: "A private space for art-making, conversation and reflection. You do not need any art experience.",
                link: "/services/individual-art-therapy",
                accent: C.rose,
              },
              {
                Symbol: OverlappingCircles,
                symbolColor: C.aqua,
                art: art5,
                artAlt: "Pink peonies watercolor",
                label: "CREATE TOGETHER",
                title: "Group Art & Wellbeing",
                desc: "A shared creative space for expression, reflection and connection, with room to take part in your own way.",
                link: "/services/group-art-wellbeing",
                accent: C.blue,
              },
              {
                Symbol: FlowingRibbon,
                symbolColor: C.ochre,
                art: art7,
                artAlt: "Expressionist golden painting",
                label: "COMMUNITY & ORGANISATIONS",
                title: "Workshops & Programs",
                desc: "Creative experiences shaped for communities, healthcare settings, organisations and suitable projects.",
                link: "/services/workshops-programs",
                accent: C.ochre,
              },
            ].map(
              ({
                Symbol,
                symbolColor,
                art,
                artAlt,
                label,
                title,
                desc,
                link,
                accent,
              }) => (
                <div
                  key={title}
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
                      alt={artAlt}
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
                      {label}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "1.2rem",
                        color: C.ink,
                        margin: "0 0 0.75rem",
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.88rem",
                        color: "rgba(40,37,45,0.62)",
                        lineHeight: 1.75,
                        flex: 1,
                        margin: "0 0 1.25rem",
                      }}
                    >
                      {desc}
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
                      Learn more →
                    </Link>
                  </div>
                </div>
              ),
            )}
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
                alt="Daw Mi at Royal North Shore Hospital beside a painting created with patients, visitors and staff"
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
                  color: C.ochre,
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
                Art where care happens.
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
                The Art of Wellness brings music, art and photography to
                patients, carers and staff at Royal North Shore Hospital.
                Discover the program, Daw Mi&apos;s involvement and the work
                connected to it.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  href="/art-of-wellness"
                  style={{
                    backgroundColor: C.coral,
                    color: "#fff",
                    fontFamily: "var(--sans)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  Explore The Art of Wellness →
                </Link>
                <Link
                  href="/portfolio"
                  style={{
                    color: C.aqua,
                    fontFamily: "var(--sans)",
                    fontWeight: 500,
                    fontSize: "0.88rem",
                    textDecoration: "none",
                    borderBottom: `1px solid ${C.aqua}`,
                    paddingBottom: "1px",
                    alignSelf: "center",
                  }}
                >
                  See related projects →
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
              Stories & Insights
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: C.ink,
                margin: "0 0 1rem",
              }}
            >
              Stories, thoughts and things worth sitting with.
            </h2>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.95rem",
                color: "rgba(40,37,45,0.58)",
                lineHeight: 1.8,
              }}
            >
              Reflections on art, wellbeing, lived experience and the moments
              that shape our work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STORIES.slice(0, 3).map((story) => (
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
                    {story.category}
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
                    {story.title}
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
                    {story.excerpt}
                  </p>
                  <Link
                    href={`/stories/${story.slug}`}
                    aria-label={`Read story: ${story.title}`}
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
                    Read story →
                  </Link>
                </div>
              </article>
            ))}
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
              All stories & insights →
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
            right: 0,
            top: 0,
            width: "35%",
            height: "100%",
            opacity: 0.06,
          }}
        >
          <Image
            src={art3}
            alt=""
            fill
            sizes="35vw"
            quality={40}
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
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
                color: C.rose,
                fontSize: "1rem",
                marginBottom: "0.4rem",
              }}
            >
              True stories
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: C.ink,
                margin: 0,
              }}
            >
              Voices from the studio
            </h2>
          </div>
          <div
            style={{ display: "grid", gap: "1.5rem" }}
            className="grid-cols-1 md:grid-cols-3"
          >
            {TESTIMONIALS.map(({ quote, name, tag }) => (
              <div
                key={name}
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
                  {quote}
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
                    color: "rgba(40,37,45,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginTop: "2px",
                  }}
                >
                  {tag}
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
                color: C.rose,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              Common questions
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                color: C.ink,
                margin: "0 0 2rem",
              }}
            >
              What people ask first
            </h2>
            <div style={{ borderTop: "1px solid rgba(40,37,45,0.1)" }}>
              {FAQ_DATA.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
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
            <MintOpenCircle
              size={340}
              style={{
                position: "absolute",
                top: "7%",
                right: "-3rem",
                opacity: 0.38,
              }}
            />
            <div
              style={{
                position: "relative",
                width: "100%",
                padding: "0.75rem",
                backgroundColor: C.paper,
                borderRadius: "34% 34% 22px 22px",
                boxShadow: "0 18px 42px rgba(73,76,109,0.12)",
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
                  src={art5}
                  alt="Pink peonies — art created in therapy sessions"
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  style={{ objectFit: "cover", objectPosition: "72% 42%" }}
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
                Art made in session
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
              background: C.rose,
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
                Looking for personal support?
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
                Explore the services and find out what each experience involves.
              </p>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <Link
                  href="/services"
                  style={{
                    backgroundColor: "#fff",
                    color: C.rose,
                    fontFamily: "var(--sans)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    padding: "11px 22px",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  Explore Services
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
                  Book Appointment
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
                Planning a project or collaboration?
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
                Tell us what you are thinking about and we can begin from there.
              </p>
              <Link
                href="/contact"
                style={{
                  backgroundColor: C.coral,
                  color: "#fff",
                  fontFamily: "var(--sans)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  padding: "11px 22px",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                Contact Daw Mi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
