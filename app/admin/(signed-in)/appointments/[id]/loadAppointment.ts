import "server-only";
import { notFound } from "next/navigation";
import { adminCall } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One appointment with its history and communications, or the shell's
// not-found page. Null means the API refused this user: the page shows the
// permission message and no data (Booking UX §29).
export async function loadAppointment(id: string) {
  if (!UUID.test(id)) notFound();
  return adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/appointments/{appointmentId}", {
        params: { path: { appointmentId: id } },
      }),
    ),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
}
