import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArtMosaic } from "../ArtMosaic";

export function GallerySection() {
  const t = useTranslations("home");
  return (
    <section className="bg-paper pt-20">
      <div className="mx-auto max-w-[1240px] px-6 pb-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-[0.3rem] font-script text-[1rem] text-label">
              {t("gallery.eyebrow")}
            </div>
            <h2 className="text-[clamp(1.7rem,3vw,2.4rem)] text-ink">
              {t("gallery.title")}
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="border-b border-indigo font-body text-[0.88rem] text-indigo no-underline"
          >
            {t("gallery.link")}
          </Link>
        </div>
      </div>

      {/* Mosaic of Daw Mi's own artworks */}
      <ArtMosaic />
    </section>
  );
}
