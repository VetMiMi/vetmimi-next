import { EmptyState } from "@/components/admin/EmptyState";

// An unknown admin address, inside the shell.
export default function ShellNotFound() {
  return (
    <>
      <h1 className="mb-[clamp(28px,4vw,40px)] text-[clamp(1.6rem,3vw,2.2rem)]">
        Page not found
      </h1>
      <EmptyState
        title="This page does not exist."
        text="The address may be mistyped, or the page may have moved."
        action={{ label: "Go to the dashboard", href: "/admin" }}
      />
    </>
  );
}
