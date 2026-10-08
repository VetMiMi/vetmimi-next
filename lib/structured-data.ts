import type { Locale } from "../i18n/routing.ts";
import { DAW_MI, PRACTICE, pageAlternates, siteUrl } from "./seo.ts";

// schema.org JSON-LD for the public pages. Every fact arrives from the
// messages, lib/services.ts or lib/seo.ts; this file adds only types, ids
// and URL paths. Never offers, prices, ratings or reviews: fees are not
// public and the site shows no testimonials.

type JsonLdObject = { [key: string]: unknown };

const CONTEXT = "https://schema.org";

const pageUrl = (locale: Locale, pathname: string) =>
  pageAlternates(locale, pathname).canonical;

// Image sources are either the API's absolute URLs or Next's root-relative
// static paths ("/_next/static/media/…").
const absoluteUrl = (src: string) =>
  src.startsWith("/") ? `${siteUrl()}${src}` : src;

// The practice and Daw Mi are described once, on home and About; other
// pages point to them by @id, with the name so each page stands on its own.
const practiceRef = (locale: Locale) => ({
  "@type": "ProfessionalService",
  "@id": `${siteUrl()}/#practice`,
  name: PRACTICE.name,
  url: pageUrl(locale, "/"),
});

const dawMiRef = (locale: Locale) => ({
  "@type": "Person",
  "@id": `${siteUrl()}/#daw-mi`,
  name: DAW_MI.name,
  url: pageUrl(locale, "/about"),
});

// Home FAQ entries (keys of messages/<locale>/home.json faq.items) that stay
// on the page but out of the structured data, so answer engines do not quote
// them as fact.
// - medicare: owner decision 2026-10-08 (#173), until Daw Mi confirms the
//   wording of the Medicare and private health answer.
export const FAQ_EXCLUDED_FROM_STRUCTURED_DATA = ["medicare"];

export type FaqQuestion = { question: string; answer: string };

// The home FAQ as shown on the page, minus the excluded entries.
export function homeFaqQuestions(
  items: Record<string, { q: string; a: string }>,
): FaqQuestion[] {
  return Object.entries(items)
    .filter(([id]) => !FAQ_EXCLUDED_FROM_STRUCTURED_DATA.includes(id))
    .map(([, { q, a }]) => ({ question: q, answer: a }));
}

// The questions and answers a page shows, in the page's language, as nodes
// to spread into its graph: none when the page has no questions.
export function faqPageNodes(
  locale: Locale,
  pathname: string,
  questions: FaqQuestion[],
): JsonLdObject[] {
  if (questions.length === 0) return [];
  const url = pageUrl(locale, pathname);
  return [
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      inLanguage: locale,
      mainEntity: questions.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];
}

// Home: the site, for its name in search results, the practice and the FAQ.
export function practiceJsonLd(
  locale: Locale,
  {
    description,
    email,
    faq,
  }: { description: string; email: string; faq: FaqQuestion[] },
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl()}/#website`,
        name: PRACTICE.name,
        url: pageUrl(locale, "/"),
        inLanguage: locale,
        publisher: { "@id": `${siteUrl()}/#practice` },
      },
      {
        ...practiceRef(locale),
        description,
        email,
        sameAs: [PRACTICE.facebookUrl],
        address: {
          "@type": "PostalAddress",
          addressLocality: PRACTICE.locality,
          addressRegion: PRACTICE.region,
          addressCountry: PRACTICE.country,
        },
        founder: dawMiRef(locale),
      },
      ...faqPageNodes(locale, "/", faq),
    ],
  };
}

// About.
export function dawMiJsonLd(
  locale: Locale,
  { jobTitle, image }: { jobTitle: string; image: string },
): JsonLdObject {
  return {
    "@context": CONTEXT,
    ...dawMiRef(locale),
    jobTitle,
    image: absoluteUrl(image),
    alumniOf: { "@type": "EducationalOrganization", name: DAW_MI.alumniOf },
    memberOf: { "@type": "Organization", name: DAW_MI.memberOf },
    worksFor: practiceRef(locale),
  };
}

// A service page and its questions. `href` is where its main button goes:
// booking for individual sessions, the enquiry form for the others.
export function serviceJsonLd(
  locale: Locale,
  {
    slug,
    name,
    description,
    href,
    questions,
  }: {
    slug: string;
    name: string;
    description: string;
    href: string;
    questions: FaqQuestion[];
  },
): JsonLdObject {
  const pathname = `/services/${slug}`;
  const url = pageUrl(locale, pathname);
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name,
        description,
        url,
        serviceType: PRACTICE.serviceType,
        provider: practiceRef(locale),
        areaServed: { "@type": "Country", name: PRACTICE.countryName },
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: pageUrl(locale, href),
        },
      },
      ...faqPageNodes(locale, pathname, questions),
    ],
  };
}

// A story. Written stories have no exact publication date, so they go
// without one rather than with a guessed one.
export function storyJsonLd(
  locale: Locale,
  {
    slug,
    headline,
    description,
    datePublished,
    image,
  }: {
    slug: string;
    headline: string;
    description: string;
    datePublished?: string;
    image?: string;
  },
): JsonLdObject {
  const url = pageUrl(locale, `/stories/${slug}`);
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: locale,
    datePublished,
    image: image ? absoluteUrl(image) : undefined,
    author: dawMiRef(locale),
    publisher: practiceRef(locale),
  };
}

// For a <script> body: "<" is escaped so a value such as "</script>" cannot
// end the script early.
export function jsonLdText(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
