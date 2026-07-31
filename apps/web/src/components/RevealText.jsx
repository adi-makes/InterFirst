export function RevealText({
  as: Element = "span",
  children,
  className = "",
  delay = 0,
  style,
  ...props
}) {
  return (
    <Element
      {...props}
      className={`scroll-text-reveal ${className}`.trim()}
      style={{ ...style, "--scroll-text-delay": `${delay}ms` }}
    >
      <span className="scroll-text-reveal__clip">
        <span className="scroll-text-reveal__content">{children}</span>
      </span>
    </Element>
  );
}
