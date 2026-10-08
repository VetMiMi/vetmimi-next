import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("services.index.title"),
  eyebrow: t("common.nav.services"),
}));

export { generateImageMetadata };
export default Image;
