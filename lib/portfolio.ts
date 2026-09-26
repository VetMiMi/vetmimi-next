import type { StaticImageData } from "next/image";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";
import groupArtwork from "@/assets/art-of-wellness/group-artwork.webp";
import loveHopeFaith from "@/assets/artworks/love-hope-faith.webp";
import ulx from "@/assets/artworks/the-ulx-eddington-limit.webp";
import growth from "@/assets/artworks/growth-and-becoming.webp";
import bloom from "@/assets/artworks/bloom.webp";
import beGood from "@/assets/artworks/be-good-be-empty-be-equal.webp";
import driftwood from "@/assets/artworks/driftwood-seascape.webp";
import expression from "@/assets/image-7.webp";
import sketchbookRoses from "@/assets/artworks/sketchbook-roses.webp";
import paintedPot from "@/assets/artworks/painted-pot.webp";
import gardenEasel from "@/assets/artworks/garden-easel.webp";
import immaculata from "@/assets/artworks/immaculata.webp";
import dragonfly from "@/assets/artworks/dragonfly-michael.webp";
import cecatHillside from "@/assets/artworks/cecat-hillside.webp";
import cecatRedCurrent from "@/assets/artworks/cecat-red-current.webp";

// Text for these lists lives in messages/<locale>/portfolio.json, keyed by
// the ids below. Artwork titles are proper titles, so they stay here in
// English for both languages.

export type HighlightId = "humanExperienceWeek" | "artOfWellness" | "cecat";
export type HighlightLinkId =
  "aboutProgram" | "northFoundation" | "readEssay" | "cecatDirectory";

type SourceLink = { href: string; label: HighlightLinkId; external?: boolean };

export type Highlight = {
  id: HighlightId;
  img: StaticImageData;
  links: SourceLink[];
};

// Evidence of Daw Mi's work, each backed by a photo or an outside source.
export const HIGHLIGHTS: Highlight[] = [
  { id: "humanExperienceWeek", img: hewPhoto, links: [] },
  {
    id: "artOfWellness",
    img: groupArtwork,
    links: [
      { href: "/art-of-wellness", label: "aboutProgram" },
      {
        href: "https://northfoundation.org.au/projects/the-art-of-wellness/",
        label: "northFoundation",
        external: true,
      },
    ],
  },
  {
    id: "cecat",
    img: cecatHillside,
    links: [
      {
        href: "https://arttherapycourses.com.au/blogs/all/overcoming-vicarious-trauma-discovering-self-compassion",
        label: "readEssay",
        external: true,
      },
      {
        href: "https://arttherapycourses.com.au/pages/find-an-art-therapist",
        label: "cecatDirectory",
        external: true,
      },
    ],
  },
];

export type ArtworkId =
  | "loveHopeFaith"
  | "ulxEddingtonLimit"
  | "growthAndBecoming"
  | "beGood"
  | "bloom"
  | "driftwood"
  | "expression"
  | "sketchbookRoses"
  | "paintedPot"
  | "hillside"
  | "gardenPath"
  | "dragonfly"
  | "immaculata"
  | "redCurrent";

export type Artwork = {
  id: ArtworkId;
  title: string;
  img: StaticImageData;
  /** Year, only when confirmed. */
  year?: string;
  /** Shown as "From her CECAT essay, {year}". */
  fromCecatEssay?: boolean;
};

// Daw Mi's own pieces. Driftwood, Sketchbook roses, Painted pot, Garden
// path, The hillside and Red current are working titles; Love · Hope ·
// Faith and Be good · Be empty · Be equal come from the words on the
// paintings. Confirm all with Daw Mi.
export const ARTWORKS: Artwork[] = [
  {
    id: "loveHopeFaith",
    title: "Love · Hope · Faith",
    img: loveHopeFaith,
    year: "2026",
  },
  {
    id: "ulxEddingtonLimit",
    title: "The ULX & Eddington Limit",
    img: ulx,
    year: "2023",
  },
  { id: "growthAndBecoming", title: "Growth & Becoming", img: growth },
  { id: "beGood", title: "Be good · Be empty · Be equal", img: beGood },
  { id: "bloom", title: "Bloom", img: bloom },
  { id: "driftwood", title: "Driftwood", img: driftwood },
  { id: "expression", title: "Expression", img: expression },
  { id: "sketchbookRoses", title: "Sketchbook roses", img: sketchbookRoses },
  { id: "paintedPot", title: "Painted pot", img: paintedPot },
  {
    id: "hillside",
    title: "The hillside",
    img: cecatHillside,
    year: "2024",
    fromCecatEssay: true,
  },
  { id: "gardenPath", title: "Garden path", img: gardenEasel },
  { id: "dragonfly", title: "Dragonfly", img: dragonfly, year: "2025" },
  { id: "immaculata", title: "Immaculata", img: immaculata },
  {
    id: "redCurrent",
    title: "Red current",
    img: cecatRedCurrent,
    year: "2024",
    fromCecatEssay: true,
  },
];
