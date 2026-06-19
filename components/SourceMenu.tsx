"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";

/**
 * Three-dots menu for a saved source: a hover-blue circular trigger and a
 * portalled dropdown (so the scrollable sources list never clips it), styled
 * like the Einstellungen dropdown. Options: remove / rename.
 */
export default function SourceMenu({
  onDelete,
  onRename,
}: {
  onDelete: () => void;
  onRename: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [hover, setHover] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(t) &&
        menuRef.current && !menuRef.current.contains(t)
      ) {
        setOpen(false);
      }
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

  const toggle = () => {
    const el = btnRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ left: r.right - 200, top: r.bottom + 6 });
    }
    setOpen((o) => !o);
  };

  const Item = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f4")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "10px 16px",
        border: "none",
        background: "transparent",
        fontFamily: "inherit",
        fontSize: 14,
        color: "#1f1f1f",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <Icon name={icon} size={20} color="#444746" />
      {label}
    </button>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Quellenmenü"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          flex: "none",
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: hover || open ? "#e8f0fe" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background-color 120ms ease",
        }}
      >
        <Icon name="more_vert" size={22} color="#444746" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  left: pos.left,
                  top: pos.top,
                  width: 200,
                  background: "#fff",
                  border: "1px solid #e6e8eb",
                  borderRadius: 12,
                  boxShadow: "0 6px 22px rgba(0,0,0,0.18)",
                  padding: "6px 0",
                  zIndex: 1200,
                  transformOrigin: "top right",
                }}
              >
                <Item icon="delete" label="Quelle entfernen" onClick={onDelete} />
                <Item icon="edit" label="Quelle umbenennen" onClick={onRename} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
