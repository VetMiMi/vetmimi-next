import { defineRouting } from "next-intl/routing";

// English keeps today's URLs (/about); Burmese lives under /my (/my/about).
// "my" is the ISO 639-1 code for Burmese.
export const routing = defineRouting({
  locales: ["en", "my"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
