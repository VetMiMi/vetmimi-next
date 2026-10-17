import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, random } from "remotion";
import { color } from "../theme";

type BrushProps = { tone: string };

const rows = 90;
const band = 6;
const wash = 14;

// Percent x of a ragged, slightly tilted edge, with bristle jitter in px.
function edge(base: number, seed: string) {
  return Array.from({ length: rows + 1 }, (_, index) => {
    const y = (index * 100) / rows;
    const x = base + (50 - y) * 0.1 + Math.sin(y / 9 + seed.length) * 1.4;
    const bristle = (random(`${seed}-${index}`) - 0.5) * 10;
    return `calc(${x}% + ${bristle}px) ${y}%`;
  });
}

function Brush({ children, presentationDirection, presentationProgress, passedProps }: TransitionPresentationComponentProps<BrushProps>) {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const base = -18 + presentationProgress * (128 + wash);
  const reveal = edge(base, "reveal");
  const front = edge(base + band, "front");
  const trail = edge(base - wash, "trail");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(0 0, ${reveal.join(", ")}, 0 100%)` }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: `polygon(${trail.join(", ")}, ${[...reveal].reverse().join(", ")})`,
          background: passedProps.tone,
          opacity: 0.3,
        }}
      />
      <AbsoluteFill
        style={{
          clipPath: `polygon(${reveal.join(", ")}, ${[...front].reverse().join(", ")})`,
          background: passedProps.tone,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
}

export function brush(tone: string = color.aqua): TransitionPresentation<BrushProps> {
  return { component: Brush, props: { tone } };
}
