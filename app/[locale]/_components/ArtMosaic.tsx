import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import growth from "@/assets/artworks/growth-and-becoming.webp";
import loveHopeFaith from "@/assets/artworks/love-hope-faith.webp";
import ulx from "@/assets/artworks/the-ulx-eddington-limit.webp";
import bloom from "@/assets/artworks/bloom.webp";
import driftwood from "@/assets/artworks/driftwood-seascape.webp";
import beGood from "@/assets/artworks/be-good-be-empty-be-equal.webp";

type Tile = {
  /** Key for the alt text in messages/<locale>/home.json (gallery.tiles). */
  id: "growth" | "loveHopeFaith" | "driftwood" | "ulx" | "bloom" | "beGood";
  /** Artwork titles are proper names and stay in English in every language. */
  title: string;
  img: StaticImageData;
  /** The object-position class that keeps the painting's focus in a cropped tile. */
  focus: string;
  /** Grid placement: tall tiles span two rows. */
  place: string;
  sizes: string;
};

// Order matters on phones (2 columns, packed densely):
// Growth | Love·Hope·Faith / Growth | Driftwood / ULX | Bloom / ULX | Be good
const TILES: Tile[] = [
  {
    id: "growth",
    title: "Growth & Becoming",
    img: growth,
    focus: "object-[center_40%]",
    place: "row-span-2 md:col-start-1 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 22vw",
  },
  {
    id: "loveHopeFaith",
    title: "Love · Hope · Faith",
    img: loveHopeFaith,
    focus: "object-[center_45%]",
    place: "md:col-start-2 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
  {
    id: "driftwood",
    title: "Driftwood",
    img: driftwood,
    focus: "object-[center_55%]",
    place: "md:col-start-3 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
  {
    id: "ulx",
    title: "The ULX & Eddington Limit",
    img: ulx,
    focus: "object-[45%_center]",
    place: "row-span-2 md:col-start-4 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 22vw",
  },
  {
    id: "bloom",
    title: "Bloom",
    img: bloom,
    focus: "object-[center_35%]",
    place: "md:col-start-2 md:row-start-2",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
  {
    id: "beGood",
    title: "Be good · Be empty · Be equal",
    img: beGood,
    focus: "object-center",
    place: "md:col-start-3 md:row-start-2",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
];

/** Homepage mosaic of Daw Mi's own artworks. */
export function ArtMosaic() {
  const t = useTranslations("home.gallery.tiles");
  return (
    <div className="grid grid-flow-dense auto-rows-[180px] grid-cols-2 gap-[3px] md:grid-cols-[1.1fr_1.4fr_1.4fr_1.1fr] md:grid-rows-[280px_280px] bg-indigo">
      {TILES.map((tile) => (
        <div
          key={tile.id}
          className={`group relative overflow-hidden ${tile.place}`}
        >
          <Image
            src={tile.img}
            alt={t(`${tile.id}.alt`)}
            fill
            sizes={tile.sizes}
            className={`object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105 ${tile.focus}`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,37,45,0.52)_0%,transparent_55%)]" />
          <div className="absolute bottom-[0.85rem] left-[0.85rem] font-script text-[0.88rem] text-white">
            {tile.title}
          </div>
        </div>
      ))}
    </div>
  );
}
