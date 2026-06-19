"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IconButton from "./IconButton";
import Icon from "./Icon";

/** Google Drive tricolor mark. */
function DriveLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

function Gemini({ size = 28 }: { size?: number }) {
  return (
    <Icon
      name="auto_awesome"
      size={size}
      fill={1}
      style={{
        background: "linear-gradient(135deg,#4285f4,#9b72cb,#d96570)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    />
  );
}

function Konto() {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#f04393,#f9373c)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 500,
      }}
    >
      G
    </span>
  );
}

interface App {
  name: string;
  url: string;
  icon: ReactNode;
}

const FAVORITES: App[] = [
  { name: "Konto", url: "https://myaccount.google.com", icon: <Konto /> },
  { name: "Drive", url: "https://drive.google.com", icon: <DriveLogo /> },
  { name: "Gmail", url: "https://mail.google.com", icon: <Icon name="mail" size={30} color="#ea4335" fill={1} /> },
  { name: "YouTube", url: "https://youtube.com", icon: <Icon name="smart_display" size={32} color="#ff0000" fill={1} /> },
  { name: "Gemini", url: "https://gemini.google.com", icon: <Gemini /> },
  { name: "Maps", url: "https://maps.google.com", icon: <Icon name="location_on" size={30} color="#34a853" fill={1} /> },
  { name: "Suche", url: "https://www.google.com", icon: <Icon name="search" size={30} color="#4285f4" /> },
  { name: "Kalender", url: "https://calendar.google.com", icon: <Icon name="calendar_month" size={29} color="#4285f4" fill={1} /> },
  { name: "News", url: "https://news.google.com", icon: <Icon name="newspaper" size={29} color="#4285f4" fill={1} /> },
];

const MORE: App[] = [
  { name: "Fotos", url: "https://photos.google.com", icon: <Icon name="photo" size={30} color="#4285f4" fill={1} /> },
  { name: "Meet", url: "https://meet.google.com", icon: <Icon name="videocam" size={30} color="#00897b" fill={1} /> },
  { name: "Übersetzer", url: "https://translate.google.com", icon: <Icon name="translate" size={30} color="#4285f4" /> },
  { name: "Docs", url: "https://docs.google.com", icon: <Icon name="description" size={30} color="#4285f4" fill={1} /> },
  { name: "Tabellen", url: "https://sheets.google.com", icon: <Icon name="grid_on" size={28} color="#0f9d58" fill={1} /> },
  { name: "Präsentationen", url: "https://slides.google.com", icon: <Icon name="slideshow" size={30} color="#f4b400" fill={1} /> },
  { name: "Keep", url: "https://keep.google.com", icon: <Icon name="lightbulb" size={30} color="#fbbc04" fill={1} /> },
  { name: "Kontakte", url: "https://contacts.google.com", icon: <Icon name="contacts" size={30} color="#4285f4" fill={1} /> },
  { name: "Earth", url: "https://earth.google.com", icon: <Icon name="public" size={30} color="#1a73e8" /> },
  { name: "Chat", url: "https://mail.google.com/chat", icon: <Icon name="chat" size={29} color="#00897b" fill={1} /> },
  { name: "Play", url: "https://play.google.com", icon: <Icon name="play_circle" size={30} color="#4285f4" fill={1} /> },
  { name: "Formulare", url: "https://forms.google.com", icon: <Icon name="assignment" size={29} color="#673ab7" fill={1} /> },
];

function Tile({ app }: { app: App }) {
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={(e) => (e.currentTarget.style.background = "#e8eaf2")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "12px 4px",
        borderRadius: 12,
        textDecoration: "none",
        transition: "background-color 120ms ease",
      }}
    >
      <span style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {app.icon}
      </span>
      <span style={{ fontSize: 12, color: "#3c4043", textAlign: "center", lineHeight: 1.2 }}>{app.name}</span>
    </a>
  );
}

const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 };

/** Google-style app launcher (the 3×3 waffle), used in the top bar and list page. */
export default function AppsMenu() {
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
      <IconButton name="apps" size={40} iconSize={22} onClick={() => setOpen((o) => !o)} />

      <AnimatePresence>
        {open && (
          <motion.div
            className="cl-scroll"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 48,
              right: 0,
              width: 360,
              maxHeight: 470,
              overflowY: "auto",
              background: "linear-gradient(180deg, #fbfcff 0%, #e9ecf8 100%)",
              border: "1px solid #e2e5f0",
              borderRadius: 24,
              boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
              padding: "16px 14px 18px",
              zIndex: 1000,
              transformOrigin: "top right",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 6px 12px" }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: "#1f1f1f" }}>Meine Favoriten</span>
              <button
                type="button"
                aria-label="Favoriten bearbeiten"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#c3d8fb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#d7e6fd")}
                style={{
                  width: 60,
                  height: 40,
                  borderRadius: 20,
                  border: "none",
                  background: "#d7e6fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background-color 120ms ease",
                }}
              >
                <Icon name="edit" size={20} color="#202124" />
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 18, padding: "6px 6px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={grid}>
                {FAVORITES.map((a) => (
                  <Tile key={a.name} app={a} />
                ))}
              </div>
            </div>

            <div style={{ ...grid, marginTop: 8 }}>
              {MORE.map((a) => (
                <Tile key={a.name} app={a} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
