// A web address part from a name: "Individual Art Therapy" →
// "individual-art-therapy", the pattern the API accepts. Letters outside
// a–z (Burmese, accents) drop out; the field stays editable for that.
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}
