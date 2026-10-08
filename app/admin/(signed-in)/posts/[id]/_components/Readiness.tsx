import { CheckCircle } from "@phosphor-icons/react";
import { Card } from "@/components/admin/Card";
import { sectionTitle } from "./WebsiteFields";

// What still stands between the post and approval, as the editor checks it
// (lib/admin/postDraft.ts readiness).
export function Readiness({ problems }: { problems: string[] }) {
  return (
    <Card as="section">
      <h2 className={sectionTitle}>Before approval</h2>
      {problems.length === 0 ? (
        <p className="flex items-start gap-2 text-[0.92rem] text-ink">
          <CheckCircle
            aria-hidden="true"
            size={20}
            className="mt-0.5 shrink-0 text-olive"
          />
          Every channel that is on is ready for review.
        </p>
      ) : (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[0.92rem] leading-[1.6] text-muted">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
