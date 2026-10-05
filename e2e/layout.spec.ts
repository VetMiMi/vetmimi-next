import { baseline, expect, test } from "./fixtures";
import { PAGES } from "./routes";

// Brief §10: "Works at 200% browser zoom and at 320px wide with no
// horizontal scroll". A 320 px desktop window is also 1280 px at 400% zoom.
test.use({ viewport: { width: 320, height: 800 } });
test.skip(({ isMobile }) => isMobile, "one 320 px run is enough");

for (const { path, key } of PAGES) {
  test(`no sideways scroll at 320 px: ${key}`, async ({ page, visit }) => {
    test.fail(baseline.layout.includes(key), "listed in e2e/axe-baseline.json");
    await visit(path);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `${key} is wider than the window`).toBeLessThanOrEqual(
      clientWidth,
    );
  });
}
