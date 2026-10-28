"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Artwork } from "@/lib/portfolio";

const lightboxButton =
  "absolute grid size-12 cursor-pointer place-items-center rounded-full bg-canvas/12 text-[1.4rem] text-canvas hover:bg-canvas/24 focus-visible:bg-canvas/24";
const lightboxArrow =
  "top-1/2 -translate-y-1/2 max-md:top-auto max-md:bottom-6 max-md:translate-none";

/**
 * Masonry gallery of whole artworks. Pressing a piece opens it large in a
 * dialog on the same page, with arrow keys or buttons to move between pieces.
 */
export function ArtworkGallery({ artworks }: { artworks: Artwork[] }) {
  const t = useTranslations("portfolio.artworks");
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback(
    (delta: number) =>
      setIndex((i) =>
        i === null ? i : (i + delta + artworks.length) % artworks.length,
      ),
    [artworks.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const current = index === null ? null : artworks[index];
  const alt = (art: Artwork) => t(`items.${art.id}.alt`);
  const meta = (art: Artwork) =>
    art.fromCecatEssay && art.year
      ? t("meta.cecatEssay", { year: art.year })
      : art.year;

  return (
    <>
      <ul className="columns-3 gap-x-5 max-md:columns-2 max-md:gap-x-3">
        {artworks.map((art, i) => (
          <li key={art.id} className="mb-5 break-inside-avoid max-md:mb-3">
            <button
              type="button"
              className="group block w-full cursor-zoom-in text-left"
              onClick={() => open(i)}
            >
              <Image
                className="block h-auto w-full rounded-[6px] shadow-[0_10px_26px_rgba(40,37,45,0.14)] transition-transform duration-400 ease-[ease] group-hover:-translate-y-[3px] group-focus-visible:-translate-y-[3px]"
                src={art.img}
                alt={alt(art)}
                sizes="(max-width: 767px) 50vw, 380px"
                placeholder="blur"
              />
              <span className="mt-[0.6rem] block font-script text-[1.05rem] text-ink/75">
                {art.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="h-screen max-h-none w-screen max-w-none bg-[rgba(24,21,30,0.94)] backdrop:bg-transparent"
        aria-label={current ? current.title : t("lightbox.label")}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {current && (
          <figure className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 px-18 pt-16 pb-8 max-md:px-4 max-md:pb-24">
            <Image
              className="pointer-events-auto block h-auto max-h-[calc(100vh-9rem)] w-auto max-w-full rounded-[6px]"
              key={current.id}
              src={current.img}
              alt={alt(current)}
              sizes="90vw"
              placeholder="blur"
            />
            <figcaption className="flex items-baseline gap-[0.9rem] text-[0.85rem] text-[#e3dfe8]">
              <span className="font-script text-[1.3rem] text-canvas">
                {current.title}
              </span>
              {meta(current) && <span>{meta(current)}</span>}
            </figcaption>
          </figure>
        )}
        <button
          type="button"
          className={`${lightboxButton} top-4 right-4`}
          onClick={close}
          aria-label={t("lightbox.close")}
        >
          ×
        </button>
        <button
          type="button"
          className={`${lightboxButton} ${lightboxArrow} left-4 max-md:left-[calc(50%-60px)]`}
          onClick={() => step(-1)}
          aria-label={t("lightbox.previous")}
        >
          ←
        </button>
        <button
          type="button"
          className={`${lightboxButton} ${lightboxArrow} right-4 max-md:right-[calc(50%-60px)]`}
          onClick={() => step(1)}
          aria-label={t("lightbox.next")}
        >
          →
        </button>
      </dialog>
    </>
  );
}
