import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { signOut } from "@/app/admin/actions";

// Quiet, because signing out is never the task at hand (brief §7 Shell).
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[0.84rem] font-medium text-ink/72 transition-colors duration-150 hover:text-ink motion-reduce:transition-none"
      >
        <SignOut aria-hidden="true" size={18} />
        Sign out
      </button>
    </form>
  );
}
