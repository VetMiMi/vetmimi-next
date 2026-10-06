import type { Metadata } from "next";
import Link from "next/link";
import { Prohibit } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import { addDays } from "@/lib/time";
import { todayIn } from "@/lib/zonedTime";
import { deleteBlock } from "../actions";
import { AvailabilityHeader } from "../AvailabilityHeader";
import { BlockForm } from "./BlockForm";
import { blockFields, describeBlock } from "./blockTimes";

export const metadata: Metadata = { title: "Blocked time · Availability" };

const BASE = "/admin/availability/blocks";

// Blocked time (#73): current and upcoming blocks, with past ones a link
// away. The form opens from the URL, as on Overrides.
export default async function BlocksPage({
  searchParams,
}: PageProps<"/admin/availability/blocks">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { past, edit, new: adding } = await searchParams;
  const showPast = past === "1";

  // No zone is more than a day behind UTC, so this covers the practice's
  // today; blocks that have ended are trimmed below.
  const list = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/availability/blocks", {
        params: {
          query: showPast ? {} : { from: addDays(todayIn("UTC"), -1) },
        },
      }),
    ),
  );
  const { timezone } = list;
  const now = new Date().toISOString();
  const items = showPast
    ? list.items
    : list.items.filter((block) => block.endsAt > now);
  const editing = items.find((block) => block.id === edit);
  const formOpen = adding !== undefined || editing !== undefined;

  return (
    <>
      <AvailabilityHeader
        timezone={timezone}
        active="blocks"
        action={
          !formOpen && (
            <Button
              href={`${BASE}?new`}
              size="page"
              icon={<Prohibit aria-hidden="true" size={18} />}
            >
              Block time
            </Button>
          )
        }
      />
      {formOpen && (
        <Card as="section" className="mb-10 max-w-[660px]">
          <h2 className="mb-6 text-[1.35rem]">
            {editing ? "Change blocked time" : "Block time"}
          </h2>
          <BlockForm
            key={editing?.id ?? "new"}
            timezone={timezone}
            id={editing?.id}
            initial={editing && blockFields(editing, timezone)}
            reason={editing?.reason}
            today={todayIn(timezone)}
          />
        </Card>
      )}
      <DataTable
        caption={showPast ? "All blocked time" : "Current and upcoming blocks"}
        rows={items}
        rowHref={(block) => `${BASE}?edit=${block.id}`}
        columns={[
          {
            key: "when",
            label: "When",
            render: (block) => describeBlock(block, timezone),
          },
          {
            key: "reason",
            label: "Private reason",
            render: (block) =>
              block.reason || <span className="text-muted">None</span>,
          },
          {
            key: "remove",
            label: "Remove",
            render: (block) => (
              <ConfirmButton
                label="Remove"
                variant="quiet"
                title="Remove this block?"
                body="The time becomes available again if weekly hours cover it."
                confirmLabel="Remove block"
                busyLabel="Removing…"
                action={deleteBlock.bind(null, block.id)}
                success="Block removed"
              />
            ),
          },
        ]}
        empty={
          !formOpen && (
            <EmptyState
              title="No blocked time."
              text="Block a few hours, a day or a holiday, and those times stop showing to visitors."
              action={{ label: "Block time", href: `${BASE}?new` }}
            />
          )
        }
      />
      <p className="mt-6 text-[0.88rem]">
        <Link
          href={showPast ? BASE : `${BASE}?past=1`}
          className="text-indigo underline underline-offset-4 hover:text-ink"
        >
          {showPast ? "Hide past blocks" : "Show past blocks"}
        </Link>
      </p>
    </>
  );
}
