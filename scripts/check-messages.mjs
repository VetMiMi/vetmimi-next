// Checks that every Burmese message file has exactly the same keys as its
// English file, with no empty values. Run with `pnpm i18n:check`.
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

if (problems) {
  console.error(`\n${problems} problem(s).`);
  process.exit(1);
}
console.log("Burmese messages match English.");
