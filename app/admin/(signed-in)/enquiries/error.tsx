"use client";

import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

export default function EnquiriesError({ retry }: { retry: () => void }) {
  return (
    <div className="flex max-w-[660px] flex-col gap-6">
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">Enquiries</h1>
      <Notice tone="error">The enquiries could not be loaded.</Notice>
      <div>
        <Button onClick={retry}>Retry</Button>
      </div>
    </div>
  );
}
