import { pageImage } from "@/app/_og/pageImage";

const { generateImageMetadata, Image } = pageImage(async (t) => ({
  title: t("contact.hero.title"),
  eyebrow: t("common.nav.contact"),
}));

export { generateImageMetadata };
export default Image;
