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

type SourceLink = { href: string; label: string; external?: boolean };

export type Highlight = {
  when: string;
  title: string;
  role: string;
  text: string;
  img: { src: StaticImageData; alt: string };
  links: SourceLink[];
};

// Evidence of Daw Mi's work, each backed by a photo or an outside source.
export const HIGHLIGHTS: Highlight[] = [
  {
    when: "May 2026",
    title: "Human Experience Week, Royal North Shore Hospital",
    role: "Art therapist and artist",
    text: "Three paintings created with patients, visitors and staff, with Daw Mi painting the backgrounds that connect their stories. Unveiled by the hospital’s General Manager.",
    img: {
      src: hewPhoto,
      alt: "Daw Mi kneeling beside one of the three paintings at Royal North Shore Hospital",
    },
    links: [],
  },
  {
    when: "Since 2023",
    title: "The Art of Wellness",
    role: "Co-founder and art therapist",
    text: "Participatory art sessions for patients, carers and staff at Royal North Shore Hospital, part of a NORTH Foundation program.",
    img: {
      src: groupArtwork,
      alt: "A large, colourful group drawing of flowers made during an Art of Wellness session",
    },
    links: [
      { href: "/art-of-wellness", label: "About the program →" },
      {
        href: "https://northfoundation.org.au/projects/the-art-of-wellness/",
        label: "NORTH Foundation ↗",
        external: true,
      },
    ],
  },
  {
    when: "August 2024",
    title: "Published by CECAT",
    role: "Art Therapy Diploma student",
    text: "Her diploma essay, “Overcoming Vicarious Trauma & Discovering Self-compassion”, was shared by CECAT’s director, Robert Gray, with three of her artworks. She is also listed in CECAT’s directory of art therapists.",
    img: {
      src: cecatHillside,
      alt: "Daw Mi’s painting of a figure in yellow sketching beneath bare trees, from her CECAT essay",
    },
    links: [
      {
        href: "https://arttherapycourses.com.au/blogs/all/overcoming-vicarious-trauma-discovering-self-compassion",
        label: "Read the essay ↗",
        external: true,
      },
      {
        href: "https://arttherapycourses.com.au/pages/find-an-art-therapist",
        label: "CECAT directory ↗",
        external: true,
      },
    ],
  },
];

export type Artwork = {
  title: string;
  alt: string;
  img: StaticImageData;
  /** Year, medium or both, only when confirmed. */
  meta?: string;
};

// Daw Mi's own pieces. Driftwood, Sketchbook roses, Painted pot, Garden
// path, The hillside and Red current are working titles; Love · Hope ·
// Faith and Be good · Be empty · Be equal come from the words on the
// paintings. Confirm all with Daw Mi.
export const ARTWORKS: Artwork[] = [
  {
    title: "Love · Hope · Faith",
    alt: "Three winding dragons in white, green and pink beneath the words love, hope and faith",
    img: loveHopeFaith,
    meta: "2026",
  },
  {
    title: "The ULX & Eddington Limit",
    alt: "Portrait of a woman in profile with a pink peony and a blue-and-white vase",
    img: ulx,
    meta: "2023",
  },
  {
    title: "Growth & Becoming",
    alt: "Tall pastel painting of flowing sage, lavender and peach shapes against red",
    img: growth,
  },
  {
    title: "Be good · Be empty · Be equal",
    alt: "A tree with deep roots and a bird, with Burmese and English words: be good, be empty, be equal",
    img: beGood,
  },
  {
    title: "Bloom",
    alt: "Pink peonies in a blue-and-white vase, painted in soft watercolour",
    img: bloom,
  },
  {
    title: "Driftwood",
    alt: "Driftwood reaching over a calm blue shoreline, painted in thick oil",
    img: driftwood,
  },
  {
    title: "Expression",
    alt: "A golden face emerging from deep indigo, surrounded by expressive marks",
    img: expression,
  },
  {
    title: "Sketchbook roses",
    alt: "A sketchbook page of deep red roses with handwritten Burmese notes",
    img: sketchbookRoses,
  },
  {
    title: "Painted pot",
    alt: "A painted plant pot with a pale moon, blue leaves and a watchful eye",
    img: paintedPot,
  },
  {
    title: "The hillside",
    alt: "A figure in yellow sketching beneath bare trees, with golden hills and blue sky",
    img: cecatHillside,
    meta: "From her CECAT essay, 2024",
  },
  {
    title: "Garden path",
    alt: "A painted garden path winding past a tree, a rabbit, fruit and a potted plant",
    img: gardenEasel,
  },
  {
    title: "Dragonfly",
    alt: "A dragonfly drawn in marker and paint over swirling yellow and blue",
    img: dragonfly,
    meta: "2025",
  },
  {
    title: "Immaculata",
    alt: "A pencil portrait of the Virgin Mary with a veil, titled Immaculata",
    img: immaculata,
  },
  {
    title: "Red current",
    alt: "An abstract painting of red spirals and dark marks over green and blue",
    img: cecatRedCurrent,
    meta: "From her CECAT essay, 2024",
  },
];
