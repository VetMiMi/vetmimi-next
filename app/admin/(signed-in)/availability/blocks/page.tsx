import { redirect } from "next/navigation";

// Days off and changed hours now live on the one availability page.
export default function Page() {
  redirect("/admin/availability");
}
