"use client";

import { LoadError } from "./_components/LoadError";

export default function AppointmentsError({ retry }: { retry: () => void }) {
  return (
    <LoadError
      title="Appointments"
      message="The list could not be loaded. Nothing has changed."
      retry={retry}
    />
  );
}
