import { Skeleton } from "@/components/admin/Skeleton";

// The shape of a list page while it loads (brief §7 Loading).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="h-9 w-[min(280px,70%)] rounded-small bg-paper" />
        <Skeleton variant="text" />
      </div>
      <Skeleton variant="row" count={5} />
    </div>
  );
}
