import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PRACTICE } from "@/lib/seo";
import { C } from "@/lib/tokens";
import { PetalOutline, WaveDivider } from "@/components/art/Shapes";
import { ExternalLink } from "@/components/ExternalLink";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <nav aria-label={title}>
      <div
        style={{
          fontFamily: "var(--sans)",
          fontSize: "0.65rem",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          color: "rgba(255,247,239,0.85)",
          marginBottom: "0.55rem",
        }}
      >
        {title}
      </div>
      {links.map(([label, to]) => {
        // A 44px tall row for each link (brief §10); the heading's margin
        // shrinks by the same amount, so the first link stays in place.
        const style = {
          display: "flex",
          alignItems: "center",
          minHeight: "44px",
          fontFamily: "var(--sans)",
          fontSize: "0.86rem",
          color: "rgba(255,247,239,0.9)",
          textDecoration: "none",
        };
        // Site pages keep the visitor's language; Facebook and email do not.
        if (to.startsWith("/")) {
          return (
            <Link key={label} href={to} style={style}>
              {label}
            </Link>
          );
        }
        if (to.startsWith("http")) {
          return (
            <ExternalLink key={label} href={to} style={style}>
              {label}
            </ExternalLink>
          );
        }
        return (
          <a key={label} href={to} style={style}>
            {label}
          </a>
        );
      })}
    </nav>
  );
}

export default function SiteFooter() {
  const t = useTranslations("common");
  return (
    <footer>
      <WaveDivider from={C.paper} to={C.indigo} variant="dramatic" />
      <div
        style={{
          backgroundColor: C.indigo,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <PetalOutline
          color={C.coral}
          size={110}
          style={{
            position: "absolute",
            bottom: "1.5rem",
            right: "1.5rem",
            opacity: 0.35,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "2rem",
            width: "40px",
            height: "58px",
            borderRadius: "20px 20px 35% 35%",
            border: "1px solid rgba(255,247,239,0.12)",
            opacity: 0.5,
          }}
        />

        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "4rem 1.5rem 3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{ display: "grid", gap: "2.5rem" }}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]"
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.4rem",
                  color: C.canvas,
                  marginBottom: "0.4rem",
                }}
              >
                VetMiMi
              </div>
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#e9bac8",
                  marginBottom: "1.25rem",
                }}
              >
                {t("footer.tagline")}
              </div>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.84rem",
                  color: "rgba(255,247,239,0.85)",
                  lineHeight: 1.75,
                  maxWidth: "280px",
                }}
              >
                {t("footer.blurb")}
              </p>
            </div>
            <FooterCol
              title={t("footer.explore")}
              links={[
                [t("nav.about"), "/about"],
                [t("nav.services"), "/services"],
                [t("nav.artOfWellness"), "/art-of-wellness"],
                [t("nav.portfolio"), "/portfolio"],
                [t("nav.stories"), "/stories"],
              ]}
            />
            <FooterCol
              title={t("footer.connect")}
              links={[
                [t("nav.bookAppointment"), "/book"],
                [t("nav.contact"), "/contact"],
                [t("footer.facebook"), PRACTICE.facebookUrl],
                [t("footer.email"), "mailto:meenaerie@gmail.com"],
              ]}
            />
            <FooterCol
              title={t("footer.information")}
              links={[
                [t("footer.privacy"), "/privacy"],
                [t("footer.bookingPolicy"), "/booking-policy"],
                [t("footer.disclaimer"), "/disclaimer"],
              ]}
            />
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,247,239,0.1)",
              marginTop: "3rem",
              paddingTop: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.75rem",
                color: "rgba(255,247,239,0.8)",
              }}
            >
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </span>
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.75rem",
                color: "rgba(255,247,239,0.8)",
              }}
            >
              {t("footer.location")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
