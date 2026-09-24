# Next Image Migration Design

## Goal

Replace the project's plain image elements with `next/image` so local artwork is delivered in responsive, optimized formats while preserving the current visual layout. This addresses the first priority from the performance review.

## Current state

- Imported artwork is immediately converted to a string with `.src`.
- `PortfolioItem`, `Story`, and `Service` describe images as `string` values.
- Pages and shared cards render those values with plain `<img>` elements.
- The home hero is the LCP image and currently downloads a full-size source image.

## Scope

The migration touches image data in `lib/data.ts` and `lib/services.ts`, plus all current image consumers:

- `app/page.tsx`
- `app/about/page.tsx`
- `app/art-of-wellness/page.tsx`
- `app/portfolio/page.tsx`
- `app/portfolio/[slug]/page.tsx`
- `app/stories/page.tsx`
- `app/stories/[slug]/page.tsx`
- `app/services/page.tsx`
- `components/Editorial.tsx`
- `components/ServiceDetail.tsx`

## Design

1. Store static imports as `StaticImageData`, not string URLs. Remove all `.src` bridges from the data modules.
2. Import `Image` from `next/image` in each consumer and pass static imports directly to `src`.
3. Use `fill` only where the existing parent already establishes a positioned, cropped image area. Supply `sizes` for every responsive or filled image.
4. Use `preload` only on the home hero. This project runs Next.js 16, where `preload` replaces the deprecated `priority` prop.
5. Preserve existing `alt` text, crop positions, decorative-image semantics, hover behavior, and visual dimensions.
6. Do not compress or replace source artwork files in this change. Source-asset resizing and WebP/AVIF conversion are a separate follow-up needed to meet the review's byte-size targets.

## Verification

- `npm run lint` has no blocking errors.
- `npm run build` succeeds.
- Desktop and mobile checks confirm the hero, grid cards, service cards, stories, and detail pages retain their layout.
- Browser network inspection confirms optimized `/_next/image` requests for migrated images.

## Non-goals

- Refactoring the 419 inline style objects.
- Changing fonts.
- Static generation for dynamic slug pages.
- Editing copy, routes, or visual design.
