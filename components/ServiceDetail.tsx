import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  services,
  type ServicePractical,
  type ServiceQuestion,
  type ServiceStep,
} from "@/lib/services";
import Image from "next/image";

// Each service has its own accent (small text) and tint (backgrounds).
export const TONE = {
  rose: "[--accent:#88435b] [--tint:#f3e8e6]",
  blue: "[--accent:#416879] [--tint:#eaf0ed]",
  gold: "[--accent:#79602e] [--tint:#f3eddf]",
} as const;

export const container =
  "mx-auto w-[min(1120px,calc(100%-48px))] max-md:w-[calc(100%-40px)]";
export const eyebrow =
  "mb-4 text-[0.7rem] leading-[1.75] font-bold tracking-[0.13em] text-(--accent) uppercase";
export const text = "text-[1rem] leading-[1.75] text-muted";
export const intro = "max-w-[56ch] text-[1.08rem] leading-[1.75] text-muted";
// Burmese keeps the taller heading lines from globals.css.
export const heading =
  "mb-5 text-[clamp(1.8rem,2.8vw,2.5rem)] tracking-[-0.018em] [&:not(:lang(my))]:leading-[1.16]!";
export const button =
  "inline-flex min-h-12 items-center justify-center gap-[18px] rounded-(--radius-control) bg-action px-[22px] py-3.5 text-center text-[0.9rem] font-semibold text-white transition-colors duration-200 hover:bg-action-hover";
export const textLink =
  "text-[0.88rem] text-indigo underline underline-offset-[5px]";
export const closing =
  "flex items-center justify-between gap-8 rounded-(--radius-card) bg-[#eee9f2] p-[clamp(24px,4vw,44px)] max-lg:flex-col max-lg:items-start";

const section = "py-[clamp(44px,5.5vw,72px)]";
const twoColumns =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-16 max-lg:gap-8 max-md:grid-cols-1";
const footnote = "underline underline-offset-4";

