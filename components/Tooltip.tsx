"use client";

import { useState, type ReactNode } from "react";
import TooltipBubble from "./TooltipBubble";

/**
 * Wraps any element and shows a dark tooltip below it on hover. `block` makes
 * the wrapper full-width (so a full-width child button keeps its width and the
 * tooltip still centres under it).
 */
export default function Tooltip({
  label,
  children,
  block = false,
}: {
  label: string;
  children: ReactNode;
  block?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", display: block ? "block" : "inline-block" }}
    >
      {children}
      <TooltipBubble show={hover} label={label} />
    </span>
  );
}
