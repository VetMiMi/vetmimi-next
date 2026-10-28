import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroTrustStrip } from "./HeroTrustStrip";

export function HeroSection() {
  const t = useTranslations("home");
  return (
    <section className="relative flex min-h-[clamp(640px,95vh,1000px)] items-center overflow-hidden">
      <HeroBackdrop />

      <div className="relative z-2 mx-auto w-full max-w-[1240px] pt-32 pr-8 pb-24 pl-10">
        <div className="mb-8 font-body text-[0.7rem] font-semibold tracking-[0.2em] text-ochre uppercase opacity-80">
          {t("hero.eyebrow")}
        </div>

        {/* `!` beats the global heading weight and line height; the :lang
            guard leaves Burmese on its own taller line height. */}
        <h1 className="mb-5 max-w-[680px] text-[clamp(3rem,6vw,5.5rem)] font-light! tracking-[-0.01em] text-[#FEFCF8] [&:not(:lang(my))]:leading-[1.04]!">
          {t("hero.title")}
        </h1>

        <p className="mb-6 max-w-[480px] font-display text-[clamp(1rem,1.8vw,1.2rem)] leading-[1.5] font-light text-ochre italic">
          {t("hero.subtitle")}
        </p>

        <p className="mb-12 max-w-[420px] font-body text-[1rem] leading-[1.85] text-canvas/70">
          {t("hero.intro")}
        </p>

        <div className="mb-10 flex flex-wrap items-center gap-4">
          <Link
            href="/book"
            className="rounded-lg bg-action px-8 py-[15px] font-body text-[0.95rem] font-semibold text-white no-underline shadow-[0_8px_28px_rgba(219,95,89,0.35)]"
          >
            {t("hero.bookCta")}
          </Link>
          <Link
            href="/about"
            className="rounded-lg border-[1.5px] border-[rgba(254,252,248,0.4)] bg-transparent px-8 py-[15px] font-body text-[0.95rem] font-medium text-[#FEFCF8] no-underline"
          >
            {t("hero.meetCta")}
          </Link>
        </div>

        <HeroTrustStrip />
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 z-2 flex -translate-x-1/2 flex-col items-center gap-1.5 opacity-40">
        <div className="h-[52px] w-px bg-[linear-gradient(to_bottom,rgba(255,247,239,0.7),transparent)]" />
      </div>
    </section>
  );
}
