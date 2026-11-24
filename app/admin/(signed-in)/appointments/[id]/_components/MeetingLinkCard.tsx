"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Input } from "@/components/admin/Input";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import { LINK_ERROR, meetingLinkError } from "@/lib/admin/videoSession";
import type { AppointmentDetail } from "@/lib/api/types/appointments";
import { saveMeetingLink } from "../../actions";

export function MeetingLinkCard({
  appointment: a,
}: {
  appointment: AppointmentDetail;
}) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [error, setError] = useState<{ message: string; code: string }>();
  const [copyFailed, setCopyFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const sending = useRef(false);
  const field = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  const current = a.meetingLink;
  const canSet = a.allowedActions.includes("set_meeting_link");
  // Emails read the link when they go, so only a sent confirmation is stale.
  const emailed = a.communications.some(
    (c) => c.kind === "booking_confirmed" && c.status === "sent",
  );
  // The appointment moved on, so saving again cannot help before a refresh.
  const changed =
    error?.code === "stale_version" || error?.code === "action_not_allowed";

  function show() {
    setLink(current ?? "");
    setFieldError(undefined);
    setError(undefined);
    setOpen(true);
  }

  function save() {
    if (sending.current) return;
    const invalid = meetingLinkError(link);
    setFieldError(invalid);
    if (invalid) return;
    sending.current = true;
    startTransition(async () => {
      const outcome = await saveMeetingLink(a.id, a.version, link);
      sending.current = false;
      if (outcome.ok) {
        setOpen(false);
        toast("Meeting link saved");
        return;
      }
      if (outcome.fieldErrors.meetingLink) {
        setFieldError(LINK_ERROR);
        return;
      }
      setError({ message: outcome.message, code: outcome.code });
    });
  }

  function copy(text: string) {
    setCopyFailed(false);
    navigator.clipboard.writeText(text).then(
      () => toast("Link copied"),
      () => setCopyFailed(true),
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 text-[0.95rem]">
      {current ? (
        <>
          <a
            href={current}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline underline-offset-4 transition-colors duration-150 hover:text-indigo motion-reduce:transition-none"
          >
            {current}
            <ArrowSquareOut
              aria-hidden="true"
              size={16}
              className="ml-1 inline align-[-2px]"
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Button variant="secondary" onClick={() => copy(current)}>
            Copy link
          </Button>
          {canSet && (
            <Button variant="secondary" onClick={show}>
              Change link
            </Button>
          )}
          {copyFailed && (
            <Notice tone="error">
              Your browser did not allow copying. Select the link and copy it.
            </Notice>
          )}
        </>
      ) : (
        <>
          <p className="text-muted">
            {canSet ? "No meeting link yet." : "No meeting link."}
          </p>
          {canSet && (
            // One primary action a page: a waiting request keeps Confirm's.
            <Button
              variant={
                a.allowedActions.includes("confirm") ? "secondary" : "primary"
              }
              onClick={show}
            >
              Add meeting link
            </Button>
          )}
        </>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={current ? "Change meeting link" : "Add meeting link"}
        cancelLabel="Cancel"
        confirmLabel={error && !changed ? "Try again" : "Save link"}
        busyLabel="Saving…"
        busy={pending}
        onConfirm={save}
        initialFocus={field}
      >
        {error && (
          <div className="mb-4 flex flex-col gap-3">
            <Notice tone="error">{error.message}</Notice>
            {changed && (
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
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="text-ink"
        >
          <Input
            ref={field}
            label="Meeting link"
            name="meetingLink"
            type="url"
            required
            autoComplete="off"
            help="Starts with https://"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onBlur={() => setFieldError(meetingLinkError(link))}
            error={fieldError}
          />
        </form>
        {emailed && (
          <p className="mt-4">
            The visitor is not emailed automatically about a changed link.
            Contact them if the session is soon.
          </p>
        )}
      </Dialog>
    </div>
  );
}
