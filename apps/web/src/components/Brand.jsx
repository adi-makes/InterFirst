import Link from "next/link";
import Image from "next/image";
import { useId } from "react";

const assemblyModules = [
  { id: "top-left", x: 13, y: 16, width: 30, height: 30, dx: -14, dy: -10, rotate: -7 },
  { id: "top-right", x: 58, y: 16, width: 62, height: 30, dx: 12, dy: -12, rotate: 5 },
  { id: "stem", x: 13, y: 61, width: 30, height: 64, dx: -16, dy: 12, rotate: -5 },
  { id: "middle", x: 58, y: 61, width: 49, height: 31, dx: 14, dy: 6, rotate: 4 },
  { id: "terminal", x: 58, y: 105, width: 23, height: 20, dx: 8, dy: 14, rotate: 7 },
];

export function Brand({
  animation = "static",
  assemble = false,
  className = "",
  decorative = false,
  href = "#top",
}) {
  const instanceId = useId().replaceAll(":", "");
  const classes = [
    "brand",
    assemble ? "brand--assembly" : "",
    assemble && animation !== "static" ? `brand--${animation}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {assemble ? (
        <span className="brand__assembly-mark" aria-hidden="true">
          <svg viewBox="0 0 130 150" role="presentation">
            <defs>
              {assemblyModules.map((module) => (
                <clipPath id={`brand-${instanceId}-${module.id}`} key={module.id}>
                  <rect
                    x={module.x}
                    y={module.y}
                    width={module.width}
                    height={module.height}
                  />
                </clipPath>
              ))}
            </defs>
            {assemblyModules.map((module, index) => (
              <g
                className={`brand__module brand__module--${index + 1}`}
                clipPath={`url(#brand-${instanceId}-${module.id})`}
                key={module.id}
                style={{
                  "--brand-module-index": index,
                  "--brand-module-x": `${module.dx}px`,
                  "--brand-module-y": `${module.dy}px`,
                  "--brand-module-rotate": `${module.rotate}deg`,
                }}
              >
                <image
                  href="/brand/interfirst-mark.png"
                  width="130"
                  height="150"
                />
              </g>
            ))}
          </svg>
        </span>
      ) : (
        <Image
          className="brand__mark"
          src="/brand/interfirst-mark.png"
          alt=""
          width="130"
          height="150"
        />
      )}
      <span className="brand__name">InterFirst</span>
    </>
  );

  if (decorative) {
    return (
      <span aria-hidden="true" className={classes}>
        {content}
      </span>
    );
  }

  return (
    <Link className={classes} href={href} aria-label="InterFirst — Home">
      {content}
    </Link>
  );
}
