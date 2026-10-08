import {
  BookmarkSimple,
  ChatCircle,
  Globe,
  Heart,
  ImageSquare,
  PaperPlaneRight,
  PaperPlaneTilt,
  Repeat,
  ShareFat,
  ThumbsUp,
} from "@phosphor-icons/react";
import type { Media } from "@/lib/admin/media";
import { hashtagRuns, type SocialChannel } from "@/lib/admin/postDraft";
import { MediaThumb } from "./MediaThumb";

// A guide to how each post will read on its platform, in the site's own
// type and colours: the platforms' layouts, not their look. The account
// names are the ones the connectors will post as [To confirm].
const ACCOUNTS = {
  facebook: "VetMiMi",
  instagram: "vetmimi",
  linkedin: "Daw Mi",
};

type PreviewProps = { text: string; link?: string; images: Media[] };

function Text({ text }: { text: string }) {
  if (!text.trim())
    return <p className="text-muted italic">Nothing written yet.</p>;
  return (
    <p className="break-words whitespace-pre-wrap">
      {hashtagRuns(text).map(({ run, tag }, i) =>
        tag ? (
          <span key={i} className="text-blue-text">
            {run}
          </span>
        ) : (
          run
        ),
      )}
    </p>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-indigo font-display text-[1rem] text-white"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Header({ name, note }: { name: string; note?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
      <Avatar name={name} />
      <div className="min-w-0 leading-tight">
        <p className="font-semibold">{name}</p>
        <p className="flex items-center gap-1 text-[0.78rem] text-caption">
          {note && `${note} · `}Just now ·
          <Globe aria-hidden="true" size={12} />
        </p>
      </div>
    </div>
  );
}

// The first image as the platform crops it, and how many follow.
function Images({ images, ratio }: { images: Media[]; ratio: string }) {
  return (
    <div className={`relative ${ratio} bg-paper`}>
      <MediaThumb media={images[0]} width={800} className="size-full" />
      {images.length > 1 && (
        <span className="absolute top-3 right-3 rounded-pill bg-ink/70 px-2.5 py-1 text-[0.75rem] font-semibold text-white">
          1 / {images.length}
        </span>
      )}
    </div>
  );
}

function LinkCard({ link }: { link: string }) {
  const host = URL.canParse(link) ? new URL(link).hostname : link;
  return (
    <div className="border-t border-card-border bg-paper px-4 py-3">
      <p className="text-[0.75rem] tracking-[0.06em] text-caption uppercase">
        {host}
      </p>
      <p className="truncate font-semibold">{link}</p>
    </div>
  );
}

function Actions({ items }: { items: [typeof Heart, string][] }) {
  return (
    <div className="flex justify-around border-t border-card-border px-2 py-2 text-[0.82rem] font-semibold text-muted">
      {items.map(([Icon, label]) => (
        <span key={label} className="flex items-center gap-1.5 px-2 py-1">
          <Icon aria-hidden="true" size={18} />
          {label}
        </span>
      ))}
    </div>
  );
}

const frame =
  "max-w-[440px] overflow-hidden rounded-inner border border-card-border bg-white text-[0.9rem] leading-[1.5] text-ink";

function FacebookPreview({ text, link, images }: PreviewProps) {
  return (
    <div className={frame}>
      <Header name={ACCOUNTS.facebook} />
      <div className="px-4 pb-3">
        <Text text={text} />
      </div>
      {images.length > 0 ? (
        <Images images={images} ratio="aspect-[1.91/1]" />
      ) : (
        link && <LinkCard link={link} />
      )}
      <Actions
        items={[
          [ThumbsUp, "Like"],
          [ChatCircle, "Comment"],
          [ShareFat, "Share"],
        ]}
      />
    </div>
  );
}

function InstagramPreview({ text, images }: PreviewProps) {
  return (
    <div className={frame}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="rounded-pill p-0.5 ring-2 ring-rose">
          <Avatar name={ACCOUNTS.instagram} />
        </span>
        <p className="font-semibold">{ACCOUNTS.instagram}</p>
      </div>
      {images.length > 0 ? (
        <Images images={images} ratio="aspect-square" />
      ) : (
        <div className="flex aspect-square items-center justify-center gap-2 bg-paper px-6 text-center text-[0.82rem] text-action">
          <ImageSquare aria-hidden="true" size={22} />
          Instagram needs at least one image.
        </div>
      )}
      <div className="flex items-center gap-4 px-4 pt-3 text-ink">
        <Heart aria-hidden="true" size={22} />
        <ChatCircle aria-hidden="true" size={22} />
        <PaperPlaneTilt aria-hidden="true" size={22} />
        <BookmarkSimple aria-hidden="true" size={22} className="ml-auto" />
      </div>
      <div className="px-4 pt-2 pb-4">
        <p className="mb-1 font-semibold">{ACCOUNTS.instagram}</p>
        <Text text={text} />
      </div>
    </div>
  );
}

function LinkedInPreview({ text, link, images }: PreviewProps) {
  return (
    <div className={frame}>
      <Header name={ACCOUNTS.linkedin} note="Art therapist" />
      <div className="px-4 pb-3">
        <Text text={text} />
      </div>
      {images.length > 0 ? (
        <Images images={images} ratio="aspect-[1.91/1]" />
      ) : (
        link && <LinkCard link={link} />
      )}
      <Actions
        items={[
          [ThumbsUp, "Like"],
          [ChatCircle, "Comment"],
          [Repeat, "Repost"],
          [PaperPlaneRight, "Send"],
        ]}
      />
    </div>
  );
}

export const previews: Record<
  SocialChannel,
  (props: PreviewProps) => React.ReactNode
> = {
  facebook: FacebookPreview,
  instagram: InstagramPreview,
  linkedin: LinkedInPreview,
};
