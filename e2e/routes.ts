import type { Locale } from "@/i18n/routing";
import type { ServiceSlug } from "@/lib/services";

// The one list of public routes every end-to-end spec walks. The service
// slugs are checked against the site's own type, so adding a service without
// listing it here fails the type check. They are not imported as values
// because lib/services.ts imports images, which only Next's bundler can load.
const SERVICE_SLUGS = Object.keys({
  "individual-art-therapy": true,
  "group-art-wellbeing": true,
  "workshops-programs": true,
} satisfies Record<ServiceSlug, true>);

/** A path no page answers, for the not-found page. */
export const MISSING_ROUTE = "/this-page-does-not-exist";

export const ROUTES = [
  "/",
  "/about",
  "/services",
  ...SERVICE_SLUGS.map((slug) => `/services/${slug}`),
  "/art-of-wellness",
  "/portfolio",
  "/stories",
  "/contact",
  "/book",
  "/privacy",
  "/disclaimer",
  "/booking-policy",
  MISSING_ROUTE,
];

export const LOCALES = ["en", "my"] as const satisfies readonly Locale[];

/** English keeps the bare path; Burmese lives under /my. */
export function localePath(route: string, locale: Locale): string {
  if (locale === "en") return route;
  return route === "/" ? "/my" : `/my${route}`;
}

export type PublicPage = {
  route: string;
  locale: Locale;
  /** The URL path to visit. */
  path: string;
  /** How the baseline file names this page: "<route> <locale>". */
  key: string;
};

export const PAGES: PublicPage[] = ROUTES.flatMap((route) =>
  LOCALES.map((locale) => ({
    route,
    locale,
    path: localePath(route, locale),
    key: `${route} ${locale}`,
  })),
);
