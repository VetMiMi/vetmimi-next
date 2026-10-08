import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NoAccess } from "@/components/admin/NoAccess";
import { requireRole } from "@/lib/admin/session";
import { SettingsHeader } from "../../SettingsHeader";
import { FinishConnection } from "../FinishConnection";
import { returnFromSignIn } from "../returnFromSignIn";

export const metadata: Metadata = { title: "Connecting LinkedIn" };

// Where LinkedIn sends Daw Mi back (its redirect address is registered
// apart from Facebook's). Without a code there is nothing to do here.
export default async function LinkedInReturnPage({
  searchParams,
}: PageProps<"/admin/settings/connections/linkedin">) {
  const user = await requireRole("site_admin");
  if (!user) return <NoAccess />;
  const callback = returnFromSignIn("linkedin", await searchParams);
  if (!callback) redirect("/admin/settings/connections");
  return (
    <>
      <SettingsHeader active="connections" withTabs />
      <FinishConnection provider="linkedin" {...callback} />
    </>
  );
}
