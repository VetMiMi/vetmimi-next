import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";

export function AboutSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-canvas px-6 py-20">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-[clamp(2rem,5vw,5rem)] md:grid-cols-[5fr_6fr]">
        {/* Daw Mi's portrait in the same framed arch as the About page */}
        <div className="relative rounded-[48%_48%_20px_20px] bg-[#eee4e2] p-[14px]">
          <div className="relative aspect-3/4 overflow-hidden rounded-[48%_48%_12px_12px]">
            <Image
              src={dawMiPortrait}
              alt={t("about.portraitAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              placeholder="blur"
              className="object-cover object-center"
            />
          </div>
          {/* Credential badge */}
          <div className="absolute -bottom-5 left-8 rounded-xl bg-white px-5 py-[0.9rem] shadow-[0_6px_24px_rgba(73,76,109,0.12)]">
            <div className="mb-[0.2rem] font-body text-[0.64rem] tracking-[0.1em] text-action uppercase">
              {t("about.badge.role")}
            </div>
            <div className="font-display text-[0.92rem] text-ink">
              The Art of Wellness
            </div>
            <div className="font-body text-[0.68rem] text-caption">
              Royal North Shore Hospital
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="mb-3 font-script text-[1rem] text-label">
            {t("about.eyebrow")}
          </div>
          {/* `!` beats the global heading line height; the :lang guard
              leaves Burmese on its own taller one. */}
          <h2 className="mb-6 text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink leading-[1.12]">
            {t("about.title")}
          </h2>
          <p className="mb-5 font-body text-[0.97rem] leading-[1.85] text-ink/66">
            {t("about.body1")}
          </p>
          <p className="mb-9 font-body text-[0.97rem] leading-[1.85] text-ink/66">
            {t.rich("about.body2", {
              em: (chunks) => <em>{chunks}</em>,
            })}
          </p>
          <Link
            href="/about"
            className="border-b-[1.5px] border-action pb-0.5 font-body text-[0.92rem] font-semibold text-action no-underline"
          >
            {t("about.link")}
          </Link>
        </div>
      </div>
    </section>
  );
}
