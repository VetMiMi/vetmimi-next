"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Btn } from "@/components/ui/Button";
import { Notice } from "@/components/admin/Notice";
import type { ManagedAppointment } from "@/lib/api/manage";
import { AppointmentSummary } from "./AppointmentSummary";
import { CancelDialog, type CancelResult } from "./CancelDialog";
import { linkClass, noteClass } from "./manageClasses";

// Statuses that never come back to life: no cancel or reschedule, a new
// booking or Contact instead (Requirements §6).
const TERMINAL = new Set<ManagedAppointment["status"]>([
  "completed",
  "declined",
  "cancelled_by_client",
  "cancelled_by_practitioner",
  "no_show",
  "expired",
]);

type Message = { tone: "success" | "info" | "error"; text: string };

// The appointment behind a management link (#59) and what its holder may
// do with it. The API decides what is allowed; this only shows it. After a
// cancel (#60) the card shows the state the API returned.
export function ManageView({
  token,
  initial,
  now,
}: {
  token: string;
  initial: ManagedAppointment;
  // An ISO instant from the server, so both renders agree on what is past.
  now: string;
}) {
  const t = useTranslations("manage");
  const [a, setA] = useState(initial);
  const [message, setMessage] = useState<Message>();
  const messageBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) messageBox.current?.focus();
  }, [message]);

  function afterCancel(result: CancelResult) {
    if (result.appointment) setA(result.appointment);
    setMessage(result.message);
  }

  const finished = TERMINAL.has(a.status) || a.endsAt <= now;
  const canAct = a.canCancel || a.canRequestReschedule;

  return (
    <>
      {message && (
        <Notice tone={message.tone} ref={messageBox}>
          {message.text}
        </Notice>
      )}

      <AppointmentSummary appointment={a} />

      {a.status === "pending" && (
        <p className={noteClass}>{t("notes.pending")}</p>
      )}
      {/* The join link itself is only ever in email (ADR-007). */}
      {a.status === "confirmed" && a.format === "online" && !finished && (
        <p className={noteClass}>{t("notes.joinLink")}</p>
      )}
      {a.rescheduleRequested && !finished && (
        <p className={noteClass}>{t("notes.rescheduleRequested")}</p>
      )}
      {finished && !message && (
        <p className={noteClass}>{t("notes.finished")}</p>
      )}

      {canAct && (
        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
          {a.canRequestReschedule && (
            <Btn
              href={`/manage/${token}/reschedule`}
              variant="secondary"
              className="text-center"
            >
              {t("actions.reschedule")}
            </Btn>
          )}
          {a.canCancel && (
            <CancelDialog token={token} appointment={a} onDone={afterCancel} />
          )}
        </div>
      )}

      {finished ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Btn href="/book">{t("actions.book")}</Btn>
          <Link href="/contact" className={linkClass}>
            {t("actions.contact")}
          </Link>
        </div>
      ) : (
        <p className="text-[0.92rem]">
          <Link href="/contact" className={linkClass}>
            {t("actions.question")}
          </Link>
        </p>
      )}
    </>
  );
}
