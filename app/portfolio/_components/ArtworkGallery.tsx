"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Artwork } from "@/lib/portfolio";

/**
 * Masonry gallery of whole artworks. Pressing a piece opens it large in a
 * dialog on the same page, with arrow keys or buttons to move between pieces.
 */
export function ArtworkGallery({ artworks }: { artworks: Artwork[] }) {
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

  return (
    <>
      <ul className="pf-gallery">
        {artworks.map((art, i) => (
          <li key={art.title}>
            <button type="button" onClick={() => open(i)}>
              <Image
                src={art.img}
                alt={art.alt}
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
        aria-label={current ? current.title : "Artwork"}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {current && (
          <figure>
            <Image
              key={current.title}
              src={current.img}
              alt={current.alt}
              sizes="90vw"
              placeholder="blur"
            />
            <figcaption>
              <span className="pf-lightbox-title">{current.title}</span>
              {current.meta && <span>{current.meta}</span>}
            </figcaption>
          </figure>
        )}
        <button
          type="button"
          className="pf-lightbox-close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
        <button
          type="button"
          className="pf-lightbox-prev"
          onClick={() => step(-1)}
          aria-label="Previous artwork"
        >
          ←
        </button>
        <button
          type="button"
          className="pf-lightbox-next"
          onClick={() => step(1)}
          aria-label="Next artwork"
        >
          →
        </button>
      </dialog>
    </>
  );
}
