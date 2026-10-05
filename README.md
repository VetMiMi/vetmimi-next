# vetmimi-next

The public website and admin for [VetMiMi](https://vetmimi-next.vercel.app),
Daw Mi's art therapy practice in Sydney: the public site in English and
Burmese, `/admin` for Daw Mi, and `/session/<token>` for online sessions.
It is a Next.js App Router app; the Go API in
[VetMiMi/vetmimi-api](https://github.com/VetMiMi/vetmimi-api) owns the data.

## Getting started

```sh
pnpm install
pnpm gate   # lint, format, types, messages, unit tests and build
```

`pnpm dev` is the owner's dev server; agents do not start or stop it.
`pnpm gate` runs heavy work behind a machine-wide lock, so wait if it says
it is waiting.

## Tests

`pnpm gate` runs the unit tests in `lib/*.test.ts`. The end-to-end checks in
`e2e/` (Playwright with axe) run only in CI, in the "Web end-to-end" job: it
builds the site, starts it, and checks every public page in English and
Burmese, at 1280 and 375 px, for WCAG 2.2 AA violations, for sideways
scrolling at 320 px, and for keyboard use of the menu and the language
switcher. They never run locally, because a browser beside a production
build does not fit on the 8 GB laptop. Failures already known are listed in
`e2e/axe-baseline.json`; a new failure fails the job, and so does a listed
one that no longer happens, so fixing it means removing its entry. When the
job fails, download the `playwright-report` artifact from the run's summary
page, unzip it, and open `index.html` (or run
`pnpm exec playwright show-report <folder>`); each axe test carries an
`axe-violations.json` attachment naming the rule, impact and elements.

## Read next

- [`AGENTS.md`](AGENTS.md): the working agreement, layout and rules.
- [`docs/`](docs/): project status and the admin design brief.
- [`messages/README.md`](messages/README.md): how public text and Burmese
  translations work.
