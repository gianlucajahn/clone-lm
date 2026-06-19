"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Bottom-center toast. Pass `text` to show; calls `onDone` after `duration`. */
export default function Toast({
  text,
  onDone,
  duration = 3000,
}: {
  text: string | null;
  onDone: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [text, duration, onDone]);

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: "50%",
            bottom: 28,
            background: "#1f1f1f",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            zIndex: 4000,
            fontFamily: "inherit",
            pointerEvents: "none",
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
