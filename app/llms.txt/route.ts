import { getTranslations } from "next-intl/server";
import { loadStories } from "@/lib/articles";
import { buildLlmsText } from "@/lib/llms";
import { DAW_MI, PRACTICE } from "@/lib/seo";
import { services } from "@/lib/services";

// English only: answer engines translate, and every English page links its
// Burmese twin. Refreshed with the stories when an article publishes (the
// article list is tagged "articles"), and hourly in case the API was
// unreachable.
export const revalidate = 3600;

// The public pages after home, with the messages area holding each one's
// title and description.
const PAGES = [
  ["/about", "about"],
  ["/services", "services"],
  ["/art-of-wellness", "artOfWellness"],
  ["/portfolio", "portfolio"],
  ["/stories", "stories"],
  ["/contact", "contact"],
  ["/book", "book"],
  ["/privacy", "legal.privacy"],
  ["/disclaimer", "legal.disclaimer"],
  ["/booking-policy", "legal.bookingPolicy"],
] as const;

export async function GET() {
  const [t, stories] = await Promise.all([
    getTranslations({ locale: "en" }),
    loadStories("en"),
  ]);
  const page = (path: string, title: string, description: string) => ({
    path,
    title,
    description,
  });
  const text = buildLlmsText({
    name: PRACTICE.name,
    // The home title reads "VetMiMi · Art psychotherapy with Daw Mi in Sydney".
    summary: `${t("home.metadata.title").split("·").at(-1)!.trim()}. ${t("home.metadata.description")}`,
    sections: [
      {
        title: `About ${DAW_MI.name}`,
        text: `${t("about.hero.lead")} ${t("about.hero.text")}`,
        items: [
          t("about.background.healthcare.text"),
          t("about.background.training.text"),
          t("about.background.art.text"),
          t("about.background.artOfWellness.text"),
        ],
      },
      {
        title: "Booking and enquiries",
        text: t("services.metadata.description"),
        items: [
          `${t("contact.details.email.label")}: ${t("contact.details.email.value")}`,
          `${t("contact.details.location.label")}: ${t("contact.details.location.value")}`,
          `${t("contact.details.responseTime.label")}: ${t("contact.details.responseTime.value")}`,
        ],
        links: [
          page(
            "/book",
            t("book.metadata.title"),
            t("book.metadata.description"),
          ),
          page(
            "/contact",
            t("contact.metadata.title"),
            t("contact.metadata.description"),
          ),
        ],
      },
      {
        title: "Languages",
        text: `This site is published in ${t("common.language.en")} and ${t("common.language.my")} (Burmese, under /my).`,
      },
      {
        title: "Pages",
        links: [
          page("/", PRACTICE.name, t("home.metadata.description")),
          ...PAGES.map(([path, area]) =>
            page(
              path,
              t(`${area}.metadata.title`),
              t(`${area}.metadata.description`),
            ),
          ),
        ],
      },
      {
        title: "Services",
        links: services.map(({ slug }) =>
          page(
            `/services/${slug}`,
            t(`services.items.${slug}.name`),
            t(`services.items.${slug}.summary`),
          ),
        ),
      },
      {
        title: "Articles",
        links: stories.map((story) =>
          page(`/stories/${story.slug}`, story.title, story.excerpt),
        ),
      },
    ],
  });
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
