import Image from "next/image";
import Link from "next/link";
import { PageEnd } from "@/components/Editorial";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";
import artImage from "@/assets/image-4.webp";
import { VideoIntro } from "./_components/VideoIntro";

export default function About() {
  return (
    <div className="ed-page">
      <section className="ed-container ed-section ed-split">
        <div>
          <p className="ed-label">About Daw Mi</p>
          <h1>Care, creativity, and a place to begin.</h1>
          <p className="ed-lead">
            Daw Mi is a certified art psychotherapist and transformative artist.
            Her work brings together healthcare, mental health, and creative
            practice.
          </p>
          <p>
            VetMiMi is where these parts of her work come together — through
            art, conversation, and time to reflect.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" href="/services">
              Explore ways to work together ↗
            </Link>
          </div>
        </div>
        <figure className="ed-portrait ed-portrait-duo">
          <Image
            src={dawMiPortrait}
            alt="Daw Mi smiling, with her paintings softly blurred behind her"
            sizes="(max-width: 767px) 340px, 410px"
            preload
            fetchPriority="high"
            placeholder="blur"
          />
          <div className="ed-portrait-art">
            <Image
              src={artImage}
              alt="The ULX & Eddington Limit, one of Daw Mi’s mixed-media portraits"
              sizes="160px"
              loading="eager"
            />
          </div>
          <figcaption className="ed-signature">Daw Mi</figcaption>
        </figure>
      </section>
      <VideoIntro />
      <section className="ed-paper">
        <div className="ed-container ed-section ed-split ed-split-wide">
          <div>
            <p className="ed-label">Her background</p>
            <h2>
              Different experiences.
              <br />
              One connected practice.
            </h2>
            <p>
              Working with people and making art have both shaped Daw Mi’s
              approach.
            </p>
          </div>
          <ul className="ed-timeline">
            <li>
              <h3>Healthcare and mental health</h3>
              <p>
                A background in care informs the attention she brings to each
                person and their experience.
              </p>
            </li>
            <li>
              <h3>Art and creative practice</h3>
              <p>
                As a transformative artist, Daw Mi works with colour, materials,
                and ideas. You can explore a selection of this work in her
                portfolio.
              </p>
            </li>
            <li>
              <h3>The Art of Wellness</h3>
              <p>
                Daw Mi is a co-founder of The Art of Wellness at Royal North
                Shore Hospital in Sydney, bringing creativity into a healthcare
                setting.
              </p>
              <Link className="ed-link" href="/art-of-wellness">
                Learn about The Art of Wellness →
              </Link>
            </li>
          </ul>
        </div>
      </section>
      <section className="ed-container ed-section">
        <p className="ed-label">Working together</p>
        <h2>Room to take things at your own pace.</h2>
        <div className="ed-principles">
          <div>
            <h3>No art skills needed</h3>
            <p>You do not need to know how to draw or arrive with an idea.</p>
          </div>
          <div>
            <h3>Your experience matters</h3>
            <p>
              The focus is on what making and talking mean to you, not on a
              finished artwork.
            </p>
          </div>
          <div>
            <h3>Start with a question</h3>
            <p>
              If you are unsure which service fits, you can ask before deciding.
            </p>
          </div>
        </div>
      </section>
      <PageEnd
        title="Find a way to begin."
        text="Explore individual sessions, group experiences, and workshops."
        href="/services"
        label="View services"
      />
    </div>
  );
}
