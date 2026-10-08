"use server";

import {
  isProvider,
  providerNames,
  type LinkedInConnection,
  type MetaConnection,
  type Provider,
} from "@/lib/admin/connections";
import { mutate } from "@/lib/admin/mutation";

const PATH = "/admin/settings/connections";

function check(provider: Provider) {
  if (!isProvider(provider)) throw new Error("Bad provider");
}

const notSetUp = (provider: Provider) =>
  `${providerNames[provider]} sign-in is not available: the server is not set up for it yet, or did not answer. Nothing changed.`;

// The platform's sign-in address; the browser goes there next.
export async function startConnection(provider: Provider) {
  check(provider);
  return mutate(
    PATH,
    (api) =>
      provider === "meta"
        ? api.POST("/admin/connections/meta/authorize")
        : api.POST("/admin/connections/linkedin/authorize"),
    {
      failure: `${providerNames[provider]} sign-in could not start. Nothing changed. Try again in a few minutes.`,
      codes: { unavailable: notSetUp(provider) },
    },
  );
}

// The platform sent Daw Mi back with `code` and `state`; the API trades
// them for a token within ten minutes.
export async function finishConnection(
  provider: Provider,
  code: string,
  state: string,
) {
  check(provider);
  if (!code || !state || code.length > 2048 || state.length > 2048)
    throw new Error("Bad callback");
  const body = { code, state };
  return mutate<MetaConnection | LinkedInConnection>(
    PATH,
    (api) =>
      provider === "meta"
        ? api.POST("/admin/connections/meta/callback", { body })
        : api.POST("/admin/connections/linkedin/callback", { body }),
    { failure: `${providerNames[provider]} was not connected.` },
  );
}

// With several Pages, the one Daw Mi chose.
export async function chooseMetaPage(pageId: string) {
  if (!/^[\w-]{1,64}$/.test(pageId)) throw new Error("Bad page");
  return mutate(
    PATH,
    (api) => api.PUT("/admin/connections/meta/page", { body: { pageId } }),
    {
      failure: "The Page was not connected. Nothing changed. Try again.",
      codes: {
        not_found:
          "You no longer manage that Page on Facebook. Choose another, or connect Facebook again.",
        action_not_allowed:
          "This Facebook sign-in has moved on. Reload the page to see where it is now.",
      },
    },
  );
}

export async function disconnect(provider: Provider) {
  check(provider);
  return mutate(
    PATH,
    (api) =>
      provider === "meta"
        ? api.DELETE("/admin/connections/meta")
        : api.DELETE("/admin/connections/linkedin"),
    {
      failure: `${providerNames[provider]} was not disconnected. It is still connected.`,
    },
  );
}
