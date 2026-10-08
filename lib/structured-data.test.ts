import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  dawMiJsonLd,
  jsonLdText,
  practiceJsonLd,
  serviceJsonLd,
  storyJsonLd,
} from "./structured-data.ts";

const SITE = "https://vetmimi.example";
const saved = process.env.SITE_URL;
beforeEach(() => {
  process.env.SITE_URL = SITE;
});
afterEach(() => {
  if (saved === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = saved;
});

type Node = Record<string, unknown>;

const practice = () =>
  practiceJsonLd("en", {
    description: "A space where creativity and reflection meet.",
    email: "hello@vetmimi.example",
  });
const dawMi = () =>
  dawMiJsonLd("my", {
    jobTitle: "Art Therapist",
    image: "/_next/static/media/portrait.webp",
  });
const service = (href: string) =>
  serviceJsonLd("my", {
    slug: "group-art-wellbeing",
    name: "Group art & wellbeing",
    description: "Make art alongside other people.",
    href,
  });

// Every key anywhere in the object, nested ones included.
function keys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keys);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => [
      key,
      ...keys(child),
    ]);
  }
  return [];
}

describe("structured data", () => {
  it("describes the practice, founded by Daw Mi, with no street address", () => {
    const [site, business] = practice()["@graph"] as Node[];
    assert.equal(site["@type"], "WebSite");
    assert.deepEqual(site.publisher, { "@id": `${SITE}/#practice` });
    assert.equal(business["@type"], "ProfessionalService");
    assert.equal(business["@id"], `${SITE}/#practice`);
    assert.equal(business.url, `${SITE}/`);
    assert.equal((business.founder as Node)["@id"], `${SITE}/#daw-mi`);
    assert.deepEqual(business.address, {
      "@type": "PostalAddress",
      addressLocality: "Sydney",
      addressRegion: "NSW",
      addressCountry: "AU",
    });
  });

  it("describes Daw Mi on the language's About page, working for the practice", () => {
    const person = dawMi();
    assert.equal(person["@type"], "Person");
    assert.equal(person["@id"], `${SITE}/#daw-mi`);
    assert.equal(person.url, `${SITE}/my/about`);
    assert.equal(person.image, `${SITE}/_next/static/media/portrait.webp`);
    assert.equal((person.worksFor as Node)["@id"], `${SITE}/#practice`);
  });

  it("points a service to its booking or enquiry page in the same language", () => {
    const data = service("/contact?service=group-art-wellbeing#enquiry");
    assert.equal(data["@type"], "Service");
    assert.equal(data.url, `${SITE}/my/services/group-art-wellbeing`);
    assert.equal((data.provider as Node)["@id"], `${SITE}/#practice`);
    assert.deepEqual(data.availableChannel, {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE}/my/contact?service=group-art-wellbeing#enquiry`,
    });
  });

  it("credits a story to Daw Mi and the practice, dated only when known", () => {
    const published = storyJsonLd("en", {
      slug: "a-story",
      headline: "A story",
      description: "An excerpt",
      datePublished: "2026-10-01T09:00:00Z",
      image: "https://media.vetmimi.example/cover.jpg",
    });
    assert.equal(published["@type"], "BlogPosting");
    assert.equal(published.datePublished, "2026-10-01T09:00:00Z");
    assert.equal(published.image, "https://media.vetmimi.example/cover.jpg");
    assert.equal((published.author as Node)["@id"], `${SITE}/#daw-mi`);
    assert.equal((published.publisher as Node)["@id"], `${SITE}/#practice`);

    const written = JSON.parse(
      jsonLdText(
        storyJsonLd("en", {
          slug: "a-story",
          headline: "A story",
          description: "An excerpt",
        }),
      ),
    );
    assert.equal("datePublished" in written, false);
    assert.equal("image" in written, false);
  });

  it("never states a price, offer, rating or review", () => {
    const all = [
      practice(),
      dawMi(),
      service("/book"),
      storyJsonLd("en", {
        slug: "s",
        headline: "h",
        description: "d",
      }),
    ].flatMap(keys);
    for (const key of ["offers", "priceRange", "aggregateRating", "review"]) {
      assert.equal(all.includes(key), false, key);
    }
  });

  it("cannot end its script early", () => {
    const text = jsonLdText(
      storyJsonLd("en", {
        slug: "s",
        headline: "</script><script>alert(1)</script>",
        description: "d",
      }),
    );
    assert.equal(text.includes("<"), false);
    assert.equal(
      JSON.parse(text).headline,
      "</script><script>alert(1)</script>",
    );
  });
});
