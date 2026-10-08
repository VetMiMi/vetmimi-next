import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("about.hero.title"),
  eyebrow: t("common.nav.about"),
}));

export { generateImageMetadata };
export default Image;
