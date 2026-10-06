import { Skeleton } from "@/components/admin/Skeleton";

// The call view while it loads: the header, then the device check card.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="flex max-w-[720px] flex-col gap-8"
    >
      <div className="h-9 w-[min(280px,70%)] rounded-small bg-paper" />
      <Skeleton variant="card" />
    </div>
  );
}
