import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Enquiries" };

export default function EnquiriesPage() {
  return <ComingSoon href="/admin/enquiries" />;
}
