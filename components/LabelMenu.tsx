"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";

/**
 * Label-management trigger that sits below the research box: a hover-blue
 * circular icon button and a portalled dropdown with the label actions
 * (new label / smart re-organise / back to the notebook list).
 */
export default function LabelMenu({
  onNewLabel,
  onOrganize,
  onBackToList,
}: {
  onNewLabel: () => void;
  onOrganize: () => void;
  onBackToList: () => void;
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
      setPos({ left: r.left, top: r.bottom + 6 });
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
        whiteSpace: "nowrap",
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
        aria-label="Labels verwalten"
        title="Labels verwalten"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          flex: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 34,
          padding: "0 10px 0 12px",
          border: "none",
          borderRadius: 18,
          fontSize: 14,
          fontWeight: 500,
          color: "#1f1f1f",
          fontFamily: "inherit",
          background: hover || open ? "#f1f3f4" : "transparent",
          cursor: "pointer",
          transition: "background-color 120ms ease",
        }}
      >
        <span style={{ position: "relative", display: "inline-flex" }}>
          <Icon name="label" size={18} color="#444746" />
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ position: "absolute", top: -3, left: -4 }}
          >
            <path
              d="M12 1 C13 7 17 11 23 12 C17 13 13 17 12 23 C11 17 7 13 1 12 C7 11 11 7 12 1 Z"
              fill="#444746"
            />
          </svg>
        </span>
        Labels
        <Icon name="keyboard_arrow_down" size={18} color="#444746" />
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
                  minWidth: 232,
                  background: "#fff",
                  border: "1px solid #e6e8eb",
                  borderRadius: 12,
                  boxShadow: "0 6px 22px rgba(0,0,0,0.18)",
                  padding: "6px 0",
                  zIndex: 1200,
                  transformOrigin: "top left",
                }}
              >
                <Item icon="new_label" label="Neues Label hinzufügen" onClick={onNewLabel} />
                <Item icon="auto_awesome" label="Neu organisieren" onClick={onOrganize} />
                <Item icon="list" label="Zurück zur Listenansicht" onClick={onBackToList} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
