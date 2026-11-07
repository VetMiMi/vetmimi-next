import { pageImage } from "@/app/_og/pageImage";
import { getArticle } from "@/lib/articles";

const { generateImageMetadata, Image } = pageImage(
  async (t, { locale, slug }) => {
    const article = await getArticle(locale, slug);
    return article
      ? { title: article.title, eyebrow: t("common.nav.stories") }
      : undefined;
  },
);

export { generateImageMetadata };
export default Image;
