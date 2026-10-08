// The IndexNow key file (lib/indexnow.ts): search engines fetch it to check
// that a ping came from this site. Not found until a key is set.
export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
