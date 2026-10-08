import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("home.hero.title"),
}));

export { generateImageMetadata };
export default Image;
