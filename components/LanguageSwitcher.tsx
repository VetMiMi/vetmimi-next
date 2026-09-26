"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { C } from "@/lib/tokens";

// English / မြန်မာ. Each option links to the same page in the other language,
// and next-intl remembers the choice in a cookie.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common.language");

  return (
    <nav
      aria-label={t("label")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        padding: "3px",
        borderRadius: "999px",
        border: "1px solid rgba(40,37,45,0.14)",
      }}
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
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.78rem",
              fontWeight: 600,
              lineHeight: 1.5,
              padding: "4px 11px",
              borderRadius: "999px",
              textDecoration: "none",
              color: active ? "#fff" : C.ink,
              backgroundColor: active ? C.indigo : "transparent",
              opacity: active ? 1 : 0.72,
            }}
          >
            {t(option)}
          </Link>
        );
      })}
    </nav>
  );
}
