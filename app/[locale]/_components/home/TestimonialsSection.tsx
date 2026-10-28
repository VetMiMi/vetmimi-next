import Image from "next/image";
import { useTranslations } from "next-intl";
import gardenEasel from "@/assets/artworks/garden-easel.webp";

// Quote and tag text lives in messages/<locale>/home.json under testimonials.items.
const TESTIMONIALS = [
  { id: "sarah", name: "Sarah M." },
  { id: "james", name: "James T." },
  { id: "priya", name: "Priya K." },
] as const;

export function TestimonialsSection() {
  const t = useTranslations("home");
  return (
    <section className="relative overflow-hidden bg-paper px-6 py-20">
      <div aria-hidden className="absolute inset-0 opacity-10">
        <Image
          src={gardenEasel}
          alt=""
          fill
          sizes="100vw"
          quality={40}
          className="object-cover object-center"
        />
      </div>
      <div className="relative z-1 mx-auto max-w-[1240px]">
        <div className="mb-14 text-center">
          <div className="mb-[0.4rem] font-script text-[1rem] text-label">
            {t("testimonials.eyebrow")}
          </div>
          <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] text-ink">
            {t("testimonials.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ id, name }) => (
            <div
              key={id}
              className="rounded-2xl bg-canvas p-8 shadow-[0_2px_12px_rgba(73,76,109,0.07)]"
            >
              <div className="mb-4 font-script text-[3rem] leading-[0.8] text-rose opacity-50">
                &ldquo;
              </div>
              <p className="mb-6 font-body text-[0.92rem] leading-[1.8] text-ink/72">
                {t(`testimonials.items.${id}.quote`)}
              </p>
              <div className="font-display text-[0.95rem] text-ink">{name}</div>
              <div className="mt-0.5 font-body text-[0.68rem] tracking-[0.1em] text-caption uppercase">
                {t(`testimonials.items.${id}.tag`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
