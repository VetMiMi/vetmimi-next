import { pageImage } from "@/app/_og/pageImage";
import { services } from "@/lib/services";

const { generateImageMetadata, Image } = pageImage(async (t, { slug }) => {
  const service = services.find((item) => item.slug === slug);
  return (
    service && {
      title: t(`services.items.${service.slug}.name`),
      eyebrow: t("common.nav.services"),
    }
  );
});

export { generateImageMetadata };
export default Image;
