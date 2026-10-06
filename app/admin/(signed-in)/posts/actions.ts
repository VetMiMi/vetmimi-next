"use server";

import { redirect } from "next/navigation";
import { mutate, type Outcome } from "@/lib/admin/mutation";
import { listQuery, parseFilters } from "@/lib/admin/posts";
import { adminCall } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { toRows } from "./rows";

type Schemas = components["schemas"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Show more": the next page for the same view and search.
export async function morePosts(
  params: Record<string, string | string[] | undefined>,
  cursor: string,
) {
  const page = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/posts", {
        params: { query: listQuery(parseFilters(params), cursor) },
      }),
    ),
  );
  return { items: await toRows(page.items), nextCursor: page.nextCursor };
}

// "New post" (#150): a draft with the website article switched on, then
// straight into the editor.
export async function createPost(): Promise<Outcome> {
  const outcome = await mutate(
    "/admin/posts",
    (api) =>
      api.POST("/admin/posts", {
        body: {
          title: "Untitled post",
          kind: "insight",
          status: "draft",
          versions: { website: { enabled: true } },
        },
      }),
    { failure: "The post was not created. Nothing was saved." },
  );
  if (outcome.ok) redirect(`/admin/posts/${outcome.data.id}`);
  return outcome;
}

// The editor's save, with the version it was loaded at: a change made
// elsewhere in the meantime comes back as `stale_version`.
export async function savePost(id: string, patch: Schemas["PostPatch"]) {
  if (!UUID.test(id)) throw new Error("Bad post id");
  return mutate(
    `/admin/posts/${id}`,
    (api) =>
      api.PATCH("/admin/posts/{postId}", {
        params: { path: { postId: id } },
        body: patch,
      }),
    {
      failure: "The post was not saved. The last saved version remains.",
      codes: {
        stale_version:
          "This post has changed since you opened it. Your text is still here: copy what you need, then reload to see the latest.",
        invalid_transition:
          "This post has started publishing, so it can no longer be changed. Your text was not saved.",
        slug_taken:
          "Another article already uses this web address. Choose a different one.",
      },
    },
  );
}
