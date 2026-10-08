"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { providerNames, type Provider } from "@/lib/admin/connections";
import { startConnection } from "./actions";

// Asks the API for the platform's sign-in address and goes there; the
// platform sends Daw Mi back to this page (or /linkedin) with a code.
export function ConnectButton({
  provider,
  again,
}: {
  provider: Provider;
  again: boolean;
}) {
  const [error, setError] = useState<string>();
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const name = providerNames[provider];

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
        variant={again ? "primary" : "secondary"}
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
