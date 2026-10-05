import { notFound } from "next/navigation";

// Any unknown path under /admin shows the admin 404, not the public one.
export default function AdminCatchAll() {
  notFound();
}
