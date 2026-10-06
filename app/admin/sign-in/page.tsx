import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PetalOutline } from "@/components/art/Shapes";
import { Notice } from "@/components/admin/Notice";
import { safeNext } from "@/lib/admin/safe-next";
import { getCurrentUser } from "@/lib/admin/session";
import { C } from "@/lib/tokens";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: PageProps<"/admin/sign-in">) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // Already signed in: carry on. If the API cannot say, show the form; the
  // sign-in attempt will explain what is wrong.
  if (await getCurrentUser().catch(() => null)) redirect(next);

  return (
    <main className="grid min-h-dvh place-items-center py-[clamp(44px,6vw,80px)]">
      <div className="relative w-[min(660px,calc(100%-40px))]">
        {/* The one decoration brief §1 allows in admin, where nothing is
            being done yet. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-11 -right-3 md:-top-14 md:-right-16"
        >
          <PetalOutline color={C.rose} size={112} />
        </div>
        <div className="relative rounded-card border border-card-border bg-raised p-[clamp(24px,4vw,44px)]">
          <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-label uppercase">
            VetMiMi admin
          </p>
          <h1 className="mb-7 text-[clamp(1.6rem,3vw,2.2rem)]">Sign in</h1>
          {params.expired === "1" ? (
            <div className="mb-[22px]">
              <Notice tone="info">
                Your session ended. Sign in again to continue.
              </Notice>
            </div>
          ) : params["signed-out"] === "1" ? (
            <div className="mb-[22px]">
              <Notice tone="info">You have signed out.</Notice>
            </div>
          ) : null}
          <SignInForm next={next} />
          <p className="mt-7 border-t border-divider pt-5 text-[0.8rem] leading-[1.6] text-muted">
            Lost your authenticator? Ask the site administrator to reset your
            access.
          </p>
        </div>
      </div>
    </main>
  );
}
