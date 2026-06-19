"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Icon from "./Icon";
import HoverTooltip from "./HoverTooltip";
import { iconTap } from "@/lib/motion";

/** Panel title row: a 16px/500 title and a trailing control. */
export default function PanelHeader({
  title,
  trailingIcon,
  padding,
  onTrailingClick,
  trailingTooltip,
  trailing,
  divider = false,
}: {
  title: string;
  padding: string;
  /** built-in trailing icon (ignored if `trailing` is supplied) */
  trailingIcon?: string;
  onTrailingClick?: () => void;
  /** if set, the built-in trailing icon shows this tooltip on hover */
  trailingTooltip?: string;
  /** custom trailing element (e.g. a menu); overrides `trailingIcon` */
  trailing?: ReactNode;
  /** draws a hairline separator along the bottom of the header */
  divider?: boolean;
}) {
  const builtIn = trailingIcon ? (
    <motion.span
      {...iconTap}
      onClick={onTrailingClick}
      style={{ display: "inline-flex", cursor: "pointer" }}
    >
      <Icon name={trailingIcon} size={22} color="#444746" />
    </motion.span>
  ) : null;

  const trailingEl =
    trailing ??
    (trailingTooltip && builtIn ? (
      <HoverTooltip label={trailingTooltip}>{builtIn}</HoverTooltip>
    ) : (
      builtIn
    ));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding,
        borderBottom: divider ? "1px solid #e8eaed" : undefined,
        flex: "none",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
      {trailingEl}
    </div>
  );
}
