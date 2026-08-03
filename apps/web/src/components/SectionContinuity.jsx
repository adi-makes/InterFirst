import { useEffect } from "react";

const sectionPlanes = [
  [".hero", ".hero__transition-plane"],
  ["#internet-first-meaning", ".internet-first-meaning__transition-plane"],
  ["#how-we-think", ".how-we-think__transition-plane"],
  ["#how-we-build", ".how-we-build__transition-plane"],
  ["#what-were-building", ".what-were-building__transition-plane"],
  ["#careers", ".careers-preview__transition-plane"],
];

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export function SectionContinuity() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const entries = sectionPlanes
      .map(([sectionSelector, planeSelector]) => {
        const section = document.querySelector(sectionSelector);
        const plane = section?.querySelector(planeSelector);

        if (!section || !plane) return null;

        section.classList.add("section-transition");
        plane.classList.add("section-transition__plane");
        return { section, plane };
      })
      .filter(Boolean);

    let frame = 0;

    const resolveStaticState = () => {
      entries.forEach(({ section, plane }) => {
        section.classList.remove("section-transition--active");
        section.dataset.transitionReveal = "1.000";
        section.dataset.transitionDrift = "0.00";
        plane.style.setProperty("--section-transition-clip", "0px");
        plane.style.setProperty("--section-transition-drift", "0px");
      });
    };

    const update = () => {
      frame = 0;

      if (reducedMotion.matches) {
        resolveStaticState();
        return;
      }

      const viewportHeight = window.innerHeight;
      const compact = window.innerWidth <= 768;
      const maximumDrift = compact ? 10 : 18;
      const maximumClip = compact ? 18 : 32;
      const revealDistance = Math.min(compact ? 150 : 220, viewportHeight * 0.3);
      const headerOffset = compact ? 64 : 72;

      entries.forEach(({ section, plane }) => {
        const bounds = section.getBoundingClientRect();
        const naturalPlaneTop = bounds.top + plane.offsetTop;
        const reveal = clamp(
          (viewportHeight - naturalPlaneTop) / revealDistance,
          0,
          1,
        );
        const exit = clamp(
          (headerOffset - bounds.top) / Math.max(bounds.height * 0.72, 1),
          0,
          1,
        );
        const drift = exit * maximumDrift;
        const clip = (1 - reveal) * maximumClip;
        const nearViewport =
          bounds.bottom > -viewportHeight * 0.2 &&
          bounds.top < viewportHeight * 1.2;

        section.classList.toggle("section-transition--active", nearViewport);
        section.dataset.transitionReveal = reveal.toFixed(3);
        section.dataset.transitionDrift = drift.toFixed(2);
        plane.style.setProperty("--section-transition-clip", `${clip.toFixed(2)}px`);
        plane.style.setProperty(
          "--section-transition-drift",
          `${drift.toFixed(2)}px`,
        );
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);

      entries.forEach(({ section, plane }) => {
        section.classList.remove(
          "section-transition",
          "section-transition--active",
        );
        delete section.dataset.transitionReveal;
        delete section.dataset.transitionDrift;
        plane.classList.remove("section-transition__plane");
        plane.style.removeProperty("--section-transition-clip");
        plane.style.removeProperty("--section-transition-drift");
      });
    };
  }, []);

  return null;
}
