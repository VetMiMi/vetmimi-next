"use client";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { Dialog } from "@/components/admin/Dialog";
import { controlClass } from "@/components/admin/Field";
import { Notice } from "@/components/admin/Notice";
import { usePracticeFormat } from "@/components/booking/practiceFormat";
import type { ManagedAppointment } from "@/lib/api/manage";
import { localDateKey } from "@/lib/time";
import { cancelManaged } from "../actions";
import { linkClass, noteClass } from "./manageClasses";

export type CancelResult = {
  appointment?: ManagedAppointment;
  message: { tone: "success" | "info" | "error"; text: string };
};

const MAX_MESSAGE = 500;

// "Cancel appointment" and its confirmation (#60, Booking UX §16). The late
// notice and its hours come from the API, never a rule of our own. A
// failure that leaves the appointment as it was stays in the dialog; a
// refusal closes it and the page shows the state the API reports.
export function CancelDialog({
  token,
  appointment: a,
  onDone,
}: {
  token: string;
  appointment: ManagedAppointment;
  onDone: (result: CancelResult) => void;
}) {
  const t = useTranslations("manage");
  const book = useTranslations("book");
  const format = usePracticeFormat(a.timezone);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  // A second press before React re-renders the button disabled.
  const sending = useRef(false);

  const date = format.date(localDateKey(a.startsAt, a.timezone));
  const time = `${format.time(a.startsAt)} ${format.zone(a.startsAt)}`;

  function close() {
    setOpen(false);
    setError(undefined);
  }

  function confirm() {
    if (sending.current) return;
    sending.current = true;
    startTransition(async () => {
      const outcome = await cancelManaged(token, text);
      sending.current = false;
      if (outcome.ok) {
        close();
        onDone({
          appointment: outcome.appointment,
          message: { tone: "success", text: t("cancel.done", { date, time }) },
        });
      } else if (outcome.code === "not_found") {
        // The link stopped working: the page shows its "not available" state.
        router.refresh();
      } else if (outcome.code === "action_not_allowed") {
        close();
        onDone({
          appointment: outcome.appointment,
          message: { tone: "error", text: t("cancel.notAllowed") },
        });
      } else if (outcome.code === "invalid_transition") {
        close();
        onDone({
          appointment: outcome.appointment,
          message: { tone: "info", text: t("cancel.changed") },
        });
      } else if (outcome.code === "rate_limited") {
        setError(t("problems.rateLimited"));
      } else {
        setError(t("cancel.failed", { status: t(`status.${a.status}`) }));
      }
    });
  }

  return (
    <>
      <Btn variant="secondary" onClick={() => setOpen(true)}>
        {t("actions.cancel")}
      </Btn>
      <Dialog
        open={open}
        onClose={close}
        title={t("cancel.title")}
        cancelLabel={t("cancel.keep")}
        confirmLabel={t("cancel.confirm")}
        busyLabel={t("cancel.busy")}
        busy={pending}
        onConfirm={confirm}
      >
        <div className="flex flex-col gap-4">
          {error && <Notice tone="error">{error}</Notice>}
          <p className="font-semibold text-ink">
            {a.service.name}
            <span className="block font-normal text-muted">
              {format.dateTime(a.startsAt)} {format.zone(a.startsAt)}
            </span>
          </p>
          <p>{t("cancel.consequence")}</p>
          {a.lateIfCancelledNow && (
            <p className={`${noteClass} text-ink`}>
              {t.rich("cancel.late", {
                hours: a.cancellationNoticeHours,
                link: (chunks) => (
                  <Link href="/booking-policy" className={linkClass}>
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}
          <div>
            <label
              htmlFor="cancel-message"
              className="mb-2 block text-[0.88rem] font-medium text-ink"
            >
              {t("cancel.message")}{" "}
              <span className="font-normal text-muted">
                {book("shared.optional")}
              </span>
            </label>
            <textarea
              id="cancel-message"
              value={text}
              maxLength={MAX_MESSAGE}
              rows={3}
              onChange={(e) => setText(e.target.value)}
              className={`${controlClass} resize-y leading-[1.65]`}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
