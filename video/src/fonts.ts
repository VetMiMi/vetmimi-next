import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/noto-sans-myanmar";
import { continueRender, delayRender } from "remotion";

const faces: [string, string?][] = [
  ['400 1em "Fraunces Variable"'],
  ['italic 400 1em "Fraunces Variable"'],
  ['400 1em "Manrope Variable"'],
  ['700 1em "Manrope Variable"'],
  // The Burmese file is a unicode-range subset, so it only loads for Burmese text.
  ['400 1em "Noto Sans Myanmar Variable"', "မြန်မာ"],
];

const handle = delayRender("Loading fonts");
Promise.all(faces.map(([face, text]) => document.fonts.load(face, text))).then(() =>
  continueRender(handle),
);
