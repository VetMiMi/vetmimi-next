import art3 from "@/assets/image-3.webp";
import art5 from "@/assets/image-5.webp";
import art7 from "@/assets/image-7.webp";
import type { StaticImageData } from "next/image";

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
