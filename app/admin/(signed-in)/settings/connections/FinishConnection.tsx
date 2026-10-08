"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { Card } from "@/components/admin/Card";
import { useToast } from "@/components/admin/Toast";
import {
  failedHref,
  failReason,
  providerNames,
  type MetaConnection,
  type Provider,
} from "@/lib/admin/connections";
import { finishConnection } from "./actions";

const PATH = "/admin/settings/connections";

function connectedToast(provider: Provider, data: unknown) {
  if (provider === "linkedin") return "LinkedIn connected";
  const meta = data as MetaConnection;
  if (meta.status === "choosing_page")
    return "Signed in to Facebook. Choose the Page to post to";
  return meta.instagramUsername
    ? "Facebook and Instagram connected"
    : "Facebook connected";
}

// The platform sent Daw Mi back with a code: hand it to the API once, then
// go back to the clean Connections page with the outcome. The code is
// single-use, so a second run (React's dev double effect) is skipped.
export function FinishConnection({
  provider,
  code,
  state,
}: {
  provider: Provider;
  code: string;
  state: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    finishConnection(provider, code, state).then(
      (outcome) => {
        if (outcome.ok) {
          toast(connectedToast(provider, outcome.data));
          router.replace(PATH);
        } else {
          router.replace(failedHref(provider, failReason(outcome.code)));
        }
      },
      () => router.replace(failedHref(provider, "failed")),
    );
  }, [provider, code, state, router, toast]);

  return (
    <Card as="section" className="max-w-[660px]">
      <p
        role="status"
        className="flex items-center gap-3 text-[0.95rem] text-muted"
      >
        <CircleNotch
          aria-hidden="true"
          size={20}
          className="shrink-0 animate-spin text-indigo motion-reduce:animate-none"
        />
        Finishing the {providerNames[provider]} connection…
      </p>
    </Card>
  );
}
