import { expect, expectedAxeRules, test } from "./fixtures";
import { MISSING_ROUTE, PAGES } from "./routes";

// Every public page, in both languages, at both widths, against WCAG 2.2 AA.
for (const { route, path, key } of PAGES) {
  test(`axe: ${key}`, async ({ visit, makeAxeBuilder }, testInfo) => {
    const response = await visit(path);
    expect(response?.status()).toBe(route === MISSING_ROUTE ? 404 : 200);

    const { violations } = await makeAxeBuilder().analyze();
    const summary = violations.map(({ id, impact, nodes }) => ({
      rule: id,
      impact,
      elements: nodes.length,
      targets: nodes.map((node) => node.target.join(" ")),
    }));
    await testInfo.attach("axe-violations.json", {
      body: JSON.stringify({ key, violations: summary }, null, 2),
      contentType: "application/json",
    });

    const found = [...new Set(violations.map(({ id }) => id))].sort();
    expect(
      found,
      `axe rules on ${key} differ from e2e/axe-baseline.json`,
    ).toEqual(expectedAxeRules(key, testInfo.project.name));
  });
}
