import { SignOutButton } from "./SignOutButton";
import { Wordmark } from "./Wordmark";

// Below 1024px the tabs hold the sections, so this slim bar holds the
// wordmark and sign-out (brief §7 Shell).
export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-ink/9 bg-canvas px-5 lg:hidden">
      <Wordmark />
      <SignOutButton />
    </header>
  );
}
