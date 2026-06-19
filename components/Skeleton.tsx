import type { CSSProperties } from "react";

/** A shimmering placeholder block (uses the global .cl-skeleton class). */
export default function Skeleton({
  width = "100%",
  height = 14,
  radius = 8,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className="cl-skeleton"
      style={{ display: "block", width, height, borderRadius: radius, ...style }}
    />
  );
}
