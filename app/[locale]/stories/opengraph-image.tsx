import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("stories.index.title"),
  eyebrow: t("common.nav.stories"),
}));

export { generateImageMetadata };
export default Image;
