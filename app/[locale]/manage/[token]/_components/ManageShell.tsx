import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// The management pages' frame (brief §9, 1/5 treatment): canvas page, one
// 560px column, no artwork, and the crisis boundary every booking page
// repeats (Requirements §6).
export function ManageShell({
  title,
  back,
  children,
}: {
  title: string;
  // The appointment page, from the pages below it: a back link and the
  // "Your appointment" eyebrow over the title.
  back?: string;
  children: ReactNode;
}) {
  const t = useTranslations();
  return (
    <div className="bg-canvas px-5 pt-[clamp(40px,7vw,72px)] pb-24">
      <div className="mx-auto flex max-w-[560px] flex-col gap-6">
        <div>
          {back && (
            <>
              <Link
                href={back}
                className="mb-5 inline-block text-[0.85rem] text-muted no-underline hover:text-ink"
              >
                {t("manage.page.back")}
              </Link>
              <p className="mb-2 text-[0.75rem] font-bold tracking-[0.14em] text-label uppercase">
                {t("manage.page.eyebrow")}
              </p>
            </>
          )}
          <h1 className="text-[clamp(1.75rem,3.5vw,2.4rem)] text-ink">
            {title}
          </h1>
        </div>
        {children}
        <p className="mt-4 text-[0.82rem] leading-[1.6] text-muted">
          {t.rich("book.boundary", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>
    </div>
  );
}
