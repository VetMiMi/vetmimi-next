export const C = {
  canvas: "#FFF7EF",
  paper: "#F8F1E8",
  ink: "#28252D",
  rose: "#B2667B",
  coral: "#DB5F59",
  red: "#C04D46",
  indigo: "#494C6D",
  violet: "#6B6396",
  blue: "#7A8FAA",
  aqua: "#91C0D3",
  ochre: "#CDAA73",
  butter: "#E2CA85",
  olive: "#6F7144",
  white: "#FFFFFF",
} as const;

// Darkened accents from docs/admin-design-brief.md §2, for text and fills
// that must pass WCAG AA where the accent itself does not. Same names as the
// Tailwind theme in app/globals.css.
export const AA = {
  action: "#ab4347", // coral, darkened: buttons and coral text
  label: "#88435b", // rose, darkened: eyebrows and small rose text
  muted: "#625d64", // secondary text
  caption: "#756b75", // captions, small tags
  blueText: "#416879", // blue accent text
  goldText: "#79602e", // ochre accent text
} as const;
