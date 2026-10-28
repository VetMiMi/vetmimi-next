import type { LocalizedText } from "./shared.ts";

// ── Posts ─────────────────────────────────────────────────────────────

export type PostKind = "insight" | "true_story" | "announcement";

export type PostStatus =
  | "idea"
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "archived";

export type DraftStatus = "idea" | "draft";

export type SocialChannel = "facebook" | "instagram" | "linkedin";

export type Channel = "website" | SocialChannel;

export type PublicationStatus =
  "pending" | "publishing" | "published" | "failed" | "manual";

type WebsiteVersion = {
  enabled: boolean;
  slug?: string;
  title?: LocalizedText;
  excerpt?: LocalizedText;
  body?: LocalizedText;
  coverImageId?: string;
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
};

type FacebookVersion = {
  enabled: boolean;
  text?: string;
  link?: string;
  imageIds?: string[];
};

type InstagramVersion = {
  enabled: boolean;
  caption?: string;
  imageIds?: string[];
};

type LinkedInVersion = FacebookVersion;

type PostVersions = {
  website?: WebsiteVersion;
  facebook?: FacebookVersion;
  instagram?: InstagramVersion;
  linkedin?: LinkedInVersion;
};

type Consent = {
  confirmed: boolean;
  note?: string;
  confirmedAt?: string;
  confirmedBy?: string;
};

export type Publication = {
  channel: Channel;
  status: PublicationStatus;
  externalId?: string;
  permalink?: string;
  error?: string;
  attempts: number;
  publishedAt?: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  title: string;
  kind: PostKind;
  status: PostStatus;
  scheduledAt?: string;
  consent: Consent;
  reviewNote?: string;
  authorId?: string;
  approvedAt?: string;
  approvedBy?: string;
  publishedAt?: string;
  versions: PostVersions;
  publications: Publication[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type PostPatch = {
  version: number;
  title?: string;
  kind?: PostKind;
  status?: DraftStatus;
  consent?: { confirmed: boolean; note?: string };
  versions?: PostVersions;
};

export type PostSummary = {
  id: string;
  title: string;
  kind: PostKind;
  status: PostStatus;
  scheduledAt?: string;
  channels: Channel[];
  publications: { channel: Channel; status: PublicationStatus }[];
  publishedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

// ── AI assistant ──────────────────────────────────────────────────────

export type SuggestionLanguage = "en" | "my";

export type PostSuggestions = {
  facebook?: { text: string };
  instagram?: { caption: string; hashtags: string[] };
  linkedin?: { text: string };
  website?: {
    language: SuggestionLanguage;
    title: string;
    excerpt: string;
    body: string;
  };
};

// ── Media and public articles ─────────────────────────────────────────

type ImageSize = { width: number; url: string };

export type Media = {
  id: string;
  width: number;
  height: number;
  byteSize: number;
  alt?: LocalizedText;
  credit?: string;
  sizes: ImageSize[];
  uploadedBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicImage = {
  id: string;
  alt: string;
  width: number;
  height: number;
  sizes: ImageSize[];
};

export type PublicArticleSummary = {
  slug: string;
  kind: PostKind;
  title: string;
  excerpt: string;
  coverImage?: PublicImage;
  publishedAt: string;
};

export type PublicArticle = PublicArticleSummary & {
  body: string;
  seoTitle: string;
  seoDescription: string;
};
