"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Notice } from "@/components/admin/Notice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import type { Media } from "@/lib/admin/media";
import {
  afterSave,
  EDITABLE,
  imageLimits,
  readiness,
  toDraft,
  toPatch,
  type Draft,
  type SocialChannel,
} from "@/lib/admin/postDraft";
import { whenShort } from "@/lib/admin/posts";
import type { components } from "@/lib/api/schema";
import { savePost } from "../../actions";
import { Channels } from "./Channels";
import { MediaPicker } from "./MediaPicker";
import { PostFields } from "./PostFields";
import { Readiness } from "./Readiness";
import { SocialTabs } from "./SocialTabs";
import { Suggestions } from "./Suggestions";
import { useUnsavedWarning } from "./useUnsavedWarning";
import { sectionTitle, WebsiteFields } from "./WebsiteFields";
import { Workflow } from "./Workflow";

type Post = components["schemas"]["Post"];
type Channel = Draft["facebook"];

const same = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b);

const FORM_ID = "post-form";

// The post editor (#151, #152): the post, its website article and its
// social versions on the left; saving, what approval still needs, the
// workflow and each channel's publishing on the right (below on a phone).
// Nothing saves by itself: "Save changes" sends the version it was loaded
// at, so a change made elsewhere is caught rather than overwritten, and
// the typed text stays on the page. Images are part of the draft: attach,
// reorder or take one out, then save.
export function PostEditor({
  post: loaded,
  media: loadedMedia,
  canReview,
  aiEnabled,
}: {
  post: Post;
  media: Media[];
  canReview: boolean;
  aiEnabled: boolean;
}) {
  const [post, setPost] = useState(loaded);
  const [saved, setSaved] = useState(() => toDraft(loaded));
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState<{ message: string; stale: boolean }>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [media, setMedia] = useState(() =>
    Object.fromEntries(loadedMedia.map((item) => [item.id, item])),
  );
  const [picking, setPicking] = useState<"cover" | SocialChannel>();
  const noticeRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const editable = EDITABLE.includes(post.status);
  const dirty = !same(draft, saved);
  const release = useUnsavedWarning(dirty);

  const problems = readiness(draft);

  // A workflow step or a channel's progress: the post moved on, and with
  // no unsaved changes the working copy follows it.
  function moved(next: Post) {
    setPost(next);
    const nextDraft = afterSave(saved, next);
    setSaved(nextDraft);
    setDraft(nextDraft);
  }

  function setChannel(channel: SocialChannel, patch: Partial<Channel>) {
    setDraft((d) => ({ ...d, [channel]: { ...d[channel], ...patch } }));
  }

  function attach(item: Media) {
    setMedia((all) => ({ ...all, [item.id]: item }));
    if (picking === "cover") {
      setDraft((d) => ({
        ...d,
        website: { ...d.website, coverImageId: item.id },
      }));
    } else if (picking) {
      const channel = picking;
      setDraft((d) => {
        const ids = d[channel].imageIds;
        const imageIds =
          ids.length < imageLimits[channel] ? [...ids, item.id] : [item.id];
        return { ...d, [channel]: { ...d[channel], imageIds } };
      });
    }
    setPicking(undefined);
    toast("Image attached. Save to keep it");
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setFieldErrors({ title: "Enter a working title." });
      return;
    }
    const sent = draft;
    startTransition(async () => {
      const outcome = await savePost(
        post.id,
        toPatch(sent, post, post.version),
      );
      if (outcome.ok) {
        const backToReview =
          outcome.data.status === "in_review" && post.status !== "in_review";
        const next = afterSave(sent, outcome.data);
        setPost(outcome.data);
        setSaved(next);
        // Text typed while saving stays; otherwise show what was stored.
        setDraft((current) => (same(current, sent) ? next : current));
        setError(undefined);
        setFieldErrors({});
        toast(
          backToReview ? "Post saved and sent back to review" : "Post saved",
        );
      } else {
        setError({
          message: outcome.message,
          stale: outcome.code === "stale_version",
        });
        setFieldErrors(outcome.fieldErrors);
        requestAnimationFrame(() => noticeRef.current?.focus());
      }
    });
  }

  function reload() {
    release();
    window.location.reload();
  }

  // The form holds the fields only; the side panel's buttons name it, so
  // the workflow's and the library's own fields never submit the post.
  return (
    <div className="flex flex-col gap-6 min-[900px]:grid min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] min-[900px]:items-start min-[900px]:gap-x-[clamp(28px,4vw,56px)]">
      <form
        id={FORM_ID}
        noValidate
        onSubmit={save}
        className="flex min-w-0 flex-col gap-6"
      >
        {post.reviewNote && post.status === "draft" && (
          <Notice tone="info">Changes requested: {post.reviewNote}</Notice>
        )}
        {!editable && (
          <Notice tone="info">
            This post is{" "}
            {post.status === "publishing" ? "being published" : post.status}, so
            it can no longer be changed.
          </Notice>
        )}
        <Card>
          <fieldset disabled={!editable} className="m-0 min-w-0 border-0 p-0">
            <PostFields
              draft={draft}
              confirmedAt={
                post.consent.confirmedAt && whenShort(post.consent.confirmedAt)
              }
              errors={fieldErrors}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
          </fieldset>
        </Card>
        <Card>
          <fieldset disabled={!editable} className="m-0 min-w-0 border-0 p-0">
            <WebsiteFields
              website={draft.website}
              media={media}
              editable={editable}
              errors={fieldErrors}
              onChange={(patch) =>
                setDraft((d) => ({ ...d, website: { ...d.website, ...patch } }))
              }
              onPickCover={() => setPicking("cover")}
            />
          </fieldset>
        </Card>
        <Card>
          <SocialTabs
            disabled={!editable}
            draft={draft}
            media={media}
            errors={fieldErrors}
            onChange={setChannel}
            onPickImage={setPicking}
          />
        </Card>
        {aiEnabled && editable && (
          <Suggestions postId={post.id} draft={draft} onAccept={setChannel} />
        )}
      </form>

      {/* On a phone the Save card sits below the whole form, so unsaved
          changes also get a save button above the tab bar. */}
      {dirty && editable && (
        <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 px-5 min-[900px]:hidden">
          <Button
            type="submit"
            form={FORM_ID}
            size="page"
            busy={pending}
            className="w-full shadow-lifted"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}

      {/* Sticky, and scrolled on its own when the workflow and channels
          make it taller than the window. */}
      <aside
        aria-label="Saving and workflow"
        className="flex flex-col gap-6 min-[900px]:sticky min-[900px]:top-[104px] min-[900px]:max-h-[calc(100dvh-128px)] min-[900px]:overflow-y-auto"
      >
        <Card as="section">
          <h2 className={sectionTitle}>{editable ? "Save" : "Status"}</h2>
          <div className="flex flex-col items-start gap-4">
            <StatusBadge
              kind="post"
              status={post.status}
              detail={post.scheduledAt && whenShort(post.scheduledAt)}
            />
            {(post.status === "approved" || post.status === "scheduled") && (
              <p className="text-[0.88rem] leading-[1.6] text-muted">
                Saving a change sends this post back to review.
              </p>
            )}
            {error && (
              <div className="flex w-full flex-col items-start gap-3">
                <Notice tone="error" ref={noticeRef}>
                  {error.message}
                </Notice>
                {error.stale && (
                  <Button variant="secondary" onClick={reload}>
                    Reload the latest
                  </Button>
                )}
              </div>
            )}
            {editable && (
              <>
                <p className="text-[0.88rem] text-muted" aria-live="polite">
                  {dirty ? "You have unsaved changes." : "All changes saved."}
                </p>
                <Button
                  type="submit"
                  form={FORM_ID}
                  size="page"
                  busy={pending}
                  disabled={!dirty}
                  className="w-full"
                >
                  {pending ? "Saving…" : "Save changes"}
                </Button>
              </>
            )}
          </div>
        </Card>

        <Workflow
          post={post}
          canReview={canReview}
          dirty={dirty}
          onChange={moved}
        />

        {post.publications.length > 0 && (
          <Channels
            post={post}
            media={media}
            canConnect={canReview}
            onChange={moved}
          />
        )}

        {editable && <Readiness problems={problems} />}
      </aside>

      <MediaPicker
        target={picking}
        draft={draft}
        onPick={attach}
        onClose={() => setPicking(undefined)}
      />
    </div>
  );
}
