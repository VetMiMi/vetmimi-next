import { pageImage } from "@/app/_og/pageImage";
import { getArticle } from "@/lib/articles";
import { STORIES } from "@/lib/data";

// The same lookup as the story page: a published article's title, else the
// story still written in the messages.
const { generateImageMetadata, Image } = pageImage(
  async (t, { locale, slug }) => {
    const article = await getArticle(locale, slug);
    const story = STORIES.find((item) => item.slug === slug);
    const title =
      article?.title ?? (story && t(`stories.items.${story.slug}.title`));
    return title ? { title, eyebrow: t("common.nav.stories") } : undefined;
  },
);

export { generateImageMetadata };
export default Image;
