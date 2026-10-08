import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { PublicImage, StoryItem } from "@/lib/stories";
import "@/styles/editorial.css";

// A story's picture: an imported artwork through next/image, or an API cover
// as a plain <img>, since its web sizes already exist on the API's host.
export function StoryImage({
  image,
  alt,
  sizes,
  className,
}: {
  image: NonNullable<StoryItem["image"]>;
  alt: string;
  sizes: string;
  className?: string;
}) {
  if (!isPublicImage(image)) {
    return <Image className={className} src={image} alt={alt} sizes={sizes} />;
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
      loading="lazy"
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
    <article className={story.image ? "ed-story" : "ed-story ed-story-text"}>
      {story.image && <StoryImage image={story.image} alt="" sizes="110px" />}
      <div>
        <p className="ed-label">{t(`types.${story.kind}`)}</p>
        <h3>
          <Link href={`/stories/${story.slug}`}>{story.title}</Link>
        </h3>
        <p>{story.excerpt}</p>
        <Link
          className="ed-link"
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
    <section className="ed-container ed-end">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Link className="ed-button" href={href}>
        {label} <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
