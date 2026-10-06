import { Skeleton } from "@/components/admin/Skeleton";

// The list's header, tabs and rows while they load (brief §7 Loading).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="h-9 w-[min(240px,60%)] rounded-small bg-paper" />
        <Skeleton variant="text" />
      </div>
      <Skeleton variant="row" count={5} />
    </div>
  );
}
