export function HeroNetwork({ variant = "home" }) {
  return (
    <div aria-hidden="true" className={`hero-network hero-network--${variant}`}>
      <div className="hero-network__grid" aria-hidden="true" />
    </div>
  );
}
