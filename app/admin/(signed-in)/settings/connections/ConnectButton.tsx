"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import {
  providerNames,
  type ConnectionStatus,
  type Provider,
} from "@/lib/admin/connections";
import { startConnection } from "./actions";

// Asks the API for the platform's sign-in address and goes there; the
// platform sends Daw Mi back to this page (or /linkedin) with a code.
export function ConnectButton({
  provider,
  status,
}: {
  provider: Provider;
  status: ConnectionStatus;
}) {
  const [error, setError] = useState<string>();
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const name = providerNames[provider];
  const urgent = status === "expiring_soon" || status === "reconnect_required";
  const again = urgent || status === "connected";

  function connect() {
    setError(undefined);
    startTransition(async () => {
      const outcome = await startConnection(provider);
      if (outcome.ok) {
        setLeaving(true);
        window.location.assign(outcome.data.authorizeUrl);
      } else setError(outcome.message);
    });
  }

  return (
    <>
      {error && (
        <div className="w-full">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <Button
        variant={urgent ? "primary" : "secondary"}
        busy={pending || leaving}
        onClick={connect}
      >
        {pending || leaving
          ? `Opening ${name}…`
          : again
            ? `Connect ${name} again`
            : `Connect ${name}`}
      </Button>
    </>
  );
}
