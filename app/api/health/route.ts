// Liveness for the Docker host's health check and deploy rollback. Answers
// without calling the API, so a slow API never restarts the website.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
