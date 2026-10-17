import type { ReactNode } from "react";
import { Img, staticFile } from "remotion";
import { color, font } from "../theme";

export const phoneScreen = { width: 436, height: 945 };

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "fit-content",
        padding: 12,
        borderRadius: 64,
        background: color.ink,
        boxShadow: "0 50px 90px -50px rgba(40,37,45,0.6)",
      }}
    >
      <div style={{ position: "relative", ...phoneScreen, overflow: "hidden", borderRadius: 52, background: color.canvas }}>
        <span
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            zIndex: 10,
            width: 110,
            height: 30,
            marginLeft: -55,
            borderRadius: 15,
            background: color.ink,
          }}
        />
        <div style={{ position: "absolute", inset: "54px 0 0" }}>{children}</div>
      </div>
    </div>
  );
}

export function BrowserFrame({ address, width, children }: { address: string; width: number; children: ReactNode }) {
  return (
    <div
      style={{
        width,
        overflow: "hidden",
        borderRadius: 18,
        border: `1px solid ${color.line}`,
        background: color.raised,
        boxShadow: "0 50px 90px -60px rgba(40,37,45,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 52,
          padding: "0 22px",
          borderBottom: `1px solid ${color.line}`,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <span key={dot} style={{ width: 12, height: 12, borderRadius: 6, background: color.line }} />
        ))}
        <span
          style={{
            marginLeft: 16,
            padding: "6px 16px",
            borderRadius: 8,
            background: color.paper,
            fontFamily: font.sans,
            fontSize: 16,
            color: color.muted,
          }}
        >
          {address}
        </span>
      </div>
      <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden", background: color.canvas }}>
        {children}
      </div>
    </div>
  );
}

// A full-width screenshot scrolled to `y` (in the image's own pixels).
// Children are positioned in those same pixels, so they scroll with it.
export function Screenshot({
  file,
  sourceWidth,
  viewWidth,
  y = 0,
  opacity = 1,
  children,
}: {
  file: string;
  sourceWidth: number;
  viewWidth: number;
  y?: number;
  opacity?: number;
  children?: ReactNode;
}) {
  const scale = viewWidth / sourceWidth;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: sourceWidth,
        opacity,
        transform: `scale(${scale}) translateY(${-y}px)`,
        transformOrigin: "0 0",
      }}
    >
      <Img src={staticFile(`screens/${file}`)} style={{ display: "block", width: sourceWidth }} />
      {children}
    </div>
  );
}
