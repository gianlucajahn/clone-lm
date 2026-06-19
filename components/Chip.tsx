"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import styles from "./Chip.module.css";

export interface ChipOption {
  /** rendered icon (Material symbol or logo) */
  iconNode: ReactNode;
  label: string;
  description: string;
  /** greyed-out and not selectable */
  disabled?: boolean;
}

/**
 * A dropdown chip: shows the current selection with a caret, and on click opens
 * a popover menu of options (icon + title + description). Selecting an option
 * updates the chip and closes the menu; clicking outside or Escape also closes.
 */
export default function Chip({ options }: { options: ChipOption[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options[selected];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.div className={styles.chip} onClick={() => setOpen((o) => !o)}>
        {current.iconNode}
        <span style={{ marginLeft: 4, marginRight: 2 }}>{current.label}</span>
        <Icon name="keyboard_arrow_down" size={20} color="#444746" />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ transformOrigin: "top left" }}
          >
            {options.map((o, i) => (
              <div
                key={o.label}
                className={`${styles.menuItem}${
                  o.disabled ? ` ${styles.menuItemDisabled}` : ""
                }`}
                onClick={
                  o.disabled
                    ? undefined
                    : () => {
                        setSelected(i);
                        setOpen(false);
                      }
                }
              >
                <span className={styles.menuIcon}>{o.iconNode}</span>
                <div>
                  <div className={styles.menuTitle}>{o.label}</div>
                  <div className={styles.menuDesc}>{o.description}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
