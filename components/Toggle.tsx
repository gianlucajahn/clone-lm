"use client";

import { motion } from "framer-motion";

/** A Material-style on/off switch; the thumb springs between the two ends. */
export default function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? "#1a73e8" : "#bdc1c6",
        border: "none",
        cursor: "pointer",
        padding: 3,
        display: "flex",
        alignItems: "center",
        flex: "none",
        transition: "background-color 160ms ease",
      }}
    >
      {/* Slide via an explicit x transform (local to the track) rather than a
          layout animation, so mounting the textarea below doesn't make the
          thumb fly in from elsewhere on the page. */}
      <motion.span
        animate={{ x: on ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
          display: "block",
        }}
      />
    </button>
  );
}
