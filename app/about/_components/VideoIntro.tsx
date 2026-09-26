"use client";
import { useState } from "react";
import Image from "next/image";
import poster from "@/assets/artworks/driftwood-seascape.webp";

// PLACEHOLDER: ANZACATA's "What is Creative Arts Therapy?" (1 min).
// Replace with Daw Mi's own introduction video before launch.
const VIDEO_ID = "RHoCwJCJtMI";
const VIDEO_TITLE = "What is Creative Arts Therapy? (placeholder video)";

/**
 * Click-to-play YouTube embed. Shows a still with a play button and only
 * loads YouTube (privacy-enhanced, no cookies) when the visitor presses play,
 * so the page stays fast and nothing tracks people who never watch.
 */
export function VideoIntro() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="ed-container ed-section" aria-labelledby="video-intro">
      <p className="ed-label">Meet Daw Mi</p>
      <h2 id="video-intro">Hear it from Daw Mi.</h2>
      <p className="ed-lead" style={{ marginBottom: "2rem" }}>
        A short introduction, in her own words.
      </p>

      <div className="relative aspect-video max-w-[960px] overflow-hidden rounded-[6px] bg-[#28252d] shadow-[0_24px_48px_rgba(40,37,45,0.22)]">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&cc_load_policy=1`}
            title={VIDEO_TITLE}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer border-0 p-0"
            aria-label={`Play video: ${VIDEO_TITLE}`}
          >
            <Image
              src={poster}
              alt=""
              fill
              sizes="(max-width: 1000px) 100vw, 960px"
              placeholder="blur"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-[rgba(40,37,45,0.35)] transition-colors duration-300 group-hover:bg-[rgba(40,37,45,0.2)]" />
            <span className="absolute top-1/2 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#db5f59] shadow-[0_8px_28px_rgba(219,95,89,0.45)] transition-transform duration-300 group-hover:scale-110">
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7z" fill="#fff" />
              </svg>
            </span>
            <span
              className="absolute bottom-5 left-6 text-[1.05rem] text-white"
              style={{ fontFamily: "var(--hand)" }}
            >
              1 minute · with subtitles
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
