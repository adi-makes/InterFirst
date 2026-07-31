import { ArrowRight } from "@phosphor-icons/react";

export function ChapterLabel({ children, className = "" }) {
  return (
    <p className={`chapter-label ${className}`.trim()}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={12} weight="regular" />
    </p>
  );
}
