// The post editor's working copy (#151): built from the API's post, turned
// back into a save, and checked against the platforms' rules the API
// applies at approval (vetmimi-api internal/content/rules.go). Pure, so
// node:test covers it.
import type { components } from "../api/schema.ts";

type Schemas = components["schemas"];
type Post = Schemas["Post"];
type Localized = { en: string; my: string };

export type SocialChannel = Schemas["SocialChannel"];

export type Draft = {
  title: string;
  kind: Schemas["PostKind"];
  stage?: Schemas["DraftStatus"];
  // True Story consent: confirmed once every item is ticked.
  consent: { checks: boolean[]; note: string };
  website: {
    enabled: boolean;
    slug: string;
    title: Localized;
    excerpt: Localized;
    body: Localized;
    coverImageId?: string;
  };
  // Media library ids, in the order the platform shows them.
  facebook: {
    enabled: boolean;
    text: string;
    link: string;
    imageIds: string[];
  };
  instagram: { enabled: boolean; text: string; imageIds: string[] };
  linkedin: {
    enabled: boolean;
    text: string;
    link: string;
    imageIds: string[];
  };
};

// What the storyteller agreed to, from the True Story workflow in the
// content management requirements. The API keeps one "confirmed" flag.
export const consentChecks = [
  "The storyteller has read and agreed to this wording.",
  "Names and identifying details are removed, or the storyteller agreed to them.",
  "Any image or artwork has its owner's permission.",
];

export const limits = {
  instagram: { characters: 2200, hashtags: 30 },
  linkedin: { characters: 3000 },
} as const;

// The most images each platform takes in one post.
export const imageLimits: Record<SocialChannel, number> = {
  facebook: 10,
  instagram: 10,
  linkedin: 1,
};

// Statuses whose post can still be changed; publishing starts a record.
export const EDITABLE: Post["status"][] = [
  "idea",
  "draft",
  "in_review",
  "approved",
  "scheduled",
];

const localized = (text?: Schemas["LocalizedText"]): Localized => ({
  en: text?.en ?? "",
  my: text?.my ?? "",
});

export function toDraft(post: Post): Draft {
  const { website: w, facebook: f, instagram: i, linkedin: l } = post.versions;
  return {
    title: post.title,
    kind: post.kind,
    ...((post.status === "idea" || post.status === "draft") && {
      stage: post.status,
    }),
    consent: {
      checks: consentChecks.map(() => post.consent.confirmed),
      note: post.consent.note ?? "",
    },
    website: {
      enabled: w?.enabled ?? false,
      slug: w?.slug ?? "",
      title: localized(w?.title),
      excerpt: localized(w?.excerpt),
      body: localized(w?.body),
      ...(w?.coverImageId && { coverImageId: w.coverImageId }),
    },
    facebook: {
      enabled: f?.enabled ?? false,
      text: f?.text ?? "",
      link: f?.link ?? "",
      imageIds: f?.imageIds ?? [],
    },
    instagram: {
      enabled: i?.enabled ?? false,
      text: i?.caption ?? "",
      imageIds: i?.imageIds ?? [],
    },
    linkedin: {
      enabled: l?.enabled ?? false,
      text: l?.text ?? "",
      link: l?.link ?? "",
      imageIds: l?.imageIds ?? [],
    },
  };
}

// The working copy after a save: what the API now holds, keeping the
// consent ticks of a story not yet confirmed, which the API does not store
// one by one.
export function afterSave(sent: Draft, post: Post): Draft {
  const next = toDraft(post);
  return post.consent.confirmed
    ? next
    : { ...next, consent: { ...next.consent, checks: sent.consent.checks } };
}

// Only what was written: an empty language or field is left out, which
// clears it.
const filled = (text: Localized) => {
  const en = text.en.trim() ? text.en : "";
  const my = text.my.trim() ? text.my : "";
  return { ...(en && { en }), ...(my && { my }) };
};
const optional = <K extends string>(key: K, value: string) =>
  (value.trim() ? { [key]: value.trim() } : {}) as Partial<Record<K, string>>;

