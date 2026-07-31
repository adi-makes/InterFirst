import { ActionLink } from "./ActionLink.jsx";
import { HeroNetwork } from "./HeroNetwork.jsx";
import { NextSectionCue } from "./NextSectionCue.jsx";

export function Hero({ isReady = true }) {
  return (
    <section
      className={`hero ${isReady ? "hero--intro-ready" : "hero--intro-pending"}`}
      aria-labelledby="hero-title"
      data-intro-ready={isReady}
    >
      <HeroNetwork />
      <div className="hero__grid">
        <div className="hero__transition-plane">
          <div className="hero__index">
            <span className="hero__index-rule" aria-hidden="true" />
            <p>Product · Systems · Company</p>
          </div>

          <div className="hero__content">
          <h1 id="hero-title" tabIndex="-1">
              <span className="hero__line">
                <span className="hero__word-clip">
                  <span className="hero__word" style={{ "--word-index": 0 }}>
                    We
                  </span>
                </span>{" "}
                <span className="hero__word-clip">
                  <span className="hero__word" style={{ "--word-index": 1 }}>
                    build
                  </span>
                </span>
              </span>
              <span className="hero__line">
                <span className="hero__word-clip">
                  <span className="hero__word" style={{ "--word-index": 2 }}>
                    internet-first
                  </span>
                </span>
              </span>
              <span className="hero__line">
                <span className="hero__word-clip">
                  <span className="hero__word" style={{ "--word-index": 3 }}>
                    companies.
                  </span>
                </span>
              </span>
            </h1>
            <p className="hero__description">
              We design the product, systems, and company as one connected whole from
              day one.
            </p>
            <div className="hero__actions">
              <ActionLink href="/careers" showArrow>
                View Careers
              </ActionLink>
            </div>
          </div>
        </div>

        <NextSectionCue
          href="#internet-first-meaning"
          label="What internet-first means"
        />
      </div>
    </section>
  );
}
