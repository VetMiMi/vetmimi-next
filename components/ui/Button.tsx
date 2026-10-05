import { AA, C } from "@/lib/tokens";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "editorial";
type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: AA.action,
    color: "#fff",
    border: `2px solid ${AA.action}`,
    padding: "14px 32px",
    borderRadius: "8px",
    fontFamily: "var(--sans)",
    fontWeight: 600,
    fontSize: "0.92rem",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    letterSpacing: "0.01em",
  },
  secondary: {
    backgroundColor: "transparent",
    color: C.indigo,
    border: `2px solid ${C.indigo}`,
    padding: "14px 32px",
    borderRadius: "8px",
    fontFamily: "var(--sans)",
    fontWeight: 600,
    fontSize: "0.92rem",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    letterSpacing: "0.01em",
  },
  editorial: {
    backgroundColor: "transparent",
    color: C.ink,
    border: "none",
    padding: "0",
    fontFamily: "var(--sans)",
    fontWeight: 500,
    fontSize: "0.92rem",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
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
  style,
  className,
}: ButtonProps) {
  const s: React.CSSProperties = {
    ...styles[variant],
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  if (href) {
    return (
      <SmartLink href={href} style={s} className={className}>
        {children}
      </SmartLink>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={s}
      className={className}
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
  const s: React.CSSProperties = {
    ...styles.editorial,
    borderBottom: `1px solid currentColor`,
    paddingBottom: "1px",
  };
  if (href)
    return (
      <SmartLink href={href} style={s}>
        {children} →
      </SmartLink>
    );
  return (
    <button onClick={onClick} style={s}>
      {children} →
    </button>
  );
}
