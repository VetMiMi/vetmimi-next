import { EmptyState } from "@/components/admin/EmptyState";

export default function AppointmentNotFound() {
  return (
    <>
      <h1 className="mb-[clamp(28px,4vw,40px)] text-[clamp(1.6rem,3vw,2.2rem)]">
        Appointment not found
      </h1>
      <EmptyState
        title="This appointment does not exist or was removed."
        action={{ label: "Back to appointments", href: "/admin/appointments" }}
      />
    </>
  );
}
