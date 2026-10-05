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

## Read next

- [`AGENTS.md`](AGENTS.md): the working agreement, layout and rules.
- [`docs/`](docs/): project status and the admin design brief.
- [`messages/README.md`](messages/README.md): how public text and Burmese
  translations work.
