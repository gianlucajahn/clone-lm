"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import Icon from "./Icon";
import { pill } from "@/lib/motion";
import styles from "./Button.module.css";

type Variant = "primary" | "ghost" | "outline" | "outlineBlue" | "ghostBlue";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  /** Leading Material Symbols icon name. */
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  iconFill?: 0 | 1;
  /** Skip the hover-lift/press micro-interaction (e.g. tooltip-only buttons). */
  disableMotion?: boolean;
  /** Disabled look: not-allowed cursor, dimmed, no hover tint, no motion. */
  muted?: boolean;
  children?: ReactNode;
}

/**
 * The single pill-button used across the app. `variant` controls the colour
 * scheme + hover; `style` overrides per-instance dimensions. Every button gets
 * a consistent spring lift on hover and a press-in on tap.
 */
export default function Button({
  variant = "ghost",
  icon,
  iconSize = 20,
  iconColor,
  iconFill,
  disableMotion = false,
  muted = false,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      className={`${styles.base} ${styles[variant]}${muted ? ` ${styles.muted}` : ""}${
        className ? ` ${className}` : ""
      }`}
      {...(disableMotion || muted ? {} : pill)}
      {...rest}
    >
      {icon && (
        <Icon name={icon} size={iconSize} color={iconColor} fill={iconFill} />
      )}
      {children}
    </motion.button>
  );
}
