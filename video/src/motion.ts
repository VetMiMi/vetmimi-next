import type { CSSProperties } from "react";
import { Easing, interpolate } from "remotion";

const ease = Easing.bezier(0.25, 0.6, 0.25, 1);

export function progress(frame: number, start: number, length = 22): number {
  return interpolate(frame, [start, start + length], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function rise(frame: number, start: number, distance = 24): CSSProperties {
  const t = progress(frame, start);
  return { opacity: t, transform: `translateY(${(1 - t) * distance}px)` };
}

export function fadeOut(frame: number, end: number, length = 14): number {
  return 1 - progress(frame, end - length, length);
}
