import { notFound } from "next/navigation";

// Any unknown path under /admin shows the 404 inside the shell, not the
// public one.
export default function AdminCatchAll() {
  notFound();
}
