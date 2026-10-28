import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AA, C } from "@/lib/tokens";
import { ArtMosaic } from "../ArtMosaic";

export function GallerySection() {
  const t = useTranslations("home");
  return (
    <section style={{ background: C.paper, padding: "5rem 0 0" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 1.5rem 2.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--hand)",
                color: AA.label,
                fontSize: "1rem",
                marginBottom: "0.3rem",
              }}
            >
              {t("gallery.eyebrow")}
            </div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                color: C.ink,
                margin: 0,
              }}
            >
              {t("gallery.title")}
            </h2>
          </div>
          <Link
            href="/portfolio"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.88rem",
              color: C.indigo,
              textDecoration: "none",
              borderBottom: `1px solid ${C.indigo}`,
            }}
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
