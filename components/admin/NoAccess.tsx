import { LockSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "./Button";

// What a page shows when requireRole says no (Booking UX §29): a
// permission message and nothing about any record.
export function NoAccess() {
  return (
    <div className="flex max-w-[560px] flex-col items-start gap-3 py-[clamp(32px,6vw,64px)]">
      <LockSimple aria-hidden="true" size={32} className="text-indigo" />
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">
        You do not have access to this page.
      </h1>
      <p className="text-[0.95rem] text-muted">
        Your account is not set up for this part of admin. If you need it, ask
        the site administrator.
      </p>
      <div className="mt-4">
        <Button href="/admin" variant="secondary">
          Go to the dashboard
        </Button>
      </div>
    </div>
  );
}
