"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";

/** Discord glyph (Material Symbols has no Discord icon). */
function DiscordLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#444746" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02ZM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12Zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12Z" />
    </svg>
  );
}

interface Item {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
  node?: ReactNode;
  /** Render a full-width separator immediately above this item. */
  divider?: boolean;
}
const ITEMS: Item[] = [
  {
    label: "Hilfe zu NotebookLM",
    icon: "help",
    href: "https://support.google.com/notebooklm#topic=16164070",
    external: true,
  },
  { label: "Feedback geben", icon: "feedback", href: "mailto:gianluca.jahn98@gmail.com" },
  { label: "Discord", node: <DiscordLogo />, href: "https://discord.com/invite/Az2N7BwV7r", external: true },
  {
    label: "Lizenzen",
    icon: "workspace_premium",
    href: "https://notebooklm.google.com/licenses",
    external: true,
  },
  {
    label: "Auf Pro upgraden",
    divider: true,
    node: (
      <Icon
        name="auto_awesome"
        size={22}
        fill={1}
        style={{
          background: "linear-gradient(135deg,#4285f4,#9b72cb,#d96570)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      />
    ),
    href: "https://support.google.com/notebooklm/answer/16213268",
    external: true,
  },
];

/** The "Einstellungen" pill + dropdown menu, used in the top bar and list page. */
export default function SettingsMenu() {
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
      <motion.button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f0fe")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 34,
          padding: "0 16px",
          border: "1px solid #dadce0",
          borderRadius: 18,
          background: "transparent",
          transition: "background-color 120ms ease",
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: 500,
          color: "#444746",
          cursor: "pointer",
        }}
      >
        <Icon name="settings" size={20} color="#444746" />
        Einstellungen
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 44,
              left: 0,
              minWidth: 220,
              background: "#fff",
              border: "1px solid #e6e8eb",
              borderRadius: 12,
              boxShadow: "0 6px 22px rgba(0,0,0,0.18)",
              padding: "8px 0",
              zIndex: 1000,
              transformOrigin: "top left",
            }}
          >
            {ITEMS.map((it) => (
              <Fragment key={it.label}>
                {it.divider && (
                  <div style={{ height: 1, background: "#e6e8eb", margin: "8px 0" }} />
                )}
                <a
                  href={it.href}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    padding: "11px 16px",
                    fontFamily: "inherit",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#1f1f1f",
                    textDecoration: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ display: "inline-flex", width: 24, justifyContent: "center", flex: "none" }}>
                    {it.node ?? <Icon name={it.icon as string} size={22} weight={500} color="#444746" />}
                  </span>
                  {it.label}
                </a>
              </Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
