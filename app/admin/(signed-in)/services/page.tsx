import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <ComingSoon href="/admin/services" />;
}
