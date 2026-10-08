import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("artOfWellness.hero.title"),
  eyebrow: t("common.nav.artOfWellness"),
}));

export { generateImageMetadata };
export default Image;
