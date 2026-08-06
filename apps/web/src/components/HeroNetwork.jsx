import { BackgroundBeams } from "@/components/ui/background-beams";

export function HeroNetwork({ variant = "home" }) {
  return (
    <div aria-hidden="true" className={`hero-network hero-network--${variant}`}>
      {variant === "home" ? <BackgroundBeams className="hero-beams" /> : null}
    </div>
  );
}
