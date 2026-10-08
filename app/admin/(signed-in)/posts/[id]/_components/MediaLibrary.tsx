"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { controlClass } from "@/components/admin/Field";
import { Notice } from "@/components/admin/Notice";
import { describedEnough, type Media } from "@/lib/admin/media";
import { deleteMedia, describeMedia, listMedia } from "../actions";
import { AltFields, altErrors, describe } from "./AltFields";
import { MediaThumb } from "./MediaThumb";

const LOAD_FAILED =
  "The library could not be loaded. Check your connection and try again.";

// The media library (#151): search by alt text or credit, choose one image,
// complete its alt text if it has none, then attach it. An image no post
// uses can be deleted here.
export function MediaLibrary({
  attached,
  onAttach,
  onUpload,
}: {
  attached: string[];
  onAttach: (media: Media) => void;
  onUpload: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [items, setItems] = useState<Media[]>();
  const [cursor, setCursor] = useState<string>();
  const [selected, setSelected] = useState<Media>();
  const [description, setDescription] = useState(describe());
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function load(q: string, after?: string) {
    startTransition(async () => {
      try {
        const page = await listMedia(q, after);
        setItems((list) => [...(after ? (list ?? []) : []), ...page.items]);
        setCursor(page.nextCursor);
        setSearched(q);
        setError(undefined);
      } catch {
        setError(LOAD_FAILED);
      }
    });
  }

  // The first page once, when the library opens.
  useEffect(() => load(""), []);

  function select(item: Media) {
    setSelected(item);
    setDescription(describe(item.alt, item.credit));
    setTried(false);
    setConfirmDelete(false);
    setError(undefined);
  }

  function attach() {
    if (!selected) return;
    setTried(true);
    if (Object.keys(altErrors(description)).length > 0) return;
    const { en, my, credit } = description;
    const unchanged =
      describedEnough(selected) &&
      en === selected.alt?.en &&
      my === selected.alt?.my &&
      credit === (selected.credit ?? "");
    if (unchanged) return onAttach(selected);
    startTransition(async () => {
      const outcome = await describeMedia(
        selected.id,
        selected.version,
        { en, my },
        credit,
      );
      if (outcome.ok) onAttach(outcome.data);
      else setError(outcome.message);
    });
  }

  function remove() {
    if (!selected) return;
    startTransition(async () => {
      const outcome = await deleteMedia(selected.id);
      setConfirmDelete(false);
      if (!outcome.ok) return setError(outcome.message);
      setItems((list) => list?.filter((item) => item.id !== selected.id));
      setSelected(undefined);
    });
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setSelected(undefined);
          load(query);
        }}
        className="flex gap-2"
      >
        <label htmlFor="media-search" className="sr-only">
          Search by alt text or credit
        </label>
        <input
          id="media-search"
          type="search"
          value={query}
          placeholder="Search by alt text or credit"
          onChange={(event) => setQuery(event.target.value)}
          className={controlClass}
        />
        <Button
          type="submit"
          variant="secondary"
          icon={<MagnifyingGlass aria-hidden="true" size={18} />}
        >
          <span className="max-sm:sr-only">Search</span>
        </Button>
      </form>

      {items === undefined ? (
        <p className="text-[0.92rem] text-muted" aria-live="polite">
          {error ? "" : "Loading the library…"}
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-inner bg-paper px-5 py-6 text-[0.92rem] leading-[1.6]">
          <p className="mb-3">
            {searched
              ? `No images match “${searched}”.`
              : "No images in the library yet."}
          </p>
          <Button variant="quiet" onClick={onUpload}>
            Upload a new image
          </Button>
        </div>
      ) : (
        <ul
          aria-label="Library images"
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {items.map((item) => {
            const inPost = attached.includes(item.id);
            const isSelected = selected?.id === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={inPost}
                  aria-label={`${item.alt?.en || "Image without alt text"}${inPost ? ", already in this post" : ""}`}
                  onClick={() => select(item)}
                  className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-small ring-offset-2 transition-shadow duration-150 hover:ring-2 hover:ring-indigo/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:ring-0 aria-pressed:ring-3 aria-pressed:ring-indigo motion-reduce:transition-none"
                >
                  <MediaThumb media={item} className="size-full" />
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-pill bg-indigo text-white">
                      <Check aria-hidden="true" size={16} weight="bold" />
                    </span>
                  )}
                  {inPost && (
                    <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1 py-0.5 text-[0.75rem] font-semibold text-white">
                      In this post
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {cursor && (
        <div>
          <Button
            variant="secondary"
            busy={pending}
            onClick={() => load(searched, cursor)}
          >
            Show more
          </Button>
        </div>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {selected && (
        <section
          aria-label="Chosen image"
          className="flex flex-col gap-[18px] border-t border-divider pt-[18px]"
        >
          <div className="flex items-center gap-3">
            <MediaThumb media={selected} className="size-20 rounded-small" />
            <p className="text-[0.88rem] leading-[1.5] text-muted">
              {selected.width} × {selected.height} px
              {!describedEnough(selected) && (
                <>
                  <br />
                  <span className="font-semibold text-ink">
                    Add alt text in both languages to attach it.
                  </span>
                </>
              )}
            </p>
          </div>
          <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
            <AltFields
              value={description}
              errors={tried ? altErrors(description) : {}}
              onChange={setDescription}
            />
          </fieldset>
          {confirmDelete ? (
            <div className="rounded-notice border border-red/27 bg-red/7 px-5 py-4 text-[0.92rem] leading-[1.6]">
              <p className="mb-3 text-action">
                Delete this image from the library? This cannot be undone. An
                image that any post still uses is not deleted.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep it
                </Button>
                <Button variant="danger" busy={pending} onClick={remove}>
                  Delete image
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button size="page" busy={pending} onClick={attach}>
                Attach image
              </Button>
              <Button variant="quiet" onClick={() => setConfirmDelete(true)}>
                Delete from library
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
