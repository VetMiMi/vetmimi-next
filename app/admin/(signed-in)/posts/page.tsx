import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return <ComingSoon href="/admin/posts" />;
}
