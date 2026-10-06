"use server";

import { mutate } from "@/lib/admin/mutation";
import type { SettingsPatch } from "./fields";

// One section's keys at a time (#76), so a failure leaves the rest alone.
export async function updateSettings(patch: SettingsPatch) {
  return mutate(
    "/admin/settings",
    (api) => api.PATCH("/admin/settings", { body: patch }),
    { failure: "Settings were not saved. The previous values remain active." },
  );
}