// The save. A channel named in `versions` replaces that version whole, so
// what this editor does not change yet (the SEO fields) is carried over
// from the post as loaded.
export function toPatch(
  draft: Draft,
  post: Post,
  version: number,
): Schemas["PostPatch"] {
  const w = post.versions.website;
  const { website, facebook: f, instagram: i, linkedin: l } = draft;
  return {
    version,
    title: draft.title.trim(),
    kind: draft.kind,
    ...(draft.stage && { status: draft.stage }),
    ...(draft.kind === "true_story" && {
      consent: {
        confirmed: draft.consent.checks.every(Boolean),
        ...optional("note", draft.consent.note),
      },
    }),
    versions: {
      website: {
        enabled: website.enabled,
        ...optional("slug", website.slug),
        title: filled(website.title),
        excerpt: filled(website.excerpt),
        body: filled(website.body),
        ...(website.coverImageId && { coverImageId: website.coverImageId }),
        ...(w?.seoTitle && { seoTitle: w.seoTitle }),
        ...(w?.seoDescription && { seoDescription: w.seoDescription }),
      },
      facebook: {
        enabled: f.enabled,
        ...optional("text", f.text),
        ...optional("link", f.link),
        imageIds: f.imageIds,
      },
      instagram: {
        enabled: i.enabled,
        ...optional("caption", i.text),
        imageIds: i.imageIds,
      },
      linkedin: {
        enabled: l.enabled,
        ...optional("text", l.text),
        ...optional("link", l.link),
        imageIds: l.imageIds,
      },
    },
  };
}

// Characters as the API counts them: code points, so an emoji is one.
export const characterCount = (text: string) => [...text].length;

const HASHTAG = /#[\p{L}\p{N}_]+/gu;
export const hashtagCount = (text: string) => text.match(HASHTAG)?.length ?? 0;

// Text split into plain runs and hashtags, for the previews.
export function hashtagRuns(text: string) {
  return text
    .split(/(#[\p{L}\p{N}_]+)/u)
    .filter(Boolean)
    .map((run) => ({ run, tag: /^#[\p{L}\p{N}_]+$/u.test(run) }));
}

// What still stands between the post and approval, in the order the
// editor shows it. Drafts may break these; approval may not.
export function readiness(draft: Draft) {
  const problems: string[] = [];
  if (draft.kind === "true_story" && !draft.consent.checks.every(Boolean))
    problems.push("True Story: tick every consent item.");
  const { website: w, facebook: f, instagram: i, linkedin: l } = draft;
  if (w.enabled) {
    if (!w.slug.trim()) problems.push("Website: add the web address.");
    if (!w.title.en.trim()) problems.push("Website: add the English title.");
    if (!w.excerpt.en.trim())
      problems.push("Website: add the English excerpt.");
    if (!w.body.en.trim()) problems.push("Website: write the English article.");
  }
  if (f.enabled && !f.text.trim()) problems.push("Facebook: write the post.");
  if (i.enabled) {
    if (i.imageIds.length === 0)
      problems.push("Instagram: needs at least one image.");
    if (characterCount(i.text) > limits.instagram.characters)
      problems.push("Instagram: the caption is over 2,200 characters.");
    if (hashtagCount(i.text) > limits.instagram.hashtags)
      problems.push("Instagram: the caption has more than 30 hashtags.");
  }
  if (l.enabled) {
    if (!l.text.trim()) problems.push("LinkedIn: write the post.");
    if (characterCount(l.text) > limits.linkedin.characters)
      problems.push("LinkedIn: the post is over 3,000 characters.");
  }
  if (!w.enabled && !f.enabled && !i.enabled && !l.enabled)
    problems.push("Turn on at least one channel.");
  return problems;
}
