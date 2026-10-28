import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoldMark, PetalOutline } from "@/components/art/Shapes";

const BUTTON =
  "rounded-lg px-[22px] py-[11px] font-body text-[0.88rem] font-semibold no-underline";

export function PathsSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-canvas px-6 pb-20">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal */}
        <div className="relative overflow-hidden rounded-(--radius-card) bg-label p-12">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <PetalOutline color="#fff" size={90} />
          </div>
          <div className="relative z-1">
            <h3 className="mb-3 text-[1.5rem] text-white">
              {t("paths.personal.title")}
            </h3>
            <p className="mb-8 font-body text-[0.9rem] leading-[1.75] text-white/80">
              {t("paths.personal.text")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className={`${BUTTON} bg-white text-label`}
              >
                {t("paths.personal.servicesCta")}
              </Link>
              <Link
                href="/book"
                className={`${BUTTON} border-[1.5px] border-white/50 bg-transparent text-white`}
              >
                {t("paths.personal.bookCta")}
              </Link>
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="relative overflow-hidden rounded-(--radius-card) bg-indigo p-12">
          <div className="absolute right-6 bottom-6 opacity-50">
            <GoldMark size={48} />
          </div>
          <div className="relative z-1">
            <h3 className="mb-3 text-[1.5rem] text-canvas">
              {t("paths.professional.title")}
            </h3>
            <p className="mb-8 font-body text-[0.9rem] leading-[1.75] text-canvas/70">
              {t("paths.professional.text")}
            </p>
            <Link href="/contact" className={`${BUTTON} bg-action text-white`}>
              {t("paths.professional.contactCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
