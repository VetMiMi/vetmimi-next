import Image, { type StaticImageData } from "next/image";
import { C } from "@/lib/tokens";
import growth from "@/assets/artworks/growth-and-becoming.webp";
import loveHopeFaith from "@/assets/artworks/love-hope-faith.webp";
import ulx from "@/assets/artworks/the-ulx-eddington-limit.webp";
import bloom from "@/assets/artworks/bloom.webp";
import driftwood from "@/assets/artworks/driftwood-seascape.webp";
import beGood from "@/assets/artworks/be-good-be-empty-be-equal.webp";

type Tile = {
  title: string;
  alt: string;
  img: StaticImageData;
  /** Which part of the painting stays in frame when the tile crops it. */
  focus: string;
  /** Grid placement: tall tiles span two rows. */
  place: string;
  sizes: string;
};

// Order matters on phones (2 columns, packed densely):
// Growth | Love·Hope·Faith / Growth | Driftwood / ULX | Bloom / ULX | Be good
const TILES: Tile[] = [
  {
    title: "Growth & Becoming",
    alt: "Tall pastel painting of flowing sage, lavender and peach shapes against red",
    img: growth,
    focus: "center 40%",
    place: "row-span-2 md:col-start-1 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 22vw",
  },
  {
    title: "Love · Hope · Faith",
    alt: "Three winding dragons in white, green and pink beneath the words love, hope and faith",
    img: loveHopeFaith,
    focus: "center 45%",
    place: "md:col-start-2 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
  {
    title: "Driftwood",
    alt: "Driftwood reaching over a calm blue shoreline, painted in thick oil",
    img: driftwood,
    focus: "center 55%",
    place: "md:col-start-3 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
  {
    title: "The ULX & Eddington Limit",
    alt: "Portrait of a woman in profile with a pink peony and a blue-and-white vase",
    img: ulx,
    focus: "45% center",
    place: "row-span-2 md:col-start-4 md:row-start-1",
    sizes: "(max-width: 767px) 50vw, 22vw",
  },
  {
    title: "Bloom",
    alt: "Pink peonies in a blue-and-white vase, painted in soft watercolour",
    img: bloom,
    focus: "center 35%",
    place: "md:col-start-2 md:row-start-2",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
  {
    title: "Be good · Be empty · Be equal",
    alt: "A tree with deep roots and a bird, with Burmese and English words: be good, be empty, be equal",
    img: beGood,
    focus: "center",
    place: "md:col-start-3 md:row-start-2",
    sizes: "(max-width: 767px) 50vw, 28vw",
  },
];

/** Homepage mosaic of Daw Mi's own artworks. */
export function ArtMosaic() {
  return (
    <div
      className="grid grid-flow-dense auto-rows-[180px] grid-cols-2 gap-[3px] md:grid-cols-[1.1fr_1.4fr_1.4fr_1.1fr] md:grid-rows-[280px_280px]"
      style={{ background: C.indigo }}
    >
      {TILES.map((tile) => (
        <div
          key={tile.title}
          className={`group relative overflow-hidden ${tile.place}`}
        >
          <Image
            src={tile.img}
            alt={tile.alt}
            fill
            sizes={tile.sizes}
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            style={{ objectPosition: tile.focus }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(40,37,45,0.52) 0%, transparent 55%)",
            }}
          />
          <div
            className="absolute bottom-[0.85rem] left-[0.85rem] text-[0.88rem] text-white"
            style={{ fontFamily: "var(--hand)" }}
          >
            {tile.title}
          </div>
        </div>
      ))}
    </div>
  );
}
