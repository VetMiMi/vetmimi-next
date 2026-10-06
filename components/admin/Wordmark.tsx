import Link from "next/link";

// The site header's wordmark, with "Admin" where the tagline sits.
export function Wordmark() {
  return (
    <Link href="/admin" className="flex flex-col leading-none no-underline">
      <span className="font-display text-[1.45rem] tracking-[-0.01em] text-ink">
        VetMiMi
      </span>
      <span className="mt-1 text-[0.7rem] font-bold tracking-[0.12em] text-label uppercase">
        Admin
      </span>
    </Link>
  );
}
