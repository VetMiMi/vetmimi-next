import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { components } from "../api/schema.ts";
import {
  characterCount,
  hashtagCount,
  hashtagRuns,
  readiness,
  toDraft,
  toPatch,
} from "./postDraft.ts";

type Post = components["schemas"]["Post"];

const post = (patch: Partial<Post> = {}): Post => ({
  id: "0b6f7c1e-2d3a-4b5c-9d8e-7f6a5b4c3d2e",
  title: "Colour and calm",
  kind: "insight",
  status: "draft",
  consent: { confirmed: false },
  versions: {
    website: {
      enabled: true,
      slug: "colour-and-calm",
      title: { en: "Colour and calm" },
      body: { en: "Hello", my: "  " },
      coverImageId: "11111111-2222-4333-8444-555555555555",
      seoTitle: { en: "SEO" },
    },
    instagram: {
      enabled: true,
      caption: "Hi #art",
      imageIds: ["aaaaaaaa-2222-4333-8444-555555555555"],
    },
  },
  publications: [],
  version: 3,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
  ...patch,
});

describe("post draft", () => {
  it("round-trips and keeps what the editor does not change", () => {
    const loaded = post();
    const patch = toPatch(toDraft(loaded), loaded, 3);
    assert.equal(patch.version, 3);
    assert.equal(patch.status, "draft");
    assert.equal(patch.consent, undefined);
    assert.deepEqual(patch.versions?.website, {
      enabled: true,
      slug: "colour-and-calm",
      title: { en: "Colour and calm" },
      excerpt: {},
      body: { en: "Hello" },
      coverImageId: "11111111-2222-4333-8444-555555555555",
      seoTitle: { en: "SEO" },
    });
    assert.deepEqual(patch.versions?.instagram, {
      enabled: true,
      caption: "Hi #art",
      imageIds: ["aaaaaaaa-2222-4333-8444-555555555555"],
    });
    assert.deepEqual(patch.versions?.facebook, {
      enabled: false,
      imageIds: [],
    });
  });

  it("sends the images and cover as edited", () => {
    const loaded = post();
    const draft = toDraft(loaded);
    draft.website.coverImageId = undefined;
    draft.instagram.imageIds = ["b", "a"];
    draft.linkedin.imageIds = ["c"];
    const patch = toPatch(draft, loaded, 3);
    assert.equal(patch.versions?.website?.coverImageId, undefined);
    assert.deepEqual(patch.versions?.instagram?.imageIds, ["b", "a"]);
    assert.deepEqual(patch.versions?.linkedin?.imageIds, ["c"]);
  });

  it("sends no stage after review and consent only for a True Story", () => {
    const loaded = post({ status: "approved", kind: "true_story" });
    const draft = toDraft(loaded);
    draft.consent.checks = [true, true, false];
    draft.consent.note = " Signed form in the client folder ";
    const patch = toPatch(draft, loaded, 4);
    assert.equal(patch.status, undefined);
    assert.deepEqual(patch.consent, {
      confirmed: false,
      note: "Signed form in the client folder",
    });
    draft.consent.checks = [true, true, true];
    assert.equal(toPatch(draft, loaded, 4).consent?.confirmed, true);
  });
});

describe("platform rules", () => {
  it("counts characters and hashtags as the API does", () => {
    assert.equal(characterCount("🎨 art"), 5);
    assert.equal(hashtagCount("#art #ArtTherapy #မြန်မာ # #_ok"), 4);
    assert.deepEqual(hashtagRuns("Hi #art!"), [
      { run: "Hi ", tag: false },
      { run: "#art", tag: true },
      { run: "!", tag: false },
    ]);
  });

  it("lists what blocks approval", () => {
    const draft = toDraft(post({ kind: "true_story" }));
    draft.instagram.text = "#a ".repeat(31) + "x".repeat(2200);
    draft.instagram.imageIds = [];
    draft.linkedin = { enabled: true, text: "", link: "", imageIds: [] };
    assert.deepEqual(readiness(draft), [
      "True Story: tick every consent item.",
      "Website: add the English excerpt.",
      "Instagram: needs at least one image.",
      "Instagram: the caption is over 2,200 characters.",
      "Instagram: the caption has more than 30 hashtags.",
      "LinkedIn: write the post.",
    ]);
  });

  it("needs a channel", () => {
    const draft = toDraft(post({ versions: {} }));
    assert.deepEqual(readiness(draft), ["Turn on at least one channel."]);
  });
});
