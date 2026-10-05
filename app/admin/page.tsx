import { notFound } from "next/navigation";

// Placeholder until the admin shell lands: /admin shows the admin 404.
// Without a page here, /admin would fall through to app/[locale].
export default function AdminHome() {
  notFound();
}
