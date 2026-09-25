import art3 from "@/assets/image-3.webp";
import art4 from "@/assets/image-4.webp";
import art5 from "@/assets/image-5.webp";
import art6 from "@/assets/image-6.webp";
import art7 from "@/assets/image-7.webp";
import type { StaticImageData } from "next/image";

export type PortfolioItem = {
  slug: string; category: string; title: string; year: string;
  medium?: string; context?: string; summary: string; role?: string;
  img: StaticImageData; featured?: boolean;
};

export type Story = {
  slug: string; category: string; title: string; subtitle?: string;
  excerpt: string; author: string; date: string; img: StaticImageData; featured?: boolean;
  body?: string;
};

export const PORTFOLIO: PortfolioItem[] = [
  {
    slug: "the-ulx-eddington-limit",
    category: "Artwork",
    title: "The ULX & Eddington Limit",
    year: "2023",
    medium: "Mixed media",
    context: "Personal creative practice",
    summary: "A mixed-media portrait bringing together a woman, flowers, and references to science.",
    img: art4,
    featured: true,
  },
  {
    slug: "growth-and-becoming",
    category: "Artwork",
    title: "Growth & Becoming",
    year: "[Year to confirm]",
    medium: "Acrylic on canvas",
    summary: "Flowing shapes in sage, lavender, and peach against a red background.",
    img: art3,
    featured: true,
  },
  {
    slug: "bloom",
    category: "Artwork",
    title: "Bloom",
    year: "[Year to confirm]",
    medium: "Watercolour",
    summary: "Pink peonies in a blue-and-white vase, painted in soft watercolour tones.",
    img: art5,
  },
  {
    slug: "expression",
    category: "Artwork",
    title: "Expression",
    year: "[Year to confirm]",
    medium: "Oil/acrylic",
    summary: "A golden face emerging from deep indigo, surrounded by expressive marks and colour.",
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
    summary: "A mixed-media diptych exploring the relationship between life and grief through found imagery, colour and texture. Created in a community context.",
    img: art6,
    featured: true,
  },
];

export const STORIES: Story[] = [
  {
    slug: "stop-trying-make-perfect",
    category: "Reflections",
    title: "What happens when we stop trying to make it perfect?",
    subtitle: "A reflection on making space for curiosity before answers",
    excerpt: "A reflection on creating without needing an answer first. What opens up when the pressure to get it right is set aside for a while.",
    author: "Daw Mi",
    date: "October 2025",
    img: art5,
    featured: true,
    body: `Some experiences arrive before we have the words for them. This reflection begins with noticing what changed when there was permission to make first and explain later.

In a session, someone once picked up a piece of paper and tore it. Not in frustration — in curiosity. They held the edges and looked at what the tear had made. It had not been planned. It had just happened.

What followed was a conversation that could not have started any other way.

There did not have to be a perfect answer. There only had to be a place to start.

[This story is a prototype for layout purposes. Final stories must preserve the real storyteller's meaning and voice.]`,
  },
  {
    slug: "art-and-words",
    category: "Art & Wellbeing",
    title: "When art holds what words cannot carry",
    excerpt: "Sometimes the things we most need to say do not arrive as sentences. They arrive as colour, weight, pressure on paper.",
    author: "Daw Mi",
    date: "September 2025",
    img: art3,
    body: `[Prototype story — layout placeholder only. Final content to be written and approved.]\n\nThis is a space for the full story text. Reading width is constrained to 680–760px for comfortable reading.`,
  },
  {
    slug: "creativity-in-healthcare",
    category: "Art of Wellness & Project Updates",
    title: "What creativity can bring into a healthcare space",
    excerpt: "A reflection on what happens when art is offered in places of waiting, uncertainty and care.",
    author: "Daw Mi",
    date: "August 2025",
    img: art7,
    body: `[Prototype story — layout placeholder only. Final content to be written and approved.]`,
  },
];

export const PORTFOLIO_CATEGORIES = ["All", "Artwork", "Workshops & Programs", "Exhibitions & Events", "Projects & Collaborations"];
export const STORY_CATEGORIES = ["All", "True Stories", "Reflections", "Art & Wellbeing", "Art Psychotherapy", "Art of Wellness & Project Updates"];
