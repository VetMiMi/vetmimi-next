import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Response } from "@playwright/test";
import baselineFile from "./axe-baseline.json";

// WCAG 2.2 level AA, the bar brief §10 sets for every public page.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Known failures, each with a note naming the issue that fixes it. A check
// fails both when something new breaks and when a listed failure no longer
// happens, so every fix must also shrink this file.
type Baseline = {
  /** "<route> <locale>" → axe rule ids, in both projects. A key ending in
   * " desktop" or " mobile" holds rules that occur in that project only. */
  axe: Record<string, string[]>;
  /** Why each "axe" entry is still allowed, and the issue that removes it. */
  notes: Record<string, string>;
  /** Titles of keyboard.spec.ts tests that fail today. */
  keyboard: string[];
  /** "<route> <locale>" keys that scroll sideways at 320 px today. */
  layout: string[];
};

export const baseline: Baseline = baselineFile;

/** The axe rule ids the baseline expects for one page in one project. */
export function expectedAxeRules(key: string, project: string): string[] {
  const rules = [
    ...(baseline.axe[key] ?? []),
    ...(baseline.axe[`${key} ${project}`] ?? []),
  ];
  return [...new Set(rules)].sort();
}

type Fixtures = {
  /** Opens a path and waits until React has hydrated the header, so
   * keyboard input reaches the client components. */
  visit: (path: string) => Promise<Response | null>;
  /** An axe scan of the current page against WCAG 2.2 AA. */
  makeAxeBuilder: () => AxeBuilder;
};

// Playwright calls the fixture callback "use"; it is named "provide" here
// because the React Hooks lint rule treats any call to use() as a hook.
export const test = base.extend<Fixtures>({
  visit: async ({ page }, provide) => {
    await provide(async (path) => {
      const response = await page.goto(path);
      await page.waitForFunction(() => {
        const toggle = document.querySelector(
          'button[aria-controls="mobile-navigation"]',
        );
        return (
          toggle !== null &&
          Object.keys(toggle).some((key) => key.startsWith("__reactProps"))
        );
      });
      return response;
    });
  },
  makeAxeBuilder: async ({ page }, provide) => {
    await provide(() => new AxeBuilder({ page }).withTags(WCAG_TAGS));
  },
});

export { expect };
