"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { useToast } from "@/components/admin/Toast";
import type { components } from "@/lib/api/schema";
import { pauseService, resumeService } from "./actions";
import { serviceName } from "./serviceText";

type Service = components["schemas"]["Service"];

// Pausing hides the service from public booking and needs a confirmation
// (Booking UX §30); resuming does not. An archived service has neither.
export function ServiceStateButton({
  service,
}: {
  service: Pick<Service, "id" | "version" | "state" | "name" | "slug">;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const name = serviceName(service);

  if (service.state === "active")
    return (
      <ConfirmButton
        label="Pause"
        variant="quiet"
        title={`Pause ${name}?`}
        body="The service disappears from public booking. The service page and existing appointments are not changed."
        cancelLabel="Keep active"
        confirmLabel="Pause service"
        busyLabel="Pausing…"
        action={() => pauseService(service.id, service.version)}
        success="Service paused"
      />
    );
  if (service.state !== "paused") return null;

  return (
    <div>
      <Button
        variant="quiet"
        busy={pending}
        onClick={() =>
          startTransition(async () => {
            const outcome = await resumeService(service.id, service.version);
            setError(outcome.ok ? undefined : outcome.message);
            if (outcome.ok) toast("Service resumed");
          })
        }
      >
        {pending ? "Resuming…" : "Resume"}
      </Button>
      {error && (
        <p role="alert" className="mt-1 text-[0.88rem] text-action">
          {error}
        </p>
      )}
    </div>
  );
}
