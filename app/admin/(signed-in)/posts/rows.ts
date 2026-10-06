import "server-only";
import {
  channelStates,
  type ChannelState,
  type PostSummary,
} from "@/lib/admin/posts";
import { adminCall } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";

export type PostRow = Pick<
  PostSummary,
  "id" | "title" | "kind" | "status" | "scheduledAt" | "updatedAt"
> & { channels: ChannelState[] };

// List rows with each channel's state. A summary names only the enabled
// channels, so a post still publishing (a handful at most: the ones
// waiting to be posted by hand or that failed) is read in full for its
// publications.
export async function toRows(items: PostSummary[]): Promise<PostRow[]> {
  return Promise.all(
    items.map(async (post) => {
      const publications =
        post.status === "publishing"
          ? await adminCall(async (api) =>
              unwrap(
                await api.GET("/admin/posts/{postId}", {
                  params: { path: { postId: post.id } },
                }),
              ),
            ).then((full) => full.publications)
          : [];
      return {
        id: post.id,
        title: post.title,
        kind: post.kind,
        status: post.status,
        scheduledAt: post.scheduledAt,
        updatedAt: post.updatedAt,
        channels: channelStates(post, publications),
      };
    }),
  );
}
