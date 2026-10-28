"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// English / မြန်မာ. Each option links to the same page in the other language,
// and next-intl remembers the choice in a cookie.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common.language");

  return (
    <nav
      aria-label={t("label")}
      className="inline-flex items-center gap-0.5 rounded-full border border-ink/14 p-[3px]"
    >
      {routing.locales.map((option) => {
        const active = option === locale;
        return (
          <Link
            key={option}
            href={pathname}
            locale={option}
            lang={option}
            hrefLang={option}
            aria-current={active ? "true" : undefined}
            className={`touch-target rounded-full px-[11px] py-1 text-[0.78rem] leading-[1.5] font-semibold ${active ? "bg-indigo text-white" : "text-ink opacity-72"}`}
          >
            {t(option)}
          </Link>
        );
      })}
    </nav>
  );
}
