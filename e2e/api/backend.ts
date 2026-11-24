// What the API-backed specs reach directly: the Go API with the service key
// or the admin's session, the CI database through psql, and link tokens made
// the way the API makes them. The browser itself only ever talks to Next.
import { execFileSync } from "node:child_process";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { addDays } from "../../lib/time";
import { todayIn } from "../../lib/zonedTime";

export const SERVICE = "individual-art-therapy";
export const TIMEZONE = "Australia/Sydney";

export function env(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set; job web-e2e-api in ci.yml sets it.`);
  }
  return value;
}

// The API limits bookings and sign-ins per visitor address, so each caller
// is a different made-up visitor (203.0.113.0/24 is for documentation).
export const visitorIp = () =>
  `203.0.113.${1 + Math.floor(Math.random() * 254)}`;

export type Visitor = { name: string; email: string };

export function madeUpVisitor(): Visitor {
  const id = randomBytes(3).toString("hex");
  return { name: `Mira Example ${id}`, email: `mira.${id}@example.com` };
}

type Options = { body?: unknown; headers?: Record<string, string> };

async function call<T>(method: string, path: string, options: Options) {
  const { body, headers } = options;
  const response = await fetch(`${env("API_URL")}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path}: ${response.status} ${text}`);
  }
  return (text ? JSON.parse(text) : undefined) as T;
}

export const publicCall = <T>(
  method: string,
  path: string,
  options: Options = {},
) =>
  call<T>(method, path, {
    body: options.body,
    headers: {
      "X-Service-Key": env("API_SERVICE_KEY"),
      "X-Visitor-IP": visitorIp(),
      ...options.headers,
    },
  });

// As the booking admin, with the session global-setup.ts opened.
export const adminCall = <T>(method: string, path: string, body?: unknown) =>
  call<T>(method, path, {
    body,
    headers: { Authorization: `Bearer ${env("E2E_ADMIN_TOKEN")}` },
  });

export async function signIn(email: string, password: string) {
  const session = await publicCall<{ token: string }>(
    "POST",
    "/auth/sessions",
    { body: { email, password } },
  );
  return session.token;
}

// One statement against the CI database. `:'name'` in the statement is the
// quoted value of vars.name. Rows come back as arrays of text.
export function sql(statement: string, vars: Record<string, string> = {}) {
  const args = ["--no-psqlrc", "--quiet", "--tuples-only", "--no-align"];
  args.push("--set=ON_ERROR_STOP=1");
  for (const [name, value] of Object.entries(vars)) {
    args.push(`--set=${name}=${value}`);
  }
  const output = execFileSync("psql", [...args, env("DATABASE_URL")], {
    input: statement,
    encoding: "utf8",
  });
  return output
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("|"));
}

// base64url(HMAC-SHA256(SIGNING_SECRET, label ‖ seed)): how the API turns a
// stored seed into a management ("manage") or join ("join") link token
// (vetmimi-api docs/architecture.md, "Token formats").
export function linkToken(label: "manage" | "join", seedHex: string) {
  return createHmac("sha256", env("SIGNING_SECRET"))
    .update(label)
    .update(Buffer.from(seedHex, "hex"))
    .digest("base64url");
}

// The free start times (UTC) between two practice dates.
export async function freeSlots(from: string, to: string) {
  const query = new URLSearchParams({ service: SERVICE, from, to });
  const availability = await publicCall<{
    days: { slots: { startsAt: string }[] }[];
  }>("GET", `/public/availability?${query}`);
  return availability.days.flatMap((day) => day.slots.map((s) => s.startsAt));
}

// A pending request, sent as the site sends one, at the first free time
// from tomorrow: today's next time may start before the test is over.
export async function requestAppointment(visitor = madeUpVisitor()) {
  const today = todayIn(TIMEZONE);
  const [startsAt] = await freeSlots(addDays(today, 1), addDays(today, 14));
  const receipt = await publicCall<{ reference: string }>(
    "POST",
    "/public/appointments",
    {
      body: {
        service: SERVICE,
        startsAt,
        format: "online",
        locale: "en",
        visitor,
        privacyAcknowledged: true,
        policyAcknowledged: true,
      },
      headers: { "Idempotency-Key": randomUUID() },
    },
  );
  const [[id, version]] = sql(
    "select id, version from appointments where reference = :'reference'",
    { reference: receipt.reference },
  );
  const { reference } = receipt;
  return { id, reference, startsAt, version: Number(version), visitor };
}
