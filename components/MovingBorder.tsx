"use client";

/**
 * A lit segment that travels clockwise around a component's rounded border.
 * Overlay it inside a `position: relative` element; `color` is the option's
 * text colour. Used on a Studio card while its artifact is generating.
 */
export default function MovingBorder({
  color,
  radius = 13,
}: {
  color: string;
  radius?: number;
}) {
  return (
    <svg
      aria-hidden
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 1,
        width: "calc(100% - 2px)",
        height: "calc(100% - 2px)",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 25,
      }}
    >
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={radius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="22 78"
        strokeDashoffset="0"
        style={{ animation: "cl-dash 1.6s linear infinite" }}
      />
    </svg>
  );
}
