import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { WaveDivider } from "@/components/art/Shapes";

const SECTIONS = [
  "requests",
  "rescheduling",
  "cancellation",
  "noticePeriods",
  "lateCancellation",
  "noShows",
  "payment",
  "contact",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/booking-policy">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "legal.bookingPolicy.metadata",
  });
  return pageMetadata(locale, "/booking-policy", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function BookingPolicy({
  params,
}: PageProps<"/[locale]/booking-policy">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("legal.bookingPolicy");
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="pt-28 pb-16">
        <div className="mx-auto max-w-[1240px] px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <Link
              href="/"
              className="mb-6 inline-block text-[0.78rem] tracking-[0.08em] text-muted uppercase"
            >
              {t("links.home")}
            </Link>
            <h1 className="mb-8 text-[clamp(2rem,4vw,3rem)] text-ink [&:not(:lang(my))]:leading-[1.15]!">
              {t("title")}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-[720px] px-8">
          <WaveDivider
            from="var(--canvas)"
            to="var(--paper)"
            variant="gentle"
          />
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-8 pb-28">
        {/* Placeholder notice */}
        <div className="mb-12 rounded-lg border-l-3 border-ochre bg-paper px-6 py-5 text-[0.875rem] text-ink/73">
          {t("notice")}
        </div>

        {SECTIONS.map((id) => (
          <div key={id} className="mb-10">
            <h2 className="mb-3 text-[clamp(1.15rem,2vw,1.35rem)] font-semibold! text-ink">
              {t(`sections.${id}.heading`)}
            </h2>
            <p className="text-[1rem] leading-[1.78] text-ink/73">
              {t(`sections.${id}.body`)}
            </p>
          </div>
        ))}

        <div className="mt-12 flex flex-wrap gap-6 border-t border-ink/9 pt-10">
          <Link href="/" className="text-[0.9rem] text-label">
            {t("links.returnHome")}
          </Link>
          <Link href="/contact" className="text-[0.9rem] text-label">
            {t("links.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
