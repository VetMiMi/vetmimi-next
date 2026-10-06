# Admin design brief

For whoever builds `/admin`, the rebuilt public booking flow and the
`/session/<token>` video page, so they reach the finish of the public pages.
Every value here comes from the code (`lib/tokens.ts`, `app/globals.css`,
`app/fonts.ts`, `styles/*.css`, `components/**`) or from the design sources:
the Figma Make Final Design Specification and Master Prompt
(`../documents/VetMiMi/03 Design/01 Design Specifications/`) and
`03 Booking & Admin UX.docx` (`../documents/VetMiMi/02 Website Plan/03 UX & Wireframes/`).
If you need a value that is not here, take it from the nearest public
component and add it to this file in the same pull request; do not invent one.

## 1. Design intent

The specification's idea is **Structured Expression**: "Clean editorial
structure + large red/coral and indigo art fields + flowing waves +
translucent ribbons + imperfect halos + collage fragments + real artwork +
simple human language." Its promise is "an art-led website where the
interface itself feels like a contemporary abstract artwork - while
services, booking and professional information remain calm, clear and
trustworthy."

Each page has a creative intensity. The calm end is the one we use:

- Services: "Creative intensity 2.5/5 - expressive enough to feel like
  VetMiMi, but clarity comes first."
- Individual Art Therapy: "Creative intensity 2/5 - warm and personal, with
  clear practical information."
- Book Appointment: "Creative intensity 1/5 - the calmest and most functional
  public interface." Its motif: "Subtle curved progress line only. No waves
  behind calendars, no artwork behind forms."

