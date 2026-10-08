import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import type { Media } from "@/lib/admin/media";
import { kindNames } from "@/lib/admin/posts";
import { canUse } from "@/lib/admin/roles";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { PostEditor } from "./_components/PostEditor";

export const metadata: Metadata = { title: "Edit post" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The library items the post's versions name. One that has gone is left
// out; the editor shows it as missing and approval names it.
async function mediaOf(post: components["schemas"]["Post"]) {
  const { website, facebook, instagram, linkedin } = post.versions;
  const ids = new Set([
    ...(website?.coverImageId ? [website.coverImageId] : []),
    ...(facebook?.imageIds ?? []),
    ...(instagram?.imageIds ?? []),
    ...(linkedin?.imageIds ?? []),
  ]);
  const found = await Promise.all(
    [...ids].map((mediaId) =>
      adminCall(async (api) =>
        unwrap(
          await api.GET("/admin/media/{mediaId}", {
            params: { path: { mediaId } },
          }),
        ),
      ).catch((error) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }),
    ),
  );
  return found.filter((media): media is Media => media !== null);
}

// Whether "Suggest versions" shows: off when the server has no AI key, and
// off rather than an error page when the status cannot be read.
async function aiStatus() {
  return adminCall(async (api) => unwrap(await api.GET("/admin/ai/status")))
    .then((status) => status.enabled)
    .catch((error) => {
      if (error instanceof ApiError) return false;
      throw error;
    });
}

// One post, its channel versions and its workflow (#151, #152).
export default async function PostPage({
  params,
}: PageProps<"/admin/posts/[id]">) {
  const user = await requireRole("content_editor");
  if (!user) return <NoAccess />;
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const post = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/posts/{postId}", {
        params: { path: { postId: id } },
      }),
    ),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  if (!post) return <NoAccess />;
  const [media, aiEnabled] = await Promise.all([mediaOf(post), aiStatus()]);

  return (
    <>
      <PageHeader
        title={post.title}
        description={kindNames[post.kind]}
        breadcrumb={[{ label: "Posts", href: "/admin/posts" }]}
      />
      <PostEditor
        post={post}
        media={media}
        canReview={canUse(user.roles, ["site_admin"])}
        aiEnabled={aiEnabled}
      />
    </>
  );
}
