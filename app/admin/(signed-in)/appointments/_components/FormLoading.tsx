import { Skeleton } from "@/components/admin/Skeleton";

// A form page while it loads: title, then the 660px column.
export function FormLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="flex max-w-[660px] flex-col gap-8"
    >
      <div className="h-9 w-[min(280px,70%)] rounded-small bg-paper" />
      <Skeleton variant="card" count={2} />
    </div>
  );
}
