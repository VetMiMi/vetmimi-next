import { NestedOval, PetalOutline } from "@/components/art/Shapes";
import { C } from "@/lib/tokens";
import { Button } from "./Button";

const shapes = { petal: PetalOutline, oval: NestedOval };

// What is empty, why if it helps, and the one next step (brief §7). Never
// fake rows. The shape is the one decoration admin allows where nothing is
// being done (brief §1).
export function EmptyState({
  title,
  text,
  action,
  shape,
  headingLevel = 2,
}: {
  title: string;
  text?: string;
  action?: { label: string; href: string };
  shape?: keyof typeof shapes;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  const Shape = shape && shapes[shape];
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-card-border bg-raised px-[clamp(24px,4vw,44px)] py-[clamp(32px,5vw,48px)]">
      {Shape && (
        <div aria-hidden="true" className="mb-1">
          <Shape color={C.rose} size={56} />
        </div>
      )}
      <Heading className="text-[1.35rem]">{title}</Heading>
      {text && <p className="max-w-[56ch] text-[0.95rem] text-muted">{text}</p>}
      {action && (
        <div className="mt-2">
          <Button href={action.href} variant="secondary">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
