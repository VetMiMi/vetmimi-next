import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WaveDivider } from "@/components/art/Shapes";

export function PauseSection() {
  const t = useTranslations("home");
  return (
    <section className="relative overflow-hidden bg-canvas px-8 py-24">
      <div className="absolute right-0 bottom-0 left-0">
        <WaveDivider from="var(--canvas)" to="var(--coral)" variant="gentle" />
      </div>

      <div className="relative z-1 mx-auto max-w-[760px] text-center">
        <p className="mb-8 font-display text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.4] font-light text-ink italic">
          <span className="block">{t("pause.line1")}</span>
          <span className="block">{t("pause.line2")}</span>
          <span className="block">{t("pause.line3")}</span>
        </p>
        <Link
          href="/services"
          className="border-b border-action pb-px font-body text-[0.9rem] text-action no-underline"
        >
          {t("pause.link")}
        </Link>
      </div>
    </section>
  );
}
