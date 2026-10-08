"use server";

import { mutate } from "@/lib/admin/mutation";
import { adminCall } from "@/lib/admin/session";
import {
  suggestedTexts,
  suggestionFailure,
  type Language,
} from "@/lib/admin/suggestions";
import { ApiError, unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";

type Schemas = components["schemas"];
type SocialChannel = Schemas["SocialChannel"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHANNELS: SocialChannel[] = ["facebook", "instagram", "linkedin"];

function check(id: string, channel?: string) {
  if (!UUID.test(id)) throw new Error("Bad id");
  if (channel !== undefined && !CHANNELS.includes(channel as SocialChannel))
    throw new Error("Bad channel");
}

const STALE =
  "This post has changed since you opened it. Reload to see the latest, then try again.";

// The post's workflow steps (#152). Each sends the version the page was
// loaded at, so a change made elsewhere comes back as `stale_version`.
type Step = "submit" | "approve" | "unschedule" | "publish" | "archive";

const stepFailures: Record<Step, string> = {
  submit: "The post was not submitted. It is still a draft.",
  approve: "The post was not approved. It is still in review.",
  unschedule: "The schedule was not cancelled. The post is still scheduled.",
  publish: "The post was not published. Nothing went out.",
  archive: "The post was not archived. Its status has not changed.",
};

const paths = {
  submit: "/admin/posts/{postId}/submit",
  approve: "/admin/posts/{postId}/approve",
  unschedule: "/admin/posts/{postId}/unschedule",
  publish: "/admin/posts/{postId}/publish",
  archive: "/admin/posts/{postId}/archive",
} as const;

export async function postStep(step: Step, id: string, version: number) {
  check(id);
  if (!(step in paths)) throw new Error("Bad step");
  return mutate(
    `/admin/posts/${id}`,
    (api) =>
      api.POST(paths[step], {
        params: { path: { postId: id } },
        body: { version },
      }),
    {
      failure: stepFailures[step],
      codes: {
        stale_version: STALE,
        invalid_transition:
          "This post has moved on since you opened it. Reload to see where it is now.",
        publish_requirements_unmet:
          "The post is not ready to approve yet. It is still in review:",
      },
    },
  );
}

export async function requestChanges(
  id: string,
  version: number,
  note: string,
) {
  check(id);
  return mutate(
    `/admin/posts/${id}`,
    (api) =>
      api.POST("/admin/posts/{postId}/request-changes", {
        params: { path: { postId: id } },
        body: { version, note: note.trim().slice(0, 2000) },
      }),
    {
      failure: "Changes were not requested. The post is still in review.",
      codes: { stale_version: STALE },
    },
  );
}

export async function schedulePost(
  id: string,
  version: number,
  scheduledAt: string,
) {
  check(id);
  if (Number.isNaN(Date.parse(scheduledAt))) throw new Error("Bad time");
  return mutate(
    `/admin/posts/${id}`,
    (api) =>
      api.POST("/admin/posts/{postId}/schedule", {
        params: { path: { postId: id } },
        body: { version, scheduledAt },
      }),
    {
      failure: "The post was not scheduled. Its status has not changed.",
      codes: { stale_version: STALE },
    },
  );
}

// A channel that failed, given three fresh attempts.
export async function retryChannel(id: string, channel: SocialChannel) {
  check(id, channel);
  return mutate(
    `/admin/posts/${id}`,
    (api) =>
      api.POST("/admin/posts/{postId}/channels/{channel}/retry", {
        params: { path: { postId: id, channel } },
      }),
    {
      failure: "The retry did not start. The channel is still marked failed.",
      codes: {
        action_not_allowed:
          "This channel is no longer failed. Reload to see where it is now.",
      },
    },
  );
}

// Copy & open: Daw Mi posted it herself.
export async function markPosted(
  id: string,
  channel: SocialChannel,
  permalink: string,
) {
  check(id, channel);
  const link = permalink.trim();
  return mutate(
    `/admin/posts/${id}`,
    (api) =>
      api.POST("/admin/posts/{postId}/channels/{channel}/mark-posted", {
        params: { path: { postId: id, channel } },
        body: link ? { permalink: link } : {},
      }),
    {
      failure:
        "The channel was not marked as posted. Its status has not changed.",
      codes: {
        invalid_request: "Enter the full link, starting with https://.",
      },
    },
  );
}

// The latest state while channels are still going out.
export async function reloadPost(id: string) {
  check(id);
  return adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/posts/{postId}", {
        params: { path: { postId: id } },
      }),
    ),
  );
}

// "Suggest versions" (#153): the AI assistant's versions of the chosen
// channels, written from the saved website article. Nothing is saved; the
// editor shows them beside the current text. The assistant can take half
// a minute, so this call waits longer than most.
export async function suggestVersions(
  id: string,
  channels: SocialChannel[],
  language: Language,
): Promise<
  | { ok: true; texts: ReturnType<typeof suggestedTexts> }
  | { ok: false; message: string }
> {
  check(id);
  if (channels.length === 0 || channels.some((c) => !CHANNELS.includes(c)))
    throw new Error("Bad channels");
  if (language !== "en" && language !== "my") throw new Error("Bad language");
  try {
    const suggestions = await adminCall(
      async (api) =>
        unwrap(
          await api.POST("/admin/posts/{postId}/suggestions", {
            params: { path: { postId: id } },
            body: { channels, language },
          }),
        ),
      { timeoutMs: 45_000 },
    );
    return { ok: true, texts: suggestedTexts(suggestions) };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return {
      ok: false,
      message: suggestionFailure(
        error.status,
        error.code,
        error.retryAfterSeconds,
      ),
    };
  }
}

// ── Media library ───────────────────────────────────────────────────────

export async function listMedia(q: string, cursor?: string) {
  return adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/media", {
        params: {
          query: {
            ...(q.trim() && { q: q.trim().slice(0, 100) }),
            ...(cursor && { cursor }),
            limit: 24,
          },
        },
      }),
    ),
  );
}

export async function describeMedia(
  id: string,
  version: number,
  alt: { en: string; my: string },
  credit: string,
) {
  check(id);
  return mutate(
    "/admin/posts",
    (api) =>
      api.PATCH("/admin/media/{mediaId}", {
        params: { path: { mediaId: id } },
        body: {
          version,
          alt: { en: alt.en.trim(), my: alt.my.trim() },
          ...(credit.trim() && { credit: credit.trim() }),
        },
      }),
    {
      failure: "The alt text was not saved. The image was not attached.",
      codes: {
        stale_version:
          "This image's description changed elsewhere. Close the library and open it again.",
      },
    },
  );
}

export async function deleteMedia(id: string) {
  check(id);
  return mutate(
    "/admin/posts",
    (api) =>
      api.DELETE("/admin/media/{mediaId}", {
        params: { path: { mediaId: id } },
      }),
    {
      failure: "The image was not deleted. It is still in the library.",
      codes: {
        in_use:
          "A post uses this image, so it was not deleted. Take it out of every post first.",
      },
    },
  );
}
