import { redirect } from "next/navigation";
import {
  failedHref,
  platformErrorReason,
  type Provider,
} from "@/lib/admin/connections";

type Params = Record<string, string | string[] | undefined>;

export const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

// Facebook, and LinkedIn's own page beside this one, return here with
// `code` and `state`, or with `error` when Daw Mi backed out.
export function returnFromSignIn(provider: Provider, params: Params) {
  const error = one(params.error);
  if (error) redirect(failedHref(provider, platformErrorReason(error)));
  const code = one(params.code);
  const state = one(params.state);
  return code && state ? { code, state } : undefined;
}
