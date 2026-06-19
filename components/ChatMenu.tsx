"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import HoverTooltip from "./HoverTooltip";
import { iconTap } from "@/lib/motion";
import styles from "./ChatMenu.module.css";

/**
 * The chat panel's three-dots control: a tooltip on hover and, on click, a
 * dropdown to customize the notebook or (disabled) clear the chat history.
 */
export default function ChatMenu({ onCustomize }: { onCustomize: () => void }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <HoverTooltip
        label="Das Chatprotokoll wird jetzt sitzungsübergreifend gespeichert. Sie können es hier löschen."
        maxWidth={280}
        disabled={open}
      >
        <motion.span
          {...iconTap}
          onClick={() => setOpen((o) => !o)}
          style={{ display: "inline-flex", cursor: "pointer" }}
        >
          <Icon name="more_vert" size={22} color="#444746" />
        </motion.span>
      </HoverTooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
          >
            <div
              className={styles.item}
              onClick={() => {
                onCustomize();
                setOpen(false);
              }}
            >
              Notebook anpassen
            </div>
            <div className={`${styles.item} ${styles.itemDisabled}`}>
              Chatprotokoll löschen
            </div>
            <div className={styles.note}>
              Der Chatverlauf ist nur für Sie sichtbar.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
