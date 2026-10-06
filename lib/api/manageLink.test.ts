import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { it } from "node:test";

// The management link as the API's emails build it (vetmimi-api
// internal/comms/render_data.go sitePath): English at the site root, other
// languages under their prefix. Renaming the page's route segment breaks
// every link already sent, so this fails first.
const sitePath = (site: string, locale: string, path: string) =>
  (locale === "en" ? site : `${site}/${locale}`) + path;

const TOKEN = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_AbCdE";

it("resolves the emailed management link to the manage page", () => {
  for (const locale of ["en", "my"]) {
    const { pathname } = new URL(
      sitePath("https://vetmimi.example", locale, `/manage/${TOKEN}`),
    );
    // next-intl's "as-needed" prefix: /my/… is Burmese, anything else English.
    const segments = pathname.split("/").filter(Boolean);
    const route = segments[0] === "my" ? segments.slice(1) : segments;
    assert.deepEqual(route, ["manage", TOKEN]);
    assert.ok(existsSync(`app/[locale]/${route[0]}/[token]/page.tsx`));
  }
});
