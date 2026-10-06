"use client";

import { LoadError } from "../_components/LoadError";

export default function NewAppointmentError({ retry }: { retry: () => void }) {
  return (
    <LoadError
      title="New appointment"
      message="The form could not be loaded. Nothing was saved."
      retry={retry}
    />
  );
}
