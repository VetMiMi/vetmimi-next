"use client";

import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import type { Media } from "@/lib/admin/media";
import type { Draft } from "@/lib/admin/postDraft";
import { slugify } from "@/lib/slug";
import { ImageSlot } from "./ImageSlot";
import { MarkdownField } from "./MarkdownField";
import { Switch } from "./Switch";

type Website = Draft["website"];
type Localized = Website["title"];

export const sectionTitle = "mb-6 text-[1.35rem]";

// The website article (ADR-009): its address, title, excerpt and body in
// English and Burmese. Approval needs the address and the English title,
// excerpt and body.
export function WebsiteFields({
  website,
  media,
  editable,
  errors,
  onChange,
  onPickCover,
}: {
  website: Website;
  media: Record<string, Media>;
  editable: boolean;
  errors: Record<string, string>;
  onChange: (patch: Partial<Website>) => void;
  onPickCover: () => void;
}) {
  const err = (field: string) => errors[`versions.website.${field}`];
  const set =
    (field: "title" | "excerpt" | "body", locale: keyof Localized) =>
    (value: string) => {
      const next = { ...website[field], [locale]: value };
      // The address follows the English title until it is typed in.
      const followSlug =
        field === "title" &&
        locale === "en" &&
        website.slug === slugify(website.title.en);
      onChange({
        [field]: next,
        ...(followSlug && { slug: slugify(value) }),
      });
    };

  return (
    <section
      aria-labelledby="website-title"
      className="flex flex-col gap-[22px]"
    >
      <h2 id="website-title" className={`${sectionTitle} mb-0`}>
        Website article
      </h2>
      <Switch
        label="Publish on the website"
        checked={website.enabled}
        onChange={(enabled) => onChange({ enabled })}
      />
      <div className="grid gap-[18px] md:grid-cols-2">
        <Input
          label="Title in English"
          name="versions.website.title.en"
          required={website.enabled}
          value={website.title.en}
          onChange={(event) => set("title", "en")(event.target.value)}
          error={err("title.en")}
        />
        <Input
          label="Title in Burmese"
          name="versions.website.title.my"
          lang="my"
          value={website.title.my}
          onChange={(event) => set("title", "my")(event.target.value)}
          error={err("title.my")}
        />
      </div>
      <Input
        label="Web address"
        name="versions.website.slug"
        required={website.enabled}
        help={`The end of the article's address, e.g. /stories/${website.slug || "colour-and-calm"}.`}
        value={website.slug}
        spellCheck={false}
        onChange={(event) => onChange({ slug: event.target.value })}
        error={err("slug")}
      />
      <div className="grid gap-[18px] md:grid-cols-2">
        <Textarea
          label="Excerpt in English"
          name="versions.website.excerpt.en"
          required={website.enabled}
          help="One or two sentences for article lists and link previews."
          rows={3}
          value={website.excerpt.en}
          onChange={(event) => set("excerpt", "en")(event.target.value)}
          error={err("excerpt.en")}
        />
        <Textarea
          label="Excerpt in Burmese"
          name="versions.website.excerpt.my"
          lang="my"
          help="Shown on the Burmese site; English is used when empty."
          rows={3}
          value={website.excerpt.my}
          onChange={(event) => set("excerpt", "my")(event.target.value)}
          error={err("excerpt.my")}
        />
      </div>
      <MarkdownField
        label="Article in English"
        name="versions.website.body.en"
        required={website.enabled}
        value={website.body.en}
        onChange={set("body", "en")}
        error={err("body.en")}
      />
      <MarkdownField
        label="Article in Burmese"
        name="versions.website.body.my"
        lang="my"
        value={website.body.my}
        onChange={set("body", "my")}
        error={err("body.my")}
      />
      <ImageSlot
        label="Cover image"
        rule="Shown at the top of the article and in link previews."
        ids={website.coverImageId ? [website.coverImageId] : []}
        media={media}
        max={1}
        disabled={!editable}
        onChange={([coverImageId]) => onChange({ coverImageId })}
        onAdd={onPickCover}
      />
    </section>
  );
}