The specification leaves admin out on purpose ("the internal booking-admin
dashboard, CMS screens and content-management administration. Those can be
designed separately."), and ADR-002 settles it: admin reuses the public
tokens and fonts "with the calm '2/5 intensity' treatment the Figma spec
assigns to Services and Booking". In practice:

- Warm canvas page, white working surfaces, indigo for navigation and
  selection, the editorial red for the one primary action on a screen.
- Fraunces for page titles only; Manrope for everything Daw Mi reads while
  working.
- No waves, halos or ribbons inside working areas. One small decorative
  gesture is allowed where nothing is being done: the sign-in page and empty
  states (a `PetalOutline` or `NestedOval` from `components/art/Shapes.tsx`,
  `aria-hidden`).
- Simple human language, the same voice as the site: "Appointment confirmed.
  Visitor notification failed." not "Error 502 in comms worker".
- `/book` and `/session` sit at 1/5: calmer than admin, no decoration until
  the final success state ("A tiny abstract flower/petal may appear only on
  final success state").

## 2. Colour tokens

`lib/tokens.ts` exports `C` with 13 colours plus `white`; `app/globals.css`
repeats the 13 as CSS variables (`var(--indigo)`). Contrast is the WCAG 2.1
ratio, computed from the hex values. AA needs 4.5:1 for normal text, 3:1 for
large text (24px, or 18.66px bold) and for borders, icons and focus rings.

| Token    | Hex       | Spec name    | Role in the current CSS                                                                   | Kind       | On canvas | On white | AA text?         |
| -------- | --------- | ------------ | ----------------------------------------------------------------------------------------- | ---------- | --------- | -------- | ---------------- |
| `canvas` | `#FFF7EF` | Warm Canvas  | `body` background, header, mobile menu                                                    | background | –         | –        | –                |
| `paper`  | `#F8F1E8` | Soft Paper   | alternate sections (`.ed-paper`, `.service-paper`), booking summary, future progress step | background | –         | –        | –                |
| `ink`    | `#28252D` | Ink          | body text, headings, inputs                                                               | text       | 14.22     | 15.08    | yes              |
| `indigo` | `#494C6D` | Deep Indigo  | footer, secondary button, `.ed-link`, selected date/time, pressed filter, language pill   | text, fill | 7.80      | 8.27     | yes              |
| `violet` | `#6B6396` | Violet       | Stories art fields, home shapes                                                           | accent     | 5.14      | 5.45     | yes              |
| `olive`  | `#6F7144` | Olive        | declared, not used yet ("rare earthy accent")                                             | accent     | 4.80      | 5.10     | yes              |
| `red`    | `#C04D46` | Deep Red     | contact error text and border; art fields                                                 | accent     | 4.51      | 4.78     | just; 4.27 paper |
| `rose`   | `#B2667B` | Flower Rose  | tagline, eyebrows, required `*`, input focus border, checked pill, done progress step     | accent     | 3.90      | 4.13     | large only       |
| `coral`  | `#DB5F59` | Poppy Coral  | `Btn` primary fill, header Book, global focus outline, active nav link                    | accent     | 3.42      | 3.62     | large only       |
| `blue`   | `#7A8FAA` | Dusty Blue   | quiet shapes                                                                              | accent     | 3.12      | 3.31     | large only       |
| `ochre`  | `#CDAA73` | Golden Ochre | gold marks, notice tint, current Pending badge                                            | decorative | 2.06      | 2.19     | no               |
| `aqua`   | `#91C0D3` | Water Aqua   | ribbons and shapes                                                                        | decorative | 1.85      | 1.97     | no               |
| `butter` | `#E2CA85` | Butter       | declared, not used yet ("soft yellow background")                                         | background | 1.52      | 1.61     | no               |
| `white`  | `#FFFFFF` | –            | cards, form fields, booking surfaces (written as `#fff` in CSS)                           | background | –         | –        | –                |

The editorial CSS already darkens the accents where text needs them. Reuse
these exact values; they are the site's own answer to the contrast problem:

| Value     | Where                                           | On canvas | On white | Use in admin                        |
| --------- | ----------------------------------------------- | --------- | -------- | ----------------------------------- |
| `#ab4347` | `.ed-button`, `.service-button` fill            | 5.46      | 5.79     | primary and destructive button fill |
| `#91373b` | `.ed-button:hover`                              | –         | 7.46\*   | primary hover                       |
| `#88435b` | `.ed-label`, rose service accent                | 6.60      | 7.00     | eyebrows, small rose text           |
| `#625d64` | editorial body text, breadcrumb, metadata `dt`  | 6.06      | 6.42     | secondary text, help text           |
| `#756b75` | `.pf-role`, `.aow-credit`                       | 4.81      | 5.10     | captions, timestamps                |
| `#416879` | blue service accent                             | 5.69      | 6.03     | "blue" badge text                   |
| `#79602e` | gold service accent                             | 5.62      | 5.96     | "gold" badge text                   |
| `#8a8389` | `.service-row-steps-label`                      | 3.48      | 3.69     | input borders (non-text 3:1)        |
| `#33334d` | `.ed-dark` section                              | –         | –        | video stage background              |
| `#fffcf8` | `.contact-card`, `.contact-choice` surface      | –         | –        | raised card on canvas               |
| `#ded5ce` | dividers (`.service-faq`, `.service-practical`) | –         | –        | table row and list dividers         |
| `#e9e0da` | `.contact-card` border                          | –         | –        | card border                         |

\* white text on `#91373b`. White on `#ab4347` is 5.79; white on `coral` is
only **3.62**, so the current `Btn` primary (white 0.92rem text on coral)
fails AA. Admin buttons use `#ab4347`, as the editorial pages do.

Other failures to avoid repeating (all measured on canvas): `${C.ink}66`
2.35 and `${C.ink}88` 3.34 (booking progress labels, back links, weekday
headers), `rgba(40,37,45,0.55)` 3.48 (`.contact-note`), `0.45` 2.65
(`.opt`), placeholder `0.38` 2.26 on white. For muted text use `#625d64`
or ink at 0.72 or more (5.83). Input borders at `rgba(40,37,45,0.16)` are
1.37 against white; use `#8a8389`. The coral focus outline is 3.42 on canvas
and 3.62 on white (passes) but 2.28 on indigo, so never put focusable
controls on an indigo surface without a canvas-coloured outline there.

### Tailwind names

Admin code styles with Tailwind classes, never `style={…}`: ESLint rejects
the `style` prop in `app/admin/**` and `components/admin/**` (#9 explains
why; the public pages keep their inline styles for now). A value that only
exists at run time gets an `eslint-disable-next-line` comment saying why.
`app/globals.css` maps every value in this brief to a theme name, so use
these and nothing else:

| Token or value                                  | Tailwind name                                                                                                                               | Example                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| the 13 tokens and `white`                       | the token's name: `canvas`, `paper`, `ink`, `rose`, `coral`, `red`, `indigo`, `violet`, `blue`, `aqua`, `ochre`, `butter`, `olive`, `white` | `bg-canvas`, `text-ink`    |
| `#ab4347` / `#91373b`                           | `action` / `action-hover`                                                                                                                   | `hover:bg-action-hover`    |
| `#88435b`                                       | `label`                                                                                                                                     | `text-label`               |
| `#625d64` / `#756b75`                           | `muted` / `caption`                                                                                                                         | `text-muted`               |
| `#416879` / `#79602e`                           | `blue-text` / `gold-text`                                                                                                                   | `text-gold-text`           |
| `#8a8389`                                       | `input-border`                                                                                                                              | `border-input-border`      |
| `#ded5ce` / `#e9e0da`                           | `divider` / `card-border`                                                                                                                   | `border-divider`           |
| `#fffcf8` / `#33334d`                           | `raised` / `stage`                                                                                                                          | `bg-raised`                |
| a token at 12% (status tint, §3)                | the token with `/12`                                                                                                                        | `bg-ochre/12`              |
| Fraunces `var(--serif)` / Manrope `var(--sans)` | `display` / `body`                                                                                                                          | `font-display`             |
| radius 6 / 8 / 10 / 12 / 14 / 16 / 20px / 999px | `cell` / `small` / `control` / `inner` / `notice` / `choice` / `card` / `pill`                                                              | `rounded-card`             |
| card hover / lifted shadow (§5)                 | `card-hover` / `lifted`                                                                                                                     | `shadow-lifted`            |
| input / pill focus halo (§5)                    | `focus-input` / `focus-pill`                                                                                                                | `focus:shadow-focus-input` |

The fonts are `display` and `body`, not `serif` and `sans`: next/font owns
`--font-serif` and `--font-sans`, and a theme variable of that name would
replace Fraunces and Manrope. Radii and shadows also exist as variables for
arbitrary values, written the Tailwind 4 way: `rounded-(--radius-card)`,
not `rounded-[--radius-card]`.

## 3. Status colours

Status is always **icon + text label + tint**, never colour alone (Booking
UX §11: "Status must be displayed using text as well as any visual badge or
colour"). Badges are pills: `border-radius: 999px`, `padding: 4px 11px`
(the language switcher's pill), `font-size: 0.78rem`, `font-weight: 600`,
icon 16px from `@phosphor-icons/react` (already a dependency; import from
`/dist/ssr` in server components, as `about/page.tsx` does). The tint is the
token at 12% opacity (hex suffix `1F`, e.g. `${C.indigo}1F`). Ratios are text
on the tint over canvas / over white.

### Appointments (Booking UX §11)

| Status                    | Label               | Tint     | Text      | Ratio       | Icon              |
| ------------------------- | ------------------- | -------- | --------- | ----------- | ----------------- |
| pending                   | Pending             | `ochre`  | `#79602e` | 5.20 / 5.48 | `HourglassMedium` |
| confirmed                 | Confirmed           | `indigo` | `indigo`  | 6.47 / 6.88 | `CheckCircle`     |
| completed                 | Completed           | `olive`  | `ink`     | 12.3 / 13.0 | `CalendarCheck`   |
| declined                  | Declined            | `paper`  | `#625d64` | 5.73        | `XCircle`         |
| cancelled_by_client       | Cancelled by client | `red`    | `#ab4347` | 4.68 / 4.94 | `CalendarX`       |
| cancelled_by_practitioner | Cancelled by Daw Mi | `red`    | `#ab4347` | 4.68 / 4.94 | `CalendarX`       |
| no_show                   | No-show             | `violet` | `ink`     | 12.2 / 12.8 | `UserMinus`       |
| expired                   | Expired             | `paper`  | `#625d64` | 5.73        | `HourglassLow`    |

The statuses are the contract's `AppointmentStatus`: the practitioner's
cancellation is `cancelled_by_practitioner`, and `expired` (a request
nobody answered in time) takes the Declined treatment. These tables live as
data in `components/admin/status.ts`, typed from `lib/api/schema.ts`, so a
status the API adds fails `pnpm typecheck` until it has a row; the admin
`StatusBadge` and the public booking pages both read it.

Keep the UX document's distinction in the wording: "Declined = appointment
request was never confirmed. Cancelled = previously confirmed appointment
will no longer take place." Rescheduled is a history event, not a badge.

### Communications (Booking UX §24) and video rooms (ADR-007)

| Status            | Label      | Tint     | Text      | Icon              |
| ----------------- | ---------- | -------- | --------- | ----------------- |
| queued            | Queued     | `paper`  | `#625d64` | `Clock`           |
| sent              | Sent       | `indigo` | `indigo`  | `PaperPlaneTilt`  |
| failed            | Failed     | `red`    | `#ab4347` | `WarningCircle`   |
| cancelled         | Cancelled  | `paper`  | `#625d64` | `Prohibit`        |
| room `waiting`    | Waiting    | `ochre`  | `#79602e` | `HourglassMedium` |
| room `in_session` | In session | `indigo` | `indigo`  | `VideoCamera`     |
| room `ended`      | Ended      | `paper`  | `#625d64` | `PhoneDisconnect` |

"Delivered should only be used if the chosen provider can genuinely confirm
delivery." Do not add a Delivered badge until it can.

### Publication and approval (ADR-008)

| Status                       | Label             | Tint     | Text      | Icon            |
| ---------------------------- | ----------------- | -------- | --------- | --------------- |
| draft                        | Draft             | `paper`  | `#625d64` | `NotePencil`    |
| review                       | In review         | `butter` | `#79602e` | `Eye`           |
| scheduled                    | Scheduled         | `blue`   | `#416879` | `CalendarDots`  |
| published                    | Published         | `olive`  | `ink`     | `Globe`         |
| unpublished                  | Unpublished       | `paper`  | `#625d64` | `EyeSlash`      |
| archived                     | Archived          | `paper`  | `#625d64` | `Archive`       |
| approval `not_reviewed`      | Not reviewed      | `paper`  | `#625d64` | `FileDashed`    |
| approval `needs_review`      | Needs review      | `butter` | `#79602e` | `WarningCircle` |
| approval `changes_requested` | Changes requested | `red`    | `#ab4347` | `ArrowUUpLeft`  |
| approval `approved`          | Approved          | `indigo` | `indigo`  | `CheckCircle`   |

Scheduled badges carry the time ("Scheduled · 12 Oct, 9:00 am").

## 4. Typography

Three families from `app/fonts.ts`, self-hosted by `next/font`, exposed as
CSS variables in `app/globals.css`:

- **Fraunces** (`var(--serif)`, variable, italic, `opsz` axis): `h1`–`h4`
  globally at weight 400 and line-height 1.1; the logo (1.45rem); FAQ
  questions; `.contact-choice strong`; the italic `.aow-quote`; service step
  numbers. In admin: page titles, dialog titles and empty-state headings only.
- **Manrope** (`var(--sans)`, variable): body, navigation, buttons, labels,
  inputs, tables. All admin working text.
- **Caveat** (`var(--hand)`, not preloaded): the About signature, portfolio
  dates and artwork titles. Not used in admin.
- **Burmese**: Noto Sans Myanmar and Noto Serif Myanmar (400, 600) sit after
  the Latin fonts in each stack, are not preloaded, and only download for
  Burmese text. `globals.css` sets `line-height: 1.9` on `:lang(my)` text
  elements, `1.5` on headings, and `letter-spacing: normal` everywhere, with
  `!important` because components set these inline.

Body is `font-size: 17px; line-height: 1.7` (spec: "Body 17-18px desktop;
17px mobile"). Sizes in use:

| Use                        | Value                                                                       | Source                |
| -------------------------- | --------------------------------------------------------------------------- | --------------------- |
| Editorial `h1`             | `clamp(2.5rem, 5vw, 4.5rem)`, lh 1.08, ls −0.03em                           | `.ed-page h1`         |
| Editorial `h2`             | `clamp(1.8rem, 3vw, 2.65rem)`, lh 1.16, ls −0.02em                          | `.ed-page h2`         |
| Editorial `h3`             | `clamp(1.3rem, 2vw, 1.6rem)`, lh 1.25                                       | `.ed-page h3`         |
| Service `h1` / `h2` / `h3` | `clamp(2.3rem, 4.4vw, 3.7rem)` / `clamp(1.8rem, 2.8vw, 2.5rem)` / `1.45rem` | `services.css`        |
| Booking step title         | `clamp(1.6rem, 3vw, 2.2rem)`                                                | `Step1`–`Step4`       |
| Card title                 | `clamp(1.6rem, 2.4vw, 2rem)`                                                | `.contact-card h2`    |
| Small serif heading        | `1.35rem`                                                                   | `.aow-parts h3`       |
| Lead                       | `1.08rem`, max 56ch                                                         | `.ed-lead`            |
| Body (editorial)           | `1rem`–`17px`, lh 1.75–1.8, colour `#625d64`                                | `.ed-page p`          |
| Label                      | `0.88rem`, weight 500                                                       | `.contact-label`      |
| Input text                 | `1rem` (16px; stops iOS zoom)                                               | `.contact-input`      |
| Button                     | `0.9rem`, weight 600                                                        | `.ed-button`          |
| Eyebrow                    | `0.7rem`, uppercase, ls 0.12em, weight 700, `#88435b`                       | `.ed-label`           |
| Table head / `dt`          | `0.75rem`, uppercase, ls 0.1em, weight 600                                  | `.contact-details dt` |
| Small print                | `0.8rem`                                                                    | `.service-footnotes`  |

Admin scale: page title = booking step title; section title = `1.35rem`
Fraunces; body and table cells `0.95rem` Manrope (`.service-practical dd`);
labels, buttons, eyebrows and table heads as above.

## 5. Spacing, radii, borders, shadows, widths

The specification asks for "an 8px spacing system"; the CSS uses multiples
of 4. Admin uses 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

- **Containers**: `width: min(1120px, calc(100% - 48px))` (`.ed-container`,
  `.service-container`, `.contact-container`), `calc(100% - 40px)` below
  768px. Header and footer: `max-width: 1240px`, `padding: 0 1.5rem`,
  header height `72px`.
- **Reading widths**: `.prose` 720px, `.ed-article-body` 760px, booking flow
  660px, success state 560px; text measures 56ch, 54ch, 44ch.
- **Section rhythm**: `padding-block: clamp(44px, 6vw, 80px)` (`.ed-section`);
  service sections `clamp(44px, 5.5vw, 72px)`; card padding
  `clamp(24px, 4vw, 44px)`; grid gaps `clamp(28px, 4vw, 48px)`; form gap
  22px, field row gap 18px, label-to-field 8px; action rows gap 20–24px,
  `margin-top: 28px`.
- **Radii**: 6px small images and date cells; 8px `Btn`; 10px inputs,
  `.ed-button`, notes; 12px inner images; 14px status messages; 16px choice
  cards and article images; 20px cards and panels (spec: "Functional cards:
  16-20px radius"); 999px pills; 50% round buttons; the arch
  `48% 48% 12px 12px` for portraits (not admin).
- **Borders**: 1px everywhere. `#e9e0da` card, `#e2d8d2` choice card,
  `#ded5ce` / `#d8cdca` / `#dcd2cf` dividers, `rgba(40,37,45,0.09)` header on
  scroll, `rgba(40,37,45,0.1)` light dividers. Inputs `#8a8389` in admin
  (see §2).
- **Shadows** (sparingly; most surfaces are flat):
  `0 8px 24px rgba(73,76,109,0.08)` card hover (`.contact-choice`);
  `0 14px 30px rgba(40,37,45,0.16)` lifted objects (framed photos) — use for
  dialogs, toasts and menus; `0 0 0 3px rgba(178,102,123,0.16)` input focus
  halo; `0 0 0 3px rgba(178,102,123,0.3)` pill focus halo.
- **Breakpoints**: 480, 640, 768 (`md`), 900, 1024 (`lg`). Admin uses 768
  (tables ↔ cards) and 1024 (sidebar ↔ bottom tabs).

## 6. Motion

What the pages do now:

- Colour and border changes: 0.15s ease (inputs, pills, date cells) to 0.2s
  (buttons, nav opacity/colour). Header border fades in at 0.3s after 24px
  of scroll.
- Lifts: `.contact-choice` rises `translateY(-2px)` with a border and
  shadow change at 0.2s; gallery images rise 3px at 0.4s.
- Disclosure: FAQ `+` rotates 45° at 0.25s; answer height at 0.35s.
- The home floating CTA uses `cubic-bezier(.22,.68,0,1.2)` at 0.45s; the
  mosaic scales to 1.05 over 600ms.
- Reduced motion: no public page honours `prefers-reduced-motion` yet.
  That is a gap; do not copy it.

The specification adds: "Buttons: arrow moves 3px right on hover/focus"
and "Respect reduced-motion preference; all important content must be
fully usable without animation."

Admin rules: 0.15s for colour and border, 0.2s for lifts and dialogs, no
bounce, nothing that loops except a progress spinner. Every transition and
transform sits inside `@media (prefers-reduced-motion: no-preference)` or is
switched off under `reduce`.

## 7. Layout patterns for admin

**Shell.** At 1024px and wider, a left sidebar on `paper` with the
wordmark (Fraunces 1.45rem, as the header) and links in the header's style
(Manrope 0.84rem, weight 500, ink at 0.72 opacity, active item ink at full
opacity with an indigo marker and `aria-current="page"`). Main area on
`canvas`. Below 1024px the sidebar becomes a bottom tab bar on `paper` with
a top border `rgba(40,37,45,0.09)`, icon above label, each tab at least
44px tall plus `env(safe-area-inset-bottom)`. Items per Booking UX §8:
Dashboard, Appointments, Availability, Settings, plus Content (ADR-008).
Roles decide the list: `content_editor` sees no booking items. More than
five items → the fifth tab is "More", a page listing the rest. Below 1024px
a slim top bar on canvas holds the wordmark and a quiet "Sign out"; from
1024px the sidebar ends with the user's name and "Sign out". The one nav
config is `components/admin/nav.ts`; a section not built yet links to a
"coming soon" empty state, never a 404.

**Page header.** Optional breadcrumb (`.ed-breadcrumb`: 0.82rem, `#625d64`,
underlined links, offset 4px), title, one-line description in `#625d64`,
then the page's primary action on the right; below 768px the action drops
under the title at full width. One primary action per page.

**Content width.** Lists and dashboards use the 1120px container. Forms sit
in a 660px column (the booking flow). Detail pages use the contact layout:
`grid-template-columns: minmax(0, 7fr) minmax(0, 4fr)`, gap
`clamp(28px, 4vw, 56px)`, side panel sticky at `top: 104px`, one column
below 900px.

**Tables and cards.** At 768px and wider, a table: head row in the `dt`
style, rows divided by `#ded5ce`, `padding-block: 12px`, the first cell a
link to the detail page so the row is reachable by keyboard. Below 768px,
the same data as stacked cards ("Mobile should use stacked cards rather
than forcing a wide table"), each a label/value list in the `.ed-metadata`
pattern (`grid-template-columns: 100px 1fr`). Overview rows show minimal
data; personal details only on the detail page (Booking UX §28).

**Forms.** Label above the field, always visible; `*` in rose for required
or "(optional)" in `#625d64`; help text under the label linked with
`aria-describedby`; inputs as `.contact-input` (padding 13px 16px, radius
10px, white, 1rem) with `#8a8389` border, hover darker, focus rose border
plus the 3px halo. Validate on blur and on submit; the message sits under
the field in `#ab4347` with `WarningCircle`, the field gets
`aria-invalid="true"`, and on submit a summary at the top
(`role="alert"`, the `.contact-status--error` box with `#ab4347` text)
links to each field. Help and error text are the label's 0.88rem at
line-height 1.6, the error's `WarningCircle` 18px; ids come from the
field's `name` (`field-<name>`, `-help`, `-error`), so the summary's links
and `aria-describedby` always agree. Every control and tap area is at
least 44px high. Disable the submit button while sending and say so
("Saving…").

**Dialogs.** Native `<dialog>` with `showModal()`, as the portfolio
lightbox does: focus is trapped, Escape closes, focus returns to the
trigger. Radius 20px, white, the lifted shadow, max-width 560px (the
booking summary width). Required
for "Decline Request, Cancel Appointment, Pause Public Booking, or Remove
Availability" (§30), and as the review step before Confirm (§13). Title
names the action; body states the consequence and what is kept ("The
visitor will be notified. The appointment stays in history."); buttons:
"Keep it" (secondary, focused first) and the verb in `#ab4347`
("Decline request"). Routine navigation and filtering never ask.

**Toasts.** For completed, non-blocking outcomes only ("Availability saved").
`role="status"`, bottom-right on desktop, above the tab bar on mobile,
paper background, the lifted shadow, radius 14px. A toast leaves after 5
seconds, waits while hovered or focused, and has a dismiss button. A partial failure is
never a toast that fades: it stays on the page until dealt with.

**Empty states.** One sentence that says what is empty, one that says why
if useful, and one clear next action, in the spirit of S09 ("Nothing here
yet."). Examples: "No pending requests." → "View upcoming appointments";
"No weekly hours yet." → "Add weekly hours". Never fake rows.

**Loading.** Route-level `loading.tsx` with skeletons that match the final
layout: `paper` blocks with the final radii, `aria-busy="true"` on the
region, no shimmer under reduced motion.

**Errors.** Say what happened and **what state remains active**. The UX
document's §31 wording, to use as written:

- "Appointment could not be confirmed. No status change was saved."
- "The appointment was not rescheduled. The original appointment remains
  active."
- "The appointment was not cancelled. Status remains Confirmed."
- "Availability was not updated. The previous schedule remains active."
- "Appointment confirmed. Visitor notification failed."

Stale data (§30): "This appointment has changed since you opened it.
Refresh to see the latest." Session expiry (§29): send to sign-in and come
back to the same page. No access: a permission message and no appointment
data. Never show stack traces or `Problem.type` URLs.

## 8. Component inventory (`components/admin/`)

Props are sketches; match the patterns in `components/ui/Button.tsx`.

| Component                   | Props sketch                                                                                      | Notes                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                    | `variant: "primary" \| "secondary" \| "quiet" \| "danger"; href?; type?; disabled?; busy?; icon?` | Reuse `Btn`'s API and `SmartLink` (its `Link` needs the admin shell's i18n decision; see `AGENTS.md`). Primary and danger fill `#ab4347` (hover `#91373b`); secondary indigo border as `Btn`; quiet = `EditorialLink` style. Radius 10px, min-height 44px (48px for page actions), 0.9rem/600. `busy` disables and shows `CircleNotch`.                                                                |
| `Input`                     | `label; name; type?; help?; error?; required?; autoComplete?`                                     | `.contact-input` treatment; renders label, help and error with ids wired.                                                                                                                                                                                                                                                                                                                              |
| `Textarea`                  | as `Input` + `rows?`                                                                              | `min-height: 168px`, `resize: vertical`, lh 1.65.                                                                                                                                                                                                                                                                                                                                                      |
| `Select`                    | as `Input` + `options: {value, label}[]`                                                          | Native `<select>`, same box.                                                                                                                                                                                                                                                                                                                                                                           |
| `Checkbox`                  | `label; name; checked; help?`                                                                     | `.contact-privacy` pattern, `accent-color: var(--rose)`, 44px row.                                                                                                                                                                                                                                                                                                                                     |
| `DateField`                 | `label; value: string /* YYYY-MM-DD */; min?; max?`                                               | Native `type="date"`; dates are Sydney calendar dates, never `toISOString()`.                                                                                                                                                                                                                                                                                                                          |
| `TimeRangeField`            | `label; start; end; onChange; error?`                                                             | Two `type="time"` inputs with "to" between; rejects end ≤ start inline. Used for weekly periods ("Tuesday 10:00 AM–1:00 PM, 2:00 PM–5:00 PM"). Side by side in a column 320px or wider, stacked in a narrower one.                                                                                                                                                                                     |
| `ErrorSummary`              | `title; errors: {name, message}[]`                                                                | The summary in §7 Forms: the `.contact-status--error` box (`bg-red/7`, `border-red/27`, radius 14px, padding 20px 24px, 0.92rem) with `#ab4347` text and `role="alert"`. Focus moves to it when it appears (a new `key` per submit); each message links to its field and focuses it. A client component only for the focus.                                                                            |
| `StatusBadge`               | `kind: "appointment" \| "communication" \| "room" \| "publication" \| "approval"; status`         | Tables in §3 are its source; label and icon always rendered.                                                                                                                                                                                                                                                                                                                                           |
| `Card`                      | `as?; children; padding?`                                                                         | `#fffcf8` or white, `#e9e0da` border, radius 20px, padding `clamp(24px, 4vw, 44px)`.                                                                                                                                                                                                                                                                                                                   |
| `DataTable` / `StackedList` | `columns: {key, label, render}[]; rows; rowHref`                                                  | One component that renders a table ≥768px and cards below; same column config.                                                                                                                                                                                                                                                                                                                         |
| `Tabs`                      | `items: {id, label, count?}[]; active`                                                            | Link-based (URL holds the state) using the `.ed-filters` pill style, `aria-current`. Border `#8a8389` (the public `#c6bec6` is under 3:1).                                                                                                                                                                                                                                                             |
| `Dialog`                    | `title; open; onClose; children; actions`                                                         | Native `<dialog>`; see §7.                                                                                                                                                                                                                                                                                                                                                                             |
| `Toast`                     | `message; tone: "success" \| "info"`                                                              | `role="status"`; see §7.                                                                                                                                                                                                                                                                                                                                                                               |
| `Notice`                    | `tone: "error" \| "info" \| "success"; children`                                                  | An outcome that must stay on the page: what state remains active, partial failures, stale data. The `.contact-status` box; error `role="alert"` in `#ab4347`, info indigo, success olive tint with ink text, both `role="status"`.                                                                                                                                                                     |
| `EmptyState`                | `title; text?; action?: {label, href}`                                                            | Optional small `Shapes` accent, `aria-hidden`.                                                                                                                                                                                                                                                                                                                                                         |
| `Skeleton`                  | `variant: "row" \| "card" \| "text"; count?`                                                      | `paper`, final radii, reduced-motion safe.                                                                                                                                                                                                                                                                                                                                                             |
| `PageHeader`                | `title; description?; breadcrumb?; action?`                                                       | See §7.                                                                                                                                                                                                                                                                                                                                                                                                |
| `Sidebar` / `BottomNav`     | `items: {href, label, icon}[]; current`                                                           | One nav config, two renderings; see §7.                                                                                                                                                                                                                                                                                                                                                                |
| `CalendarMonth`             | `month; days: {date, state, count?}[]; selected?; onSelect`                                       | Grid with `role="grid"`, arrow keys move by day/week, Home/End and PageUp/PageDown move by week/month; each day button's name is the full date and its state ("Tuesday 6 October, 3 appointments"); selected = indigo fill **and** `aria-pressed` with a `Check` icon; unavailable = struck text plus "unavailable" in the name, not grey alone. Month buttons labelled "Previous month"/"Next month". |
| `SlotPicker`                | `slots: {start, label}[]; selected?; onSelect; timezone`                                          | Large time buttons in a wrap (as Step 2), radiogroup semantics, timezone line under the list ("Times shown in Sydney time (AEST/AEDT)"). Shared by admin reschedule and the public flow.                                                                                                                                                                                                               |

## 9. Public booking flow and `/session`

Both are public, so every string lives in `messages/` in English and
Burmese, and both use the 1/5 treatment: canvas page, white surface, indigo
selection, `#ab4347` primary, no artwork.

**Booking states** (spec §13, states S01–S06 and S11, Booking UX §1–7):

| State              | How it looks                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1 Service     | One selectable card per row (`.contact-choice` style, radio semantics); only schedulable services; service carried from a service page is preselected.  |
| Step 2 Date & time | `CalendarMonth` + `SlotPicker`; after choosing, "You selected [Date] at [Time] [Timezone]." with "Change date or time".                                 |
| Step 3 Details     | Single-column form; Name, Email, Phone only if required, optional note with the health-information warning, two acknowledgements. Entries survive Back. |
| Step 4 Review      | White summary card, an Edit link beside each group, "Please check the details before sending your request.", button "Submit Appointment Request".       |
| Processing         | Button disabled, "Sending your appointment request..."; no second submit.                                                                               |
| S01 Pending        | "Appointment request received", `StatusBadge` Pending (icon + text), the summary repeated, one small petal.                                             |
| S02 Confirmed      | "Your appointment is confirmed." Visibly different from Pending (Confirmed badge, next steps).                                                          |
| S03 Failed         | "Your request was not sent." "No appointment request was created. Your details are still here, so you can try again." Try again / Change time.          |
| S04 No times       | "There are no available times showing right now." Next actions instead of an empty calendar.                                                            |
| S05 Time lost      | Inline alert "That time is no longer available. Please choose another time.", focus moved to the slot list, other answers kept.                         |
| S06 Unavailable    | Badge "Currently unavailable"; "This service is not taking appointment requests at the moment."; booking controls hidden.                               |
| Booking paused     | As S06 for every service, with the contact route.                                                                                                       |
| S11 Bad link       | "This link is not available." and the S11 copy; reveals nothing about any appointment.                                                                  |

Mobile: "progress becomes short numbered step header, not a cramped desktop
stepper" ("Step 2 of 4 · Date & time"). The spec's "Thin curved progress
line connects steps 1-4" is the only decoration on desktop.

Known defects in the current `/book` code that the rebuild must not carry
over: dates are keyed with `toISOString().slice(0, 10)`, which in Sydney
gives the previous day, so the summary names the wrong date; day buttons
are announced only as a number and availability is shown by coral tint
alone; the month arrows have no accessible name; the Pending badge is ochre
on an ochre tint (1.83:1); muted text uses `${C.ink}66` (2.35:1); inputs
have a 4px radius where every other form uses 10px.

**`/session/<token>` states** (ADR-007: "too early, expired, waiting for
Daw Mi, connecting, poor connection, ended — each designed, not
improvised"):

| State                     | How it looks                                                                                                                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invalid link              | The S11 page, same copy.                                                                                                                                                                                                                                                         |
| Too early                 | Calm canvas card: "Your session starts at 10:00 am (Sydney time). This page opens 15 minutes before." The time comes from the API.                                                                                                                                               |
| Expired                   | "This session has ended." and the contact route; no appointment details.                                                                                                                                                                                                         |
| Check devices             | Camera preview, microphone and camera toggles, "Join session". Permission denied explains how to allow access in the browser.                                                                                                                                                    |
| Waiting                   | `#33334d` stage (`.ed-dark`; canvas text 11.5:1), self-view, "Waiting for Daw Mi to join." with a Waiting badge.                                                                                                                                                                 |
| Connecting / reconnecting | Same stage, `CircleNotch` and "Connecting…" / "Reconnecting…", controls still usable.                                                                                                                                                                                            |
| Poor connection           | A non-blocking banner, `WifiLow`, "Your connection is weak. Video may pause; audio will try to continue."                                                                                                                                                                        |
| In session                | Remote video large, self-view small in a corner, a control row of 48px round buttons (the lightbox buttons: `rgba(255,247,239,0.12)`, hover `0.24`) for microphone, camera and "Leave", each with a visible label or tooltip and an `aria-label`; the Leave button is `#ab4347`. |
| Ended                     | Back on canvas: "The session has ended." No rating, no recording (there is none).                                                                                                                                                                                                |

Focus rings on the stage use canvas, not coral (coral is 3.37:1 on
`#33334d`, borderline). Daw Mi joins from the appointment in `/admin`; the
same stage component serves both.

## 10. Accessibility checklist

- Text meets AA (§2 ratios); borders, icons and focus rings meet 3:1.
- Visible focus on every link, button, filter, tab, calendar day and form
  control (global `:focus-visible` is 2px coral, offset 3px).
- Nothing is shown by colour alone: status, selection, availability, errors.
- Keyboard: the whole flow and every admin task work without a mouse;
  calendars support arrow keys; dialogs trap and return focus.
- Every input has a visible label; help and errors are linked with
  `aria-describedby`; errors are announced (`role="alert"`), results with
  `role="status"`.
- Touch targets at least 44px; inputs 16px text.
- Works at 200% browser zoom and at 320px wide with no horizontal scroll.
- One `h1` per page; headings in order; landmarks (`nav` with a label,
  `main`).
- Decorative shapes `aria-hidden`; meaningful images have alt text (public
  alt text lives in messages).
- Motion respects `prefers-reduced-motion`.
- Public pages: `lang` is set by the layout; Burmese line-height rules are
  not overridden.
- Times are shown in the practice timezone with the zone named.

## 11. "Finished" checklist for admin and booking pull requests

What makes the public pages feel finished, as checks. Copy into the pull
request and tick each one.

- [ ] **Rhythm.** Spacing comes from §5; sections and cards line up on the
      same container edges; nothing sits closer than 8px by accident.
- [ ] **One voice.** Real copy in the site's plain, kind English (and
      Burmese for public pages), no lorem ipsum, unknown facts marked
      `[To confirm]`. Buttons say what happens ("Confirm appointment", not
      "Submit").
- [ ] **One primary action** per screen, in `#ab4347`; everything else is
      secondary or quiet.
- [ ] **Every state designed:** loading, empty, error (with the state that
      remains active), success, no permission, stale, slow network.
- [ ] **Hover and focus** on everything interactive: colour change at
      0.15–0.2s, visible focus ring, pointer cursor; disabled looks disabled
      and says why when not obvious.
- [ ] **Status** uses `StatusBadge` (icon + text); never colour alone.
- [ ] **Type**: Fraunces only for titles; Manrope everywhere else; sizes
      from §4; no text below 0.75rem.
- [ ] **Colour**: only tokens and the §2 darkened values; muted text
      `#625d64` or darker; contrast checked for anything new.
- [ ] **Images** (public pages): `next/image` with `sizes`, WebP, a quality
      from `next.config.ts` (40, 60, 75), `placeholder="blur"` for heroes,
      alt text in messages, and the site's framing (mat, radius) rather than
      bare rectangles.
- [ ] **Burmese** (public pages): every key in both locales,
      `pnpm i18n:check` green, layout checked at `/my/…` with the taller
      line-height, no clipped or overlapping lines, no inline
      `letter-spacing` fighting `:lang(my)`.
- [ ] **Responsive**: checked at 375, 768 and 1280 px; tables become cards
      below 768; no horizontal scroll; tap targets 44px; bottom tabs do not
      cover content.
- [ ] **Keyboard and screen reader**: completed the main task by keyboard;
      headings, labels and live regions make sense read aloud.
- [ ] **Motion**: nothing moves under `prefers-reduced-motion: reduce`.
- [ ] **Privacy**: overview screens show minimal data; screenshots use
      made-up people; nothing personal in logs or URLs.
- [ ] **Screenshots** at the three widths attached to the pull request.
