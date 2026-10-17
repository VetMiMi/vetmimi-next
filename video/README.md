# Intro video

A 69-second walk-through of VetMiMi, built with Remotion. It is a standalone
project: nothing in the site or CI depends on it, and the site's lint,
typecheck, format check and Docker build all ignore this folder.

```sh
npm install
npm run studio   # preview and scrub in the browser
npm run render   # out/intro.mp4, 1920x1080, 30 fps, H.264, no audio
npm run poster   # out/poster.webp, the title card
npm run gif      # out/intro-video.gif for a README, made from out/intro.mp4
npm run typecheck
```

Run `render` before `gif`. The GIF is 864 px wide at 8 fps with a 128-colour
palette, which keeps it under 5 MB; Remotion's own GIF codec made a file
about twice that size at the same width.

On a machine that already has Playwright's headless Chromium, add
`-- --browser-executable=<path to chrome-headless-shell>` to `render` or
`poster` to skip Remotion's browser download. Renders use one tab
(`--concurrency=1`) so they fit beside everything else on an 8 GB laptop.

## Scenes

| Scene | Seconds | Source |
|---|---|---|
| Title | 5 | `src/scenes/Title.tsx` |
| Two languages | 7 | `src/scenes/Languages.tsx` |
| A visitor books | 19 | `src/scenes/Booking.tsx` |
| No double booking | 11 | `src/scenes/Race.tsx` |
| Daw Mi's admin | 13 | `src/scenes/Admin.tsx` |
| Under the hood | 13 | `src/scenes/UnderTheHood.tsx` |
| End card | 6 | `src/scenes/EndCard.tsx` |

Lengths and transitions are in `src/Intro.tsx`; the total is computed from
them. The brush wipe between some scenes is `src/transitions/brush.tsx`.

The numbers in "Under the hood" were counted from `vetmimi-api`: operations
are `operationId:` lines in `openapi.yaml`, tests are `func Test` lines in
`*_test.go` minus `TestMain`. Re-count them before a new render.

## Screenshots

`public/screens/` holds cropped WebP copies of the interview-kit captures
(`vetmimi-api` `docs/interview-kit/screens/`, made by
`scripts/interview-kit/capture-screens.ts` against made-up demo data). To
refresh one, crop the matching PNG from `screens/raw/` with `cwebp`, for
example:

```sh
cwebp -q 80 -m 6 raw/078-book-step2-date-time-en-desktop.png \
  -crop 0 0 1440 1350 -o public/screens/book-time.webp
```

Desktop shots are 1440 px wide and phone shots 780 px (2x). The coral loops
and underlines are placed in those pixels, so check them after a re-crop.

## Adding music

Put the track in `public/` (for example `public/music.mp3`), set `music` at
the top of `src/Intro.tsx` to its file name, and remove `--muted` from the
`render` script. `volume` on the `<Audio>` there sets the level.
