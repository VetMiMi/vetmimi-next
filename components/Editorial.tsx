import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PortfolioItem, Story } from "@/lib/data";
import "@/styles/editorial.css";
import Image from "next/image";

export function WorkCard({ item }: { item: PortfolioItem }) {
  return (
    <Link className="ed-work" href={`/portfolio/${item.slug}`}>
      <div className="ed-work-image">
        <Image
          src={item.img}
          alt={item.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="ed-work-caption">
        <div>
          <p className="ed-label">{item.category}</p>
          <h3>{item.title}</h3>
        </div>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  );
}

export function StoryCard({ story }: { story: Story }) {
  const t = useTranslations("stories");
  const tEditorial = useTranslations("common.editorial");
  const title = t(`items.${story.slug}.title`);
  return (
    <article className="ed-story">
      <Image
        src={story.img}
        alt=""
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
