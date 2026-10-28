import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  NestedOval,
  OverlappingCircles,
  FlowingRibbon,
} from "@/components/art/Shapes";
import art3 from "@/assets/image-3.webp";
import art5 from "@/assets/image-5.webp";
import art7 from "@/assets/image-7.webp";

const SERVICE_IDS = ["individual", "group", "workshops"] as const;

export function ServicesSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-paper px-6 py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 max-w-[680px]">
          <div className="mb-2 font-script text-[1rem] text-label">
            {t("services.eyebrow")}
          </div>
          <h2 className="mb-4 text-[clamp(1.9rem,3.5vw,3rem)] text-ink">
            {t("services.title")}
          </h2>
          <p className="font-body text-[0.97rem] leading-[1.8] text-ink/72">
            {t("services.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              id: SERVICE_IDS[0],
              Symbol: NestedOval,
              symbolColor: "var(--rose)",
              art: art3,
              link: "/services/individual-art-therapy",
              accent: "border-label text-label",
            },
            {
              id: SERVICE_IDS[1],
              Symbol: OverlappingCircles,
              symbolColor: "var(--aqua)",
              art: art5,
              link: "/services/group-art-wellbeing",
              accent: "border-blue-text text-blue-text",
            },
            {
              id: SERVICE_IDS[2],
              Symbol: FlowingRibbon,
              symbolColor: "var(--ochre)",
              art: art7,
              link: "/services/workshops-programs",
              accent: "border-gold-text text-gold-text",
            },
          ].map(({ id, Symbol, symbolColor, art, link, accent }) => (
            <div
              key={id}
              className="flex flex-col overflow-hidden rounded-2xl bg-canvas shadow-[0_2px_16px_rgba(73,76,109,0.07)]"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={art}
                  alt={t(`services.items.${id}.artAlt`)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-[center_25%]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,37,45,0.38)_0%,transparent_65%)]" />
                <div className="absolute top-4 left-4">
                  <Symbol color={symbolColor} size={44} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <div
                  className={`mb-2 font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase ${accent}`}
                >
                  {t(`services.items.${id}.label`)}
                </div>
                <h3 className="mb-3 text-[1.2rem] text-ink">
                  {t(`services.items.${id}.title`)}
                </h3>
                <p className="mb-5 flex-1 font-body text-[0.88rem] leading-[1.75] text-ink/72">
                  {t(`services.items.${id}.desc`)}
                </p>
                <Link
                  href={link}
                  className={`w-fit border-b-[1.5px] pb-0.5 font-body text-[0.84rem] font-semibold no-underline ${accent}`}
                >
                  {t("services.learnMore")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
