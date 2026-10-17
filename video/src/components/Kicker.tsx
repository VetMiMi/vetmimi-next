import type { CSSProperties, ReactNode } from "react";
import { color, font } from "../theme";

export function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: font.sans,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: "0.18em",
        color: color.label,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
