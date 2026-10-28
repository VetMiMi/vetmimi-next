import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { AlmondEye, PetalOutline, GoldMark } from "@/components/art/Shapes";

const LINK = "mx-4 text-[0.9rem] text-label";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas px-8 py-40 text-center">
      <div className="pointer-events-none absolute top-16 right-[6vw] opacity-35">
        <AlmondEye />
      </div>
      <div className="pointer-events-none absolute bottom-20 left-[5vw] opacity-28">
        <PetalOutline />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 opacity-8">
        <GoldMark />
      </div>

      <div className="relative z-1">
        <div className="mb-4 text-[0.72rem] font-bold tracking-[0.14em] text-label uppercase">
          404
        </div>
        <h1 className="mx-auto max-w-[600px] text-[clamp(2.5rem,5vw,4rem)] text-ink [&:not(:lang(my))]:leading-[1.15]!">
          {t("notFound.heading")}
        </h1>

        {/* Negative space */}
        <div className="min-h-[20vh]" />

        <p className="mx-auto mb-10 max-w-[440px] text-[1rem] leading-[1.78] text-ink/73">
          {t("notFound.text")}
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Btn href="/">{t("notFound.home")}</Btn>
          <Btn href="/services" variant="secondary">
            {t("notFound.services")}
          </Btn>
        </div>

        <div className="flex flex-wrap justify-center">
          <Link href="/portfolio" className={LINK}>
            {t("nav.portfolio")}
          </Link>
          <Link href="/stories" className={LINK}>
            {t("nav.stories")}
          </Link>
          <Link href="/contact" className={LINK}>
            {t("nav.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
