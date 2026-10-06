import { Skeleton } from "@/components/admin/Skeleton";

// The editor's header, cards and side panel while the post loads.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="h-9 w-[min(320px,70%)] rounded-small bg-paper" />
        <Skeleton variant="text" />
      </div>
      <div className="flex flex-col gap-6 min-[900px]:grid min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] min-[900px]:gap-x-[clamp(28px,4vw,56px)]">
        <Skeleton variant="card" count={3} />
        <Skeleton variant="card" count={2} />
      </div>
    </div>
  );
}
