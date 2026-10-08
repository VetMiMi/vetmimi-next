"use client";

import { useState, useTransition } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Notice } from "@/components/admin/Notice";
import { Select } from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toast";
import { channelNames } from "@/lib/admin/posts";
import type { Draft, SocialChannel } from "@/lib/admin/postDraft";
import type { Language } from "@/lib/admin/suggestions";
import { channelIcons } from "../../_components/ChannelBadge";
import { suggestVersions } from "../actions";
import { sectionTitle } from "./WebsiteFields";

const CHANNELS: SocialChannel[] = ["facebook", "instagram", "linkedin"];

const languages = [
  { value: "en", label: "English" },
  { value: "my", label: "Burmese" },
];

const columnLabel =
  "mb-2 text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase";

// "Suggest versions" (#153): the AI assistant drafts the switched-on social
// channels from the saved website article, shown beside the current text.
// Accept puts a suggestion in the field, unsaved; Discard drops it. Daw Mi
// still edits, saves and approves: nothing here saves or publishes.
export function Suggestions({
  postId,
  draft,
  onAccept,
}: {
  postId: string;
  draft: Draft;
  onAccept: (channel: SocialChannel, patch: { text: string }) => void;
}) {
  const [language, setLanguage] = useState<Language>("en");
  const [texts, setTexts] = useState<Partial<Record<SocialChannel, string>>>(
    {},
  );
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const channels = CHANNELS.filter((channel) => draft[channel].enabled);
  const shown = CHANNELS.filter((channel) => texts[channel] !== undefined);
  const hint = pending
    ? "This can take up to half a minute. You can keep editing meanwhile."
    : channels.length === 0
      ? "Switch on Facebook, Instagram or LinkedIn above to get suggestions."
      : undefined;

  function suggest() {
    setError(undefined);
    startTransition(async () => {
      const outcome = await suggestVersions(postId, channels, language);
      if (outcome.ok) {
        setTexts(outcome.texts);
        if (Object.keys(outcome.texts).length === 0)
          setError("The assistant had no suggestions this time. Try again.");
      } else setError(outcome.message);
    });
  }

  function drop(channel: SocialChannel) {
    setTexts((all) => {
      const rest = { ...all };
      delete rest[channel];
      return rest;
    });
  }

  function accept(channel: SocialChannel, text: string) {
    onAccept(channel, { text });
    drop(channel);
    toast(`${channelNames[channel]} text replaced. Save to keep it`);
  }

  return (
    <Card as="section" className="flex flex-col gap-[22px]">
      <div>
        <h2 className={`${sectionTitle} mb-2`}>Suggested versions</h2>
        <p className="text-[0.92rem] leading-[1.65] text-muted">
          The assistant writes the switched-on social posts from the saved
          website article. Nothing changes until you accept a suggestion, and
          you still save and approve the post.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:w-48">
          <Select
            label="Write in"
            name="suggestionLanguage"
            required
            options={languages}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          />
        </div>
        <Button
          variant="secondary"
          icon={<Sparkle aria-hidden="true" size={18} />}
          busy={pending}
          disabled={channels.length === 0}
          onClick={suggest}
        >
          {pending ? "Writing suggestions…" : "Suggest versions"}
        </Button>
      </div>
      {hint && (
        <p role="status" className="text-[0.88rem] leading-[1.6] text-muted">
          {hint}
        </p>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      {shown.map((channel) => {
        const Icon = channelIcons[channel];
        const text = texts[channel]!;
        const current = draft[channel].text;
        return (
          <article
            key={channel}
            aria-labelledby={`suggestion-${channel}`}
            className="flex flex-col gap-4 rounded-choice border border-card-border bg-white p-5"
          >
            <h3
              id={`suggestion-${channel}`}
              className="flex items-center gap-2 font-body! text-[1rem]! font-semibold!"
            >
              <Icon aria-hidden="true" size={20} className="text-indigo" />
              {channelNames[channel]}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <p className={columnLabel}>Current</p>
                <p className="text-[0.92rem] leading-[1.65] break-words whitespace-pre-wrap text-muted">
                  {current.trim() ? current : "Nothing written yet."}
                </p>
              </div>
              <div className="min-w-0 rounded-control bg-indigo/7 p-4">
                <p className={columnLabel}>Suggested</p>
                <p
                  lang={language}
                  className="text-[0.92rem] leading-[1.65] break-words whitespace-pre-wrap"
                >
                  {text}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button variant="secondary" onClick={() => accept(channel, text)}>
                Accept
                <span className="sr-only">
                  {" "}
                  the {channelNames[channel]} suggestion
                </span>
              </Button>
              <Button variant="quiet" onClick={() => drop(channel)}>
                Discard
                <span className="sr-only">
                  {" "}
                  the {channelNames[channel]} suggestion
                </span>
              </Button>
            </div>
          </article>
        );
      })}
    </Card>
  );
}
