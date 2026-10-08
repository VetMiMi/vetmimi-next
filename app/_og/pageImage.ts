import "server-only";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { contentType, renderOgCard, size } from "./OgCard";

type Params = { locale: string; slug?: string };
type Translate = Awaited<ReturnType<typeof getTranslations<never>>>;

/** A page's card text; undefined when the page does not exist (404). */
export type CardLookup = (
  t: Translate,
  params: { locale: Locale; slug: string },
) => Promise<{ title: string; eyebrow?: string } | undefined>;

// The image renderer cannot shape Burmese: vowel signs such as ေ land after
// their consonant instead of before it. So Burmese pages share the English
// card, and the Burmese title stays in og:title.
const CARD_LOCALE: Record<Locale, Locale> = { en: "en", my: "en" };

async function cardText(lookup: CardLookup, { locale, slug = "" }: Params) {
  if (!hasLocale(routing.locales, locale)) return undefined;
  const cardLocale = CARD_LOCALE[locale];
  const t = await getTranslations({ locale: cardLocale });
  const text = await lookup(t, { locale: cardLocale, slug });
  return text && { ...text, tagline: t("common.brand.tagline") };
}

// Everything an opengraph-image route exports, so each route only says
// where its title comes from. One card per page and locale, with alt text
// from messages; the id "card" ends up in the image's URL.
export function pageImage(lookup: CardLookup) {
  async function generateImageMetadata({ params }: { params: Params }) {
    const text = await cardText(lookup, params);
    if (!text) return [];
    const t = await getTranslations({
      locale: params.locale as Locale,
      namespace: "common.og",
    });
    const alt = t("alt", { title: text.title });
    return [{ id: "card", alt, size, contentType }];
  }
  async function Image({ params }: { params: Promise<Params> }) {
    const text = await cardText(lookup, await params);
    if (!text) return new Response(null, { status: 404 });
    return renderOgCard(text);
  }
  return { generateImageMetadata, Image };
}
