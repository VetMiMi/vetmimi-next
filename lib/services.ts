import art3 from "@/assets/image-3.webp";
import art5 from "@/assets/image-5.webp";
import art7 from "@/assets/image-7.webp";
import type { StaticImageData } from "next/image";

export type ServiceSlug =
  "individual-art-therapy" | "group-art-wellbeing" | "workshops-programs";

// All text for a service (name, intro, steps, questions…) lives in
// messages/<locale>/services.json under items.<slug>.
type Service = {
  slug: ServiceSlug;
  image: StaticImageData;
  tone: "rose" | "blue" | "gold";
  /** Where the main call-to-action button goes. */
  href: string;
};

export type ServiceStep = { title: string; text: string };
export type ServicePractical = { title: string; text: string };
export type ServiceQuestion = { question: string; answer: string };

export const services: Service[] = [
  {
    slug: "individual-art-therapy",
    image: art3,
    tone: "rose",
    href: "/book",
  },
  {
    slug: "group-art-wellbeing",
    image: art5,
    tone: "blue",
    href: "/contact",
  },
  {
    slug: "workshops-programs",
    image: art7,
    tone: "gold",
    href: "/contact",
  },
];
