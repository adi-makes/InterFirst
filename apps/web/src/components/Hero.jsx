import { BackgroundBeams } from "@/components/ui/background-beams";
import { ActionLink } from "./ActionLink.jsx";
import { HeroNetwork } from "./HeroNetwork.jsx";
import { RevealText } from "./RevealText.jsx";

export function Hero() {
  return (
    <>
      <section className="hero hero--desktop" aria-labelledby="hero-title">
        <HeroNetwork />
        <div className="hero__grid">
          <div className="hero__transition-plane">
            <div className="hero__primary">
              <div className="hero__index"><p>Product · Systems · Company</p></div>
              <div className="hero__content">
                <h1 id="hero-title" tabIndex="-1">
                  <span className="hero__line">We make</span>
                  <span className="hero__line hero__line--accent">internet-first</span>
                  <span className="hero__line">companies.</span>
                </h1>
              </div>
            </div>
            <aside className="hero__support" aria-label="About InterFirst">
              <p className="hero__description">
                <span>We design the product, systems, and company</span>
                <span>as one connected whole from day one.</span>
              </p>
              <div className="hero__actions"><ActionLink href="/careers">See Open Roles</ActionLink></div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mobile-home-hero mobile-home-hero--entered" aria-labelledby="mobile-hero-title">
        <div className="mobile-home-hero__background" aria-hidden="true">
          <BackgroundBeams className="mobile-home-hero__beams" />
        </div>
        <div className="mobile-home-hero__inner">
          <div className="mobile-home-hero__content">
            <RevealText as="p" className="mobile-home-hero__eyebrow" delay={0}>
              Product <span>·</span> Systems <span>·</span> Company
            </RevealText>
            <h1 id="mobile-hero-title" tabIndex="-1">
              <RevealText as="span" delay={70}>We make</RevealText>
              <RevealText as="span" className="mobile-home-hero__accent" delay={140}>internet-first</RevealText>
              <RevealText as="span" delay={210}>companies.</RevealText>
            </h1>
            <RevealText as="p" className="mobile-home-hero__description" delay={280}>
              <span>We design the product, systems, and company</span>
              <span>as one connected whole from day one.</span>
            </RevealText>
            <RevealText as="div" className="mobile-home-hero__action-reveal" delay={350}>
              <ActionLink className="mobile-home-hero__action" href="/careers">See Open Roles</ActionLink>
            </RevealText>
          </div>
        </div>
      </section>
    </>
  );
}
