import { EmptyState } from "@/components/admin/EmptyState";

export default function PostNotFound() {
  return (
    <EmptyState
      title="This post was not found."
      text="It may have been deleted. Posts that went further than a draft are archived, not deleted."
      action={{ label: "Back to posts", href: "/admin/posts" }}
    />
  );
}
