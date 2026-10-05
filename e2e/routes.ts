import type { Locale } from "@/i18n/routing";
import type { StorySlug } from "@/lib/data";
import type { ServiceSlug } from "@/lib/services";

// The one list of public routes every end-to-end spec walks. The slug lists
// are checked against the site's own types, so adding a service or a story
// without listing it here fails the type check. They are not imported as
// values because lib/services.ts and lib/data.ts import images, which only
// Next's bundler can load.
const SERVICE_SLUGS = Object.keys({
  "individual-art-therapy": true,
  "group-art-wellbeing": true,
  "workshops-programs": true,
} satisfies Record<ServiceSlug, true>);

const STORY_SLUGS = Object.keys({
  "stop-trying-make-perfect": true,
  "art-and-words": true,
  "creativity-in-healthcare": true,
} satisfies Record<StorySlug, true>);

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
  ...STORY_SLUGS.map((slug) => `/stories/${slug}`),
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