export default function ServiceDetail({ slug }: { slug: string }) {
  const service = services.find((item) => item.slug === slug);
  const t = useTranslations("services");
  if (!service) notFound();
  const item = `items.${service.slug}` as const;
  const highlights: string[] = t.raw(`${item}.highlights`);
  const steps: ServiceStep[] = t.raw(`${item}.steps`);
  const practical: ServicePractical[] = t.raw(`${item}.practical`);
  const questions: ServiceQuestion[] = t.raw(`${item}.questions`);
  const name = t(`${item}.name`);
  const action = t(`${item}.action`);
  const isIndividual = slug === "individual-art-therapy";
  const isWorkshop = slug === "workshops-programs";

  return (
    <div className={`bg-canvas text-ink ${TONE[service.tone]}`}>
      <div className={container}>
        <nav
          className="flex flex-wrap gap-2.5 pt-7 text-[0.8rem] text-[#756e73]"
          aria-label={t("detail.breadcrumbLabel")}
        >
          <Link href="/services" className="underline underline-offset-4">
            {t("detail.breadcrumbServices")}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{name}</span>
        </nav>
        <section className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-16 pt-12 pb-16 max-lg:gap-8 max-md:grid-cols-1 max-md:pt-8 max-md:pb-11">
          <div>
            <p className={eyebrow}>{t(`${item}.audience`)}</p>
            <h1 className="mb-6 max-w-[18ch] text-[clamp(2.3rem,4.4vw,3.7rem)] tracking-[-0.025em]">
              {name}
            </h1>
            <p className={intro}>{t(`${item}.intro`)}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 max-md:gap-4">
              <Link className={button} href={service.href}>
                {action} <span aria-hidden="true">↗</span>
              </Link>
              <a className={textLink} href="#what-to-expect">
                {t("detail.seeHowItWorks")}
              </a>
            </div>
            <p className="mt-[18px] text-[0.83rem] leading-[1.75] text-muted">
              {t(`${item}.reassurance`)}
            </p>
          </div>
          <figure className="rounded-[100px_20px_20px_20px] bg-(--tint) p-3 max-md:w-full max-md:max-w-[440px]">
            <Image
              src={service.image}
              alt={t(`${item}.imageAlt`)}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="block h-[280px] w-full rounded-[90px_12px_12px_12px] object-cover object-[center_30%] max-md:h-[200px]"
            />
            <figcaption className="px-1 pt-2.5 text-[0.7rem] tracking-[0.035em] text-(--accent)">
              {t("detail.figcaption")}
            </figcaption>
          </figure>
        </section>
      </div>

      <section className={`${section} bg-(--tint)`}>
        <div className={`${container} ${twoColumns}`}>
          <div>
            <p className={eyebrow}>{t("detail.fit.eyebrow")}</p>
            <h2 className={heading}>
              {isWorkshop
                ? t("detail.fit.titleWorkshop")
                : t("detail.fit.title")}
            </h2>
          </div>
          <div>
            <p className={text}>{t(`${item}.fit`)}</p>
            <ul className="mt-[22px] flex list-none flex-wrap gap-x-[22px] gap-y-2.5 text-[0.86rem]">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="before:mr-2 before:text-(--accent) before:content-['✓']"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="what-to-expect"
        className={`${section} ${container} scroll-mt-24`}
      >
        <div className="mb-8">
          <p className={eyebrow}>{t("detail.steps.eyebrow")}</p>
          <h2 className={heading}>{t(`${item}.stepsTitle`)}</h2>
        </div>
        <ol className="grid list-none grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-[#dcd2cf] pt-5">
              <span className="mb-[22px] block text-[0.85rem] font-semibold text-(--accent) max-md:mb-3">
                0{index + 1}
              </span>
              <h3 className="mb-3.5 text-[1.45rem] [&:not(:lang(my))]:leading-[1.25]!">
                {step.title}
              </h3>
              <p className={text}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${section} bg-paper`}>
        <div className={`${container} ${twoColumns}`}>
          <div>
            <p className={eyebrow}>{t("detail.practical.eyebrow")}</p>
            <h2 className={heading}>
              {isWorkshop
                ? t("detail.practical.titleWorkshop")
                : t("detail.practical.title")}
            </h2>
            <p className={text}>
              {isWorkshop
                ? t("detail.practical.textWorkshop")
                : t("detail.practical.text")}
            </p>
          </div>
          <dl>
            {practical.map((item) => (
              <div
                key={item.title}
                className="border-b border-divider py-5 first:pt-0"
              >
                <dt className="mb-1.5 font-semibold">{item.title}</dt>
                <dd className="text-[0.95rem] leading-[1.7] text-muted">
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${section} ${container} ${twoColumns}`}>
        <div>
          <p className={eyebrow}>{t("detail.faq.eyebrow")}</p>
          <h2 className={heading}>{t("detail.faq.title")}</h2>
          <Link className={textLink} href="/contact">
            {t("detail.faq.ask")}
          </Link>
        </div>
        <div>
          {questions.map((item) => (
            <details
              key={item.question}
              className="group border-b border-divider first:border-t"
            >
              <summary className="flex cursor-pointer list-none justify-between gap-5 py-5 text-[1rem] font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-(--accent) group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-[22px] text-[0.95rem] leading-[1.75] text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className={`${container} pb-11`}>
        <div className={closing}>
          <div>
            <p className={`${eyebrow} max-w-[54ch]`}>
              {t("detail.closing.eyebrow")}
            </p>
            <h2 className={heading}>{t(`${item}.closing`)}</h2>
            <p className={`${text} max-w-[54ch]`}>{t(`${item}.next`)}</p>
          </div>
          <Link className={`${button} shrink-0`} href={service.href}>
            {action} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 text-[0.8rem] text-indigo">
          <Link href="/services" className={footnote}>
            {t("detail.footnotes.compare")}
          </Link>
          <Link href="/about" className={footnote}>
            {t("detail.footnotes.about")}
          </Link>
          {isIndividual && (
            <>
              <Link href="/booking-policy" className={footnote}>
                {t("detail.footnotes.bookingPolicy")}
              </Link>
              <Link href="/privacy" className={footnote}>
                {t("detail.footnotes.privacy")}
              </Link>
              <Link href="/disclaimer" className={footnote}>
                {t("detail.footnotes.disclaimer")}
              </Link>
            </>
          )}
        </div>
        {isIndividual && (
          <p className="mt-4 text-[0.8rem] leading-[1.75] text-muted">
            {t("detail.boundary")}
          </p>
        )}
      </section>
    </div>
  );
}
