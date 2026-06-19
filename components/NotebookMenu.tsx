"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import styles from "./NotebookMenu.module.css";

/** Reusable three-dots menu for a notebook (grid card or list row). */
export default function NotebookMenu({
  onDelete,
  onEdit,
}: {
  onDelete: () => void;
  onEdit?: () => void;
}) {
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
    <div
      ref={ref}
      className={styles.wrap}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={styles.dots}
        onClick={() => setOpen((o) => !o)}
        aria-label="Menü"
      >
        <Icon name="more_vert" size={20} color="#444746" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
          >
            <div
              className={styles.item}
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              <Icon name="delete" size={20} color="#444746" />
              Löschen
            </div>
            {onEdit && (
              <div
                className={styles.item}
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                <Icon name="edit" size={20} color="#444746" />
                Titel bearbeiten
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
