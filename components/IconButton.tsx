"use client";

import type { CSSProperties } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import Icon from "./Icon";
import { circle } from "@/lib/motion";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends HTMLMotionProps<"button"> {
  name: string;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  iconFill?: 0 | 1;
  /** Background colour shown on hover. */
  hoverBg?: string;
}

/** Circular, transparent icon button (e.g. apps switcher, modal close). */
export default function IconButton({
  name,
  size = 40,
  iconSize = 22,
  iconColor,
  iconFill,
  hoverBg = "#e9eaec",
  style,
  ...rest
}: IconButtonProps) {
  return (
    <motion.button
      className={styles.iconBtn}
      {...circle}
      style={
        {
          width: size,
          height: size,
          "--hover-bg": hoverBg,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <Icon name={name} size={iconSize} color={iconColor} fill={iconFill} />
    </motion.button>
  );
}
