"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { Textarea } from "@/components/admin/Textarea";
import { useToast } from "@/components/admin/Toast";
import type { Outcome } from "@/lib/admin/mutation";
import { whenShort } from "@/lib/admin/posts";
import {
  approvalProblem,
  workflowActions,
  type WorkflowAction,
} from "@/lib/admin/postWorkflow";
import type { components } from "@/lib/api/schema";
import { postStep, requestChanges } from "../actions";
import { ScheduleForm } from "./ScheduleForm";
import { sectionTitle } from "./WebsiteFields";

type Post = components["schemas"]["Post"];
type Failure = { message: string; problems: string[]; reload: boolean };

const done: Partial<Record<WorkflowAction, string>> = {
  submit: "Post submitted for review",
  approve: "Post approved",
  unschedule: "Schedule cancelled. The post is approved",
  publish: "Publishing started",
  archive: "Post archived",
};

function nextStep(post: Post, canReview: boolean) {
  switch (post.status) {
    case "idea":
    case "draft":
      return "When the post is ready, submit it for review.";
    case "in_review":
      return canReview
        ? "Check each channel, then approve the post or send it back with a note."
        : "Waiting for review by the site administrator.";
    case "approved":
      return canReview
        ? "Schedule the post, or publish it now."
        : "Approved. The site administrator schedules or publishes it.";
    case "scheduled":
      return `Publishes on ${whenShort(post.scheduledAt!)}, Sydney time.`;
    case "publishing":
      return "Going out now. Each channel's progress is under Channels.";
    case "published":
      return post.publishedAt
        ? `Published on ${whenShort(post.publishedAt)}.`
        : "Published on every channel.";
    case "archived":
      return "Archived. It is not on the website.";
  }
}

// The post's next steps by role (#152): an editor submits; a site
// administrator approves or sends back, schedules, publishes and archives.
// Every step sends the version on the page; nothing runs while the editor
// has unsaved changes, so what is approved is what was saved.
export function Workflow({
  post,
  canReview,
  dirty,
  onChange,
}: {
  post: Post;
  canReview: boolean;
  dirty: boolean;
  onChange: (post: Post) => void;
}) {
  const [dialog, setDialog] = useState<"publish" | "archive" | "changes">();
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string>();
  const [failure, setFailure] = useState<Failure>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const actions = workflowActions(post.status, canReview);
  const has = (action: WorkflowAction) => actions.includes(action);
  const needsConsent =
    post.kind === "true_story" && !post.consent.confirmed && has("submit");

  function settle(outcome: Outcome<Post>, success: string) {
    if (outcome.ok) {
      onChange(outcome.data);
      setFailure(undefined);
      setDialog(undefined);
      toast(success);
      return;
    }
    setFailure({
      message: outcome.message,
      problems:
        outcome.code === "publish_requirements_unmet"
          ? Object.entries(outcome.fieldErrors).map(([field, text]) =>
              approvalProblem(field, text),
            )
          : [],
      reload: ["stale_version", "invalid_transition"].includes(outcome.code),
    });
  }

  const step = (
    action: Exclude<WorkflowAction, "requestChanges" | "schedule">,
  ) =>
    startTransition(async () =>
      settle(await postStep(action, post.id, post.version), done[action]!),
    );

  function sendBack() {
    if (!note.trim()) {
      setNoteError("Say what needs to change.");
      return;
    }
    startTransition(async () => {
      settle(
        await requestChanges(post.id, post.version, note),
        "Sent back with your note",
      );
    });
  }

  function close() {
    setDialog(undefined);
    setFailure(undefined);
    setNoteError(undefined);
  }

  const failureNotice = failure && (
    <div className="flex w-full flex-col items-start gap-3">
      <Notice tone="error">
        {failure.message}
        {failure.problems.length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {failure.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        )}
      </Notice>
      {failure.reload && (
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload the latest
        </Button>
      )}
    </div>
  );

  return (
    <Card as="section">
      <h2 className={sectionTitle}>Workflow</h2>
      <div className="flex flex-col items-start gap-4">
        <p className="text-[0.92rem] leading-[1.6] text-muted">
          {nextStep(post, canReview)}
        </p>
        {dirty && actions.length > 0 && (
          <p className="text-[0.92rem] leading-[1.6] font-semibold text-ink">
            Save your changes first.
          </p>
        )}
        {needsConsent && (
          <p className="text-[0.92rem] leading-[1.6] font-semibold text-ink">
            Tick every True Story consent item and save before submitting.
          </p>
        )}
        <fieldset
          disabled={dirty || pending}
          className="m-0 flex w-full min-w-0 flex-col items-start gap-4 border-0 p-0"
        >
          {has("submit") && (
            <Button
              size="page"
              className="w-full"
              busy={pending}
              disabled={needsConsent}
              onClick={() => step("submit")}
            >
              Submit for review
            </Button>
          )}
          {has("approve") && (
            <div className="flex w-full flex-col gap-3">
              <Button
                size="page"
                className="w-full"
                busy={pending}
                onClick={() => step("approve")}
              >
                Approve
              </Button>
              <Button variant="secondary" onClick={() => setDialog("changes")}>
                Request changes
              </Button>
            </div>
          )}
          {has("schedule") && (
            <ScheduleForm
              post={post}
              primary={post.status === "approved"}
              onDone={(outcome) =>
                settle(
                  outcome,
                  post.status === "scheduled"
                    ? "Post rescheduled"
                    : "Post scheduled",
                )
              }
            />
          )}
          {has("publish") && (
            <Button variant="secondary" onClick={() => setDialog("publish")}>
              Publish now
            </Button>
          )}
          {has("unschedule") && (
            <Button variant="quiet" onClick={() => step("unschedule")}>
              Cancel the schedule
            </Button>
          )}
          {has("archive") && (
            <Button variant="quiet" onClick={() => setDialog("archive")}>
              Archive post
            </Button>
          )}
        </fieldset>
        {!dialog && failureNotice}
      </div>

      <Dialog
        open={dialog === "publish"}
        onClose={close}
        title="Publish this post now?"
        confirmLabel="Publish now"
        busyLabel="Publishing…"
        busy={pending}
        onConfirm={() => step("publish")}
      >
        {failureNotice && <div className="mb-4">{failureNotice}</div>}
        <p>
          The website article goes live at once and each social channel starts
          posting. A channel that is not connected waits for you to post it
          yourself with Copy &amp; open.
        </p>
      </Dialog>
      <Dialog
        open={dialog === "archive"}
        onClose={close}
        title="Archive this post?"
        confirmLabel="Archive post"
        busyLabel="Archiving…"
        busy={pending}
        onConfirm={() => step("archive")}
      >
        {failureNotice && <div className="mb-4">{failureNotice}</div>}
        <p>
          It leaves every list except All, and a published article leaves the
          website. What already went out on social channels stays there.
        </p>
      </Dialog>
      <Dialog
        open={dialog === "changes"}
        onClose={close}
        title="Request changes"
        confirmLabel="Send back"
        busyLabel="Sending…"
        busy={pending}
        onConfirm={sendBack}
      >
        {failureNotice && <div className="mb-4">{failureNotice}</div>}
        <p className="mb-4">
          The post goes back to draft with your note at the top of the editor.
        </p>
        <Textarea
          label="What needs to change"
          name="reviewNote"
          required
          rows={4}
          maxLength={2000}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setNoteError(undefined);
          }}
          error={noteError}
        />
      </Dialog>
    </Card>
  );
}
