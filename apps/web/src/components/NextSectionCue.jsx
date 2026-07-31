import { ArrowDown } from "@phosphor-icons/react";

export function NextSectionCue({ href, label }) {
  return (
    <a
      className="next-section-cue"
      href={href}
      aria-label={`Continue to ${label}`}
    >
      <span>{label}</span>
      <ArrowDown aria-hidden="true" size={14} weight="regular" />
    </a>
  );
}
