import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/services";
import "@/styles/services.css";
import Image from "next/image";

export default function ServiceDetail({ slug }: { slug: string }) {
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const isIndividual = slug === "individual-art-therapy";
  const isWorkshop = slug === "workshops-programs";

  return (
    <div className={`service-pages service-tone-${service.tone}`}>
      <div className="service-container">
        <nav className="service-breadcrumb" aria-label="Breadcrumb">
          <Link href="/services">Services</Link>
          <span aria-hidden="true">/</span>
          <span>{service.name}</span>
        </nav>
        <section className="service-hero">
          <div>
            <p className="service-eyebrow">{service.audience}</p>
            <h1>{service.name}</h1>
            <p className="service-intro">{service.intro}</p>
            <div className="service-actions">
              <Link className="service-button" href={service.href}>
                {service.action} <span aria-hidden="true">↗</span>
              </Link>
              <a className="service-text-link" href="#what-to-expect">
                See how it works ↓
              </a>
            </div>
            <p className="service-reassurance">{service.reassurance}</p>
          </div>
          <figure className="service-hero-art">
            <Image
              src={service.image}
              alt={service.imageAlt}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <figcaption>Art, expression & connection</figcaption>
          </figure>
        </section>
      </div>

      <section className="service-section service-tinted">
        <div className="service-container service-fit">
          <div>
            <p className="service-eyebrow">Is this for me?</p>
            <h2>
              {isWorkshop
                ? "For people planning something together."
                : "Find a way that feels right for you."}
            </h2>
          </div>
          <div>
            <p>{service.fit}</p>
            <ul className="service-highlights">
              {service.highlights.map((text) => (
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
          <p className="service-eyebrow">What to expect</p>
          <h2>{service.stepsTitle}</h2>
        </div>
        <ol className="service-steps">
          {service.steps.map((step, index) => (
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
            <p className="service-eyebrow">The practical side</p>
            <h2>
              {isWorkshop
                ? "What to include in your enquiry"
                : "Before you get started"}
            </h2>
            <p>
              {isWorkshop
                ? "These details help us understand your plans. Share what you know so far."
                : "Get the details you need before making a decision."}
            </p>
          </div>
          <dl>
            {service.practical.map((item) => (
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
          <p className="service-eyebrow">A little more clarity</p>
          <h2>Common questions</h2>
          <Link className="service-text-link" href="/contact">
            Ask Daw Mi a question ↗
          </Link>
        </div>
        <div>
          {service.questions.map((item) => (
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
            <p className="service-eyebrow">Your next step</p>
            <h2>{service.closing}</h2>
            <p>{service.next}</p>
          </div>
          <Link className="service-button" href={service.href}>
            {service.action} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="service-footnotes">
          <Link href="/services">← Compare all services</Link>
          <Link href="/about">About Daw Mi</Link>
          {isIndividual && (
            <>
              <Link href="/booking-policy">Booking & cancellation</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/disclaimer">Important information</Link>
            </>
          )}
        </div>
        {isIndividual && (
          <p className="service-boundary">
            Art therapy is not an emergency or crisis service.
          </p>
        )}
      </section>
    </div>
  );
}
