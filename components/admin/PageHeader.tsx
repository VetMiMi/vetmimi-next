import Link from "next/link";

// Brief §7 Page header: breadcrumb, the page's one h1, one line of
// description, and the page's primary action, which drops under the title
// at full width below 768px.
export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-[clamp(28px,4vw,40px)]">
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap gap-3 text-[0.82rem] text-muted">
            {breadcrumb.map((crumb) => (
              <li key={crumb.href} className="after:ml-3 after:content-['/']">
                <Link
                  href={crumb.href}
                  className="underline underline-offset-4 hover:text-ink"
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] break-words">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-[56ch] text-[0.95rem] text-muted">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 max-md:*:w-full">{action}</div>}
      </div>
    </header>
  );
}
