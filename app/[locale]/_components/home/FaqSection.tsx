import Image from "next/image";
import { useTranslations } from "next-intl";
import gardenEasel from "@/assets/artworks/garden-easel.webp";
import { FAQItem } from "./FAQItem";

// Question and answer text lives in messages/<locale>/home.json under faq.items.
const FAQ_IDS = ["whatIs", "draw", "session", "medicare", "howMany"] as const;

export function FaqSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-canvas px-6 py-20">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-[clamp(2rem,5vw,5rem)] md:grid-cols-2">
        <div>
          <div className="mb-2 font-script text-[1rem] text-label">
            {t("faq.eyebrow")}
          </div>
          <h2 className="mb-8 text-[clamp(1.8rem,3vw,2.6rem)] text-ink">
            {t("faq.title")}
          </h2>
          <div className="border-t border-ink/10">
            {FAQ_IDS.map((id) => (
              <FAQItem
                key={id}
                q={t(`faq.items.${id}.q`)}
                a={t(`faq.items.${id}.a`)}
              />
            ))}
          </div>
        </div>
        <div className="relative flex min-h-full items-start pt-8">
          <div className="relative w-full rounded-[34%_34%_20px_20px] bg-[#eee4e2] p-[14px]">
            <div className="relative aspect-4/3 overflow-hidden rounded-[32%_32%_14px_14px]">
              <Image
                src={gardenEasel}
                alt={t("faq.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                placeholder="blur"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute right-6 bottom-6 left-6 rounded-lg bg-canvas/92 px-4 py-3 font-body text-[0.7rem] tracking-[0.1em] text-indigo uppercase">
              {t("faq.imageCaption")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
