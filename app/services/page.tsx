import Link from "next/link";
import { services } from "@/lib/services";
import "@/styles/services.css";

export default function Services() {
  return (
    <div className="service-pages">
      <div className="service-container">
        <header className="services-intro">
          <p className="service-eyebrow">Ways to work together</p>
          <h1>Find the right space for you.</h1>
          <p className="service-intro">Individual support, creative time with others, or a workshop for your organisation. Explore the options below. You do not need any art experience.</p>
        </header>
        <section className="services-grid" aria-label="Explore our services">
          {services.map((service) => (
            <article key={service.slug} className={`service-card service-tone-${service.tone}`}>
              <img src={service.image} alt={service.imageAlt} />
              <div className="service-card-body">
                <p className="service-eyebrow">{service.audience}</p>
                <h2>{service.name}</h2>
                <p>{service.summary}</p>
                <Link className="service-text-link" href={`/services/${service.slug}`} aria-label={`Explore ${service.name}`}>Explore this service →</Link>
              </div>
            </article>
          ))}
        </section>
        <section className="service-compare">
          <p className="service-eyebrow">A quick guide</p>
          <h2>Which option fits what you need?</h2>
          <div className="service-compare-list">
            <Link href="/services/individual-art-therapy"><strong>“I want time to focus on myself.”</strong><span>Explore individual art therapy →</span></Link>
            <Link href="/services/group-art-wellbeing"><strong>“I would like to create with others.”</strong><span>Explore group sessions →</span></Link>
            <Link href="/services/workshops-programs"><strong>“I’m organising something for a group.”</strong><span>Explore workshops & programs →</span></Link>
          </div>
        </section>
        <section className="service-closing-wrap">
          <div className="service-closing">
            <div><p className="service-eyebrow">A place to start</p><h2>Still not sure?</h2><p>Tell Daw Mi what you are looking for. You can ask about the options before deciding what to do next.</p></div>
            <Link className="service-button" href="/contact">Ask Daw Mi a question <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
