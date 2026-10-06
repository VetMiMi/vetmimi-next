"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { channelNames } from "@/lib/admin/posts";
import {
  characterCount,
  hashtagCount,
  limits,
  type Draft,
  type SocialChannel,
} from "@/lib/admin/postDraft";
import { channelIcons } from "../../_components/ChannelBadge";
import { ImageSlot } from "./ImageSlot";
import { previews } from "./SocialPreviews";
import { sectionTitle } from "./WebsiteFields";
import { Switch } from "./Switch";

type Version = { enabled: boolean; text: string; link?: string };

const CHANNELS: SocialChannel[] = ["facebook", "instagram", "linkedin"];

const imageRules: Record<SocialChannel, string> = {
  facebook: "Up to 10 images, or none to show the link.",
  instagram: "Instagram needs 1 to 10 images.",
  linkedin: "At most one image.",
};

const n = (value: number) => value.toLocaleString("en-AU");

// What the counter says, and the error when a limit the API applies at
// approval is passed.
function counter(channel: SocialChannel, text: string) {
  const chars = characterCount(text);
  if (channel === "instagram") {
    const tags = hashtagCount(text);
    const { characters, hashtags } = limits.instagram;
    return {
      line: `${n(chars)} / ${n(characters)} characters · ${tags} / ${hashtags} hashtags`,
      over:
        chars > characters
          ? `Instagram allows ${n(characters)} characters. Remove ${n(chars - characters)}.`
          : tags > hashtags
            ? `Instagram allows ${hashtags} hashtags. Remove ${tags - hashtags}.`
            : undefined,
    };
  }
  if (channel === "linkedin") {
    const { characters } = limits.linkedin;
    return {
      line: `${n(chars)} / ${n(characters)} characters`,
      over:
        chars > characters
          ? `LinkedIn allows ${n(characters)} characters. Remove ${n(chars - characters)}.`
          : undefined,
    };
  }
  return { line: `${n(chars)} characters`, over: undefined };
}

// The Facebook, Instagram and LinkedIn versions as tabs (ARIA tabs: arrow
// keys move between them), each with its switch, text, counter, images and
// a preview. A post that can no longer change still shows every tab.
export function SocialTabs({
  disabled,
  draft,
  imageIds,
  errors,
  onChange,
}: {
  disabled: boolean;
  draft: Draft;
  imageIds: Record<SocialChannel, string[]>;
  errors: Record<string, string>;
  onChange: (channel: SocialChannel, patch: Partial<Version>) => void;
}) {
  const [active, setActive] = useState<SocialChannel>("facebook");
  const tabs = useRef<Partial<Record<SocialChannel, HTMLButtonElement | null>>>(
    {},
  );

  function onKeyDown(event: React.KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next =
      CHANNELS[(CHANNELS.indexOf(active) + step + CHANNELS.length) % 3];
    setActive(next);
    tabs.current[next]?.focus();
  }

  const version: Version = draft[active];
  const { line, over } = counter(active, version.text);
  const textField = active === "instagram" ? "caption" : "text";
  const Preview = previews[active];

  return (
    <section
      aria-labelledby="social-title"
      className="flex flex-col gap-[22px]"
    >
      <h2 id="social-title" className={`${sectionTitle} mb-0`}>
        Social posts
      </h2>
      <div
        role="tablist"
        aria-label="Social channels"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2"
      >
        {CHANNELS.map((channel) => {
          const Icon = channelIcons[channel];
          return (
            <button
              key={channel}
              ref={(el) => {
                tabs.current[channel] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${channel}`}
              aria-selected={channel === active}
              aria-controls={`panel-${channel}`}
              tabIndex={channel === active ? 0 : -1}
              onClick={() => setActive(channel)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-pill border border-input-border px-3.5 py-2.5 text-[0.82rem] leading-tight text-indigo transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none aria-selected:border-indigo aria-selected:bg-indigo aria-selected:text-white"
            >
              <Icon aria-hidden="true" size={18} />
              {channelNames[channel]}
              <span className="text-[0.75rem] font-semibold opacity-80 max-sm:sr-only">
                {draft[channel].enabled ? "On" : "Off"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="flex flex-col gap-[22px]"
      >
        <fieldset
          disabled={disabled}
          className="m-0 flex min-w-0 flex-col gap-[22px] border-0 p-0"
        >
          <Switch
            label={`Post on ${channelNames[active]}`}
            checked={version.enabled}
            onChange={(enabled) => onChange(active, { enabled })}
          />
          <div>
            <Textarea
              key={active}
              label={active === "instagram" ? "Caption" : "Post text"}
              name={`versions.${active}.${textField}`}
              required={version.enabled && active !== "instagram"}
              rows={8}
              value={version.text}
              onChange={(event) =>
                onChange(active, { text: event.target.value })
              }
              error={errors[`versions.${active}.${textField}`] ?? over}
            />
            <p className="mt-2 text-right text-[0.82rem] text-muted">{line}</p>
          </div>
          {active !== "instagram" && (
            <Input
              key={`${active}-link`}
              label="Link"
              name={`versions.${active}.link`}
              type="url"
              inputMode="url"
              help="Usually the website article. Shown as a link preview when there are no images."
              value={version.link ?? ""}
              onChange={(event) =>
                onChange(active, { link: event.target.value })
              }
              error={errors[`versions.${active}.link`]}
            />
          )}
        </fieldset>
        <ImageSlot
          label="Images"
          ids={imageIds[active]}
          rule={imageRules[active]}
        />
        <div>
          <h3 className="mb-3 font-body! text-[0.75rem] leading-normal! font-semibold! tracking-[0.1em] text-muted uppercase">
            Preview
          </h3>
          <Preview
            text={version.text}
            link={version.link}
            images={imageIds[active].length}
          />
        </div>
      </div>
    </section>
  );
}
