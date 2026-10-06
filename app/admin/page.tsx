import { Button } from "@/components/admin/Button";
import { requireUser } from "@/lib/admin/session";
import { signOut } from "./actions";

// Placeholder until the admin shell (#39) brings the dashboard and its own
// sign-out button: proves the session and lets Daw Mi sign out again.
export default async function AdminHome() {
  const user = await requireUser();
  return (
    <main className="mx-auto w-[min(660px,calc(100%-40px))] py-[clamp(64px,12vw,120px)]">
      <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-label uppercase">
        VetMiMi admin
      </p>
      <h1 className="mb-4 text-[clamp(1.6rem,3vw,2.2rem)]">
        Signed in as {user.displayName}
      </h1>
      <p className="mb-7 text-[0.95rem] text-muted">
        The dashboard is not built yet.
      </p>
      <form action={signOut}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </main>
  );
}
