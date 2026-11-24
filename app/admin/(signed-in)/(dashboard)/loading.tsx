import { Skeleton } from "@/components/admin/Skeleton";

// The dashboard's shape while it loads (brief §7 Loading).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="h-9 w-[min(240px,60%)] rounded-small bg-paper" />
        <Skeleton variant="text" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-card bg-paper" />
        ))}
      </div>
      {[2, 3, 3].map((rows, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="h-7 w-[min(200px,50%)] rounded-small bg-paper" />
          <Skeleton variant="row" count={rows} />
        </div>
      ))}
    </div>
  );
}
