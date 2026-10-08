import type { Metadata } from "next";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import { NoAccess } from "@/components/admin/NoAccess";
import { Notice } from "@/components/admin/Notice";
import { whenLong } from "@/lib/admin/appointments";
import {
  accessLabel,
  failMessage,
  lastErrorText,
  metaStatus,
  providerNames,
  type LinkedInConnection,
  type MetaConnection,
  type Provider,
} from "@/lib/admin/connections";
import { PRACTICE_TIMEZONE } from "@/lib/admin/posts";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { SettingsHeader } from "../SettingsHeader";
import { ConnectionCard } from "./ConnectionCard";
import { FinishConnection } from "./FinishConnection";
import { MetaPagePicker } from "./MetaPagePicker";
import { one, returnFromSignIn } from "./returnFromSignIn";

export const metadata: Metadata = { title: "Connections" };

const when = (instant?: string) =>
  instant ? whenLong(instant, PRACTICE_TIMEZONE) : undefined;

// A connection that could not be read still gets its card, saying so.
const readFailed = (error: unknown) => {
  if (error instanceof ApiError) return error;
  throw error;
};

const loadErrorText = (provider: Provider) =>
  `Could not check the ${providerNames[provider]} connection: the server is not set up for it yet, or did not answer. Reload the page to try again.`;

// Settings → Connections (#153): the Facebook Page with its Instagram
// account, and Daw Mi's LinkedIn profile. Site administrator only.
export default async function ConnectionsPage({
  searchParams,
}: PageProps<"/admin/settings/connections">) {
  const user = await requireRole("site_admin");
  if (!user) return <NoAccess />;
  const params = await searchParams;
  const callback = returnFromSignIn("meta", params);
  if (callback)
    return (
      <>
        <SettingsHeader active="connections" withTabs />
        <FinishConnection provider="meta" {...callback} />
      </>
    );

  const [meta, linkedin] = await Promise.all([
    adminCall(async (api) =>
      unwrap(await api.GET("/admin/connections/meta")),
    ).catch(readFailed),
    adminCall(async (api) =>
      unwrap(await api.GET("/admin/connections/linkedin")),
    ).catch(readFailed),
  ]);
  const failed = failMessage(one(params.failed), one(params.reason));

  return (
    <>
      <SettingsHeader active="connections" withTabs />
      <div className="flex flex-col gap-8">
        {failed && (
          <div className="max-w-[660px]">
            <Notice tone="error">{failed}</Notice>
          </div>
        )}
        <MetaCard connection={meta} />
        <LinkedInCard connection={linkedin} />
      </div>
    </>
  );
}

function MetaCard({ connection }: { connection: MetaConnection | ApiError }) {
  const common = {
    provider: "meta" as const,
    title: "Facebook Page and Instagram",
    icons: [FacebookLogo, InstagramLogo],
    about:
      "Posts go to your Facebook Page and to the Instagram Business account linked to it. Meta ends access 90 days after you sign in, so connect again before then.",
    disconnectNote:
      "Facebook and Instagram posts will use Copy & open until you connect again. Posts already published stay on Facebook and Instagram.",
  };
  if (connection instanceof ApiError)
    return <ConnectionCard {...common} loadError={loadErrorText("meta")} />;

  const status = metaStatus(connection);
  const facts: [string, string][] = [];
  if (connection.status === "connected") {
    facts.push(["Facebook Page", connection.pageName ?? "Your Page"]);
    facts.push([
      "Instagram",
      connection.instagramUsername
        ? `@${connection.instagramUsername}`
        : "None linked to this Page",
    ]);
    const since = when(connection.connectedAt);
    if (since) facts.push(["Connected", since]);
    const ends = when(connection.expiresAt);
    if (ends)
      facts.push([accessLabel(connection.expiresAt!), `${ends}, Sydney time`]);
    if (connection.lastError && status !== "reconnect_required")
      facts.push(["Last problem", lastErrorText(connection.lastError)]);
  }

  return (
    <ConnectionCard {...common} status={status} facts={facts}>
      {connection.status === "choosing_page" && (
        <MetaPagePicker pages={connection.pages ?? []} />
      )}
    </ConnectionCard>
  );
}

function LinkedInCard({
  connection,
}: {
  connection: LinkedInConnection | ApiError;
}) {
  const common = {
    provider: "linkedin" as const,
    title: "LinkedIn profile",
    icons: [LinkedinLogo],
    about:
      "Posts go to your personal LinkedIn profile. LinkedIn access lasts about 60 days and cannot renew itself, so connect again when it is about to end.",
    disconnectNote:
      "LinkedIn posts will use Copy & open until you connect again. Posts already published stay on LinkedIn.",
  };
  if (connection instanceof ApiError)
    return <ConnectionCard {...common} loadError={loadErrorText("linkedin")} />;

  const facts: [string, string][] = [];
  if (connection.status !== "not_connected") {
    if (connection.memberName) facts.push(["Profile", connection.memberName]);
    const since = when(connection.connectedAt);
    if (since) facts.push(["Connected", since]);
    const ends = when(connection.expiresAt);
    if (ends)
      facts.push([accessLabel(connection.expiresAt!), `${ends}, Sydney time`]);
  }

  return (
    <ConnectionCard {...common} status={connection.status} facts={facts} />
  );
}
