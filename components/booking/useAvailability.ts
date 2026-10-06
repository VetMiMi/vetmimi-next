import { useEffect, useState } from "react";
import { lastDayOfMonth } from "@/lib/time";
import type { Availability } from "./booking";

type Result = { data: Availability } | { error: true };

// Free slots for one service and month, fetched through Next's route
// handler. Each month is kept while the step is open; changing month aborts
// the request still running. The step remounts whenever the visitor comes
// back to it, so a slot taken in the meantime is fetched afresh.
export function useAvailability(service: string, month: string) {
  const key = `${service}|${month}`;
  const [results, setResults] = useState<Record<string, Result>>({});
  const result = results[key];

  useEffect(() => {
    if (result) return;
    const controller = new AbortController();
    const query = new URLSearchParams({
      service,
      from: `${month}-01`,
      to: lastDayOfMonth(month),
    });
    fetch(`/api/booking/availability?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return { data: (await response.json()) as Availability };
      })
      .catch(() => ({ error: true }) as const)
      .then((next) => {
        if (!controller.signal.aborted) {
          setResults((all) => ({ ...all, [key]: next }));
        }
      });
    return () => controller.abort();
  }, [key, month, result, service]);

  return {
    loading: !result,
    error: result !== undefined && "error" in result,
    data: result && "data" in result ? result.data : undefined,
    retry: () =>
      setResults((all) => {
        const rest = { ...all };
        delete rest[key];
        return rest;
      }),
  };
}
