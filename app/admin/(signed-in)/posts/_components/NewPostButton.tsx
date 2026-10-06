"use client";

import { useState, useTransition } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { createPost } from "../actions";

// Creates a draft and opens it in the editor; the action redirects there.
export function NewPostButton() {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function create() {
    startTransition(async () => {
      const outcome = await createPost();
      if (!outcome.ok) setError(outcome.message);
    });
  }

  return (
    <div className="flex flex-col gap-3 md:items-end">
      <Button
        size="page"
        busy={pending}
        onClick={create}
        className="max-md:w-full"
        icon={<Plus aria-hidden="true" size={18} />}
      >
        {pending ? "Creating…" : "New post"}
      </Button>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
