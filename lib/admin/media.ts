// The media library in the post editor (#151): what may be uploaded, when
// an image is described well enough to attach, and which web size to show.
// Pure, so node:test covers it.
import type { components } from "../api/schema.ts";

export type Media = components["schemas"]["Media"];

// The API's own limits (vetmimi-api internal/media): 20 MiB, and a JPEG,
// PNG or WebP recognised from its content.
export const MAX_UPLOAD_BYTES = 20 << 20;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Why a chosen file cannot be uploaded, before it is sent.
export function fileProblem(file: { type: string; size: number }) {
  if (!ACCEPTED_TYPES.includes(file.type))
    return "Choose a JPEG, PNG or WebP image.";
  if (file.size > MAX_UPLOAD_BYTES)
    return `This image is ${megabytes(file.size)}. Choose one of 20 MB or less.`;
  return undefined;
}

export const megabytes = (bytes: number) =>
  `${(bytes / (1 << 20)).toFixed(1)} MB`;

// Every image a post shows needs alt text in both languages: the website
// is bilingual and the API falls back to English, never to nothing.
export const describedEnough = (media: Pick<Media, "alt">) =>
  Boolean(media.alt?.en?.trim() && media.alt?.my?.trim());

// The smallest web size at least `width` wide, else the largest there is.
// The API lists sizes largest first.
export function sizeFor(media: Pick<Media, "sizes">, width: number) {
  const fits = media.sizes.filter((size) => size.width >= width);
  return (fits.at(-1) ?? media.sizes[0])?.url;
}

// The largest web size, for downloading to post by hand.
export const largest = (media: Pick<Media, "sizes">) => media.sizes[0]?.url;

// `list` with the item at `index` moved one place by `step` (-1 or 1);
// unchanged at either end.
export function move<T>(list: readonly T[], index: number, step: -1 | 1) {
  const to = index + step;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length)
    return [...list];
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

// The sentence for an upload the API refused.
export function uploadFailure(code: string) {
  switch (code) {
    case "payload_too_large":
      return "This image is too large: at most 20 MB and 50 megapixels. Nothing was uploaded.";
    case "unsupported_media_type":
      return "This file is not a JPEG, PNG or WebP image. Nothing was uploaded.";
    case "invalid_request":
      return "Alt text and credit may be at most 300 characters each. Nothing was uploaded.";
    case "unauthenticated":
      return "Your session has ended. Sign in again, then upload the image.";
    case "forbidden":
      return "Your account cannot upload images. If you need to, ask the site administrator.";
    default:
      return "The image was not uploaded. Check your connection and try again.";
  }
}
