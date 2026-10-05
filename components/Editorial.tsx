import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Story } from "@/lib/data";
import "@/styles/editorial.css";
import Image from "next/image";

export function StoryCard({ story }: { story: Story }) {
  const t = useTranslations("stories");
  const tEditorial = useTranslations("common.editorial");
  const title = t(`items.${story.slug}.title`);
  return (
    <article className="ed-story">
      <Image
        src={story.img}
        alt=""
        // A fixed thumbnail: 80px wide on phones, 110px above
        // (.ed-story > img in styles/editorial.css).
        sizes="(max-width: 767px) 80px, 110px"
      />
      <div>
        <p className="ed-label">{t(`types.${story.type}`)}</p>
        <h3>
          <Link href={`/stories/${story.slug}`}>{title}</Link>
        </h3>
        <p>{t(`items.${story.slug}.excerpt`)}</p>
        <Link
          className="ed-link"
          href={`/stories/${story.slug}`}
          aria-label={tEditorial("readStoryLabel", { title })}
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
