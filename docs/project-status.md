# Project status — vetmimi-next

The orchestrator owns this file and updates it after every merge through a
`docs/status-<short-name>` pull request. Implementers never edit it. A fresh
session reads it to recover where the work stands.

## Current milestone

To be set by the orchestrator from the
[VetMiMi Website](https://github.com/orgs/VetMiMi/projects/1) board.

## Repository state

- Default branch: `main`, auto-deployed to
  <https://vetmimi-next.vercel.app>.
- Required checks: **Web checks** (lint, format, typecheck, build) and
  **Commit checks** (Conventional Commits). `pnpm gate` runs the same checks
  locally, plus `pnpm i18n:check`.
- Merges: squash only; the pull request title becomes the commit subject.
- Every pull request gets a Vercel preview deployment; UI pull requests carry
  screenshots at 375, 768 and 1280 px.
- Pinned API ref: none yet (ADR-003 adds `"vetmimiApi": {"ref": …}` to
  `package.json` with the first API-backed feature).

## Accepted decisions

The decisions live in the API repository and apply to both.

- [ADR-001 — Go API in its own repository](../../vetmimi-api/docs/adr/001-go-api-in-its-own-repository.md)
- [ADR-002 — Custom admin inside the Next.js app, Next as the browser's only origin](../../vetmimi-api/docs/adr/002-custom-admin-in-the-next-app.md)
- [ADR-003 — OpenAPI-first contract shared by generation](../../vetmimi-api/docs/adr/003-openapi-first-contract.md)
- [ADR-004 — PostgreSQL owns scheduling correctness](../../vetmimi-api/docs/adr/004-postgresql-owns-scheduling.md)
- [ADR-005 — One cheap live host; ECS Fargate kept as a validated Terraform target](../../vetmimi-api/docs/adr/005-cheap-live-host-and-fargate-target.md)
- [ADR-006 — Communications as durable records, delivered by asynq workers](../../vetmimi-api/docs/adr/006-communications-as-durable-records.md)
- [ADR-007 — One-to-one WebRTC with Go WebSocket signaling](../../vetmimi-api/docs/adr/007-one-to-one-webrtc-with-go-signaling.md)
- [ADR-008 — Content in PostgreSQL, served through the API, revalidated by tag](../../vetmimi-api/docs/adr/008-content-in-postgres-served-through-the-api.md)

Paths are relative to this file (`docs/`), so they resolve to
`../vetmimi-api/docs/adr/…` from the repository root.

## Current blockers

None.

## Next step

To be filled by the orchestrator.

## Ordered backlog

The orchestrator fills this list from the board, in the order issues should
be taken, with cross-repository dependencies noted (API issue first, tagged,
then the site).

1. _(empty)_

## Completed

- #1 — Port the VetMiMi site from React (Vite) to Next.js.
- #2 — Add Daw Mi's portrait and reflect The Art of Wellness program.
- #12 — `ci:` add the repository workflow, CI and pnpm.
- #16 — `feat:` polish page designs with Daw Mi's own photos and artworks.
- #23 — `feat(i18n):` add Burmese (မြန်မာ) language support.
- #27 — `feat(content):` apply Daw Mi's feedback and fill confirmed
  placeholders.
