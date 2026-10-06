import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { ManageShell } from "./_components/ManageShell";
import { linkClass } from "./_components/manageClasses";

// S11 (Booking UX §7): an invalid, expired or used link, one neutral page
// that never says whether an appointment or a person exists. Sent with
// HTTP 404 and noindex.
export default function BadLink() {
  const t = useTranslations("manage");
  return (
    <ManageShell title={t("badLink.title")}>
      <p className="text-[1rem] leading-[1.78] text-ink/80">
        {t("badLink.text")}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Btn href="/book">{t("actions.book")}</Btn>
        <Link href="/contact" className={linkClass}>
          {t("actions.contact")}
        </Link>
      </div>
    </ManageShell>
  );
}
