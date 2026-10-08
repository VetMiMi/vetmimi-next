import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ImperfectHalo } from "@/components/art/Shapes";
import { C } from "@/lib/tokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Subset Latin instances of the site's fonts (see OFL-*.txt beside them).
// Read at module load: a missing file fails the build instead of the card
// silently falling back to the renderer's default font.
const FONT_DIR = join(process.cwd(), "app/_og/fonts");
const [fraunces, manrope] = await Promise.all(
  ["Fraunces-Regular.ttf", "Manrope-Medium.ttf"].map((file) =>
    readFile(join(FONT_DIR, file)),
  ),
);

const FONTS = [
  { name: "Fraunces", data: fraunces, weight: 400 as const },
  { name: "Manrope", data: manrope, weight: 500 as const },
];

export type OgCardText = {
  title: string;
  /** The page's name above the title; the home card has none. */
  eyebrow?: string;
  tagline: string;
};

// The shared-link card: brand only, no photographs or artworks, since no
// asset has a recorded permission for Facebook yet (issue #45).
export function renderOgCard({ title, eyebrow, tagline }: OgCardText) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: C.canvas,
        color: C.ink,
        fontFamily: "Manrope",
      }}
    >
      <ImperfectHalo
        color={C.indigo}
        size={560}
        style={{ position: "absolute", right: -150, top: 35 }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 760,
          padding: "64px 0 64px 80px",
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: 44,
            letterSpacing: "-0.01em",
          }}
        >
          VetMiMi
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 24,
                color: C.red,
                marginBottom: 20,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "block",
              lineClamp: 3,
              fontFamily: "Fraunces",
              fontSize: title.length > 48 ? 58 : 74,
              lineHeight: 1.12,
              letterSpacing: "-0.015em",
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 3,
              background: C.red,
              marginRight: 20,
            }}
          />
          <div style={{ fontSize: 26, color: C.indigo }}>{tagline}</div>
        </div>
      </div>
    </div>,
    { ...size, fonts: FONTS },
  );
}
