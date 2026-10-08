import { pageAlternates, siteUrl } from "./seo.ts";

// IndexNow tells Bing (and so ChatGPT search and Copilot) at once that a
// page changed, instead of waiting for the next crawl. The key proves the
// site is ours: it is served at /indexnow.txt (app/indexnow.txt/route.ts).

const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 5_000;

// The articles a revalidate request names, from its "article:<slug>" tags.
export function articleSlugs(tags: string[]): string[] {
  return tags
    .filter((tag) => tag.startsWith("article:"))
    .map((tag) => tag.slice("article:".length))
    .filter(Boolean);
}

// Both languages of each article, and of the stories list it appears on.
export function indexNowPayload(key: string, slugs: string[]) {
  const site = siteUrl();
  const urls = (pathname: string) => {
    const { en, my } = pageAlternates("en", pathname).languages;
    return [en, my];
  };
  return {
    host: new URL(site).host,
    key,
    keyLocation: `${site}/indexnow.txt`,
    urlList: [
      ...slugs.flatMap((slug) => urls(`/stories/${slug}`)),
      ...urls("/stories"),
    ],
  };
}

// Only the live site pings, and only when it has a key. Never throws: a
// failed ping must not fail the revalidation that triggered it.
export async function pingIndexNow(tags: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY?.trim();
  const slugs = articleSlugs(tags);
  if (process.env.VERCEL_ENV !== "production" || !key || !slugs.length) {
    return;
  }
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowPayload(key, slugs)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(`indexnow: ping refused with ${response.status}`);
    }
  } catch (error) {
    console.warn("indexnow: ping failed", error);
  }
}
