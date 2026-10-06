"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import {
  FieldError,
  FieldHelp,
  Requirement,
  controlClass,
} from "@/components/admin/Field";
import { describedBy, fieldIds } from "@/lib/fieldIds";

const HELP =
  "Markdown: ## heading, **bold**, *italic*, - list, > quote, [link](https://…).";

// Article typography for the preview, close to the public article body.
const prose =
  "min-h-[288px] rounded-control border border-card-border bg-white px-5 py-4 text-[1rem] leading-[1.75] text-ink [&_a]:text-indigo [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-rose [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_blockquote]:italic [&_code]:rounded-cell [&_code]:bg-paper [&_code]:px-1 [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-[1.6rem] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-[1.35rem] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[1.15rem] [&_hr]:my-6 [&_hr]:border-divider [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&>*:first-child]:mt-0";

const toggleClass =
  "min-h-11 cursor-pointer px-4 text-[0.82rem] font-semibold text-indigo transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none aria-pressed:bg-indigo aria-pressed:text-white";

// A Markdown body with a Write / Preview toggle. The preview renders no raw
// HTML and no images (react-markdown escapes HTML and makes unsafe links
// inert), as the public article will.
export function MarkdownField({
  label,
  name,
  value,
  onChange,
  error,
  required,
  lang,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  lang?: string;
}) {
  const [preview, setPreview] = useState(false);
  const ids = fieldIds(name);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <label htmlFor={ids.control} className="text-[0.88rem] font-medium">
          {label}
          <Requirement required={required} />
        </label>
        <div
          role="group"
          aria-label={`${label}: view`}
          className="inline-flex overflow-hidden rounded-control border border-input-border"
        >
          <button
            type="button"
            aria-pressed={!preview}
            onClick={() => setPreview(false)}
            className={toggleClass}
          >
            Write
          </button>
          <button
            type="button"
            aria-pressed={preview}
            onClick={() => setPreview(true)}
            className={toggleClass}
          >
            Preview
          </button>
        </div>
      </div>
      <FieldHelp id={ids.help} help={HELP} />
      {preview ? (
        <div lang={lang} className={prose}>
          {value.trim() ? (
            <Markdown
              skipHtml
              disallowedElements={["img"]}
              unwrapDisallowed
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {value}
            </Markdown>
          ) : (
            <p className="text-muted">Nothing written yet.</p>
          )}
        </div>
      ) : (
        <textarea
          id={ids.control}
          name={name}
          lang={lang}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { help: true, error: !!error })}
          rows={14}
          className={`${controlClass} min-h-[288px] resize-y leading-[1.65]`}
        />
      )}
      <FieldError id={ids.error} error={error} />
    </div>
  );
}
