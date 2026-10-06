"use client";

import { Checkbox } from "@/components/admin/Checkbox";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Textarea } from "@/components/admin/Textarea";
import { kindNames } from "@/lib/admin/posts";
import { consentChecks, type Draft } from "@/lib/admin/postDraft";
import { sectionTitle } from "./WebsiteFields";

const kinds = Object.entries(kindNames).map(([value, label]) => ({
  value,
  label,
}));

// The post itself: its working title, kind, whether it is still an idea,
// and for a True Story the storyteller's consent.
export function PostFields({
  draft,
  confirmedAt,
  errors,
  onChange,
}: {
  draft: Draft;
  confirmedAt?: string;
  errors: Record<string, string>;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const { consent } = draft;
  const setCheck = (index: number, checked: boolean) =>
    onChange({
      consent: {
        ...consent,
        checks: consent.checks.map((c, i) => (i === index ? checked : c)),
      },
    });

  return (
    <section aria-labelledby="post-title" className="flex flex-col gap-[22px]">
      <h2 id="post-title" className={`${sectionTitle} mb-0`}>
        Post
      </h2>
      <Input
        label="Working title"
        name="title"
        required
        maxLength={200}
        help="For finding the post here. The article and each social post have their own words."
        value={draft.title}
        onChange={(event) => onChange({ title: event.target.value })}
        error={errors.title}
      />
      <div className="grid gap-[18px] md:grid-cols-2">
        <Select
          label="Kind"
          name="kind"
          required
          options={kinds}
          value={draft.kind}
          onChange={(event) =>
            onChange({ kind: event.target.value as Draft["kind"] })
          }
          error={errors.kind}
        />
        {draft.stage && (
          <Select
            label="Stage"
            name="status"
            required
            options={[
              { value: "idea", label: "Idea" },
              { value: "draft", label: "Draft" },
            ]}
            value={draft.stage}
            onChange={(event) =>
              onChange({ stage: event.target.value as Draft["stage"] })
            }
            error={errors.status}
          />
        )}
      </div>

      {draft.kind === "true_story" && (
        <fieldset className="m-0 flex min-w-0 flex-col gap-1 rounded-inner border border-card-border bg-white px-5 py-4">
          <legend className="px-1 text-[0.88rem] font-semibold">
            Storyteller&rsquo;s consent
          </legend>
          <p className="mb-2 text-[0.88rem] leading-[1.6] text-muted">
            A True Story needs every item ticked before it can be approved.
            {confirmedAt && ` Confirmed ${confirmedAt}.`}
          </p>
          {consentChecks.map((label, i) => (
            <Checkbox
              key={label}
              label={label}
              name={`consent.check${i}`}
              checked={consent.checks[i]}
              onChange={(event) => setCheck(i, event.target.checked)}
            />
          ))}
          <div className="mt-3">
            <Textarea
              label="Where the consent is kept"
              name="consent.note"
              help="Internal only, e.g. “Signed form, client folder, 3 Oct”."
              rows={3}
              maxLength={2000}
              value={consent.note}
              onChange={(event) =>
                onChange({ consent: { ...consent, note: event.target.value } })
              }
              error={errors["consent.note"] ?? errors["consent.confirmed"]}
            />
          </div>
        </fieldset>
      )}
    </section>
  );
}
