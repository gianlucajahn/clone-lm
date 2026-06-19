"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IconButton from "./IconButton";
import HoverTooltip from "./HoverTooltip";

export const COLUMN_EXPANDED = 472;
const COLLAPSED = 56;

/** Material "standard" easing — graceful, no overshoot. */
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/**
 * A side column that smoothly collapses to a thin rail and back. The width
 * tweens (no overshoot) so the flex:1 middle column gracefully grows into the
 * freed space at the same time; the full content is kept at its natural width
 * and clipped/faded as the column closes, so nothing reflows or mismatches.
 */
export default function CollapsibleColumn({
  collapsed,
  onToggle,
  side,
  title,
  fullWidth = false,
  children,
}: {
  collapsed: boolean;
  onToggle: () => void;
  side: "left" | "right";
  title: string;
  /** Compact (tablet/mobile) mode: fill the available width, no collapse rail. */
  fullWidth?: boolean;
  children: ReactNode;
}) {
  if (fullWidth) {
    return (
      <div
        style={{
          flex: 1,
          minWidth: 0,
          alignSelf: "stretch",
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? COLLAPSED : COLUMN_EXPANDED }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{
        flex: "none",
        alignSelf: "stretch",
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1 }}
        transition={{
          duration: collapsed ? 0.15 : 0.25,
          delay: collapsed ? 0 : 0.14,
        }}
        style={{
          width: COLUMN_EXPANDED,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {collapsed && (
          <motion.div
            key="rail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.18, duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            style={{
              position: "absolute",
              inset: 0,
              width: COLLAPSED,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 14,
              gap: 8,
            }}
          >
            <HoverTooltip label={`Bereich „${title}“ erweitern`}>
              <IconButton
                name={side === "left" ? "left_panel_open" : "right_panel_open"}
                size={40}
                iconSize={22}
                onClick={onToggle}
              />
            </HoverTooltip>
            <div
              style={{
                writingMode: "vertical-rl",
                fontSize: 14,
                fontWeight: 500,
                color: "#444746",
                marginTop: 4,
                userSelect: "none",
              }}
            >
              {title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
