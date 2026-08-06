import { useRef } from "react";
import {
  careersImageSequence,
  getCareersFramePath,
} from "../../careers/careersImageSequence.js";
import { useImageSequence } from "../../hooks/useImageSequence.js";

export function CareersImageSequence({
  config = careersImageSequence,
  getFramePath = getCareersFramePath,
  scrollHeight = "100%",
}) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  useImageSequence({ canvasRef, config, getFramePath, sectionRef });

  return (
    <section
      aria-hidden="true"
      className="careers-sequence"
      data-frame-count={config.frameCount}
      ref={sectionRef}
      style={{ "--careers-sequence-height": scrollHeight }}
    >
      <div className="careers-sequence__sticky">
        <canvas ref={canvasRef} />
        <div className="careers-sequence__veil" />
      </div>
    </section>
  );
}
