"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Notice } from "@/components/admin/Notice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import {
  afterSave,
  EDITABLE,
  readiness,
  toDraft,
  toPatch,
  type Draft,
  type SocialChannel,
} from "@/lib/admin/postDraft";
import { whenShort } from "@/lib/admin/posts";
import type { components } from "@/lib/api/schema";
import { savePost } from "../../actions";
import { ChannelBadge } from "../../_components/ChannelBadge";
import { PostFields } from "./PostFields";
import { SocialTabs } from "./SocialTabs";
import { useUnsavedWarning } from "./useUnsavedWarning";
import { sectionTitle, WebsiteFields } from "./WebsiteFields";

type Post = components["schemas"]["Post"];

const same = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b);

// The post editor (#151): the post, its website article and its social
// versions on the left; saving, what approval still needs and the workflow
// on the right (below on a phone). Nothing saves by itself: "Save changes"
// sends the version it was loaded at, so a change made elsewhere is caught
// rather than overwritten, and the typed text stays on the page.
export function PostEditor({ post: loaded }: { post: Post }) {
  const [post, setPost] = useState(loaded);
  const [saved, setSaved] = useState(() => toDraft(loaded));
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState<{ message: string; stale: boolean }>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const noticeRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const editable = EDITABLE.includes(post.status);
  const dirty = !same(draft, saved);
  const release = useUnsavedWarning(dirty);

  const imageIds: Record<SocialChannel, string[]> = {
    facebook: post.versions.facebook?.imageIds ?? [],
    instagram: post.versions.instagram?.imageIds ?? [],
    linkedin: post.versions.linkedin?.imageIds ?? [],
  };
  const problems = readiness(draft, {
    facebook: imageIds.facebook.length,
    instagram: imageIds.instagram.length,
    linkedin: imageIds.linkedin.length,
  });

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

  return (
    <form
      noValidate
      onSubmit={save}
      className="flex flex-col gap-6 min-[900px]:grid min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] min-[900px]:items-start min-[900px]:gap-x-[clamp(28px,4vw,56px)]"
    >
      <div className="flex min-w-0 flex-col gap-6">
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
              coverImageId={post.versions.website?.coverImageId}
              errors={fieldErrors}
              onChange={(patch) =>
                setDraft((d) => ({ ...d, website: { ...d.website, ...patch } }))
              }
            />
          </fieldset>
        </Card>
        <Card>
          <SocialTabs
            disabled={!editable}
            draft={draft}
            imageIds={imageIds}
            errors={fieldErrors}
            onChange={(channel, patch) =>
              setDraft((d) => ({
                ...d,
                [channel]: { ...d[channel], ...patch },
              }))
            }
          />
        </Card>
      </div>

      {/* On a phone the Save card sits below the whole form, so unsaved
          changes also get a save button above the tab bar. */}
      {dirty && editable && (
        <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 px-5 min-[900px]:hidden">
          <Button
            type="submit"
            size="page"
            busy={pending}
            className="w-full shadow-lifted"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}

      <aside
        aria-label="Saving and workflow"
        className="flex flex-col gap-6 min-[900px]:sticky min-[900px]:top-[104px]"
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

        {editable && (
          <Card as="section">
            <h2 className={sectionTitle}>Before approval</h2>
            {problems.length === 0 ? (
              <p className="flex items-start gap-2 text-[0.92rem] text-ink">
                <CheckCircle
                  aria-hidden="true"
                  size={20}
                  className="mt-0.5 shrink-0 text-olive"
                />
                Every channel that is on is ready for review.
              </p>
            ) : (
              <ul className="flex list-disc flex-col gap-2 pl-5 text-[0.92rem] leading-[1.6] text-muted">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {post.publications.length > 0 && (
          <Card as="section">
            <h2 className={sectionTitle}>Channels</h2>
            <ul className="flex flex-wrap gap-2">
              {post.publications.map((p) => (
                <li key={p.channel}>
                  <ChannelBadge channel={p.channel} status={p.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Submit, approve, schedule, publish and copy & open land here
            with #152. */}
        <section className="rounded-card border border-dashed border-input-border px-[clamp(24px,4vw,44px)] py-6">
          <h2 className="mb-2 text-[1.35rem]">Workflow</h2>
          <p className="text-[0.92rem] leading-[1.6] text-muted">
            Submitting for review, approving, scheduling and publishing will be
            here. For now, save your changes.
          </p>
        </section>
      </aside>
    </form>
  );
}
