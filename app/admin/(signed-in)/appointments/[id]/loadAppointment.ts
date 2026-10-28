import "server-only";
import { notFound } from "next/navigation";
import { adminCall } from "@/lib/admin/session";
import { apiPath } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type { AppointmentDetail } from "@/lib/api/types/appointments";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One appointment with its history and communications, or the shell's
// not-found page. Null means the API refused this user: the page shows the
// permission message and no data (Booking UX §29).
export async function loadAppointment(id: string) {
  if (!UUID.test(id)) notFound();
  return adminCall((api) =>
    api.get<AppointmentDetail>(apiPath`/admin/appointments/${id}`),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
}
