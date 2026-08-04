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
          <div className="hero__primary">
            <div className="hero__index">
              <p>Product · Systems · Company</p>
            </div>

            <div className="hero__content">
              <h1 id="hero-title" tabIndex="-1">
                <span className="sr-only">We make internet-first companies.</span>
                <span aria-hidden="true">
                  <span className="hero__line">
                    <span className="hero__word-clip">
                      <span className="hero__word" style={{ "--word-index": 0 }}>
                        We make
                      </span>
                    </span>
                  </span>
                  <span className="hero__line">
                    <span className="hero__word-clip">
                      <span className="hero__word" style={{ "--word-index": 1 }}>
                        internet-first
                      </span>
                    </span>
                  </span>
                  <span className="hero__line">
                    <span className="hero__word-clip">
                      <span className="hero__word" style={{ "--word-index": 2 }}>
                        <span className="hero__rotator-viewport">
                          <span className="hero__rotator-sizer">companies.</span>
                          <span className="hero__rotator-cube">
                            <span
                              className="hero__rotator-face"
                              style={{ "--face-index": 0 }}
                            >
                              companies.
                            </span>
                            <span
                              className="hero__rotator-face"
                              style={{ "--face-index": 1 }}
                            >
                              systems.
                            </span>
                            <span
                              className="hero__rotator-face"
                              style={{ "--face-index": 2 }}
                            >
                              products.
                            </span>
                            <span
                              className="hero__rotator-face"
                              style={{ "--face-index": 3 }}
                            >
                              companies.
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </h1>
            </div>
          </div>
          <aside className="hero__support" aria-label="About InterFirst">
            <p className="hero__description">
              <span className="hero__description-desktop">
                We design the product, systems, and company as one connected whole from
                day one.
              </span>
              <span className="hero__description-mobile">
                We design products, systems, and companies as one.
              </span>
            </p>
            <div className="hero__actions">
              <ActionLink href="/careers">
                See Open Roles
              </ActionLink>
            </div>
          </aside>
        </div>
        <NextSectionCue
          href="#internet-first-meaning"
          label="Scroll to explore"
        />
      </div>
    </section>
  );
}
