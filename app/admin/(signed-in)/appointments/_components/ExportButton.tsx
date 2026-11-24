"use client";

import { useRef, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { DateField } from "@/components/admin/DateField";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import {
  defaultRange,
  exportFailure,
  exportFileName,
  rangeErrors,
} from "@/lib/admin/appointmentExport";

// Fetched, then saved from a blob, so a refusal shows here, not as a file.
export function ExportButton({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({});
  const [failure, setFailure] = useState<string>();
  const trigger = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const range = defaultRange(today);

  // Called again by the dialog's close event, once the button can take focus.
  function close() {
    setOpen(false);
    setErrors({});
    setFailure(undefined);
    trigger.current?.focus();
  }

  async function download() {
    const data = new FormData(form.current ?? undefined);
    const chosen = {
      from: String(data.get("exportFrom") ?? ""),
      to: String(data.get("exportTo") ?? ""),
    };
    const problems = rangeErrors(chosen);
    setErrors(problems);
    setFailure(undefined);
    if (problems.from || problems.to) return;

    setBusy(true);
    try {
      const response = await fetch(
        `/admin/appointments/export?${new URLSearchParams(chosen)}`,
      );
      if (response.redirected || !response.ok) {
        // Without a session cookie the proxy answers with the sign-in page.
        setFailure(exportFailure(response.redirected ? 401 : response.status));
        return;
      }
      const name = exportFileName(response.headers.get("Content-Disposition"));
      save(await response.blob(), name);
      close();
      toast("Export downloaded");
    } catch {
      setFailure(exportFailure());
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        ref={trigger}
        variant="secondary"
        size="page"
        icon={<DownloadSimple aria-hidden="true" size={18} />}
        onClick={() => setOpen(true)}
      >
        Export CSV
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Export appointments"
        confirmLabel="Download"
        busyLabel="Preparing the file…"
        cancelLabel="Cancel"
        busy={busy}
        onConfirm={download}
      >
        {failure && (
          <div className="mb-4">
            <Notice tone="error">{failure}</Notice>
          </div>
        )}
        <p>
          This file contains clients&apos; personal details. Keep it somewhere
          private and delete it when you no longer need it.
        </p>
        {/* Names unlike the list filters' from and to, so the ids differ. */}
        <form ref={form} className="mt-6 grid gap-5 sm:grid-cols-2">
          <DateField
            label="From"
            name="exportFrom"
            value={range.from}
            required
            error={errors.from}
          />
          <DateField
            label="To (included)"
            name="exportTo"
            value={range.to}
            required
            error={errors.to}
          />
        </form>
      </Dialog>
    </>
  );
}

function save(file: Blob, name: string) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  // Safari can still be reading the blob when click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
