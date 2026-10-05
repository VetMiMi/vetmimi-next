import Link from "next/link";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";

type Variant = "primary" | "secondary" | "quiet" | "danger";

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  // "page" is the taller page-level action (48px, as .ed-button).
  size?: "control" | "page";
  icon?: React.ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  Omit<
    React.ComponentProps<"button">,
    keyof CommonProps | "style" | "aria-busy"
  > & {
    href?: undefined;
    // Disables the button and shows a spinner beside the caller's label,
    // which should say what is happening ("Saving…").
    busy?: boolean;
  };

type LinkProps = CommonProps & {
  href: string;
  type?: never;
  disabled?: never;
  busy?: never;
  onClick?: never;
};

// Primary and danger use #ab4347 (white text 5.79:1), not the public Btn's
// coral (3.62:1, brief §2). Hover sits behind not-disabled so a disabled
// button does not answer the pointer; links are never :disabled.
const variants: Record<Variant, string> = {
  primary: "bg-action text-white not-disabled:hover:bg-action-hover",
  danger: "bg-action text-white not-disabled:hover:bg-action-hover",
  secondary:
    "border-2 border-indigo text-indigo not-disabled:hover:bg-indigo/12",
  quiet: "text-ink not-disabled:hover:text-indigo",
};

const sizes = {
  control: "min-h-11 px-[22px] py-2",
  page: "min-h-12 px-[22px] py-[14px]",
};

function classes(variant: Variant, size: "control" | "page", extra = "") {
  // Quiet is the EditorialLink: no box, so no padding to push it off the
  // text it sits beside; it keeps the 44px height for touch.
  const box = variant === "quiet" ? "min-h-11" : sizes[size];
  return `inline-flex cursor-pointer items-center justify-center gap-2 rounded-control text-center text-[0.9rem] leading-tight font-semibold no-underline transition-colors duration-150 ease-in-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 data-busy:cursor-wait ${box} ${variants[variant]} ${extra}`;
}

function Label({
  variant,
  icon,
  children,
}: Pick<CommonProps, "variant" | "icon" | "children">) {
  return (
    <>
      {icon}
      {variant === "quiet" ? (
        <span className="border-b border-current pb-px">{children}</span>
      ) : (
        children
      )}
    </>
  );
}

const isAdminPath = (href: string) => /^\/admin(?=$|[/?#])/.test(href);

// Admin pages go through next/link; anything else (the public site, mailto:,
// other sites) stays a plain link.
function ButtonLink({
  href,
  variant = "primary",
  size = "control",
  icon,
  className,
  children,
}: LinkProps) {
  const cls = classes(variant, size, className);
  const label = <Label {...{ variant, icon, children }} />;
  return isAdminPath(href) ? (
    <Link href={href} className={cls}>
      {label}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {label}
    </a>
  );
}

export function Button(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) return <ButtonLink {...props} />;

  const {
    variant = "primary",
    size = "control",
    icon,
    className,
    children,
    busy,
    disabled,
    type = "button",
    ...rest
  } = props;
  const spinner = (
    <CircleNotch
      aria-hidden="true"
      size={18}
      className="shrink-0 animate-spin motion-reduce:animate-none"
    />
  );
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || busy}
      data-busy={busy || undefined}
      className={classes(variant, size, className)}
    >
      <Label variant={variant} icon={busy ? spinner : icon}>
        {children}
      </Label>
    </button>
  );
}
