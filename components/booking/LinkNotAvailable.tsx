import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";

// S11 (Booking UX §7): the body for an invalid, expired or used link, the
// same for management and session links. It never says whether an
// appointment or a person exists. The page around it sends HTTP 404.
export function LinkNotAvailable() {
  const t = useTranslations("manage");
  return (
    <>
      <p className="text-[1rem] leading-[1.78] text-ink/80">
        {t("badLink.text")}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Btn href="/book">{t("actions.book")}</Btn>
        <Link
          href="/contact"
          className="font-semibold text-action underline underline-offset-2 hover:text-action-hover"
        >
          {t("actions.contact")}
        </Link>
      </div>
    </>
  );
}
