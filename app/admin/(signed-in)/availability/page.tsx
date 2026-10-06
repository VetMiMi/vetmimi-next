import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Availability" };

export default function AvailabilityPage() {
  return <ComingSoon href="/admin/availability" />;
}
