// The .contact-card surface (brief §8): raised on canvas, white where it
// sits on paper. `as` gives it the right landmark or list semantics.
export function Card({
  as: Tag = "div",
  surface = "raised",
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "li";
  surface?: "raised" | "white";
  className?: string;
  children: React.ReactNode;
}) {
  const bg = surface === "white" ? "bg-white" : "bg-raised";
  return (
    <Tag
      className={`rounded-card border border-card-border p-[clamp(24px,4vw,44px)] ${bg} ${className}`}
    >
      {children}
    </Tag>
  );
}
