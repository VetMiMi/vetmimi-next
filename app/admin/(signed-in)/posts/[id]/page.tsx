import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { kindNames } from "@/lib/admin/posts";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { PostEditor } from "./_components/PostEditor";

export const metadata: Metadata = { title: "Edit post" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One post and its channel versions (#151).
export default async function PostPage({
  params,
}: PageProps<"/admin/posts/[id]">) {
  if (!(await requireRole("content_editor"))) return <NoAccess />;
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

  return (
    <>
      <PageHeader
        title={post.title}
        description={kindNames[post.kind]}
        breadcrumb={[{ label: "Posts", href: "/admin/posts" }]}
      />
      <PostEditor post={post} />
    </>
  );
}
