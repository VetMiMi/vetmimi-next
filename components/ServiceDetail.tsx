import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  services,
  type ServicePractical,
  type ServiceQuestion,
  type ServiceStep,
} from "@/lib/services";
import "@/styles/services.css";
import Image from "next/image";

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
    <div className={`service-pages service-tone-${service.tone}`}>
      <div className="service-container">
        <nav
          className="service-breadcrumb"
          aria-label={t("detail.breadcrumbLabel")}
        >
          <Link href="/services">{t("detail.breadcrumbServices")}</Link>
          <span aria-hidden="true">/</span>
          <span>{name}</span>
        </nav>
        <section className="service-hero">
          <div>
            <p className="service-eyebrow">{t(`${item}.audience`)}</p>
            <h1>{name}</h1>
            <p className="service-intro">{t(`${item}.intro`)}</p>
            <div className="service-actions">
              <Link className="service-button" href={service.href}>
                {action} <span aria-hidden="true">↗</span>
              </Link>
              <a className="service-text-link" href="#what-to-expect">
                {t("detail.seeHowItWorks")}
              </a>
            </div>
            <p className="service-reassurance">{t(`${item}.reassurance`)}</p>
          </div>
          <figure className="service-hero-art">
            <Image
              src={service.image}
              alt={t(`${item}.imageAlt`)}
              // At most 416px wide on phones (the frame caps at 440px) and
              // about 400px beside the text on wider screens.
              sizes="(max-width: 767px) calc(100vw - 64px), 400px"
              preload
            />
            <figcaption>{t("detail.figcaption")}</figcaption>
          </figure>
        </section>
      </div>

      <section className="service-section service-tinted">
        <div className="service-container service-fit">
          <div>
            <p className="service-eyebrow">{t("detail.fit.eyebrow")}</p>
            <h2>
              {isWorkshop
                ? t("detail.fit.titleWorkshop")
                : t("detail.fit.title")}
            </h2>
          </div>
          <div>
            <p>{t(`${item}.fit`)}</p>
            <ul className="service-highlights">
              {highlights.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="what-to-expect"
        className="service-section service-container"
      >
        <div className="service-section-heading">
          <p className="service-eyebrow">{t("detail.steps.eyebrow")}</p>
          <h2>{t(`${item}.stepsTitle`)}</h2>
        </div>
        <ol className="service-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="service-step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="service-section service-paper">
        <div className="service-container service-practical">
          <div>
            <p className="service-eyebrow">{t("detail.practical.eyebrow")}</p>
            <h2>
              {isWorkshop
                ? t("detail.practical.titleWorkshop")
                : t("detail.practical.title")}
            </h2>
            <p>
              {isWorkshop
                ? t("detail.practical.textWorkshop")
                : t("detail.practical.text")}
            </p>
          </div>
          <dl>
            {practical.map((item) => (
              <div key={item.title}>
                <dt>{item.title}</dt>
                <dd>{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="service-section service-container service-faq">
        <div>
          <p className="service-eyebrow">{t("detail.faq.eyebrow")}</p>
          <h2>{t("detail.faq.title")}</h2>
          <Link className="service-text-link" href="/contact">
            {t("detail.faq.ask")}
          </Link>
        </div>
        <div>
          {questions.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="service-container service-closing-wrap">
        <div className="service-closing">
          <div>
            <p className="service-eyebrow">{t("detail.closing.eyebrow")}</p>
            <h2>{t(`${item}.closing`)}</h2>
            <p>{t(`${item}.next`)}</p>
          </div>
          <Link className="service-button" href={service.href}>
            {action} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="service-footnotes">
          <Link href="/services">{t("detail.footnotes.compare")}</Link>
          <Link href="/about">{t("detail.footnotes.about")}</Link>
          {isIndividual && (
            <>
              <Link href="/booking-policy">
                {t("detail.footnotes.bookingPolicy")}
              </Link>
              <Link href="/privacy">{t("detail.footnotes.privacy")}</Link>
              <Link href="/disclaimer">{t("detail.footnotes.disclaimer")}</Link>
            </>
          )}
        </div>
        {isIndividual && (
          <p className="service-boundary">{t("detail.boundary")}</p>
        )}
      </section>
    </div>
  );
}
