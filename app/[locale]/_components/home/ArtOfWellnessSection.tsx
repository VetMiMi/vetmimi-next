import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";

export function ArtOfWellnessSection() {
  const t = useTranslations("home");
  return (
    <section className="relative overflow-hidden bg-indigo px-6 pt-20 pb-24">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 items-center gap-[clamp(2rem,5vw,5rem)] md:grid-cols-2">
          {/* Framed photo: cream mat, thin ochre edge, soft shadow */}
          <figure className="m-0 border border-ochre bg-canvas p-[clamp(10px,1.4vw,18px)] shadow-[0_24px_48px_rgba(18,14,26,0.35)]">
            <Image
              src={hewPhoto}
              alt={t("artOfWellness.photoAlt")}
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder="blur"
              className="block h-auto w-full"
            />
          </figure>

          {/* Text */}
          <div>
            <div className="mb-4 font-script text-[1rem] text-butter">
              The Art of Wellness
            </div>
            {/* `!` beats the global heading line height; the :lang guard
                leaves Burmese on its own taller one. */}
            <h2 className="mb-6 text-[clamp(1.8rem,3.5vw,2.8rem)] text-canvas [&:not(:lang(my))]:leading-[1.12]!">
              {t("artOfWellness.title")}
            </h2>
            <p className="mb-8 font-body text-[0.97rem] leading-[1.85] text-canvas/68">
              {t("artOfWellness.body")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/art-of-wellness"
                className="rounded-lg bg-action px-6 py-3 font-body text-[0.88rem] font-semibold text-white no-underline"
              >
                {t("artOfWellness.exploreCta")}
              </Link>
              <Link
                href="/portfolio"
                className="self-center border-b border-aqua pb-px font-body text-[0.88rem] font-medium text-canvas no-underline"
              >
                {t("artOfWellness.projectsLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
