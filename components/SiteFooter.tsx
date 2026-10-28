import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PRACTICE } from "@/lib/seo";
import { PetalOutline, WaveDivider } from "@/components/art/Shapes";
import { ExternalLink } from "@/components/ExternalLink";

// A 44px tall row for each link (brief §10); the heading's margin
// shrinks by the same amount, so the first link stays in place.
const LINK = "flex min-h-11 items-center text-[0.86rem] text-canvas/90";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <nav aria-label={title}>
      <div className="mb-[0.55rem] text-[0.65rem] tracking-[0.13em] text-canvas/85 uppercase">
        {title}
      </div>
      {links.map(([label, to]) => {
        // Site pages keep the visitor's language; Facebook and email do not.
        if (to.startsWith("/")) {
          return (
            <Link key={label} href={to} className={LINK}>
              {label}
            </Link>
          );
        }
        if (to.startsWith("http")) {
          return (
            <ExternalLink key={label} href={to} className={LINK}>
              {label}
            </ExternalLink>
          );
        }
        return (
          <a key={label} href={to} className={LINK}>
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
      <WaveDivider from="var(--paper)" to="var(--indigo)" variant="dramatic" />
      <div className="relative overflow-hidden bg-indigo">
        <div className="absolute right-6 bottom-6 opacity-35">
          <PetalOutline color="var(--coral)" size={110} />
        </div>
        <div
          aria-hidden
          className="absolute top-10 left-8 h-[58px] w-10 rounded-[20px_20px_35%_35%] border border-canvas/12 opacity-50"
        />

        <div className="relative z-1 mx-auto max-w-[1240px] px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-[0.4rem] font-display text-[1.4rem] text-canvas">
                VetMiMi
              </div>
              <div className="mb-5 text-[0.65rem] tracking-[0.12em] text-[#e9bac8] uppercase">
                {t("footer.tagline")}
              </div>
              <p className="max-w-[280px] text-[0.84rem] leading-[1.75] text-canvas/85">
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

          <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-canvas/10 pt-6">
            <span className="text-[0.75rem] text-canvas/80">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </span>
            <span className="text-[0.75rem] text-canvas/80">
              {t("footer.location")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
