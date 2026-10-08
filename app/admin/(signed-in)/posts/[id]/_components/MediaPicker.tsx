"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import type { Media } from "@/lib/admin/media";
import type { Draft, SocialChannel } from "@/lib/admin/postDraft";
import { channelNames } from "@/lib/admin/posts";
import { MediaLibrary } from "./MediaLibrary";
import { MediaUpload } from "./MediaUpload";

type Mode = "library" | "upload";

const modes: { id: Mode; label: string }[] = [
  { id: "library", label: "From the library" },
  { id: "upload", label: "Upload new" },
];

// Where an image is chosen for a post (#151): the library or a new upload,
// in a native modal dialog as brief §7 asks. It sits outside the editor's
// form, so Enter in its fields never saves the post.
export function MediaPicker({
  target,
  draft,
  onPick,
  onClose,
}: {
  // Where the image goes; open while set.
  target: "cover" | SocialChannel | undefined;
  draft: Draft;
  onPick: (media: Media) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mode, setMode] = useState<Mode>("library");
  const open = target !== undefined;
  const cover = draft.website.coverImageId;
  const attached =
    target === "cover"
      ? cover
        ? [cover]
        : []
      : target
        ? draft[target].imageIds
        : [];
  const title =
    target === "cover"
      ? "Choose the cover image"
      : target && `Add an image to ${channelNames[target]}`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setMode("library");
    onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={close}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(560px,calc(100%-32px))] max-w-none overflow-y-auto rounded-card bg-white p-[clamp(20px,4vw,44px)] text-ink shadow-lifted backdrop:bg-ink/40"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-[1.35rem]">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="-mt-2 -mr-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink transition-colors duration-150 hover:bg-indigo/12 hover:text-indigo motion-reduce:transition-none"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </div>
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Source"
      >
        {modes.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-input-border px-4 py-2.5 text-[0.82rem] leading-tight text-indigo transition-colors duration-150 hover:bg-indigo/12 aria-pressed:border-indigo aria-pressed:bg-indigo aria-pressed:text-white motion-reduce:transition-none"
          >
            {label}
          </button>
        ))}
      </div>
      {/* Mounted only while open, so each opening starts afresh. */}
      {open &&
        (mode === "library" ? (
          <MediaLibrary
            attached={attached}
            onAttach={onPick}
            onUpload={() => setMode("upload")}
          />
        ) : (
          <MediaUpload onUploaded={onPick} />
        ))}
    </dialog>
  );
}
