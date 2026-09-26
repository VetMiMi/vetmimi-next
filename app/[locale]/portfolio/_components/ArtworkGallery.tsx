"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Artwork } from "@/lib/portfolio";

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
      <ul className="pf-gallery">
        {artworks.map((art, i) => (
          <li key={art.id}>
            <button type="button" onClick={() => open(i)}>
              <Image
                src={art.img}
                alt={alt(art)}
                sizes="(max-width: 767px) 50vw, 380px"
                placeholder="blur"
              />
              <span className="pf-gallery-title">{art.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="pf-lightbox"
        aria-label={current ? current.title : t("lightbox.label")}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {current && (
          <figure>
            <Image
              key={current.id}
              src={current.img}
              alt={alt(current)}
              sizes="90vw"
              placeholder="blur"
            />
            <figcaption>
              <span className="pf-lightbox-title">{current.title}</span>
              {meta(current) && <span>{meta(current)}</span>}
            </figcaption>
          </figure>
        )}
        <button
          type="button"
          className="pf-lightbox-close"
          onClick={close}
          aria-label={t("lightbox.close")}
        >
          ×
        </button>
        <button
          type="button"
          className="pf-lightbox-prev"
          onClick={() => step(-1)}
          aria-label={t("lightbox.previous")}
        >
          ←
        </button>
        <button
          type="button"
          className="pf-lightbox-next"
          onClick={() => step(1)}
          aria-label={t("lightbox.next")}
        >
          →
        </button>
      </dialog>
    </>
  );
}
