import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("book.page.title"),
  eyebrow: t("common.nav.book"),
}));

export { generateImageMetadata };
export default Image;
