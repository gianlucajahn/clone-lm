"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import Icon from "./Icon";

/** Shared styling tokens so all six Studio "anpassen" popups match exactly. */
export const studioTitle: CSSProperties = { fontSize: 22, fontWeight: 500, color: "#1f1f1f" };
export const studioLabel: CSSProperties = { fontSize: 15, fontWeight: 500, color: "#3c4043" };
export const FIELD_BORDER = "#bdc1c6";

/** A checkmark that smoothly grows/shrinks its width so the button resizes to fit it. */
function Check() {
  return (
    <motion.span
      initial={{ width: 0, opacity: 0, marginRight: 0 }}
      animate={{ width: 22, opacity: 1, marginRight: 6 }}
      exit={{ width: 0, opacity: 0, marginRight: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      <Icon name="check" size={20} color="#444746" />
    </motion.span>
  );
}

export function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "#f1f3f4";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "#fff";
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 42,
        padding: "0 20px",
        border: `1px solid ${selected ? "#b4b8be" : FIELD_BORDER}`,
        borderRadius: 21,
        background: selected ? "#e6e8f1" : "#fff",
        fontFamily: "inherit",
        fontSize: 14.5,
        fontWeight: 500,
        color: "#1f1f1f",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <AnimatePresence initial={false}>{selected && <Check />}</AnimatePresence>
      {children}
    </button>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; badge?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${FIELD_BORDER}`, borderRadius: 21, overflow: "hidden" }}>
      {options.map((o, i) => {
        const sel = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 42,
              padding: "0 18px",
              border: "none",
              borderLeft: i > 0 ? `1px solid ${FIELD_BORDER}` : "none",
              background: sel ? "#e6e8f1" : "#fff",
              color: "#1f1f1f",
              fontFamily: "inherit",
              fontSize: 14.5,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <AnimatePresence initial={false}>{sel && <Check />}</AnimatePresence>
            {o.label}
            {o.badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.4px",
                  color: "#5f6368",
                  background: "#e8eaed",
                  borderRadius: 8,
                  padding: "2px 6px",
                  marginLeft: 6,
                }}
              >
                {o.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
