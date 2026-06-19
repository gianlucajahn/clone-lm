"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Dark hover tooltip rendered through a portal to <body>, so it is never
 * clipped by a panel's `overflow: hidden`. It is centred on the trigger but
 * clamped to stay 6px inside the viewport edges, so tooltips on edge-hugging
 * buttons (the collapse rail, the studio minimize button) never get cut off.
 */
export default function HoverTooltip({
  label,
  maxWidth,
  disabled = false,
  children,
}: {
  label: string;
  maxWidth?: number;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);
  const [anchor, setAnchor] = useState({ cx: 0, top: 0 });
  const [left, setLeft] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const show = () => {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setAnchor({ cx: r.left + r.width / 2, top: r.bottom + 8 });
    }
    setHover(true);
  };

  const visible = hover && !disabled;

  // Centre on the trigger, then clamp so the whole tooltip stays on-screen.
  useIsoLayoutEffect(() => {
    if (!visible || !tipRef.current) return;
    const w = tipRef.current.offsetWidth;
    const vw = window.innerWidth;
    const margin = 6;
    let l = anchor.cx - w / 2;
    if (l < margin) l = margin;
    if (l + w > vw - margin) l = vw - w - margin;
    setLeft(l);
  }, [visible, anchor, label, maxWidth]);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setHover(false)}
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                ref={tipRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  left,
                  top: anchor.top,
                  background: "#3c4043",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  padding: "7px 11px",
                  borderRadius: 6,
                  whiteSpace: maxWidth ? "normal" : "nowrap",
                  maxWidth,
                  textAlign: maxWidth ? "left" : "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                  zIndex: 1000,
                }}
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
