import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlmondEye } from "@/components/art/Shapes";
import { StoryImage } from "@/components/Editorial";
import type { StoryItem } from "@/lib/stories";

// `stories` is the Stories page's list: published articles first.
export function StoriesSection({ stories }: { stories: StoryItem[] }) {
  const t = useTranslations("home");
  // Story titles and excerpts are shared with the Stories pages.
  const tStories = useTranslations("stories");
  return (
    <section className="relative overflow-hidden bg-[#F0EEF5] px-6 py-20">
      <div className="absolute top-12 right-12 opacity-25">
        <AlmondEye color="var(--violet)" size={72} />
      </div>
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 max-w-[680px]">
          <div className="mb-2 font-script text-[1rem] text-violet">
            {t("stories.eyebrow")}
          </div>
          <h2 className="mb-4 text-[clamp(1.8rem,3vw,2.6rem)] text-ink">
            {t("stories.title")}
          </h2>
          <p className="font-body text-[0.95rem] leading-[1.8] text-ink/72">
            {t("stories.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 3).map(({ title, ...story }) => {
            return (
              <article
                key={story.slug}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-canvas shadow-[0_2px_16px_rgba(107,99,150,0.09)]"
              >
                {story.image && (
                  <StoryImage
                    image={story.image}
                    alt=""
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="block h-[200px] w-full object-cover object-[center_30%]"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 font-body text-[0.65rem] font-semibold tracking-[0.12em] text-violet uppercase">
                    {story.category ?? tStories(`types.${story.kind}`)}
                  </div>
                  {/* `!` beats the global heading line height; the :lang
                      guard leaves Burmese on its own taller one. */}
                  <h3 className="mb-3 text-[1.35rem] text-ink leading-[1.3]">
                    {title}
                  </h3>
                  <p className="mb-5 font-body text-[0.88rem] leading-[1.75] text-ink/68">
                    {story.excerpt}
                  </p>
                  <Link
                    href={`/stories/${story.slug}`}
                    aria-label={t("stories.readStoryLabel", { title })}
                    className="mt-auto self-start border-b border-violet pb-px font-body text-[0.84rem] font-semibold text-violet no-underline"
                  >
                    {t("stories.readStory")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/stories"
            className="border-b border-indigo pb-px font-body text-[0.9rem] font-medium text-indigo no-underline"
          >
            {t("stories.allLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
