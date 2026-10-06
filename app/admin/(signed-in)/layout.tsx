import { BottomNav } from "@/components/admin/BottomNav";
import { navFor } from "@/components/admin/nav";
import { Sidebar } from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/admin/Toast";
import { TopBar } from "@/components/admin/TopBar";
import { requireUser } from "@/lib/admin/session";

// The admin shell (brief §7 Shell): a sidebar from 1024px, a top bar and
// bottom tabs below. Navigation shows only the sections the user's roles
// can use. Sign-in sits outside this group, so it has no shell.
export default async function ShellLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();
  const items = navFor(user.roles);
  return (
    <ToastProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
        <Sidebar items={items} displayName={user.displayName} />
        <div className="min-w-0">
          <TopBar />
          {/* Bottom padding keeps the tab bar off the last line. */}
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-[min(1120px,calc(100%-40px))] pt-[clamp(28px,5vw,56px)] pb-[calc(112px+env(safe-area-inset-bottom))] md:w-[min(1120px,calc(100%-48px))] lg:pb-[clamp(44px,6vw,80px)]"
          >
            {children}
          </main>
        </div>
      </div>
      <BottomNav items={items} />
    </ToastProvider>
  );
}
