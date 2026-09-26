import type { Locale } from "./routing";

// One file per area of the site, so each page's text can be edited on its
// own: messages/<locale>/<namespace>.json.
export const NAMESPACES = [
  "common",
  "home",
  "about",
  "portfolio",
  "artOfWellness",
  "services",
  "stories",
  "contact",
  "book",
  "legal",
] as const;

export async function loadMessages(locale: Locale) {
  const entries = await Promise.all(
    NAMESPACES.map(
      async (ns) =>
        [
          ns,
          (await import(`../messages/${locale}/${ns}.json`)).default,
        ] as const,
    ),
  );
  return Object.fromEntries(entries);
}
