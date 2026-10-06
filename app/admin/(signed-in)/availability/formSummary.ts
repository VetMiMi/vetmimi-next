import type { FieldErrorItem } from "@/components/admin/ErrorSummary";

// The error summary's entries in the form's order. A time range's message
// links to its start time, the first thing to fix.
export function summaryOf(
  errors: Record<string, string>,
  order: string[],
): FieldErrorItem[] {
  return order.flatMap((name) =>
    errors[name]
      ? [{ name: name === "time" ? "time-start" : name, message: errors[name] }]
      : [],
  );
}
