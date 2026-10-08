import { revalidateTag } from "next/cache";
import { revalidateSecretMatches } from "@/lib/revalidateSecret";

// Called by the API when an article publishes or changes, with
// {"tags": ["articles", "article:<slug>"]}, so the stories pages show it.
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!revalidateSecretMatches(secret, process.env.SITE_REVALIDATE_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const tags = parseTags(await request.json().catch(() => null));
  if (!tags) {
    return Response.json(
      { error: 'expected {"tags": [string, …]}' },
      { status: 400 },
    );
  }
  // expire: 0, so the next visit shows the new article rather than the
  // cached page once more; there are few visitors to keep waiting.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}

function parseTags(body: unknown): string[] | null {
  if (typeof body !== "object" || body === null || !("tags" in body)) {
    return null;
  }
  const { tags } = body;
  const valid =
    Array.isArray(tags) &&
    tags.length > 0 &&
    tags.every((tag) => typeof tag === "string" && tag.length > 0);
  return valid ? tags : null;
}
