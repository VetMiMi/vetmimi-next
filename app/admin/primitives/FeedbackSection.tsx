import { Card } from "@/components/admin/Card";
import { EmptyState } from "@/components/admin/EmptyState";
import { Notice } from "@/components/admin/Notice";
import { Skeleton } from "@/components/admin/Skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  statuses,
  type StatusKind,
  type StatusOf,
} from "@/components/admin/status";
import { ToastProvider } from "@/components/admin/Toast";
import { DialogDemo, ToastDemo } from "./FeedbackDemos";
import { Group, State } from "./FormSection";

const kinds = Object.keys(statuses) as StatusKind[];

export function FeedbackSection() {
  return (
    <>
      <Group id="badges" title="Status badges">
        <div className="flex flex-col gap-6">
          {kinds.map((kind) => (
            <State key={kind} name={kind}>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statuses[kind]) as StatusOf<typeof kind>[]).map(
                  (status) => (
                    <StatusBadge key={status} kind={kind} status={status} />
                  ),
                )}
              </div>
            </State>
          ))}
          <State name="post scheduled, with its time">
            <StatusBadge
              kind="post"
              status="scheduled"
              detail="12 Oct, 9:00 am"
            />
          </State>
        </div>
      </Group>

      <Group id="cards" title="Cards">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-[1.35rem]">Raised, on canvas</h3>
            <p className="text-[0.95rem] text-muted">
              The default surface for a panel of working content.
            </p>
          </Card>
          <div className="rounded-card bg-paper p-6">
            <Card surface="white">
              <h3 className="mb-2 text-[1.35rem]">White, on paper</h3>
              <p className="text-[0.95rem] text-muted">
                For a card that sits on a paper section.
              </p>
            </Card>
          </div>
        </div>
      </Group>

      <Group id="notices" title="Notices">
        <div className="flex max-w-[660px] flex-col gap-4">
          <Notice tone="error">
            The appointment was not cancelled. Status remains Confirmed.
          </Notice>
          <Notice tone="info">
            This appointment has changed since you opened it. Refresh to see the
            latest.
          </Notice>
          <Notice tone="success">
            Appointment confirmed. The confirmation email was sent.
          </Notice>
        </div>
      </Group>

      <Group id="dialogs" title="Dialogs and toasts">
        <ToastProvider>
          <div className="flex flex-col gap-6">
            <State name="Dialog: focus starts on Keep it; Escape closes">
              <DialogDemo />
            </State>
            <State name="Toast: leaves after 5 seconds unless hovered or focused">
              <ToastDemo />
            </State>
          </div>
        </ToastProvider>
      </Group>

      <Group id="empty" title="Empty states">
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState
            headingLevel={3}
            title="No pending requests."
            text="New booking requests will appear here."
            action={{
              label: "View upcoming appointments",
              href: "/admin/appointments",
            }}
            shape="petal"
          />
          <EmptyState headingLevel={3} title="No weekly hours yet." />
        </div>
      </Group>

      <Group id="skeletons" title="Loading skeletons">
        <div aria-busy="true" className="grid gap-8 md:grid-cols-2">
          <State name="text, row × 3">
            <div className="flex flex-col gap-4">
              <Skeleton variant="text" count={2} />
              <Skeleton variant="row" count={3} />
            </div>
          </State>
          <State name="card">
            <Skeleton variant="card" />
          </State>
        </div>
      </Group>
    </>
  );
}
