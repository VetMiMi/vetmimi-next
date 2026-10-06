import { Skeleton } from "@/components/admin/Skeleton";

// The detail page's two columns while it loads (brief §7 Loading).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="h-9 w-[min(280px,70%)] rounded-small bg-paper" />
        <Skeleton variant="text" />
      </div>
      <div className="grid gap-[clamp(28px,4vw,56px)] min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <Skeleton variant="card" count={3} />
        <Skeleton variant="card" count={2} />
      </div>
    </div>
  );
}
