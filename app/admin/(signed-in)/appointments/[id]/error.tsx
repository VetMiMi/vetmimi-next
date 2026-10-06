"use client";

import { LoadError } from "../_components/LoadError";

export default function AppointmentError({ retry }: { retry: () => void }) {
  return (
    <LoadError
      title="Appointment"
      message="The appointment could not be loaded. Nothing has changed."
      retry={retry}
    />
  );
}
