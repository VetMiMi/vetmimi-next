"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { Textarea } from "@/components/admin/Textarea";
import { useToast } from "@/components/admin/Toast";
import { saveNote } from "../../actions";

const MAX = 2000;

// Daw Mi's own scheduling note (Booking UX §12), kept apart from anything
// the visitor sees. A stale save keeps the typed text so nothing is lost.
export function PrivateNote({
  id,
  version,
  note,
}: {
  id: string;
  version: number;
  note?: string;
}) {
  const [text, setText] = useState(note ?? "");
  const [error, setError] = useState<{ message: string; stale: boolean }>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function save() {
    startTransition(async () => {
      const outcome = await saveNote(id, version, text);
      if (outcome.ok) {
        setError(undefined);
        toast("Note saved");
      } else
        setError({
          message: outcome.message,
          stale: outcome.code === "stale_version",
        });
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-4"
    >
      {error && (
        <div className="flex flex-col gap-3">
          <Notice tone="error">{error.message}</Notice>
          {error.stale && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => {
                setError(undefined);
                router.refresh();
              }}
            >
              Refresh
            </Button>
          )}
        </div>
      )}
      <Textarea
        label="Note for yourself"
        name="adminNote"
        help="Private — never sent to the visitor."
        maxLength={MAX}
        rows={5}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" busy={pending} disabled={text === (note ?? "")}>
          {pending ? "Saving…" : "Save note"}
        </Button>
        <p className="text-[0.82rem] text-muted">
          {text.length.toLocaleString("en-AU")} / 2,000
        </p>
      </div>
    </form>
  );
}
