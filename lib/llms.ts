import { pageAlternates } from "./seo.ts";

// /llms.txt, the plain Markdown summary answer engines read
// (https://llmstxt.org): an H1, a one-line "> " summary, short sections,
// then lists of links. Every text comes from the caller, which reads it from
// the same messages, services and articles as the pages.

export type LlmsLink = { title: string; path: string; description: string };

export type LlmsSection = {
  title: string;
  text?: string;
  items?: string[];
  links?: LlmsLink[];
};

// Messages may hold line breaks; each entry must stay on one line.
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

const link = ({ title, path, description }: LlmsLink) =>
  `- [${oneLine(title)}](${pageAlternates("en", path).canonical}): ${oneLine(description)}`;

function section({ title, text, items = [], links = [] }: LlmsSection) {
  const lines = [
    ...(text ? [oneLine(text), ""] : []),
    ...items.map((item) => `- ${oneLine(item)}`),
    ...links.map(link),
  ];
  return [`## ${title}`, "", ...lines].join("\n").trimEnd();
}

// Sections with nothing in them (no articles yet) are left out.
export function buildLlmsText({
  name,
  summary,
  sections,
}: {
  name: string;
  summary: string;
  sections: LlmsSection[];
}): string {
  const filled = sections.filter(
    (each) => each.text || each.items?.length || each.links?.length,
  );
  return [`# ${name}`, `> ${oneLine(summary)}`, ...filled.map(section)]
    .join("\n\n")
    .concat("\n");
}
