import art3 from "@/assets/image-3.webp";
import art4 from "@/assets/image-4.webp";
import art5 from "@/assets/image-5.webp";
import art6 from "@/assets/image-6.webp";
import art7 from "@/assets/image-7.webp";
import type { StaticImageData } from "next/image";

export type PortfolioItem = {
  slug: string;
  category: string;
  title: string;
  year: string;
  medium?: string;
  context?: string;
  summary: string;
  role?: string;
  img: StaticImageData;
  featured?: boolean;
};

export type StoryType = "story" | "insight";

export type StorySlug =
  "stop-trying-make-perfect" | "art-and-words" | "creativity-in-healthcare";

// Story text (category, title, subtitle, excerpt, date and body) lives in
// messages/<locale>/stories.json: items.<slug>, subtitles.<slug> and
// bodies.<slug>. A story without a body shows its excerpt instead.
export type Story = {
  slug: StorySlug;
  /** "story" = a real person's lived experience; "insight" = Daw Mi's writing. */
  type: StoryType;
  author: string;
  img: StaticImageData;
  featured?: boolean;
};

export const PORTFOLIO: PortfolioItem[] = [
  {
    slug: "the-ulx-eddington-limit",
    category: "Artwork",
    title: "The ULX & Eddington Limit",
    year: "2023",
    medium: "Mixed media",
    context: "Personal creative practice",
    summary:
      "A mixed-media portrait bringing together a woman, flowers, and references to science.",
    img: art4,
    featured: true,
  },
  {
    slug: "growth-and-becoming",
    category: "Artwork",
    title: "Growth & Becoming",
    year: "[Year to confirm]",
    medium: "Acrylic on canvas",
    summary:
      "Flowing shapes in sage, lavender, and peach against a red background.",
    img: art3,
    featured: true,
  },
  {
    slug: "bloom",
    category: "Artwork",
    title: "Bloom",
    year: "[Year to confirm]",
    medium: "Watercolour",
    summary:
      "Pink peonies in a blue-and-white vase, painted in soft watercolour tones.",
    img: art5,
  },
  {
    slug: "expression",
    category: "Artwork",
    title: "Expression",
    year: "[Year to confirm]",
    medium: "Oil/acrylic",
    summary:
      "A golden face emerging from deep indigo, surrounded by expressive marks and colour.",
    img: art7,
  },
  {
    slug: "life-and-grief-community-diptych",
    category: "Projects & Collaborations",
    title: "Life & Grief — Community Diptych",
    year: "[Year to confirm]",
    medium: "Mixed media collage",
    context: "Community art project [To confirm]",
    role: "[Daw Mi's role — To confirm]",
    summary:
      "A mixed-media diptych exploring the relationship between life and grief through found imagery, colour and texture. Created in a community context.",
    img: art6,
    featured: true,
  },
];

export const STORIES: Story[] = [
  {
    // Prototype for layout purposes. Final stories must preserve the real
    // storyteller's meaning and voice.
    slug: "stop-trying-make-perfect",
    type: "insight",
    author: "Daw Mi",
    img: art5,
    featured: true,
  },
  {
    // Prototype story, layout placeholder only. Final content to be written
    // and approved.
    slug: "art-and-words",
    type: "insight",
    author: "Daw Mi",
    img: art3,
  },
  {
    // Prototype story, layout placeholder only. Final content to be written
    // and approved.
    slug: "creativity-in-healthcare",
    type: "insight",
    author: "Daw Mi",
    img: art7,
  },
];

export const PORTFOLIO_CATEGORIES = [
  "All",
  "Artwork",
  "Workshops & Programs",
  "Exhibitions & Events",
  "Projects & Collaborations",
];
