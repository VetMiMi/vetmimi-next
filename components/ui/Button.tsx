import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "editorial";
type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

const BOX =
  "inline-block cursor-pointer rounded-lg border-2 px-8 py-3.5 text-[0.92rem] font-semibold tracking-[0.01em]";
const EDITORIAL =
  "inline-flex cursor-pointer items-center gap-1.5 text-[0.92rem] font-medium text-ink";

const variants: Record<Variant, string> = {
  primary: `${BOX} border-action bg-action text-white`,
  secondary: `${BOX} border-indigo text-indigo`,
  editorial: EDITORIAL,
};

// Site pages go through the i18n Link so they keep the visitor's language;
// anything else (mailto:, tel:, other sites, #anchors) stays a plain link.
function SmartLink({
  href,
  ...props
}: { href: string; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  return href.startsWith("/") ? (
    <Link href={href} {...props} />
  ) : (
    <a href={href} {...props} />
  );
}

export function Btn({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  className,
}: ButtonProps) {
  const classes = [variants[variant], disabled && "opacity-50", className]
    .filter(Boolean)
    .join(" ");
  if (href) {
    return (
      <SmartLink href={href} className={classes}>
        {children}
      </SmartLink>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}

export function EditorialLink({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const classes = `${EDITORIAL} border-b pb-px`;
  if (href)
    return (
      <SmartLink href={href} className={classes}>
        {children} →
      </SmartLink>
    );
  return (
    <button onClick={onClick} className={classes}>
      {children} →
    </button>
  );
}
