"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import poster from "@/assets/artworks/driftwood-seascape.webp";

// Daw Mi's own introduction video. Until she records it, the section shows
// a still with "Coming soon" and loads nothing from YouTube. Paste the
// YouTube video id here when it is ready.
const VIDEO_ID: string | null = null;

/**
 * Click-to-play YouTube embed. Shows a still with a play button and only
 * loads YouTube (privacy-enhanced, no cookies) when the visitor presses play,
 * so the page stays fast and nothing tracks people who never watch.
 */
export function VideoIntro() {
  const [playing, setPlaying] = useState(false);
  const t = useTranslations("about.video");
  const videoTitle = t("videoTitle");

  return (
    <section className="ed-container ed-section" aria-labelledby="video-intro">
      <p className="ed-label">{t("label")}</p>
      <h2 id="video-intro">{t("title")}</h2>
      <p className="ed-lead" style={{ marginBottom: "2rem" }}>
        {t("lead")}
      </p>

      <div className="relative aspect-video max-w-[960px] overflow-hidden rounded-[6px] bg-[#28252d] shadow-[0_24px_48px_rgba(40,37,45,0.22)]">
        {!VIDEO_ID ? (
          <>
            <Image
              src={poster}
              alt=""
              fill
              sizes="(max-width: 1000px) 100vw, 960px"
              placeholder="blur"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-[rgba(40,37,45,0.45)]" />
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(1.6rem,4vw,2.4rem)] text-white"
              style={{ fontFamily: "var(--hand)" }}
            >
              {t("comingSoon")}
            </span>
          </>
        ) : playing ? (
          <iframe
            className="absolute inset-0 h-full w-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&cc_load_policy=1`}
            title={videoTitle}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer border-0 p-0"
            aria-label={t("play", { title: videoTitle })}
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
              {t("duration")}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
