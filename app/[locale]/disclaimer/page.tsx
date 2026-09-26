import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { C } from "@/lib/tokens";
import { WaveDivider } from "@/components/art/Shapes";

const SECTIONS = [
  "general",
  "notAdvice",
  "relationship",
  "scope",
  "noGuarantee",
  "emergency",
  "externalLinks",
  "contact",
] as const;

export default async function Disclaimer({
  params,
}: PageProps<"/[locale]/disclaimer">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("legal.disclaimer");
  return (
    <div style={{ backgroundColor: C.canvas, minHeight: "100dvh" }}>
      {/* Header */}
      <div style={{ padding: "7rem 0 4rem" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <Link
              href="/"
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.78rem",
                color: `${C.ink}66`,
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "inline-block",
                marginBottom: "1.5rem",
              }}
            >
              {t("links.home")}
            </Link>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(2rem,4vw,3rem)",
                color: C.ink,
                margin: "0 0 2rem",
                lineHeight: 1.15,
              }}
            >
              {t("title")}
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem" }}>
          <WaveDivider from={C.canvas} to={C.paper} variant="gentle" />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 7rem" }}>
        {/* Placeholder notice */}
        <div
          style={{
            backgroundColor: C.paper,
            borderRadius: 8,
            padding: "1.25rem 1.5rem",
            marginBottom: "3rem",
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: `${C.ink}BB`,
            lineHeight: 1.7,
            borderLeft: `3px solid ${C.ochre}`,
          }}
        >
          {t("notice")}
        </div>

        {/* Emergency callout — always prominent */}
        <div
          style={{
            backgroundColor: `${C.coral}12`,
            border: `1px solid ${C.coral}44`,
            borderRadius: 8,
            padding: "1.25rem 1.5rem",
            marginBottom: "3rem",
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
            color: C.ink,
            lineHeight: 1.7,
          }}
        >
          {t.rich("crisis", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </div>

        {SECTIONS.map((id) => (
          <div key={id} style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.15rem,2vw,1.35rem)",
                color: C.ink,
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              {t(`sections.${id}.heading`)}
            </h2>
            <p
              style={{
                fontFamily: "var(--sans)",
                color: `${C.ink}BB`,
                lineHeight: 1.78,
                margin: 0,
                fontSize: "1rem",
              }}
            >
              {t(`sections.${id}.body`)}
            </p>
          </div>
        ))}

        {/* Footer links */}
        <div
          style={{
            borderTop: `1px solid ${C.ink}18`,
            paddingTop: "2.5rem",
            marginTop: "3rem",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
            }}
          >
            {t("links.returnHome")}
          </Link>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
            }}
          >
            {t("links.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
