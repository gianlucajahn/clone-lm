"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** A modern, higher-bounce spring pop-in; quick ease-out on close. */
const dialogVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 28 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      bounce: 0.5,
      duration: 0.6,
      opacity: { duration: 0.2, ease: "easeOut" as const },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 14,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

/**
 * Shared modal chrome: a fading backdrop and a spring-popped dialog box.
 * Both the create- and customize-notebook modals use it so their open/close
 * animations are identical. Children supply the dialog's contents (the dialog
 * is a flex column with a capped height, so children can do header / scroll
 * body / footer).
 */
export default function ModalShell({
  open,
  onClose,
  width = 780,
  overflowVisible = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  /** Let absolutely-positioned children (e.g. a dropdown) extend past the dialog edge. */
  overflowVisible?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(32,33,36,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
        >
          <motion.div
            key="dialog"
            onClick={(e) => e.stopPropagation()}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "relative",
              width,
              maxWidth: "100%",
              maxHeight: "calc(100vh - 48px)",
              background: "#fff",
              borderRadius: 28,
              overflow: overflowVisible ? "visible" : "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
