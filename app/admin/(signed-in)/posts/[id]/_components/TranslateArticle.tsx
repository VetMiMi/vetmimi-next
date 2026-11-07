"use client";

import { useState, useTransition } from "react";
import { Translate } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { Select } from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toast";
import type { Draft } from "@/lib/admin/postDraft";
import { languageNames, type Language } from "@/lib/admin/suggestions";
import { translateArticle } from "../actions";

type Website = Draft["website"];

const languages = [
  { value: "my", label: "Burmese" },
  { value: "en", label: "English" },
];

// The assistant translates the saved article into the other language and
// fills in its title, excerpt and body, unsaved. Text already there is
// only replaced after Daw Mi agrees.
export function TranslateArticle({
  postId,
  website,
  unsaved,
  onTranslated,
}: {
  postId: string;
  website: Website;
  unsaved: boolean;
  onTranslated: (patch: Partial<Website>) => void;
}) {
  const [into, setInto] = useState<Language>("my");
  const [asking, setAsking] = useState(false);
  const [done, setDone] = useState<Language>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const name = languageNames[into];
  const from = languageNames[into === "my" ? "en" : "my"];
  const hasText = [website.title, website.excerpt, website.body].some((text) =>
    text[into].trim(),
  );

  function translate() {
    setError(undefined);
    startTransition(async () => {
      const outcome = await translateArticle(postId, into);
      setAsking(false);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      const { title, excerpt, body } = outcome.website;
      onTranslated({
        title: { ...website.title, [into]: title },
        excerpt: { ...website.excerpt, [into]: excerpt },
        body: { ...website.body, [into]: body },
      });
      setDone(into);
      toast(`${name} article filled in. Check it, then save`);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-choice border border-card-border bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:w-48">
          <Select
            label="Translate into"
            name="translateInto"
            required
            options={languages}
            value={into}
            onChange={(event) => setInto(event.target.value as Language)}
          />
        </div>
        <Button
          variant="secondary"
          icon={<Translate aria-hidden="true" size={18} />}
          busy={pending && !asking}
          disabled={unsaved}
          onClick={() => (hasText ? setAsking(true) : translate())}
        >
          {pending ? "Translating…" : "Translate"}
        </Button>
      </div>
      <p role="status" className="text-[0.88rem] leading-[1.6] text-muted">
        {unsaved
          ? `Save your changes first: the translation is made from the saved ${from} article.`
          : pending
            ? "This can take up to a minute. You can keep editing meanwhile."
            : `Made from the saved ${from} article. Nothing changes until you save.`}
      </p>
      {error && <Notice tone="error">{error}</Notice>}
      {done && (
        <Notice tone="info">
          The {languageNames[done]} text is a machine translation. Have it
          checked by a native speaker before you publish.
        </Notice>
      )}
      <Dialog
        open={asking}
        onClose={() => setAsking(false)}
        title={`Replace the ${name} text?`}
        confirmLabel="Translate and replace"
        busyLabel="Translating…"
        busy={pending}
        onConfirm={translate}
      >
        <p>
          The {name} title, excerpt and article will be replaced with a new
          translation. Nothing is saved until you save the post.
        </p>
      </Dialog>
    </div>
  );
}
