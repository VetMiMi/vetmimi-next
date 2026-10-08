import type { Icon } from "@phosphor-icons/react";
import { Card } from "@/components/admin/Card";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notice } from "@/components/admin/Notice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  connectionNotice,
  providerNames,
  type ConnectionStatus,
  type Provider,
} from "@/lib/admin/connections";
import { disconnect } from "./actions";
import { ConnectButton } from "./ConnectButton";

// One platform: its state, who is connected and until when, and the way
// to connect, connect again or disconnect. `status` is absent when the
// connection could not be read; `loadError` then says why.
export function ConnectionCard({
  provider,
  title,
  icons,
  about,
  status,
  loadError,
  facts = [],
  disconnectNote,
  children,
}: {
  provider: Provider;
  title: string;
  icons: Icon[];
  about: string;
  status?: ConnectionStatus;
  loadError?: string;
  facts?: [label: string, value: string][];
  disconnectNote: string;
  children?: React.ReactNode;
}) {
  const name = providerNames[provider];
  const notice = status && connectionNotice(provider, status);
  const linked = status !== undefined && status !== "not_connected";

  return (
    <Card as="section" className="flex max-w-[660px] flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 className="flex items-center gap-3 text-[1.35rem]">
          <span className="flex gap-1.5 text-indigo">
            {icons.map((Icon, i) => (
              <Icon key={i} aria-hidden="true" size={26} />
            ))}
          </span>
          {title}
        </h2>
        {status && <StatusBadge kind="connection" status={status} />}
      </div>
      <p className="-mt-2 text-[0.92rem] leading-[1.65] text-muted">{about}</p>

      {loadError && <Notice tone="error">{loadError}</Notice>}
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      {facts.length > 0 && (
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="mb-1 text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase">
                {label}
              </dt>
              <dd className="text-[0.95rem] break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {children}

      {status && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-divider pt-6">
          <ConnectButton
            provider={provider}
            again={
              status === "expiring_soon" || status === "reconnect_required"
            }
          />
          {linked && (
            <ConfirmButton
              label={`Disconnect ${name}`}
              variant="quiet"
              title={`Disconnect ${name}?`}
              body={disconnectNote}
              confirmLabel="Disconnect"
              busyLabel="Disconnecting…"
              cancelLabel="Keep connected"
              action={disconnect.bind(null, provider)}
              success={`${name} disconnected`}
            />
          )}
        </div>
      )}
    </Card>
  );
}
