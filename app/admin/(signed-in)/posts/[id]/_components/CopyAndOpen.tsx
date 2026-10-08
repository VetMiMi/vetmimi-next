"use client";

import { useState, useTransition } from "react";
import { ArrowSquareOut, DownloadSimple } from "@phosphor-icons/react";
import { buttonClass } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Input } from "@/components/admin/Input";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import { largest, type Media } from "@/lib/admin/media";
import type { SocialChannel } from "@/lib/admin/postDraft";
import { channelNames } from "@/lib/admin/posts";
import { copyText, imageIdsOf, platformHome } from "@/lib/admin/postWorkflow";
import type { components } from "@/lib/api/schema";
import { markPosted } from "../actions";
import { MediaThumb } from "./MediaThumb";

type Post = components["schemas"]["Post"];

const stepTitle = "mb-2 font-semibold text-ink";

// Copy & open (#152): when a channel is not connected or failed, Daw Mi
// posts it herself. The text goes to the clipboard as the platform opens
// in a new tab, the images are listed to download in order, and then she
// marks it posted, with the post's address if she has it.
export function CopyAndOpen({
  post,
  channel,
  media,
  onClose,
  onChange,
}: {
  post: Post;
  channel: SocialChannel | undefined;
  media: Record<string, Media>;
  onClose: () => void;
  onChange: (post: Post) => void;
}) {
  const [copied, setCopied] = useState<"yes" | "no">();
  const [link, setLink] = useState("");
  const [error, setError] = useState<{ message: string; field?: string }>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const name = channel ? channelNames[channel] : "";
  const text = channel ? copyText(post, channel) : "";
  const images = channel
    ? imageIdsOf(post, channel).flatMap((id) => media[id] ?? [])
    : [];

  function close() {
    setCopied(undefined);
    setLink("");
    setError(undefined);
    onClose();
  }

  // Started in the click itself, before the new tab takes focus.
  function copy() {
    navigator.clipboard.writeText(text).then(
      () => setCopied("yes"),
      () => setCopied("no"),
    );
  }

  function confirm() {
    if (!channel) return;
    if (link.trim() && !/^https?:\/\/\S+$/.test(link.trim())) {
      const message = "Enter the full link, starting with https://.";
      setError({ message, field: message });
      return;
    }
    startTransition(async () => {
      const outcome = await markPosted(post.id, channel, link);
      if (outcome.ok) {
        onChange(outcome.data);
        close();
        toast(`${name} marked as posted`);
      } else {
        setError({
          message: outcome.message,
          field: outcome.fieldErrors.permalink && outcome.message,
        });
      }
    });
  }

  return (
    <Dialog
      open={channel !== undefined}
      onClose={close}
      title={`Post on ${name} yourself`}
      confirmLabel="Mark as posted"
      busyLabel="Saving…"
      cancelLabel="Close"
      busy={pending}
      onConfirm={confirm}
    >
      <ol className="flex flex-col gap-6">
        <li>
          <p className={stepTitle}>1. Copy the text and open {name}</p>
          <p className="mb-3 max-h-40 overflow-y-auto rounded-control border border-card-border bg-paper/60 px-4 py-3 text-[0.88rem] break-words whitespace-pre-wrap text-ink">
            {text || "This version has no text."}
          </p>
          {channel && (
            <a
              href={platformHome[channel]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={copy}
              className={buttonClass("secondary")}
            >
              <ArrowSquareOut aria-hidden="true" size={18} />
              Copy text and open {name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <p aria-live="polite" className="mt-2 text-[0.88rem]">
            {copied === "yes" && "Copied. Paste it into a new post."}
            {copied === "no" &&
              "Your browser did not allow copying. Select the text above and copy it."}
          </p>
        </li>
        {images.length > 0 && (
          <li>
            <p className={stepTitle}>
              2. Add{" "}
              {images.length === 1 ? "the image" : "the images, in this order"}
            </p>
            <ul className="flex flex-col gap-2">
              {images.map((image, index) => (
                <li key={image.id} className="flex items-center gap-3">
                  <MediaThumb media={image} className="size-12 rounded-small" />
                  <p className="min-w-0 flex-1 text-[0.85rem] leading-[1.5] break-words">
                    {index + 1}. {image.alt?.en}
                  </p>
                  <a
                    href={largest(image)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download image ${index + 1}`}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-indigo transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none"
                  >
                    <DownloadSimple aria-hidden="true" size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </li>
        )}
        <li>
          <p className={stepTitle}>
            {images.length > 0 ? "3" : "2"}. Mark it as posted
          </p>
          {error && !error.field && (
            <div className="mb-3">
              <Notice tone="error">{error.message}</Notice>
            </div>
          )}
          <Input
            label="Link to the post"
            name="permalink"
            type="url"
            inputMode="url"
            help={`Its address on ${name}, if you have it.`}
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setError(undefined);
            }}
            error={error?.field}
          />
        </li>
      </ol>
    </Dialog>
  );
}
