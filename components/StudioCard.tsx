"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { StudioItem } from "@/lib/studioItems";
import Icon from "./Icon";
import MovingBorder from "./MovingBorder";

/**
 * One coloured tile in the Studio grid. On hover it gets a subtle grey
 * state-layer overlay (no scale, no shadow) and shows a dark tooltip with the
 * tool's description below it. The tooltip is portalled to <body> and wraps, so
 * the long descriptions are never clipped by the panel's overflow.
 */
export default function StudioCard({
  icon,
  label,
  bg,
  color,
  beta,
  disabled,
  tooltip,
  onClick,
  onConfigure,
  generating,
}: StudioItem & {
  onClick?: () => void;
  onConfigure?: () => void;
  generating?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [chevHover, setChevHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const show = () => {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ left: r.left + r.width / 2, top: r.bottom + 8 });
    }
    setHover(true);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={() => setHover(false)}
      onClick={() => !disabled && !generating && onClick?.()}
      style={{
        position: "relative",
        background: bg,
        borderRadius: 14,
        padding: "8px 36px 8px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        minHeight: 44,
        zIndex: hover ? 20 : 1,
      }}
    >
      {generating && <MovingBorder color={color} radius={13} />}
      {beta ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={icon} size={19} color={color} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.5px",
              color: "#fff",
              background: "#1f1f1f",
              borderRadius: 4,
              padding: "3px 7px",
            }}
          >
            BETA
          </span>
        </div>
      ) : (
        <Icon name={icon} size={19} color={color} />
      )}

      <div
        style={{
          fontSize: 12.5,
          fontWeight: 500,
          color,
          marginTop: beta ? 2 : 3,
        }}
      >
        {label}
      </div>

      <div
        onMouseEnter={() => setChevHover(true)}
        onMouseLeave={() => setChevHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled || generating) return;
          (onConfigure ?? onClick)?.();
        }}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: chevHover ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background-color 120ms ease",
          zIndex: 30,
        }}
      >
        <Icon name="chevron_right" size={19} color="#5f6368" />
      </div>

      {/* grey state-layer overlay on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          background: "rgba(31,31,31,0.08)",
          opacity: hover ? 1 : 0,
          transition: "opacity 130ms ease",
          pointerEvents: "none",
        }}
      />

      {/* dark, wrapping tooltip below the card (portalled, never clipped) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {hover && (
              <motion.div
                initial={{ opacity: 0, y: -4, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -4, x: "-50%" }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  left: pos.left,
                  top: pos.top,
                  maxWidth: 240,
                  background: "#3c4043",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  padding: "7px 11px",
                  borderRadius: 6,
                  textAlign: "left",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                  zIndex: 1000,
                }}
              >
                {tooltip}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
