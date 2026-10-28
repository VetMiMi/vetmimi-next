import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { PublicImage, StoryItem } from "@/lib/stories";

// Class names shared by the editorial pages: About, Art of Wellness,
// Portfolio and Stories. globals.css gives h1–h4 a line height that beats
// utilities, so headings force theirs, except in Burmese, which keeps its
// taller one.
export const ed = {
  page: "bg-canvas text-ink",
  container:
    "mx-auto w-[min(1120px,calc(100%-48px))] max-md:w-[calc(100%-40px)]",
  section: "py-[clamp(44px,6vw,80px)]",
  split:
    "grid grid-cols-2 items-center gap-[clamp(32px,6vw,80px)] max-md:grid-cols-1",
  label:
    "mb-3.5 text-[0.7rem] leading-[1.6] font-bold tracking-[0.12em] text-label uppercase",
  h1: "mb-6 max-w-[18ch] text-[clamp(2.5rem,5vw,4.5rem)] tracking-[-0.03em] leading-[1.08]",
  h2: "mb-5 text-[clamp(1.8rem,3vw,2.65rem)] tracking-[-0.02em] leading-[1.16]",
  h3: "mb-3 text-[clamp(1.3rem,2vw,1.6rem)] leading-[1.25]",
  text: "mb-5 leading-[1.8] text-muted",
  lead: "mb-5 max-w-[56ch] text-[1.08rem] leading-[1.8] text-muted",
  link: "text-[0.9rem] font-semibold text-indigo underline underline-offset-5",
  button:
    "inline-flex min-h-12 items-center justify-center gap-5 rounded-control bg-action px-[22px] py-3.5 text-center text-[0.9rem] font-semibold text-white no-underline hover:bg-action-hover",
  actions: "mt-7 flex flex-wrap items-center gap-6",
};

// A story's picture: an imported artwork through next/image, or an API cover
// as a plain <img>, since its web sizes already exist on the API's host.
export function StoryImage({
  image,
  alt,
  sizes,
  className,
  eager,
}: {
  image: NonNullable<StoryItem["image"]>;
  alt: string;
  sizes: string;
  className?: string;
  /** The article's cover, in view on arrival: loaded straight away. */
  eager?: boolean;
}) {
  const loading = eager ? "eager" : "lazy";
  if (!isPublicImage(image)) {
    return (
      <Image
        className={className}
        src={image}
        alt={alt}
        sizes={sizes}
        loading={loading}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={image.sizes[0]?.url}
      srcSet={image.sizes
        .map(({ url, width }) => `${url} ${width}w`)
        .join(", ")}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={loading}
      decoding="async"
    />
  );
}

function isPublicImage(
  image: NonNullable<StoryItem["image"]>,
): image is PublicImage {
  return "sizes" in image;
}

export function StoryCard({ story }: { story: StoryItem }) {
  const t = useTranslations("stories");
  const tEditorial = useTranslations("common.editorial");
  return (
    <article
      className={`grid gap-6 border-t border-[#d8cdca] pt-6 max-md:gap-4 ${story.image ? "grid-cols-[110px_minmax(0,1fr)] max-md:grid-cols-[80px_minmax(0,1fr)]" : "grid-cols-1"}`}
    >
      {story.image && (
        <StoryImage
          className="block h-[145px] w-[110px] rounded-lg object-cover max-md:h-[110px] max-md:w-20"
          image={story.image}
          alt=""
          sizes="110px"
        />
      )}
      <div>
        <p className={ed.label}>{t(`types.${story.kind}`)}</p>
        <h3 className={ed.h3}>
          <Link
            className="hover:underline hover:underline-offset-4"
            href={`/stories/${story.slug}`}
          >
            {story.title}
          </Link>
        </h3>
        <p className={`${ed.text} text-[0.92rem]`}>{story.excerpt}</p>
        <Link
          className={ed.link}
          href={`/stories/${story.slug}`}
          aria-label={tEditorial("readStoryLabel", { title: story.title })}
        >
          {tEditorial("readStory")}
        </Link>
      </div>
    </article>
  );
}

export function PageEnd({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <section
      className={`${ed.container} mt-5 mb-16 flex items-center justify-between gap-9 rounded-card bg-[#eeeaf2] p-9 max-lg:flex-col max-lg:items-start max-md:p-6`}
    >
      <div>
        <h2 className={ed.h2}>{title}</h2>
        <p className="max-w-[54ch] leading-[1.8] text-muted">{text}</p>
      </div>
      <Link className={`${ed.button} shrink-0`} href={href}>
        {label} <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
