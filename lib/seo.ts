import { routing, type Locale } from "../i18n/routing.ts";

// The address search engines and shared links should use. SITE_URL wins;
// without it, a Vercel production build uses the project's production
// domain, and everything else (local builds, previews) uses localhost.
// Never fails: the live site deploys without SITE_URL today.
export function siteUrl(): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === "production" && production) {
    return `https://${production}`;
  }
  return "http://localhost:3000";
}

// The absolute URL of a page in one language. English keeps the bare path
// and Burmese lives under /my, as `localePrefix: "as-needed"` routes them.
function localeUrl(locale: Locale, pathname: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const path = pathname === "/" && prefix ? "" : pathname;
  return `${siteUrl()}${prefix}${path}`;
}

// The canonical URL and hreflang links of a page, `pathname` being its
// English path ("/", "/about", "/stories/<slug>").
export function pageAlternates(locale: Locale, pathname: string) {
  const languages = Object.fromEntries(
    routing.locales.map((each) => [each, localeUrl(each, pathname)]),
  ) as Record<Locale, string>;
  return {
    canonical: languages[locale],
    languages: { ...languages, "x-default": languages[routing.defaultLocale] },
  };
}

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_AU",
  my: "my_MM",
};

// What every page shares on social cards. A page that sets `openGraph`
// replaces the layout's whole object, so pages spread this in again.
export function openGraphDefaults(locale: Locale) {
  return {
    siteName: "VetMiMi",
    locale: OPEN_GRAPH_LOCALES[locale],
    alternateLocale: routing.locales
      .filter((each) => each !== locale)
      .map((each) => OPEN_GRAPH_LOCALES[each]),
  };
}

// Title, description, canonical, hreflang and social card for one page.
// Typed by inference, so an article page can spread `openGraph` and add to it.
export function pageMetadata(
  locale: Locale,
  pathname: string,
  { title, description }: { title: string; description: string },
) {
  const alternates = pageAlternates(locale, pathname);
  return {
    title,
    description,
    alternates,
    openGraph: {
      ...openGraphDefaults(locale),
      type: "website" as const,
      title,
      description,
      url: alternates.canonical,
    },
  };
}
