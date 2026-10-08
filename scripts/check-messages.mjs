// Checks that every Burmese message file has exactly the same keys as its
// English file, with no empty values, and that every public page has its
// own search title and description. Run with `pnpm i18n:check`.
import { readdirSync, readFileSync } from "node:fs";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );

const read = (locale, file) =>
  new Map(
    flatten(JSON.parse(readFileSync(`messages/${locale}/${file}`, "utf8"))),
  );

let problems = 0;
const report = (msg) => {
  problems++;
  console.error(msg);
};

for (const file of readdirSync("messages/en").filter((f) =>
  f.endsWith(".json"),
)) {
  const en = read("en", file);
  const my = read("my", file);
  for (const key of en.keys())
    if (!my.has(key)) report(`my/${file}: missing ${key}`);
  for (const [key, value] of my) {
    if (!en.has(key)) report(`my/${file}: extra ${key}`);
    else if (typeof value === "string" && !value.trim())
      report(`my/${file}: empty ${key}`);
  }
}

// The message area of each page's <area>.metadata.title and .description
// (app/[locale]/**/page.tsx). Services and stories pages use their items.
const PAGE_AREAS = [
  "home",
  "about",
  "services",
  "artOfWellness",
  "portfolio",
  "stories",
  "contact",
  "book",
  "legal.privacy",
  "legal.disclaimer",
  "legal.bookingPolicy",
];
// Checked in English; the key check above holds Burmese to the same keys.
const pageTitles = new Map();
for (const area of PAGE_AREAS) {
  const [file, ...rest] = area.split(".");
  const prefix = rest.map((part) => `${part}.`).join("");
  const en = read("en", `${file}.json`);
  for (const field of ["title", "description"]) {
    const key = `${prefix}metadata.${field}`;
    if (!en.get(key)?.trim()) report(`en/${file}.json: missing ${key}`);
  }
  const title = en.get(`${prefix}metadata.title`);
  if (pageTitles.has(title))
    report(`en: "${area}" has the same title as "${pageTitles.get(title)}"`);
  else if (title) pageTitles.set(title, area);
  // Search results show about 160 characters; under 50 says too little.
  const description = en.get(`${prefix}metadata.description`) ?? "";
  if (description && (description.length < 50 || description.length > 160))
    report(
      `en/${file}.json: ${prefix}metadata.description is ${description.length} characters, not 50–160`,
    );
}

if (problems) {
  console.error(`\n${problems} problem(s).`);
  process.exit(1);
}
console.log("Burmese messages match English; every page has its metadata.");
