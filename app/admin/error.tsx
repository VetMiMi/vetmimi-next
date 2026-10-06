"use client";

import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

// Admin itself could not start, most often because the API is down or
// restarting, so there is no shell to show. Calm, and clear that nothing
// was lost (brief §7 Errors). Never the error itself.
export default function AdminError({ retry }: { retry: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center py-[clamp(44px,6vw,80px)]">
      <div className="w-[min(560px,calc(100%-40px))] rounded-card border border-card-border bg-raised p-[clamp(24px,4vw,44px)]">
        <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-label uppercase">
          VetMiMi admin
        </p>
        <h1 className="mb-6 text-[clamp(1.6rem,3vw,2.2rem)]">
          Admin is not available right now
        </h1>
        <Notice tone="error">
          Admin could not reach its server, so nothing was loaded or changed.
          Please try again in a minute.
        </Notice>
        <div className="mt-7">
          <Button onClick={retry}>Try again</Button>
        </div>
      </div>
    </main>
  );
}
