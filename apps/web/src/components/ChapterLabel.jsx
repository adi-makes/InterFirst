import { ArrowRight } from "@phosphor-icons/react";
import { RevealText } from "./RevealText.jsx";

export function ChapterLabel({ children, className = "" }) {
  return (
    <p className={`chapter-label ${className}`.trim()}>
      <RevealText as="span" className="chapter-label__text">
        {children}
      </RevealText>
      <ArrowRight aria-hidden="true" size={12} weight="regular" />
    </p>
  );
}
