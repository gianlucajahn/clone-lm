"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * The dark, white-text tooltip bubble shown below an element on hover.
 * Presentational — the parent owns the `show` state. Used by both the Studio
 * cards and the "Quelle hinzufügen" button so every tooltip looks the same.
 */
export default function TooltipBubble({
  show,
  label,
}: {
  show: boolean;
  label: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -4, x: "-50%" }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            background: "#3c4043",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.4,
            padding: "6px 10px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
