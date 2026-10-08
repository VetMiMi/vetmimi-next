import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("portfolio.header.title"),
  eyebrow: t("common.nav.portfolio"),
}));

export { generateImageMetadata };
export default Image;
