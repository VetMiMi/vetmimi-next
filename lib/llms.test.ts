import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { buildLlmsText } from "./llms.ts";

before(() => {
  process.env.SITE_URL = "https://vetmimi.example";
});

describe("llms.txt", () => {
  it("starts with the name and a one-line summary, then fills sections", () => {
    const text = buildLlmsText({
      name: "VetMiMi",
      summary: "Art psychotherapy\nin Sydney.",
      sections: [
        {
          title: "About Daw Mi",
          text: "A certified art psychotherapist.",
          items: ["Trained at CECAT."],
        },
        {
          title: "Services",
          links: [
            {
              title: "Individual Art Therapy",
              path: "/services/individual-art-therapy",
              description: "One-to-one time.",
            },
          ],
        },
      ],
    });
    assert.equal(
      text,
      [
        "# VetMiMi",
        "",
        "> Art psychotherapy in Sydney.",
        "",
        "## About Daw Mi",
        "",
        "A certified art psychotherapist.",
        "",
        "- Trained at CECAT.",
        "",
        "## Services",
        "",
        "- [Individual Art Therapy](https://vetmimi.example/services/individual-art-therapy): One-to-one time.",
        "",
      ].join("\n"),
    );
  });

  it("links English pages and leaves out empty sections", () => {
    const text = buildLlmsText({
      name: "VetMiMi",
      summary: "s",
      sections: [
        {
          title: "Pages",
          links: [{ title: "Home", path: "/", description: "Start here." }],
        },
        { title: "Articles", links: [] },
      ],
    });
    assert.ok(text.includes("- [Home](https://vetmimi.example/): Start here."));
    assert.equal(text.includes("## Articles"), false);
    assert.equal(text.includes("/my"), false);
  });
});
