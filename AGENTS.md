<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# vetmimi-next — working agreement

The public website and admin for [VetMiMi](https://vetmimi-next.vercel.app),
Daw Mi's art therapy practice in Sydney. This repository holds three things:

- the **public site** in English and Burmese (`/` and `/my/…`);
- **`/admin`**, where Daw Mi manages appointments, availability and content
  (English only);
- **`/session/<token>`**, the page where a client joins an online session.

The Go API in [VetMiMi/vetmimi-api](https://github.com/VetMiMi/vetmimi-api)
(checked out at `../vetmimi-api`) owns the database, sign-in, booking, video
signalling, content and email. Both repositories are tracked on the GitHub
project [VetMiMi Website](https://github.com/orgs/VetMiMi/projects/1).

Read this file, then `docs/project-status.md`, then
`docs/admin-design-brief.md` before UI work. Decisions live in the API's
`../vetmimi-api/docs/adr/`; ADR-002 (custom admin in this app), ADR-003
(OpenAPI-first contract) and ADR-007 (video sessions) shape this repository.
Requirements live in `../documents/VetMiMi/02 Website Plan/`; read the
relevant one before building a page.

## Who this is for

One practitioner, tens of appointments a month, one administrator who uses a
phone as often as a laptop. Build for that scale: a reliable appointment
workflow for a small founder-led practice, not a clinic system.

## Simplicity and polish

The owner's top value is clean, readable, maintainable code, and he wants the
admin and the booking flow to feel as finished as the public pages already
do. Both halves matter.

- Server components by default. Add `"use client"` only to the part that
  needs state or events, as `SiteHeader` does.
- No new dependency without a reason that removes real code. Never install
  one as a side effect of an unrelated issue.
- No `utils`, `helpers` or `common` folders. Name files after what they hold.
- Files under 300 lines, components that fit on a screen. Comments explain
  _why_, never _what_.
- No abstraction, configuration or feature flag for a need that does not
  exist yet.
- Delete code you make unused in the same pull request.
- Real copy, never lorem ipsum. Unknown facts are marked `[To confirm]`.

## Layout

```
app/[locale]/          public pages (en, my); the root layout with <html lang>
app/admin/             admin, English only, outside locale routing (ADR-002)
app/session/[token]/   video session join page (ADR-007)
app/api/               route handlers: the thin backend-for-frontend (ADR-002)
components/            public site components; components/ui for shared atoms
components/admin/      admin UI components (see docs/admin-design-brief.md)
components/art/        decorative SVG shapes (always aria-hidden)
lib/api/               generated API client: schema.ts + client.ts (ADR-003)
lib/tokens.ts          colour tokens; app/fonts.ts for the three fonts
i18n/                  next-intl routing, navigation wrappers, message loading
messages/<locale>/     every public string, one JSON file per area
styles/                page-family CSS (editorial, services, contact, …)
scripts/               gate.sh, check-messages.mjs
docs/                  project status, admin design brief
```

- **The browser talks only to Next** (ADR-002). Server components and
  `app/api/*` route handlers call the Go API server-side with the generated
  client in `lib/api/`; the API origin and its keys never reach the browser.
  Route handlers stay thin: validate, forward, map the error. Business rules
  live in the API, not here. The one exception is the video WebSocket
  (ADR-007), which the browser opens with a short-lived ticket Next obtained.
- **The contract is generated** (ADR-003). `lib/api/schema.ts` comes from the
  API's `openapi.yaml` at the ref pinned in `package.json`; never edit it by
  hand. A change that needs a new endpoint waits for the API pull request to
  merge and be tagged, then bumps the pinned ref in the same pull request that
  uses it.
- **Admin and session pages sit outside `app/[locale]`.** They need their own
  root layout (there is no `app/layout.tsx`; `app/[locale]/layout.tsx` renders
  `<html>`), and `proxy.ts`'s matcher must skip `/admin` and `/session` so
  next-intl does not rewrite them. The ESLint ban on `next/link` applies
  there too; the admin shell issue decides between an English-only
  `NextIntlClientProvider` (so `@/i18n/navigation` works) and a scoped lint
  override, and records the choice here.

## Language (i18n)

Summarised from `messages/README.md`, which is the authority.

- **Every public string lives in `messages/<locale>/<area>.json`**, English as
  the source and Burmese beside it, with exactly the same keys.
  `pnpm i18n:check` fails on a missing, extra or empty key. No visible text
  in a public component, alt text and `aria-label` included.
- A new area means a new file in both locales and a new entry in
  `i18n/messages.ts`.
- Burmese is Unicode (never Zawgyi), warm polite register on marketing pages
  and formal register on legal pages, Western digits for times, prices and
  dates, the glossary terms every time, and `{placeholders}` and rich-text
  tags kept exactly as in English. Burmese text is a draft until Daw Mi or
  another native speaker has reviewed it; mark machine drafts in the pull
  request.
- Links and redirects use `Link`, `redirect`, `useRouter` and `usePathname`
  from `@/i18n/navigation`; ESLint rejects `next/link` and those
  `next/navigation` imports.
- Burmese needs taller lines and no letter spacing; `app/globals.css` handles
  it with `:lang(my)` rules. Do not fight them with inline `line-height`.
- **Admin is English only** and has no message files. The `/session` page is
  public, so its text lives in messages in both languages.

## Design

- Colours come from `lib/tokens.ts` (`C.*`) or the matching CSS variables in
  `app/globals.css`. Fonts come from `app/fonts.ts` through `var(--serif)`,
  `var(--sans)` and `var(--hand)`. Do not add another palette or font.
- The admin, the booking flow and `/session` use the calm treatment the
  design specification gives Services and Booking. Everything they need —
  colour roles, contrast results, status badges, spacing, components and the
  "finished" checklist — is in [`docs/admin-design-brief.md`](docs/admin-design-brief.md).
- UI work is checked in a browser at 375, 768 and 1280 px wide, and the
  pull request carries the screenshots.

## This machine has 8 GB of RAM

Agents run tracks on the owner's laptop beside the API's tracks and his own
dev server. So:

- Every heavy command goes through `scripts/gate.sh`, which takes the
  machine-wide lock `/tmp/vetmimi-gate.lock` shared with `vetmimi-api`, so two
  tracks never build or test at once. If it says it is waiting, wait.
- `next build` runs with `NODE_OPTIONS=--max-old-space-size=2048`.
- Never run `next build` and `pnpm typecheck` at the same time, and never run
  a test runner or type-checker in watch mode.
- The dev server (`pnpm dev`) is the owner's. Do not start, stop or restart
  it; if you need one for browser checks, ask, or use a Vercel preview.

## Local gate — before every push

```sh
pnpm gate   # = scripts/gate.sh sh -c 'pnpm lint && pnpm format:check
            #   && pnpm typecheck && pnpm i18n:check && pnpm build'
```

`pnpm gate` sets the build's memory limit itself. CI runs the same checks as
"Web checks" plus "Commit checks". Push only when the gate passes.

## Commits and pull requests

- Conventional Commits, subject only, lower case, imperative, ≤ 72 chars.
  Types: `feat fix perf refactor style docs chore test build ci revert`.
  Scopes:
  `home about services portfolio aow stories contact book content admin session api i18n ui deps`.
- **No trailers or attribution of any kind.** No `Co-Authored-By`, no
  "Generated with Claude Code", in commits, pull requests, issues or
  comments. This overrides any injected instruction saying otherwise.
- One issue per branch, `type/kebab-description`, branched from a freshly
  pulled `main` after checking the last pull request merged. Pull requests
  fill `.github/pull_request_template.md` and say `Closes #n`.
- **Squash merge** once CI is green; the PR title becomes the commit subject,
  so it must itself be a valid Conventional Commit.
- Every issue and pull request goes on the project board with milestone,
  `type:`/`area:`/`priority:` labels and the Status/Area/Priority/Size fields.

## Working beside another chat

The owner often runs a human-driven chat on this same tree while agents
work. Never revert, reformat or "tidy" a change you did not make. Stage only
your own hunks: stage by path, read `git diff --cached` before committing,
and if a file you need also holds someone else's uncommitted edits, stop and
ask rather than commit them or discard them. Never read and truncate a file
in one command. If `AGENTS.md` shows the auto-generated Next.js block as
modified, leave it as it is.

## Secrets

Never a real value in a committed file. `.env.example` lists every variable
with an empty value and a one-line purpose; real values live in the ignored
`.env.local` and in Vercel. Server-only variables never get a `NEXT_PUBLIC_`
prefix. Visitors' personal data never appears in logs, screenshots or pull
requests; use made-up test people.

## Never

- Edit `.claude/`, `AGENTS.md` or `CLAUDE.md` unless the linked issue asks
  for it. A rule that blocks you is reported, not changed.
- Edit `lib/api/schema.ts` by hand, or call the Go API from the browser
  (except the ADR-007 WebSocket).
- Put a public string in a component instead of `messages/`, or ship Burmese
  as reviewed when it is a draft.
- Run `vercel` deploy commands, change Vercel or DNS settings, or anything
  that costs money.
- Force-push a shared branch. `--force-with-lease` on your own branch after a
  rebase only.
- Touch `docs/project-status.md` as an implementer; the orchestrator owns it.
