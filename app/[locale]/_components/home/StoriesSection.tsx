import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlmondEye } from "@/components/art/Shapes";
import { C } from "@/lib/tokens";
import { StoryImage } from "@/components/Editorial";
import type { StoryItem } from "@/lib/stories";

// `stories` is the Stories page's list: published articles first.
export function StoriesSection({ stories }: { stories: StoryItem[] }) {
  const t = useTranslations("home");
  // Story titles and excerpts are shared with the Stories pages.
  const tStories = useTranslations("stories");
  return (
    <section
      style={{
        background: "#F0EEF5",
        padding: "5rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AlmondEye
        color={C.violet}
        size={72}
        style={{
          position: "absolute",
          right: "3rem",
          top: "3rem",
          opacity: 0.25,
        }}
      />
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div style={{ maxWidth: "680px", marginBottom: "3rem" }}>
          <div
            style={{
              fontFamily: "var(--hand)",
              color: C.violet,
              fontSize: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            {t("stories.eyebrow")}
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              color: C.ink,
              margin: "0 0 1rem",
            }}
          >
            {t("stories.title")}
          </h2>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.95rem",
              color: "rgba(40,37,45,0.72)",
              lineHeight: 1.8,
            }}
          >
            {t("stories.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 3).map(({ title, ...story }) => {
            return (
              <article
                key={story.slug}
                style={{
                  background: C.canvas,
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  boxShadow: "0 2px 16px rgba(107,99,150,0.09)",
                }}
              >
                {story.image && (
                  <StoryImage
                    image={story.image}
                    alt=""
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      objectPosition: "center 30%",
                      display: "block",
                    }}
                  />
                )}
                <div
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: C.violet,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {story.category ?? tStories(`types.${story.kind}`)}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.35rem",
                      color: C.ink,
                      margin: "0 0 0.75rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: "0.88rem",
                      color: "rgba(40,37,45,0.68)",
                      lineHeight: 1.75,
                      margin: "0 0 1.25rem",
                    }}
                  >
                    {story.excerpt}
                  </p>
                  <Link
                    href={`/stories/${story.slug}`}
                    aria-label={t("stories.readStoryLabel", { title })}
                    style={{
                      fontFamily: "var(--sans)",
                      fontWeight: 600,
                      fontSize: "0.84rem",
                      color: C.violet,
                      textDecoration: "none",
                      marginTop: "auto",
                      alignSelf: "flex-start",
                      borderBottom: `1px solid ${C.violet}`,
                      paddingBottom: "1px",
                    }}
                  >
                    {t("stories.readStory")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: "2.5rem" }}>
          <Link
            href="/stories"
            style={{
              fontFamily: "var(--sans)",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: C.indigo,
              textDecoration: "none",
              borderBottom: `1px solid ${C.indigo}`,
              paddingBottom: "1px",
            }}
          >
            {t("stories.allLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
