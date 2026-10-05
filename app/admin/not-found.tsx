import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="mx-auto w-[min(560px,calc(100%-40px))] py-[clamp(64px,12vw,120px)]">
      <p className="mb-3 text-[0.7rem] font-bold tracking-[0.12em] text-label uppercase">
        Page not found
      </p>
      <h1 className="mb-4 text-[clamp(1.6rem,3vw,2.2rem)]">
        This page does not exist.
      </h1>
      <p className="mb-7 text-[0.95rem] text-muted">
        The address may be mistyped, or the page may have moved.
      </p>
      <Link href="/admin" className="ed-button">
        Go to admin
      </Link>
    </main>
  );
}
