"use client";

import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

export default function PostError({ retry }: { retry: () => void }) {
  return (
    <div className="flex max-w-[660px] flex-col gap-6">
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">Post</h1>
      <Notice tone="error">
        The post could not be loaded. Nothing was changed.
      </Notice>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Button onClick={retry}>Retry</Button>
        <Button href="/admin/posts" variant="quiet">
          Back to posts
        </Button>
      </div>
    </div>
  );
}
