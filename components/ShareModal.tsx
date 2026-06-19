"use client";

import { useEffect, useRef, useState } from "react";
import ModalShell from "./ModalShell";
import IconButton from "./IconButton";
import Icon from "./Icon";

const ACCESS: { value: string; label: string; desc: string }[] = [
  { value: "restricted", label: "Eingeschränkt", desc: "Nur Personen mit Zugriff können den Link öffnen" },
  { value: "link", label: "Nutzer mit einem Link", desc: "Jeder, der den Link hat, kann dieses Notebook ansehen" },
  { value: "public", label: "Öffentlich", desc: "Im Web sichtbar" },
];

/**
 * The Google-style "… teilen" dialog. Pixel-faithful recreation; everything is
 * visual EXCEPT the "Link kopieren" button, which copies the notebook URL,
 * closes the dialog, and triggers a toast.
 */
export default function ShareModal({
  open,
  onClose,
  title,
  onCopied,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  onCopied: () => void;
}) {
  const [notify, setNotify] = useState(true);
  const [access, setAccess] = useState("restricted");
  const [accessOpen, setAccessOpen] = useState(false);
  const accessRef = useRef<HTMLDivElement>(null);
  const sel = ACCESS.find((a) => a.value === access) ?? ACCESS[0];

  useEffect(() => {
    if (!accessOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accessRef.current && !accessRef.current.contains(e.target as Node))
        setAccessOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accessOpen]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
    }
    onCopied();
  };

  return (
    <ModalShell open={open} onClose={onClose} width={600} overflowVisible>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 16px 18px 24px",
          borderBottom: "1px solid #e8eaed",
        }}
      >
        <Icon name="share" size={22} color="#444746" />
        <div style={{ flex: 1, fontSize: 18, fontWeight: 400, color: "#1f1f1f" }}>
          {`„${title}“ teilen`}
        </div>
        <IconButton name="close" size={40} iconSize={24} iconColor="#444746" hoverBg="rgba(0,0,0,0.06)" onClick={onClose} />
      </div>

      {/* Body */}
      <div style={{ padding: "22px 24px 8px" }}>
        {/* required people field (visual, red error state) */}
        <div style={{ position: "relative", border: "1px solid #d93025", borderRadius: 8, height: 54 }}>
          <span
            style={{
              position: "absolute",
              top: -8,
              left: 13,
              background: "#fff",
              padding: "0 5px",
              fontSize: 12,
              color: "#d93025",
            }}
          >
            Personen und Gruppen hinzufügen*
          </span>
          <input
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "0 15px",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#1f1f1f",
            }}
          />
        </div>

        {/* people with access */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 0 14px" }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#1f1f1f" }}>Personen mit Zugriff</div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => setNotify((n) => !n)}
          >
            <span style={{ fontSize: 14, color: "#444746" }}>Personen benachrichtigen</span>
            <Icon
              name={notify ? "check_box" : "check_box_outline_blank"}
              size={20}
              color={notify ? "#1a73e8" : "#5f6368"}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f04393,#f9373c)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 500,
              flex: "none",
            }}
          >
            G
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1f1f1f" }}>Gianluca Jahn</div>
            <div style={{ fontSize: 13, color: "#5f6368" }}>gianluca.jahn98@gmail.com</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 14, color: "#9aa0a6" }}>
            Inhaber
            <Icon name="arrow_drop_down" size={20} color="#9aa0a6" />
          </div>
        </div>

        <div style={{ height: 1, background: "#e8eaed", margin: "16px 0" }} />

        {/* notebook access */}
        <div style={{ fontSize: 16, fontWeight: 500, color: "#1f1f1f", marginBottom: 14 }}>
          Notebook-Zugriff
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f1f3f4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="lock" size={20} color="#444746" />
          </div>
          <div style={{ position: "relative" }} ref={accessRef}>
            <button
              type="button"
              onClick={() => setAccessOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 500,
                color: "#1f1f1f",
                cursor: "pointer",
                padding: "6px 6px 6px 8px",
                borderRadius: 6,
              }}
            >
              {sel.label}
              <Icon name={accessOpen ? "arrow_drop_up" : "arrow_drop_down"} size={22} color="#444746" />
            </button>
            <div style={{ fontSize: 13, color: "#846c3d", marginLeft: 8, marginTop: 2 }}>{sel.desc}</div>

            {accessOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 38,
                  left: 0,
                  minWidth: 240,
                  background: "#fff",
                  border: "1px solid #e6e8eb",
                  borderRadius: 8,
                  boxShadow: "0 6px 22px rgba(0,0,0,0.18)",
                  zIndex: 60,
                  padding: "6px 0",
                }}
              >
                {ACCESS.map((a) => {
                  const active = a.value === access;
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => {
                        setAccess(a.value);
                        setAccessOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: active ? "#e8f0fe" : "transparent",
                        fontFamily: "inherit",
                        fontSize: 14,
                        color: active ? "#174ea6" : "#1f1f1f",
                        cursor: "pointer",
                        padding: "10px 16px",
                      }}
                    >
                      <span style={{ flex: 1 }}>{a.label}</span>
                      {active && <Icon name="check" size={18} color="#174ea6" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px 18px",
          borderTop: "1px solid #e8eaed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button
            type="button"
            onClick={copyLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 16px",
              border: "1px solid #dadce0",
              borderRight: "none",
              borderRadius: "18px 0 0 18px",
              background: "#fff",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              color: "#1f1f1f",
              cursor: "pointer",
            }}
          >
            <Icon name="link" size={18} color="#1f1f1f" />
            Link kopieren
          </button>
          <button
            type="button"
            aria-label="Optionen"
            style={{
              width: 34,
              height: 36,
              border: "1px solid #dadce0",
              borderRadius: "0 18px 18px 0",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="arrow_drop_down" size={20} color="#1f1f1f" />
          </button>
        </div>

        <button
          type="button"
          style={{
            height: 36,
            padding: "0 24px",
            borderRadius: 18,
            border: "none",
            background: "#e8eaed",
            color: "#9aa0a6",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 500,
            cursor: "default",
          }}
        >
          Speichern
        </button>
      </div>
    </ModalShell>
  );
}
