"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

export default function VideoSessionError({ retry }: { retry: () => void }) {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex max-w-[660px] flex-col gap-6">
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">Video session</h1>
      <Notice tone="error">
        The session page could not load. The appointment is unchanged.
      </Notice>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button onClick={retry}>Retry</Button>
        <Button href={`/admin/appointments/${id}`} variant="quiet">
          Back to appointment
        </Button>
      </div>
    </div>
  );
}
