"use server";

import { mutate } from "@/lib/admin/mutation";
import type { Settings, SettingsPatch } from "./fields";

// One section's keys at a time (#76), so a failure leaves the rest alone.
export async function updateSettings(patch: SettingsPatch) {
  return mutate(
    "/admin/settings",
    (api) => api.patch<Settings>("/admin/settings", patch),
    { failure: "Settings were not saved. The previous values remain active." },
  );
}
