import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export function ActionLink({
  children,
  className = "",
  href,
  showArrow = false,
  variant = "primary",
  onClick,
  ariaCurrent,
}) {
  return (
    <Link
      className={`action-link action-link--${variant} ${className}`.trim()}
      href={href}
      onClick={onClick}
      aria-current={ariaCurrent}
    >
      <span>{children}</span>
      {showArrow ? <ArrowRight aria-hidden="true" size={17} weight="regular" /> : null}
    </Link>
  );
}
