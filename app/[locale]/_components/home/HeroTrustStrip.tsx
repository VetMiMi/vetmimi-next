import { useTranslations } from "next-intl";

export function HeroTrustStrip() {
  const t = useTranslations("home");
  return (
    <div className="flex flex-wrap gap-10 border-t border-[rgba(254,252,248,0.15)] pt-7">
      {[
        t("hero.trust.certified"),
        t("hero.trust.hospital"),
        t("hero.trust.location"),
      ].map((label) => (
        <div key={label} className="flex items-center gap-[0.55rem]">
          <div className="size-1.5 shrink-0 rounded-full bg-ochre" />
          <span className="font-body text-[0.8rem] leading-[1.3] text-canvas/50">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
