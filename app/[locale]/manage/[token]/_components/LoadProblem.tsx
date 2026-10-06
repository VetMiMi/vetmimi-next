import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { Notice } from "@/components/admin/Notice";
import type { ManageProblem } from "@/lib/api/manage";
import { linkClass } from "./manageClasses";

// What a management page shows when it has no appointment to show. None of
// these says anything about the appointment, or whether there is one.
export function LoadProblem({
  problem,
  retry,
}: {
  problem: Exclude<ManageProblem, "not_found">;
  retry: string;
}) {
  const t = useTranslations("manage");
  const text = {
    rate_limited: t("problems.rateLimited"),
    unavailable: t("problems.unavailable"),
    not_connected: t("problems.notConnected"),
  }[problem];
  return (
    <>
      <Notice tone={problem === "unavailable" ? "error" : "info"}>
        {text}
      </Notice>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {problem === "unavailable" && (
          <Btn href={retry}>{t("problems.retry")}</Btn>
        )}
        <Link href="/contact" className={linkClass}>
          {t("actions.contact")}
        </Link>
      </div>
    </>
  );
}
