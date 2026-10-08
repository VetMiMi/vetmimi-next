import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { pageAlternates, siteUrl } from "./seo.ts";

const ENV = ["SITE_URL", "VERCEL_ENV", "VERCEL_PROJECT_PRODUCTION_URL"];
const saved = Object.fromEntries(ENV.map((name) => [name, process.env[name]]));
const setEnv = (values: Record<string, string>) => {
  for (const name of ENV) delete process.env[name];
  Object.assign(process.env, values);
};
afterEach(() => {
  for (const name of ENV) {
    if (saved[name] === undefined) delete process.env[name];
    else process.env[name] = saved[name];
  }
});

describe("site URL", () => {
  it("prefers SITE_URL, without a trailing slash", () => {
    setEnv({
      SITE_URL: "https://vetmimi.example/",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "vetmimi.vercel.app",
    });
    assert.equal(siteUrl(), "https://vetmimi.example");
  });

  it("uses the Vercel production domain in production only", () => {
    setEnv({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "vetmimi.vercel.app",
    });
    assert.equal(siteUrl(), "https://vetmimi.vercel.app");
    setEnv({
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "vetmimi.vercel.app",
    });
    assert.equal(siteUrl(), "http://localhost:3000");
  });

  it("falls back to localhost instead of failing", () => {
    setEnv({ VERCEL_ENV: "production" });
    assert.equal(siteUrl(), "http://localhost:3000");
  });
});

describe("page alternates", () => {
  it("keeps English unprefixed and puts Burmese under /my", () => {
    setEnv({ SITE_URL: "https://vetmimi.example" });
    assert.deepEqual(pageAlternates("my", "/about"), {
      canonical: "https://vetmimi.example/my/about",
      languages: {
        en: "https://vetmimi.example/about",
        my: "https://vetmimi.example/my/about",
        "x-default": "https://vetmimi.example/about",
      },
    });
    assert.equal(
      pageAlternates("en", "/about").canonical,
      "https://vetmimi.example/about",
    );
  });

  it("gives the Burmese home page /my, not /my/", () => {
    setEnv({ SITE_URL: "https://vetmimi.example" });
    const { canonical, languages } = pageAlternates("my", "/");
    assert.equal(canonical, "https://vetmimi.example/my");
    assert.equal(languages.en, "https://vetmimi.example/");
    assert.equal(languages["x-default"], "https://vetmimi.example/");
  });
});
